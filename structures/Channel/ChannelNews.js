const ChannelGuild = require('./abstract/ChannelGuild');
const ChannelMessage = require('./abstract/ChannelMessage');

class ChannelNews extends ChannelGuild {}

Object.assign(ChannelNews.prototype, ChannelMessage);

module.exports = ChannelNews;