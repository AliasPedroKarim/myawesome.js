let EmitterEvent;

try {
    EmitterEvent = require('eventemitter3');
} catch (error) {
    EmitterEvent = require('events');
}

let WebSocket = require('ws');

const { OPCodes, GatewayEvents, ShardEvents, Status, ClientEvents, UserAgent } = require('./../settings/Constants');

const WebSocketStats = Object.keys(WebSocket);

// ERLPACK
let erlpack;

try {
  erlpack = require('erlpack');
  if (!erlpack.pack) erlpack = null;
} catch {}

// DECODER
const Utils = require('../settings/Utils');
const decoder = new (require('util')).TextDecoder();

// ZLIB
let zlib;
try {
    zlib = require('zlib-sync');
} catch {}


const BeforeReadyWhitelist = [
    GatewayEvents.READY,
    GatewayEvents.RESUMED,
    GatewayEvents.GUILD_CREATE,
    GatewayEvents.GUILD_DELETE,
    GatewayEvents.GUILD_MEMBERS_CHUNK,
    GatewayEvents.GUILD_MEMBER_ADD,
    GatewayEvents.GUILD_MEMBER_REMOVE,
];

// TODO ne pas oublier le sharding
class WebSocketShard {}

class WebSocketManager extends EmitterEvent {
    connection;
    helloTimeout;
    sequence = -1;
    closeSequence = -1;
    sessionID = null;
    ping = -1;
    lastPingTimestamp = -1;
    lastHeartbeatAcked = true;

    status = Status.IDLE;

    actionQueue = [];

    static WebSocketShard = WebSocketShard;

    /**
     * Suffix Zlib
     */
    static ZLIB_SUFFIX = [0x00, 0x00, 0xff, 0xff];
    static pack = erlpack ? erlpack.pack : JSON.stringify;
    static encoding = erlpack ? 'etf' : 'json';

    static create(gateway, query = {}, ...args) {
        const [g, q] = gateway.split('?');
        query.encoding = WebSocketManager.encoding;
        query = new URLSearchParams(query);
        if (q) new URLSearchParams(q).forEach((v, k) => query.set(k, v));
        const wsIns = new WebSocket(`${g}?${query}`, ...args);
        // if (browser) wsIns.binaryType = 'arraybuffer';
        return wsIns;
    }

    static unpack(data, type) {
        if (WebSocketManager.encoding === 'json' || type === 'json') {
          if (typeof data !== 'string') {
            data = decoder.decode(data);
          }
          return JSON.parse(data);
        }
        if (!Buffer.isBuffer(data)) data = Buffer.from(new Uint8Array(data));
        return erlpack.unpack(data);
    }

    constructor(client) {     
        super();

        this.client = client;
        this.connection = null;
        this.id = 0;
    }

    setTimeoutHello(clear) {
        if(clear) {
            if(this.helloTimeout){
                clearTimeout(this.helloTimeout);
                this.helloTimeout = null;
            }
        }else{
            if(this.helloTimeout) clearTimeout(this.helloTimeout);
            this.helloTimeout = setTimeout(() => {
                this.destroy({ codeClose: 4009 });
            }, 20 * 1000);
        }
    }

    setIntervalHeartbeat(time) {
        if(typeof time === 'boolean' && time) {
            if(this.heartbeatTimeout){
                clearTimeout(this.heartbeatTimeout);
                this.heartbeatTimeout = null;
            }
        }else{
            if(this.heartbeatTimeout) clearInterval(this.heartbeatTimeout);
            this.heartbeatTimeout = setInterval(() => {
                this.sendHeartbeat();
            }, time);
        }
    }

    sendHeartbeat(tag = 'TIMER') {
        if(!this.lastHeartbeatAcked) {
            console.log(`
Stats    -> ${this.connection ? WebSocketStats[this.connection.readyState] : 'No Connection??'}
Sequence -> ${this.sequence}`);
            return this.destroy({ codeClose: 4009, reset: true });
        }

        console.log(`[HEARTBEAT (${tag})] >> Sent heartbeat.`);
        this.lastHeartbeatAcked = false;
        this.lastPingTimestamp = Date.now();    
        this.send({ op: OPCodes.HEARTBEAT, d: this.sequence });
    }

