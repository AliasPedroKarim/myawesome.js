let EmitterEvent;

try {
    EmitterEvent = require('eventemitter3');
} catch (error) {
    EmitterEvent = require('events');
}

const { settings } = require('./settings/Constants');
const Utils = require('./settings/Utils');
const Collection = require('./settings/Collection');

class ClientGeneric extends EmitterEvent {
    tokenType;

    /**
     * @param {{ tokenType: String }} options
     */
    constructor(options = {}) {
        super();
        this.options = Utils.mergeDefault(settings, options);

        // Collection for structure global
        if (!this.guilds)
            this.guilds = new Collection();
        if (!this.users)
            this.users = new Collection();
        if (!this.channels)
            this.channels = new Collection();
        if (!this.presences)
            this.presences = new Collection();
    }
}

module.exports = ClientGeneric;