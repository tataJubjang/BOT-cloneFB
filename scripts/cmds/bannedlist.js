this.config = {
	name: "bannedlist",
	version: "1.0.1",
	author: {
		name: "lnwSCK",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "ดูรายชื่อกลุ่ม/ผู้ใช้ที่ถูกแบน",
	longDescription: "ดูรายชื่อกลุ่ม/ผู้ใช้ที่ถูกแบน",
	category: "owner",
	guide: "{p}{n} [thread|user]",
};

module.exports = {
	config: this.config,
	start: async function ({ message, args, usersData, threadsData }) {
		let target, type;
		if (["thread", "-t"].includes(args[0])) {
			target = await threadsData.getAll();
			type = "กลุ่ม";
		}
		else if (["user", "-u"].includes(args[0])) {
			target = await usersData.getAll();
			type = "ผู้ใช้";
		}
		else return message.SyntaxError();

		const bannedList = target.filter(item => item.banned.status);
		const msg = bannedList.reduce((i, item) => i += `Name: ${item.name}`
			+ `\nID: ${item.id}`
			+ `\nReason: ${item.banned.reason}`
			+ `\nTime: ${item.banned.date}\n\n`, "");

		message.reply(msg ? `ขณะนี้ ${bannedList.length} ${type} ถูกแบนจากบอท:\n\n${msg}` : `ขณะนี้ไม่มี ${type} ถูกแบนจากบอท`);
	}
};