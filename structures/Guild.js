const Generic = require('./Generic');
const GuildMember = require('./GuildMember');
const Collection = require('./../settings/Collection');
const FactoryStructure = require('./../settings/FactoryStructure');

module.exports = class Guild extends Generic {
    id;
    name;
    icon;
    splash;

    channels = new Collection();
    members = new Collection();
    presences = new Collection();

    constructor(client, id) {
        super(client);

        this.id = id;
        this.hydrate();
    }

    /**
     * Get icon url guild
     * @param {{ animate?: boolean, format?: "png" | "jpg" | "jpeg" | "webp" | "gif", size?: number }} options
     * @returns {null|string}
     */
    iconURL(options = {}) {
        if (this.icon)
            return this.client.requester.cdn.guild_icon({ guild_id: this.id, hash: this.icon }, options);
        else return null;
    }

    /**
     * Get slash url guild
     * @param {{ animate?: boolean, format?: "png" | "jpg" | "jpeg" | "webp", size?: number }} options
     * @returns {null|string}
     */
    splashURL(options = {}) {
        if (this.splash)
            return this.client.requester.cdn.guild_splash({ guild_id: this.id, hash: this.splash }, options);
        else return null;
    }

    hydrate() {
        this.client.api.guilds(this.id).get()
            .then((guild) => {
                this.name = guild.name;
                this.icon = guild.icon;
                this.splash = guild.splash;

                if (Array.isArray(guild.members)) {
                    for (const member of guild.members) {
                        this.members.set(member.id, new GuildMember(this.client, member));
                    }
                }
            })
            .catch(() => {});

        this.client.api.guilds(this.id).channels.get()
            .then((channels) => {
                if(Array.isArray(channels)) {
                    for (const channel of channels) {
                        const channelBuild = FactoryStructure.channel(this.client, channel);

                        // Cached channel in guild and client
                        this.channels.set(channel.id, channelBuild);
                        if (!this.client.channels.get(channel.id)) {
                            this.client.channels.set(channel.id, channelBuild);
                        }
                    }
                }
            })
            .catch(() => {});
    }
}