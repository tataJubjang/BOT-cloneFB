this.config = {
	name: "logsbot",
	version: "1.0.3",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 2,
	shortDescription: "เปิด/ปิดการบันทึกบอท",
	longDescription: "เปิดหรือปิดการส่งข้อความเมื่อมีการเพิ่มบอทในกลุ่มใหม่หรือถูกเตะกลับไปที่ผู้ดูแลระบบ",
	category: "owner",
	guide: "{p}{n} on: เปิด"
		+ "\n{p}{n} off: ปิด"
};

module.exports = {
	config: this.config,
	start: async function ({ args, client, globalGoat, message }) {
		const fs = require("fs-extra");
		if (args[0] == "on") globalGoat.configCommands.envEvents.logsbot.logsbot = true;
		else if (args[0] == "off") globalGoat.configCommands.envEvents.logsbot.logsbot = false;
		else return message.reply("โปรดเลือกเปิดหรือปิด");
		fs.writeFileSync(client.dirConfigCommands, JSON.stringify(globalGoat.configCommands, null, 2));
		message.reply(`อยู่แล้ว ${globalGoat.configCommands.envEvents.logsbot.logsbot ? "เปิด" : "ปิด"} ส่งข้อความเมื่อบอทถูกเพิ่มไปยังกลุ่มใหม่หรือถูกเตะกลับไปที่ผู้ดูแลระบบ`);
	}
};