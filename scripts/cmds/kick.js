module.exports = {
	config: {
		name: "kick",
		version: "1.0",
		author: "lnwsck",
		countDown: 5,
		role: 1,
		shortDescription: "เตะสมาชิก",
		longDescription: "เตะสมาชิกออกจากกล่องแชท",
		category: "box chat",
		guide: "{p}{n} @tags: เคยเตะคนที่ติดแท็ก"
	},

	start: async function ({ message, event, args, threadsData, api }) {
		const { adminIDs } = await threadsData.getData(event.threadID);
		if (!adminIDs.includes(api.getCurrentUserID()))
			return message.reply("โปรดเพิ่มผู้ดูแลระบบสำหรับบอทก่อนใช้ฟีเจอร์นี้");
		async function kickAndCheckError(uid) {
			try {
				await api.removeUserFromGroup(uid, event.threadID);
			}
			catch (e) {
				message.reply("เกิดข้อผิดพลาด เพิ่มบอทเป็นผู้ดูแลระบบแล้วลองอีกครั้งในภายหลัง");
				return "ERROR";
			}
		}
		if (!args[0]) {
			if (!event.messageReply)
				return message.SyntaxError();
			await kickAndCheckError(event.messageReply.senderID);
		}
		else {
			const uids = Object.keys(event.mentions);
			if (uids.length === 0)
				return message.SyntaxError();
			if (await kickAndCheckError(uids.shift()) === "ERROR")
				return;
			for (const uid of uids)
				api.removeUserFromGroup(uid, event.threadID);
		}
	}
};