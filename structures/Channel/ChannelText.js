const ChannelGuild = require('./abstract/ChannelGuild');
const ChannelMessage = require('./abstract/ChannelMessage');

class ChannelText extends ChannelGuild {}

Object.assign(ChannelText.prototype, ChannelMessage);

module.exports = ChannelText;