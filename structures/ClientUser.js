const User = require('./User');

module.exports = class ClientUser extends User {
    mfa_enabled;
    flags;
    verified;

    constructor(client, payload) {
        super(client, payload);

        this.mfa_enabled = payload.mfa_enabled;
        this.flags = payload.flags;
        this.verified = payload.verified;
    }
}