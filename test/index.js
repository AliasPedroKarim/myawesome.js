require('dotenv').config();

const MyAwesome = require('./../index');

let client = new MyAwesome.Client();

client.on(MyAwesome.utils.ClientsEvents.MESSAGE, (message) => {
    console.log('[Test Area] | AAH ! un nouveau message : ', message.content);
    console.log('[Test Area] | récupérer l\'url du serveur : ', message.guild.iconURL({ animate: true }));
});

/*
Test requester

client.api
    .oauth2
    .applications('@me')
    .get()
    .then(console.log)
*/

client.login(process.env.DISCORD_TOKEN);
