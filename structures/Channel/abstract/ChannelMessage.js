const Collection = require('../../../settings/Collection');
const FactoryStructure = require('../../../settings/FactoryStructure');

module.exports = {
    messages: new Collection(),
    addMessage: function (payload) {
        let messageBuild = FactoryStructure.message(this.client, payload);
        if (messageBuild)
            this.messages.set(messageBuild.id, messageBuild);
        return messageBuild;
    },
    removeMessage: function (id) {
        if (this.messages.get(id))
            this.messages.delete(id);
    }
};