module.exports = class Generic {
    constructor(client) {
        if (!client) throw new Error('The first parameter must absolutely be provided !');
        this.client = client;
    }
}