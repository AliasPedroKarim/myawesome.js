const fetch = require('node-fetch');
const https = require('https');
const AbortController = require('abort-controller');
const Router = require('./Router');
const CDN = require('./CDN');
const { UserAgent } = require('./../settings/Constants');
const FormData = require('form-data');
const Utils = require("../settings/Utils");

class Request {
    /**
     * @param {Requester} requester
     * @param {String} method
     * @param {String} url
     * @param {{ versioned: Number, route: String, query?: Object, authorization?: Boolean, headers?: Object, files?: Array, reason?: String, payload?: Object }} options
     */
    constructor(requester, method, url, options) {
        this.requester = requester;
        this.method = method;
        this.options = options;
        /**
         * Counter retries
         * @type {number}
         */
        this.retries = 0;

        if (!this.options.headers) this.options.headers = {};

        this.url = url;
        if (options.query) {
            this.url += new URLSearchParams(Object.entries(options.query)
                .filter(([k, v]) => k && v)
                .flatMap(([k, v]) => Array.isArray(v) ? v.map(e => [k, e]) : [[k, v]])).toString();
        }
    }

    call() {
        let headers = {
            ...this.options.headers,
            'User-Agent': UserAgent
        };

        if(this.options.authorization !== false) headers.Authorization = this.requester.client.getAuthorization();
        /**
         * Whenever an admin action is performed on the API, an entry is added to the respective guild's audit log.
         * You can specify the reason by attaching the X-Audit-Log-Reason request header. This header supports url encoded utf8 characters.
         */
        if(this.options.reason) headers['X-Audit-Log-Reason'] = this.options.reason;

        let body;
        if (this.options.files && this.options.files.length) {
            body = new FormData();
            for (let file of this.options.files) {
                if (file && file.file) {
                    body.append(file.name, file.file, file.name);
                }
            }
            if (this.options.payload) {
                body.append('payload_json', JSON.stringify(this.options.payload));
            }
            headers = {
                ...headers,
                ...body.getHeaders()
            };
        }else if(this.options.payload){
            body = JSON.stringify(this.options.payload);
            headers['Content-Type'] = 'application/json';
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.requester.client.options.timeoutRequest);
        return fetch(this.url, {
            method: this.method,
            headers,
            agent: new https.Agent({ keepAlive: true }),
            ...(body ? { body } : {}),
            signal: controller.signal
        }).finally(() => {
            clearTimeout(timeout);
        });
    }
}

class Queue {
    constructor() {
        this.promises = [];
    }

    get length () {
        return this.promises.length;
    }

    process() {
        let cursor = this.promises.length ? this.promises[this.promises.length - 1] : Promise.resolve();
        let r;
        let promise = new Promise((resolve) => {
            r = resolve;
        });
        this.promises.push({ promise, resolve: r });
        return cursor;
    }

    skip() {
        let ref = this.promises.shift();
        if(ref) ref.resolve();
    }
}

class Handler {
    static parseResponse(response) {
        if (response.headers.get('content-type').startsWith('application/json')) return response.json();
        return response.buffer();
    }

    static getAPIOffset(serverDate) {
        return new Date(serverDate).getTime() - Date.now();
    }

    static calculateReset(reset, serverDate) {
        return new Date(Number(reset) * 1000).getTime() - Handler.getAPIOffset(serverDate);
    }

    constructor(requester) {
        this.requester = requester;
        this.queue = new Queue();
        this.retryLimit = this.requester.client.options.retryLimit || 1;

        this.reset = -1;
        this.remaining = -1;
        this.limit = -1;
        this.retryAfter = -1;
    }

    /**
     * @param {Request} request
     * @returns {Promise<*>}
     */
    async add(request) {
        await this.queue.process();
        try {
            return await this.execute(request);
        }finally {
            this.queue.skip();
        }
    }

    /**
     * @param {Request} request
     */
    async execute(request) {
        let response;
        try{
            response = await request.call();
        }catch (e) {
            if (request.retries === this.retryLimit) {
                console.error(e)
                throw new Error('Error is occurred during performed http request.');
            }

            request.retries++;
            await this.execute(request);
        }

        if (response && response.headers) {
            const serverDate = response.headers.get('date') || response.headers.get('date');
            const limit = response.headers.get('x-ratelimit-limit') || response.headers.get('X-RateLimit-Limit');
            const remaining = response.headers.get('x-ratelimit-remaining') || response.headers.get('X-RateLimit-Remaining');
            const reset = response.headers.get('x-ratelimit-reset') || response.headers.get('X-RateLimit-Reset');
            const retryAfter = response.headers.get('retry-after') || response.headers.get('x-ratelimit-reset-after') || response.headers.get('X-RateLimit-Reset-After');

            this.limit = limit ? Number(limit) : Infinity;
            this.remaining = remaining ? Number(remaining) : 1;
            this.reset = reset ? Handler.calculateReset(reset, serverDate) : Date.now();
            this.retryAfter = retryAfter ? Number(retryAfter) : -1;

            if (request.options.route.includes('reactions')) {
                this.reset = new Date(serverDate).getTime() - Handler.getAPIOffset(serverDate) + 250;
            }

            // Handle global ratelimit
            if (response.headers.get('x-ratelimit-global') || response.headers.get('X-RateLimit-Global')) {
                // Set the manager's global timeout as the promise for other requests to "wait"
                this.requester.globalTimeout = Utils.wait(this.retryAfter);

                // Wait for the global timeout to resolve before continuing
                await this.requester.globalTimeout;

                // Clean up global timeout
                this.requester.globalTimeout = null;
            }

            if (response.ok) return Handler.parseResponse(response);

            // Handle 4xx responses
            if (response.status >= 400 && response.status < 500) {
                /**
                 * Handle ratelimited requests
                 * @see https://discord.com/developers/docs/topics/rate-limits#exceeding-a-rate-limit
                 */
                if (response.status === 429) {
                    await Utils.wait(this.retryAfter);
                    return this.execute(request);
                }

                // Handle possible malformed requests
                let data;
                try {
                    data = await Handler.parseResponse(response);
                } catch (err) {
                    throw err;
                }

                if (data)
                    return data;
                else
                    throw new Error(`${request.url} | ${request.method} | ${response.status}`);
            }

            // Handle 5xx responses
            if (response.status >= 500 && response.status < 600) {
                // Retry the specified number of times for possible serverside issues
                if (request.retries === this.retryLimit) {
                    throw new Error(`${response.statusText} | ${response.constructor.name} | ${response.status} | ${request.method} | ${request.url}`);
                }

                request.retries++;
                return this.execute(request);
            }

            // Fallback in the rare case a status code outside the range 200..=599 is returned
            return null;
        }
    }
}

class Requester {
    client;
    globalTimeout;

    constructor(client) {
        this.handlers = new Map();
        this.client = client;
    }

    get router () {
        return Router(this);
    }

    get cdn () {
        const base = this.client.options.http.cdn;
        return CDN(base);
    }

    get api() {
        this.setBase(`${this.client.options.http.api}/v${this.client.options.http.version}`);
        return this.router;
    }

    getBase() {
        return this.base;
    }

    setBase(base){
        this.base = base;
        return this;
    }

    request(method, url, options = {}) {
        const request = new Request(this, method, this.getBase() + url, options);
        let handler = this.handlers.get(request.options.route);
    
        if (!handler) {
          handler = new Handler(this);
          this.handlers.set(request.options.route, handler);
        }
    
        return handler.add(request);
    }
}

Requester.Request = Request;

module.exports = Requester;