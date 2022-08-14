const fs = require("fs-extra");
this.config = {
	name: "onlyadminbox",
	version: "1.0.0",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 1,
	shortDescription: "เปิด / ปิดเฉพาะกล่องผู้ดูแลระบบโดยใช้ bot",
	longDescription: "เปิด/ปิดโหมด เฉพาะผู้ดูแลกลุ่มเท่านั้นที่สามารถใช้บอท",
	category: "box chat",
	guide: "{prefix}{name} [on|off]"
};

module.exports = {
	config: this.config,
	start: async function ({ globalGoat, args, message, event, client, threadsData }) {
		const threadData = await threadsData.getData(event.threadID);
		if (args[0] == "on") {
			threadsData.setData(event.threadID, {
				onlyAdminBox: true
			}, (e) => {
				if (e) return message.reply(`ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง ${e.name}: ${e.message}`);
				message.reply("โหมดเปิดใช้งานเฉพาะผู้ดูแลกลุ่มเท่านั้นที่สามารถใช้บอทได้");
			});
		}
		else if (args[0] == "off") {
			threadsData.setData(event.threadID, {
				onlyAdminBox: false
			}, (e) => {
				if (e) return message.reply(`ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง ${e.name}: ${e.message}`);
				message.reply("โหมดปิดการใช้งานเฉพาะผู้ดูแลกลุ่มเท่านั้นที่สามารถใช้บอทได้");
			});
		}
		else return message.reply("โปรดเลือกเปิดหรือโหมดoff");
	}
};