'use strict';

const noop = () => {};
let CDNEndpoints = {
    custom_emoji: {
        format: ['png', 'gif'],
        path: ({ emoji_id }) => {
            return `emojis/${emoji_id}`;
        }
    },
    guild_icon: {
        format: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
        path: ({ guild_id, hash }) => {
            return `icons/${guild_id}/${hash}`;
        }
    },
    guild_splash: {
        format: ['png', 'jpg', 'jpeg', 'webp'],
        path: ({ guild_id, hash }) => {
            return `splashes/${guild_id}/${hash}`;
        }
    },
    guild_discovery_splash: {
        format: ['png', 'jpg', 'jpeg', 'webp'],
        path: ({ guild_id, hash }) => {
            return `discovery-splashes/${guild_id}/${hash}`;
        }
    },
    guild_banner: {
        format: ['png', 'jpg', 'jpeg', 'webp'],
        path: ({ guild_id, hash }) => {
            return `banners/${guild_id}/${hash}`;
        }
    },
    default_user_avatar: {
        format: ['png'],
        path: ({ user_discriminator }) => {
            return `embed/avatars/${user_discriminator}`;
        }
    },
    user_avatar: {
        format: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
        path: ({ user_id, hash }) => {
            return `avatars/${user_id}/${hash}`;
        }
    },
    application_icon: {
        format: ['png', 'jpg', 'jpeg', 'webp'],
        path: ({ application_id, icon }) => {
            return `app-icons/${application_id}/${icon}`;
        }
    },
    application_asset: {
        format: ['png', 'jpg', 'jpeg', 'webp'],
        path: ({ application_id, asset_id }) => {
            return `app-assets/${application_id}/${asset_id}`;
        }
    },
    achievement_icon: {
        format: ['png', 'jpg', 'jpeg', 'webp'],
        path: ({ application_id, achievement_id, hash }) => {
            return `app-assets/${application_id}/achievements/${achievement_id}/icons/${hash}`;
        }
    },
    team_icon: {
        format: ['png', 'jpg', 'jpeg', 'webp'],
        path: ({ team_id, team_icon }) => {
            return `team-icons/${team_id}/${team_icon}`;
        }
    }
}

/**
 * @see https://discord.com/developers/docs/reference#image-formatting-cdn-endpoints
 * @param base
 * @returns {string}
 */
function buildCDNEndpoint(base) {
    const handler = {
        get(target, property) {
            return (values, options = {}) => {
                options.size = typeof options.size !== 'number' && !isNaN(parseInt(options.size)) ? parseInt(options.size) : options.size;
                options = {
                    animate: typeof options.animate === 'boolean'? options.animate : false,
                    format: options.format ? options.format : 'png',
                    size: options.size >= 16 && options.size <= 4096 ? options.size : 256
                };
                options.format = values.hash && values.hash?.startsWith('a_') && options.animate ? 'gif' : options.format;

                const endpoint = CDNEndpoints[property?.toLowerCase()];
                if (endpoint) {
                    if (!endpoint.format?.includes(options.format)) throw new Error(`(${property?.toLowerCase()}) not support format (${options.format})`);

                    return `${base}/${endpoint.path(values)}.${options.format}?size=${options.size}`;
                }

                throw new Error('Property not supported.');
            }

        }
    };
    return new Proxy(noop, handler);
}

module.exports = buildCDNEndpoint;