const ActionGeneric = require("./ActionGeneric");
const Constants = require("./../settings/Constants");

class MessageCreate extends ActionGeneric {
    constructor(client) {
        super(client);
    }

    handle(packet) {
        return this.parse(packet.d);
    }

    parse(data) {
        if (data?.channel_id) {
            const channel = this.client.channels.get(data?.channel_id);
            if (channel?.addMessage)
                this.client.emit(Constants.ClientEvents.MESSAGE, channel.addMessage(data));
        }
    }
}

module.exports = MessageCreate;