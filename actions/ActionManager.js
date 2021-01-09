const fs = require('fs');
const path = require('path');

const ActionGeneric = require('./ActionGeneric');
const Generic = require('../structures/Generic');

class ActionManager extends Generic {
    static FILES_IGNORE = ['ActionGeneric', 'ActionManager'];

    constructor(client) {
        super(client);

        this.registers();
    }

    registers() {
        for(let actionFile of fs.readdirSync('./actions')) {
            if(actionFile.endsWith('.js') && !ActionManager.FILES_IGNORE.includes(actionFile.replace('.js', ''))) {
                this.register(require(path.resolve(__dirname, actionFile)));
            }
        }
    }

    register(ActionChild) {
        if(ActionChild.prototype && ActionChild.prototype instanceof ActionGeneric) {
            this[ActionChild.name] = new ActionChild(this.client);
        }
    }
}

module.exports = ActionManager;