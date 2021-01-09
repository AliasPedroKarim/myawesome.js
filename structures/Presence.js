const Generic = require('./Generic');

class ClientStatus {
    desktop;
    mobile;
    web;

    constructor(payload) {
        this.desktop = payload.desktop;
        this.mobile = payload.mobile;
        this.web = payload.web;
    }
}

module.exports = class Presence extends Generic {
    user;
    guildID;
    guild;
    status;
    activities;
    clientStatus;

    constructor(client, payload) {
        super(client);

        if (payload?.user?.id)
            this.user = this.client.users.get(payload.user.id);

        this.guildID = payload.guild_id;
        this.guild = this.client.guilds.get(this.guildID);
        this.status = ["idle", "dnd", "online", "offline"].includes(payload.status) ? payload.status : "offline";

        // TODO Faire la classe "Activity" après, https://discord.com/developers/docs/topics/gateway#activity-object-activity-structure
        this.activities = payload.activities;

        this.clientStatus = new ClientStatus(payload.client_status);
    }
}