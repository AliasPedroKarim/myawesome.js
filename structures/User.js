const Generic = require('./Generic');

module.exports = class User extends Generic {
    id;
    username;
    discriminator;
    avatar;
    bot;

    constructor(client, payload) {
        super(client);

        this.id = payload.id;
        this.username = payload.username;
        this.discriminator = payload.discriminator;
        this.avatar = payload.avatar;
        this.bot = !!payload.bot;
    }

    get tag() {
        return `${this.username}#${this.discriminator}`;
    }
}