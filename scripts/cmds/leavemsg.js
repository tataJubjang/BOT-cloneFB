this.config = {
	name: "leavemsg",
	version: "1.0.2",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "เปิด/ปิดการส่งข้อความบอกลา",
	longDescription: "เปิดหรือปิดการส่งข้อความลาเมื่อสมาชิกถูกไล่ออกจากกลุ่ม",
	category: "custom",
	guide: "{p}{n} on: เปิด"
		+ "\n{p}{n} off: ปิด"
};

module.exports = {
	config: this.config,
	start: async function ({ args, threadsData, globalGoat, message, event }) {
		const { threadID } = event;
		const data = (await threadsData.getData(threadID)).data;

		if (args[0] == "on") data.sendLeaveMessage = true;
		else if (args[0] == "off") data.sendLeaveMessage = false;
		else message.reply("โปรดเลือกเปิดหรือปิด");

		await threadsData.setData(threadID, {
			data
		}, (err, info) => {
			if (err) return message.reply(`มีข้อผิดพลาดเกิดขึ้นโปรดลองอีกครั้ง: ${err.name}: ${err.message}`);
			message.reply(`Đã ${data.sendLeaveMessage ? "เปิด" : "ปิด"} ส่งข้อความลาเมื่อสมาชิกออกจากกลุ่มหรือถูกไล่ออกจากกลุ่ม`);
		});
	}
};