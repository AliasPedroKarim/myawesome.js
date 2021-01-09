const ActionGeneric = require("./ActionGeneric");
const Constants = require("./../settings/Constants");

class GuildDelete extends ActionGeneric {
    constructor(client) {
        super(client);
    }

    handle(packet) {
        return this.parse(packet.d);
    }

    parse(data) {
        let guild;
        if (guild = this.client.guilds.get(data.id)) {
            this.client.emit(Constants.ClientEvents.LEAVE_GUILD, guild);
            this.client.guilds.delete(guild.id);
        }
    }
}

module.exports = GuildDelete;