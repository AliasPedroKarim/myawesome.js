const Generic = require('../structures/Generic');

class ActionGeneric extends Generic {
    constructor(client) {
        super(client);
    }

    handle(packet) {
        return this.parse(packet.d);
    }

    parse(data) {
        return data;
    }
}

module.exports = ActionGeneric;