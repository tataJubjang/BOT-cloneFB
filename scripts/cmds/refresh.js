this.config = {
	name: "refresh",
	version: "1.0.1",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 2,
	shortDescription: "อัพเดทข้อมูลบอท",
	longDescription: "อัพเดทข้อมูลผู้ใช้หรือกระทู้ทั้งหมด",
	category: "owner",
	guide: "{p}{n} [user | thread | all]"
};

module.exports = {
	config: this.config,
	start: async function ({ args, usersData, threadsData, message, api }) {

		async function refreshUsers() {
			const allUser = await usersData.getAll();
			for (const user of allUser) await usersData.refreshInfo(user.id);
			return message.reply(`ข้อมูลของได้รับการปรับปรุง ${allUser.length} ผู้ใช้`);
		}
		async function refreshThreads() {
			const allThread = (await api.getThreadList(999, null, ["INBOX"])).filter(item => item.isGroup);
			for (const thread of allThread) await threadsData.refreshInfo(thread.threadID);
			return message.reply(`ข้อมูลของได้รับการปรับปรุง ${allThread.length} กลุ่ม`);
		}

		if (args[0] == "user") await refreshUsers();
		else if (args[0] == "thread") await refreshThreads();
		else if (args[0] == "all") {
			await refreshUsers();
			await refreshThreads();
		}
		else return message.SyntaxError();
	}
};