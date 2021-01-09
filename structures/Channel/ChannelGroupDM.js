const ChannelDM = require('./ChannelDM');
const ChannelMessage = require('./abstract/ChannelMessage');

class ChannelGroupDM extends ChannelDM {
    name;
    icon;
    ownerID;
    owner;

    constructor(client, payload) {
        super(client, payload);

        this.name = payload.name;
        this.icon = payload.icon;
        this.ownerID = payload.owner_id;
        this.owner = this.client.users.get(this.ownerID);
    }
}

Object.assign(ChannelGroupDM.prototype, ChannelMessage);

module.exports = ChannelGroupDM;