    ackHeartbeat() {
        this.lastHeartbeatAcked = true;
        this.ping = Date.now() - this.lastPingTimestamp;
        console.log(`[HEARTBEAT ACK] << Heartbeat with latency ${this.ping}ms.`);
    }

    async connect () {
        let { settings } = this.client.constants;

        if (this.connection && this.connection.readyState === WebSocket.OPEN) { //  && this.status === Status.READY
            return Promise.resolve();
        }

        return new Promise(async (resolve, reject) => {
            const cleanup = () => {
                this.removeListener(ShardEvents.CLOSE, onClose);
                this.removeListener(ShardEvents.READY, onReady);
                this.removeListener(ShardEvents.RESUMED, onResumed);
                this.removeListener(ShardEvents.INVALID_SESSION, onInvalidOrDestroyed);
                this.removeListener(ShardEvents.DESTROYED, onInvalidOrDestroyed);
            };
    
            const onReady = () => {
                cleanup();
                resolve();
            };
    
            const onResumed = () => {
                cleanup();
                resolve();
            };
    
            const onClose = event => {
                cleanup();
                reject(event);
            };
    
            const onInvalidOrDestroyed = () => {
                cleanup();
                reject();
            };
    
            this.once(ShardEvents.READY, onReady);
            this.once(ShardEvents.RESUMED, onResumed);
            this.once(ShardEvents.CLOSE, onClose);
            this.once(ShardEvents.INVALID_SESSION, onInvalidOrDestroyed);
            this.once(ShardEvents.DESTROYED, onInvalidOrDestroyed);

            let gateway = await this.client.requester.api.gateway.bot.get()
                .catch(error => {
                    throw error.httpStatus === 401 ? new Error('TOKEN_INVALID') : error;
                });
    
            console.log('[DATA (/gateway/bot)] ', gateway);
    
            if(gateway && gateway.url) {
                let query = { v: settings.ws.version };

                if (zlib) {
                    this.inflate = new zlib.Inflate({
                        chunkSize: 65535,
                        flush: zlib.Z_SYNC_FLUSH,
                        to: WebSocketManager.encoding === 'json' ? 'string' : '',
                    });
                    query.compress = 'zlib-stream';
                }

                // Debug
                console.log(`
Gateway     -> ${gateway.url}
Version     -> ${settings.ws.version}
Encoding    -> ${WebSocketManager.encoding}
Compression -> ${zlib ? query.compress : 'nothing' }`);

                this.setTimeoutHello(true);

                this.connectedAt = Date.now();

                this.connection = WebSocketManager.create(gateway.url, query);
                this.connection.onopen = this.onOpen.bind(this);
                this.connection.onmessage = this.onMessage.bind(this);
                this.connection.onerror = this.onError.bind(this);
                this.connection.onclose = this.onClose.bind(this);
            }
        });
    }

    onOpen() {
        console.log(`[OPEN] URL: ${this.connection.url}, it took ${Date.now() - this.connectedAt} ms`);
    }

    onMessage({ data }) {
        if(data instanceof ArrayBuffer) data = Buffer.from(data);

        if(zlib) {
            let dl = data.length;
            let flush = dl >= 4 
                && data[dl - 4] === WebSocketManager.ZLIB_SUFFIX[0]
                && data[dl - 3] === WebSocketManager.ZLIB_SUFFIX[1]
                && data[dl - 2] === WebSocketManager.ZLIB_SUFFIX[2]
                && data[dl - 1] === WebSocketManager.ZLIB_SUFFIX[3];

            this.inflate.push(data, flush && zlib.Z_SYNC_FLUSH);
            if(!flush) return;
            data = this.inflate.result;
        }

        try {
            data = WebSocketManager.unpack(data);
            if (data.op === OPCodes.DISPATCH) 
                this.client.emit(data.t, data.d, this.sessionID);
        } catch (error) {
            return console.error(`Oups ! data broken...`, error);
        }

        this.onPacket(data);
    }

    onError(data) {
        console.log('[ERROR] ', data);
    }

    onClose(event) {
        if (this.sequence !== -1) 
            this.closeSequence = this.sequence;
        this.sequence = -1;

        console.log(`[CLOSE]
Event Code -> ${event.code}
Clean      -> ${event.wasClean}
Reason     -> ${event.reason || 'No reason received'}`);

        this.setTimeoutHello(true);
        this.setIntervalHeartbeat(true);

        if (this.connection) this._cleanupConnection();
    }

