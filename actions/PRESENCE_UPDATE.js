const ActionGeneric = require("./ActionGeneric");
const Presence = require("./../structures/Presence");

class PresenceUpdate extends ActionGeneric {
    constructor(client) {
        super(client);
    }

    handle(packet) {
        return this.parse(packet.d);
    }

    parse(data) {
        if (data?.guild_id) {
            const guild = this.client.guilds.get(data.guild_id);
            const presence = new Presence(this.client, data);
            // Cached presence in client
            this.client.presences.set(data.user.id, presence);
            if (guild) {
                // Cached presence in guild
                guild.presences.set(data.user.id, this.client.presences.get(data.user.id));
            }
        }
    }
}

module.exports = PresenceUpdate;