let p = require(require('path').resolve('./package.json'));
let constants = {};

constants.UserAgent = `DiscordBot (${p.name}/${p.version}) NodeJS/${process.version}`;

constants.settings = {
  shardCount: 1,
  timeoutRequest: 15000,

  /**
   * WebSocket options (these are left as snake_case to match the API)
   * @typedef {Object} WebsocketOptions
   * @property {number} [large_threshold=50] Number of members in a guild after which offline users will no longer be
   * sent in the initial guild member list, must be between 50 and 250
   * @property {IntentsResolvable} [intents] Intents to enable for this connection
   */
  ws: {
    large_threshold: 50,
    compress: false,
    properties: {
      $os: process.platform,
      $browser: p.name,
      $device: p.name,
    },
    version: 6,
  },

  /**
   * HTTP options
   * @typedef {Object} HTTPOptions
   * @property {number} [version=7] API version to use
   * @property {string} [api='https://discord.com/api'] Base url of the API
   * @property {string} [cdn='https://cdn.discordapp.com'] Base url of the CDN
   * @property {string} [invite='https://discord.gg'] Base url of invites
   * @property {string} [template='https://discord.new'] Base url of templates
   */
  http: {
    version: 7,
    api: "https://discord.com/api",
    cdn: "https://cdn.discordapp.com",
    invite: "https://discord.gg",
    template: "https://discord.new",
  },
};

constants.Events = {
  DEBUG: 'debug'
}

constants.OPCodes = {
  DISPATCH: 0,
  HEARTBEAT: 1,
  IDENTIFY: 2,
  STATUS_UPDATE: 3,
  VOICE_STATE_UPDATE: 4,
  VOICE_GUILD_PING: 5,
  RESUME: 6,
  RECONNECT: 7,
  REQUEST_GUILD_MEMBERS: 8,
  INVALID_SESSION: 9,
  HELLO: 10,
  HEARTBEAT_ACK: 11,
};

/**
 * Gateway Events Name
 */
constants.GatewayEvents = {
  HELLO: 'HELLO',
  READY: 'READY',
  RESUMED: 'RESUMED',
  RECONNECT: 'RECONNECT',
  INVALID_SESSION: 'INVALID_SESSION',
  CHANNEL_CREATE: 'CHANNEL_CREATE',
  CHANNEL_UPDATE: 'CHANNEL_UPDATE',
  CHANNEL_DELETE: 'CHANNEL_DELETE',
  CHANNEL_PINS_UPDATE: 'CHANNEL_PINS_UPDATE',
  GUILD_CREATE: 'GUILD_CREATE',
  GUILD_UPDATE: 'GUILD_UPDATE',
  GUILD_DELETE: 'GUILD_DELETE',
  GUILD_BAN_ADD: 'GUILD_BAN_ADD',
  GUILD_BAN_REMOVE: 'GUILD_BAN_REMOVE',
  GUILD_EMOJIS_UPDATE: 'GUILD_EMOJIS_UPDATE',
  GUILD_INTEGRATIONS_UPDATE: 'GUILD_INTEGRATIONS_UPDATE',
  GUILD_MEMBER_ADD: 'GUILD_MEMBER_ADD',
  GUILD_MEMBER_REMOVE: 'GUILD_MEMBER_REMOVE',
  GUILD_MEMBER_UPDATE: 'GUILD_MEMBER_UPDATE',
  GUILD_MEMBERS_CHUNK: 'GUILD_MEMBERS_CHUNK',
  GUILD_ROLE_CREATE: 'GUILD_ROLE_CREATE',
  GUILD_ROLE_UPDATE: 'GUILD_ROLE_UPDATE',
  GUILD_ROLE_DELETE: 'GUILD_ROLE_DELETE',
  INVITE_CREATE: 'INVITE_CREATE',
  INVITE_DELETE: 'INVITE_DELETE',
  MESSAGE_CREATE: 'MESSAGE_CREATE',
  MESSAGE_UPDATE: 'MESSAGE_UPDATE',
  MESSAGE_DELETE: 'MESSAGE_DELETE',
  MESSAGE_DELETE_BULK: 'MESSAGE_DELETE_BULK',
  MESSAGE_REACTION_ADD: 'MESSAGE_REACTION_ADD',
  MESSAGE_REACTION_REMOVE: 'MESSAGE_REACTION_REMOVE',
  MESSAGE_REACTION_REMOVE_ALL: 'MESSAGE_REACTION_REMOVE_ALL',
  MESSAGE_REACTION_REMOVE_EMOJI: 'MESSAGE_REACTION_REMOVE_EMOJI',
  PRESENCE_UPDATE: 'PRESENCE_UPDATE',
  TYPING_START: 'TYPING_START',
  USER_UPDATE: 'USER_UPDATE',
  VOICE_STATE_UPDATE: 'VOICE_STATE_UPDATE',
  VOICE_SERVER_UPDATE: 'VOICE_SERVER_UPDATE',
  WEBHOOKS_UPDATE: 'WEBHOOKS_UPDATE'
}

constants.ShardEvents = {
  CLOSE: 'close',
  DESTROYED: 'destroyed',
  INVALID_SESSION: 'invalidSession',
  READY: 'ready',
  RESUMED: 'resumed',
  ALL_READY: 'allReady',
};

constants.Status = {
  READY: 0,
  CONNECTING: 1,
  RECONNECTING: 2,
  IDLE: 3,
  NEARLY: 4,
  DISCONNECTED: 5,
  WAITING_FOR_GUILDS: 6,
  IDENTIFYING: 7,
  RESUMING: 8,
};

constants.ClientEvents = {
  CLIENT_READY: 'ready',
  RATE_LIMIT: 'rateLimit',
  MESSAGE: 'message',
  JOIN_GUILD: 'joinGuild',
  LEAVE_GUILD: 'leaveGuild',
};

module.exports = constants;
