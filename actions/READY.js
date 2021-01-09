const ActionGeneric = require("./ActionGeneric");
const Guild = require("./../structures/Guild");
const ClientUser = require("./../structures/ClientUser");

class Ready extends ActionGeneric {
    constructor(client) {
        super(client);
    }

    handle(packet) {
        return this.parse(packet.d);
    }

    parse(data) {
        // console.log(`[${this.constructor.name}] `, data);

        if (data && Array.isArray(data.guilds)) {
            data.guilds.forEach(({id}, key) => {
                this.client.guilds.set(id, new Guild(this.client, id));
            });
        }

        if (data.user)
            this.client.user = new ClientUser(this.client, data.user);
    }
}

module.exports = Ready;