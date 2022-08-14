const fs = require("fs-extra");

this.config = {
	name: "adminonly",
	version: "1.0.1",
	author: {
		name: "lnwSCK",
		contacts: ""
	},
	cooldowns: 5,
	role: 2,
	shortDescription: "เปิด / ปิดเฉพาะผู้ดูแลระบบเพื่อใช้ bot",
	longDescription: "เปิด/ปิดโหมด เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถใช้บอทได้",
	category: "owner",
	guide: "{prefix}{name} [on|off]"
};

module.exports = {
	config: this.config,
	start: function ({ globalGoat, args, message, client }) {
		const { config } = globalGoat;
		if (args[0] == "on") {
			config.adminOnly = true;
			message.reply("โหมดเปิดใช้งาน เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถใช้บอทได้");
			fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
		}
		else if (args[0] == "off") {
			config.adminOnly = false;
			message.reply("โหมดปิดใช้งาน เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถใช้บอทได้");
			fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
		}
		else return message.reply("โปรดเลือกโหมดเปิดหรือปิด");
	}
};