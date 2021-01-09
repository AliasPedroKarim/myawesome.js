const Generic = require('../../Generic');

module.exports = class ChannelGeneric extends Generic {
    id;
    type;
    typeID;

    constructor(client, payload) {
        super(client);

        this.id = payload.id;
        this.type = this.parseType(payload.type);
        this.typeID = payload.type;
    }

    parseType (type) {
        switch (type) {
            // Guild Text Channel
            case 0:
                return 'text';
            // DM Channel
            case 1:
                return 'dm';
            // Guild Voice Channel
            case 2:
                return 'voice';
            // Group DM Channel
            case 3:
                return 'group';
            // Guild Category Channel
            case 4:
                return 'category';
            // Guild News Channel
            case 5:
                return 'news';
            // Guild Store Channel
            case 6:
                return 'store';
            default:
                return null;
        }
    }
}