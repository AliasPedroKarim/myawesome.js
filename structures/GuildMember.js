const Generic = require('./Generic');
const User = require('./User');

module.exports = class GuildMember extends Generic {
    id;
    user;
    nick;
    roles;
    joinedAtTime;
    joinedAt;
    premiumSinceTime;
    premiumSince;
    deaf;
    mute;
    pending;

    constructor(client, payload) {
        super(client);

        if (payload.user) {
            this.id = payload.user.id;
            this.user = this.client.users.get(this.id) || new User(this.client, payload.user);
            this.client.users.set(this.id, this.user);
        }

        this.nick = payload.nick;
        this.roles = payload.roles;
        this.joinedAtTime = payload.joined_at;
        this.joinedAt = new Date(payload.joined_at);

        this.premiumSinceTime = payload.premium_since;
        if (this.premiumSinceTime)
            this.premiumSince = new Date();

        this.deaf = !!payload.deaf;
        this.mute = !!payload.mute;
        this.pending = !!payload.pending;
    }
}