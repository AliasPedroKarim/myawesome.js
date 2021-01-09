const ChannelText = require('../structures/Channel/ChannelText');
const ChannelDM = require('../structures/Channel/ChannelDM');
const ChannelGroupDM = require('../structures/Channel/ChannelGroupDM');
const ChannelVoice = require('../structures/Channel/ChannelVoice');
const ChannelCategory = require('../structures/Channel/ChannelCategory');
const ChannelNews = require('../structures/Channel/ChannelNews');
const ChannelStore = require('../structures/Channel/ChannelStore');

const Message = require('./../structures/Message');

exports.channel = (client, payload) => {
    if (!payload || (payload && (payload.type === null || payload.type === undefined))) throw new Error('Payload or (property "type" in payload) channel is require.');

    switch (payload.type) {
        // Guild Text Channel
        case 0:
            return new ChannelText(client, payload);
        // DM Channel
        case 1:
            return new ChannelDM(client, payload);
        // Guild Voice Channel
        case 2:
            return new ChannelVoice(client, payload);
        // Group DM Channel
        case 3:
            return new ChannelGroupDM(client, payload);
        // Guild Category Channel
        case 4:
            return new ChannelCategory(client, payload);
        // Guild News Channel
        case 5:
            return new ChannelNews(client, payload);
        // Guild Store Channel
        default:
            return new ChannelStore(client, payload);
    }
}

exports.message = (client, payload) => {
    if (!payload || (payload && (payload.type === null || payload.type === undefined))) throw new Error('Payload or (property "type" in payload) message is require.');

    switch (payload.type) {
        // Default
        case 0:
        // Reply
        case 19:
            return new Message(client, payload);
        // Guild Store Channel
        default:
            return null;
    }
};