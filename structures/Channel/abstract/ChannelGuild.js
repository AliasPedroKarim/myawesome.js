const ChannelGeneric = require('./ChannelGeneric');

/**
 * No instantiable
 * @type {module.ChannelGuild}
 */
module.exports = class ChannelGuild extends ChannelGeneric {
    guildID;
    guild;
    position;
    name;
    nsfw;
    permissionOverwrites;
    parentID;
    parent;

    constructor(client, payload) {
        super(client, payload);

        this.guildID = payload.guild_id;
        this.guild = this.client.guilds.get(this.guildID);

        this.name = payload.name;
        this.position = payload.position;
        this.nsfw = !!payload.nsfw;
        this.permissionOverwrites = payload.permission_overwrites;

        this.parentID = payload.parent_id;

        if (this.guild && this.guild.channels)
            this.parent = this.guild.channels.get(payload.parent_id);
    }

}