const Requester = require('./rest/Requester');
const WebSocketManager = require('./websocket/WebSocketManager');
const constants = require('./settings/Constants');
const ClientGeneric = require('./ClientGeneric');
const ActionManager = require('./actions/ActionManager');

class Client extends ClientGeneric {
    constants;
    actions;
    ws;
    requester;
    user = null;

    /**
     * @param {{ tokenType?: String }} options
     */
    constructor(options = {}) {
        super(Object.assign({ tokenType: options.tokenType !== undefined && options.tokenType !== null ? options.tokenType : 'Bot' }, options));

        this.constants = constants;

        /**
         * Actions
         */
        this.actions = new ActionManager(this);

        this.ws = new WebSocketManager(this);

        this.requester = new Requester(this);
    }

    get api() {
        return this.requester.api;
    }

    getAuthorization() {
        if (!this.token || typeof this.token !== 'string') throw new Error('TOKEN_INVALID');
        return `${this.options.tokenType} ${this.token}`;
    }

    login(token = this.token) {
        if (!token || typeof token !== 'string') throw new Error('TOKEN_INVALID');
        this.token = token = token.replace(/^(Bot|Bearer)\s*/i, '');
        
        try {
            this.ws.connect();
        } catch (error) {
            console.log('[ERROR] during connect websocket server', error);
        }
    }

    destroy() {
        this.token = null;
    }
}

module.exports = Client;