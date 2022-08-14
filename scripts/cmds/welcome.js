this.config = {
	name: "welcome",
	version: "1.0.1",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "เปิด/ปิด ข้อความต้อนรับ",
	longDescription: "เปิดหรือปิดการส่งข้อความต้อนรับเมื่อสมาชิกใหม่เข้าร่วมกลุ่มแชทของคุณ",
	category: "custom",
	guide: "{p}{n} on: เปิด"
		+ "\n{p}{n} off: ปิด"
};

module.exports = {
	config: this.config,
	start: async function ({ args, threadsData, globalGoat, message, event, role }) {
		const { threadID } = event;
		const data = (await threadsData.getData(threadID)).data;

		if (args[0] == "on") data.sendWelcomeMessage = true;
		else if (args[0] == "off") data.sendWelcomeMessage = false;
		else message.reply("โปรดเลือกเปิดหรือปิด");

		await threadsData.setData(threadID, {
			data
		}, (err, info) => {
			if (err) return message.reply(`มีข้อผิดพลาดเกิดขึ้นโปรดลองอีกครั้ง: ${err.name}: ${err.message}`);
			message.reply(`อยู่แล้ว ${data.sendWelcomeMessage ? "เปิด" : "ปิด"} ส่งข้อความต้อนรับเมื่อมีสมาชิกใหม่เข้าร่วมกลุ่มแชทของคุณ`);
		});
	}
};