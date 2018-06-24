const fs = require('fs');
const dotenv = require('dotenv');
const fastify = require('fastify');
const chalk = require('chalk');

const package = require('./package.json');

// Show splash.
console.log(chalk`\n{yellow ${package.description}} {blue v${package.version}} {gray (${package.license})}\n`);

// Setup environmental variables from file.
dotenv.config();

const db = require('./db.js');
const debug = require('./utils/debug.js');
const data = require('./data.js');

const app = fastify();

// Load routes dynamically from folder.
for (const file of fs.readdirSync('routes')) app.register(require(`./routes/${file}`));

data.update().then(async () => {
	const port = process.env['PORT'];
	await app.listen(port);
	debug.info(`Started listening on port ${chalk.blue(port)}`);
});

// Schedule data update.
setInterval(() => {
	
	const date = new Date();
	const time = date.getHours().toFixed(0, 2) + date.getMinutes().toFixed(0, 2) + date.getSeconds().toFixed(0, 2);
	
	switch (time) {
		case '060000': return void data.update();
		case '000000': return void db.query('DELETE FROM favorites');
	}
	
}, 1000);