    onPacket(packet) {
        if(!packet) 
            return console.log(`aah ! les packets sont cassés ...`);

        switch(packet.t) {
            /**
             * contains the initial state information
             */
            case GatewayEvents.READY:
                this.sessionID = packet.d.session_id;
                this.guilds = new Set(packet.d.guilds.map(d => d.id));
                console.log(`[READY] Ready with session ID: ${this.sessionID}`);
                this.lastHeartbeatAcked = true;
                this.sendHeartbeat('READY');
                break;
            /**
             * 	response to Resume
             */
            case GatewayEvents.RESUMED:
                console.log(`[RESUMED] Session ID (${this.sessionID}) resumed and replayed ${packet.s - this.closeSequence} events.`)
                this.lastHeartbeatAcked = true;
                this.sendHeartbeat('RESUMED');
                break;
        }
        
        // Sequence update
        if (packet.s > this.sequence) this.sequence = packet.s;

        // Testing OPCode
        switch(packet.op) {
            case OPCodes.HELLO:
                this.setTimeoutHello(true);
                this.setIntervalHeartbeat(packet.d.heartbeat_interval);
                this.identify();
                break;
            case OPCodes.RECONNECT:
                this.destroy({ codeClose: 4000 });
                break;
            case OPCodes.INVALID_SESSION:
                if(packet.d) {
                    return this.identify();
                }
                this.sequence = -1;
                this.sessionID = null;
                break;
            case OPCodes.HEARTBEAT_ACK:
                this.ackHeartbeat();
                break;
            case OPCodes.HEARTBEAT:
                this.sendHeartbeat('RECEIVE');
                break;
            default:
                this.managePacket(packet);

                // Just for update property "guild" in class WebsocketManager
                if (packet.t === GatewayEvents.GUILD_DELETE) {
                    this.guilds.delete(packet.d.id);
                }
                if (packet.t === GatewayEvents.GUILD_CREATE) {
                    this.guilds.set(packet.d.id);
                }
        }
    }
    
    destroy(options = { codeClose: 1000, reset: false }) {
        if(this.connection) {
            if(this.connection.readyState === WebSocket.OPEN) {
                this.connection.close(options.codeClose);
            }else{
                console.log(`State : ${WebSocketStats[this.connection.readyState]}`);
                this._cleanupConnection();
                
                try {
                    this.connection.close(options.codeClose);
                } catch (error) {
                    // No open
                }
            }
        }

        this.connection = null;

        if (this.sequence !== -1) 
            this.cacheSequence = this.sequence;

        if(options.reset) {
            this.sequence = null;
        }
    }
    
    identify() {
        let d = {
            token: this.client.token
        };
        // Resumed
        if(this.sessionID) {
            d.session_id = this.sessionID;
            d.seq = this.cacheSequence;
            
            console.log(`<RESUME> Session ID: ${this.sessionID}, Sequence: ${this.sequence}`);
        }
        // New
        else{
            d = {
                ...d,
                ...this.client.options.ws,
                shard: [this.id, Number(this.client.options.shardCount)]
            };

            console.log(`<IDENTIFY> New identification...`);
        }

        this.send({ op: this.sessionID ? OPCodes.RESUME : OPCodes.IDENTIFY, d });
    }

    send(data) {
        if (!this.connection || this.connection.readyState !== WebSocket.OPEN) {
            console.log(`Tried to send packet '${JSON.stringify(data)}' but no WebSocket is available!`);
            this.destroy({ close: 4000 });
            return;
        }
    
        this.connection.send(WebSocketManager.pack(data), err => {
            if (err) console.error('Error during pack data: ', err);
        });
    }

    _cleanupConnection() {
        this.connection.onopen = this.connection.onclose = this.connection.onerror = this.connection.onmessage = null;
    }

    /**
     * function reserve for handle packet
     */
    managePacket(packet) {
        let gatewayNameEvent = Utils.capitalize(packet.t, true).replace(" ", "");   

        if(packet && this.client.actions[gatewayNameEvent]) {
            this.client.actions[gatewayNameEvent].handle(packet, null);
        }
        return true;
    }

    triggerClientReady() {
        this.status = Status.READY;

        this.client.readyAt = new Date();

        /**
         * @event Client#ready
         */
        this.client.emit(ClientEvents.CLIENT_READY);

        this.managePacket();
    }
}

module.exports = WebSocketManager;