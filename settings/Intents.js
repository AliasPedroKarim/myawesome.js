const BitField = require('./BitField');

class Intents extends BitField {
    /**
     * GUILDS (1 << 0)
     *  - GUILD_CREATE
     *  - GUILD_UPDATE
     *  - GUILD_DELETE
     *  - GUILD_ROLE_CREATE
     *  - GUILD_ROLE_UPDATE
     *  - GUILD_ROLE_DELETE
     *  - CHANNEL_CREATE
     *  - CHANNEL_UPDATE
     *  - CHANNEL_DELETE
     *  - CHANNEL_PINS_UPDATE
     * GUILD_MEMBERS (1 << 1)
     *  - GUILD_MEMBER_ADD
     *  - GUILD_MEMBER_UPDATE
     *  - GUILD_MEMBER_REMOVE
     * GUILD_BANS (1 << 2)
     *  - GUILD_BAN_ADD
     *  - GUILD_BAN_REMOVE
     * GUILD_EMOJIS (1 << 3)
     *  - GUILD_EMOJIS_UPDATE
     * GUILD_INTEGRATIONS (1 << 4)
     *  - GUILD_INTEGRATIONS_UPDATE
     * GUILD_WEBHOOKS (1 << 5)
     *  - WEBHOOKS_UPDATE
     * GUILD_INVITES (1 << 6)
     *  - INVITE_CREATE
     *  - INVITE_DELETE
     * GUILD_VOICE_STATES (1 << 7)
     *  - VOICE_STATE_UPDATE
     * GUILD_PRESENCES (1 << 8)
     *  - PRESENCE_UPDATE
     * GUILD_MESSAGES (1 << 9)
     *  - MESSAGE_CREATE
     *  - MESSAGE_UPDATE
     *  - MESSAGE_DELETE
     *  - MESSAGE_DELETE_BULK
     * GUILD_MESSAGE_REACTIONS (1 << 10)
     *  - MESSAGE_REACTION_ADD
     *  - MESSAGE_REACTION_REMOVE
     *  - MESSAGE_REACTION_REMOVE_ALL
     *  - MESSAGE_REACTION_REMOVE_EMOJI
     * GUILD_MESSAGE_TYPING (1 << 11)
     *  - TYPING_START
     * DIRECT_MESSAGES (1 << 12)
     *  - MESSAGE_CREATE
     *  - MESSAGE_UPDATE
     *  - MESSAGE_DELETE
     *  - CHANNEL_PINS_UPDATE
     * DIRECT_MESSAGE_REACTIONS (1 << 13)
     *  - MESSAGE_REACTION_ADD
     *  - MESSAGE_REACTION_REMOVE
     *  - MESSAGE_REACTION_REMOVE_ALL
     *  - MESSAGE_REACTION_REMOVE_EMOJI
     * DIRECT_MESSAGE_TYPING (1 << 14)
     *  - TYPING_START
     * @type {{}}
     */
    static FLAGS = {
        GUILDS: 1 << 0,
        GUILD_MEMBERS: 1 << 1,
        GUILD_BANS: 1 << 2,
        GUILD_EMOJIS: 1 << 3,
        GUILD_INTEGRATIONS: 1 << 4,
        GUILD_WEBHOOKS: 1 << 5,
        GUILD_INVITES: 1 << 6,
        GUILD_VOICE_STATES: 1 << 7,
        GUILD_PRESENCES: 1 << 8,
        GUILD_MESSAGES: 1 << 9,
        GUILD_MESSAGE_REACTIONS: 1 << 10,
        GUILD_MESSAGE_TYPING: 1 << 11,
        DIRECT_MESSAGES: 1 << 12,
        DIRECT_MESSAGE_REACTIONS: 1 << 13,
        DIRECT_MESSAGE_TYPING: 1 << 14,
    }

    static PRIVILEGED = Intents.FLAGS.GUILD_MEMBERS | Intents.FLAGS.GUILD_PRESENCES;
    static ALL = Object.values(Intents.FLAGS).reduce((acc, p) => acc | p, 0);
    static NON_PRIVILEGED = Intents.ALL & ~Intents.PRIVILEGED;
}

module.exports = Intents;