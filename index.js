module.exports = {
    Client: require('./Client'),
    utils: {
        BitField: require('./settings/BitField'),
        Intents: require('./settings/Intents'),
        ClientsEvents: (require('./settings/Constants')).ClientEvents
    }
};