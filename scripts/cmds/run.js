this.config = {
	name: "run",
	version: "1.0.0",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 2,
	shortDescription: "ทดสอบรหัสอย่างรวดเร็ว",
	longDescription: "ทดสอบรหัสอย่างรวดเร็ว",
	category: "owner",
	guide: "{prefix}run <รหัสที่จะทดสอบ>"
};

module.exports = {
	config: this.config,
	start: async function ({ api, globalGoat, args, download, message, client, event, threadsData, usersData, usersModel, threadsModel, configCommands }) {
		try {
			eval("(async () => {" + args.join(" ") + "})();");
		}
		catch (e) {
			message.send(`เกิดข้อผิดพลาด: ${e.message}`);
		}
	}
};