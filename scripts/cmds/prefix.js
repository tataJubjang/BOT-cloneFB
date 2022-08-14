this.config = {
	name: "prefix",
	version: "1.0.1",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "ดูหรือเปลี่ยนแปลง prefix",
	longDescription: "ดูหรือเปลี่ยนแปลง prefix ของกลุ่มคุณ",
	category: "box chat",
	guide: "{prefix}prefix <prefix อยากเปลี่ยน>: เปลี่ยน prefix ของกลุ่ม"
		+ "\nprefix: ดูคำนำหน้าปัจจุบัน"
		+ "\n"
		+ "\nตัวอย่างการเปลี่ยนแปลง prefix: {prefix}prefix !",
	priority: 1
};

module.exports = {
	config: this.config,
	start: async function ({ globalGoat, threadsData, message, args, event }) {
		if (!args[0]) {
			const prefix = (await threadsData.getData(event.threadID)).prefix || globalGoat.config.data.prefix;
			return message.reply(`> Prefix ของกลุ่มคุณ: ${prefix}\n> Prefix ของระบบ: ${globalGoat.config.prefix}\n> หากต้องการเปลี่ยนคำนำหน้าให้ป้อน ${prefix} <prefix ใหม่>`);
		}
		await threadsData.setData(event.threadID, { prefix: args[0] }, (err, info) => {
			if (err) return message.reply(err.stack);
			return message.reply(`เปลี่ยนคำนำหน้ากลุ่มเป็น \`${info.prefix}\``);
		});
	},

	whenChat: async ({ threadsData, message, args, event, setup, globalGoat }) => {
		if (event.body && event.body.toLowerCase() == "prefix") {
			return message.reply(`Prefix ของกลุ่มคุณ: ${(await threadsData.getData(event.threadID)).prefix || globalGoat.config.prefix}\nPrefix ของระบบ: ${globalGoat.config.prefix}`);
		}
	}
};