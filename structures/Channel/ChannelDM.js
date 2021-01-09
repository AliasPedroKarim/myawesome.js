const ChannelGeneric = require('./abstract/ChannelGeneric');
const ChannelMessage = require('./abstract/ChannelMessage');
const Collection = require('../../settings/Collection');

class ChannelDM extends ChannelGeneric {
    recipients;
    lastMessageID;
    lastMessage;
    messages = new Collection();

    constructor(client, payload) {
        super(client, payload);

        this.recipients = payload.recipients;
        this.lastMessageID = payload.last_message_id;
        this.lastMessage = this.messages.get(this.lastMessageID);
    }
}

Object.assign(ChannelDM.prototype, ChannelMessage);

module.exports = ChannelDM;