const Generic = require('./Generic');

module.exports = class Message extends Generic {
    id;
    guildID;
    channelID;
    author;
    channel;
    content;
    attachments = [];
    embeds = [];
    flags;

    constructor(client, payload) {
        super(client);
        this.id = payload.id;
        this.guildID = payload.guild_id;
        this.channelID = payload.channel_id;

        this.author = this.client.users.get(payload?.author?.id);
        this.guild = this.client.guilds.get(this.guildID);

        if (this.guild) {
            this.channel = this.guild.channels.get(this.channelID);
            this.member = this.guild.members.get(payload?.member?.id);
        }

        this.content = payload.content;
        this.attachments = payload.attachments;
        this.embeds = payload.embeds;
    }
}