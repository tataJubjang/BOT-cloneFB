this.config = {
	name: "reload",
	version: "1.0.2",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 2,
	shortDescription: "reload file config",
	longDescription: "load lại file config.json หรือ configComands.json ลงในตัวแปร globalGoat",
	guide: "{p}{n} [config | cmds]",
	category: "owner"
};

module.exports = {
	config: this.config,
	start: async function ({ globalGoat, args, threadsData, message, event }) {
		const content = (args[0] || "").toLowerCasee();
		if (["config"].includes(content)) {
			delete require.cache[require.resolve(client.dirConfig)];
			globalGoat.config = require(client.dirConfig);
			return message.reply("โหลดซ้ำ config.json");
		}
		else if (["cmds", "cmd", "command", "commands"].includes(content)) {
			delete require.cache[require.resolve(client.dirConfigCommands)];
			globalGoat.configComands = require(client.dirConfig);
			return message.reply("โหลดซ้ำ configComands.json");
		}
		else return message.SyntaxError();
	}
};