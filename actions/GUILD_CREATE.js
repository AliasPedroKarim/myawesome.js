const ActionGeneric = require("./ActionGeneric");
const Guild = require("./../structures/Guild");
const Constants = require("./../settings/Constants");

class GuildCreate extends ActionGeneric {
    constructor(client) {
        super(client);
    }

    handle(packet) {
        return this.parse(packet.d);
    }

    parse(data) {
        this.client.guilds.set(data.id, new Guild(this.client, data));
        this.client.emit(Constants.ClientEvents.JOIN_GUILD, this.client.guilds.get(data.id));
    }
}

module.exports = GuildCreate;