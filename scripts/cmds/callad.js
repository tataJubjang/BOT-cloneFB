this.config = {
	name: "callad",
	version: "1.0.2",
	author: {
		name: "lnw",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "ส่งรายงานให้แอดมินบ่อ",
	longDescription: "ส่งรายงาน คำแนะนำ รายงานข้อผิดพลาด... ถึงผู้ดูแลระบบบอท",
	category: "contacts admin",
	guide: "{prefix}{name} < ข้อความ>"
};

module.exports = {
	config: this.config,
	start: async function ({ globalGoat, args, message, api, event, usersData, threadsData }) {
		if (!args[0]) return message.reply("กรุณากรอกข้อความที่ต้องการส่งถึงแอดมิน");
		const { senderID, threadID, isGroup } = event;

		const userData = await usersData.getData(senderID);
		const nameSender = userData.name;
		let msg = "==📨️ รายงาน 📨️=="
			+ `\n${userData.gender == 2 ? "🚹" : "🚺"} Name: ${nameSender}`
			+ `\n🆔 User ID: ${senderID}`;

		msg += `\n👨‍👩‍👧‍👦 Từ ` + (isGroup ? `nhóm: ${(await threadsData.getData(threadID)).name}`
			+ `\n🆔 Thread ID: ${threadID}` : "รายงาน");

		api.sendMessage({
			body: msg + `\n🆎 เนื้อหา: ${args.join(" ")}\n─────────────────\nตอบกลับข้อความนี้เพื่อส่งข้อความเกี่ยวกับผู้ใช้`,
			mentions: [{
				id: senderID,
				tag: nameSender
			}]
		}, globalGoat.config.adminBot[0], (err, info) => {
			if (err) return message.reply(`ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง: ${err.name ? err.name + " " + err.message : err.errorSummary + "\n" + err.errorDescription}`);
			message.reply("รายงานของคุณถูกส่งไปยังผู้ดูแลระบบเรียบร้อยแล้ว");
			globalGoat.whenReply[info.messageID] = {
				nameCmd: this.config.name,
				messageID: info.messageID,
				messageIDSender: event.messageID,
				threadIDSender: threadID,
				type: "userCallAdmin"
			};
		});
	},

	whenReply: async ({ globalGoat, args, event, api, message, Reply, usersData }) => {
		const { messageIDSender, threadIDSender, type } = Reply;
		const nameSender = (await usersData.getData(event.senderID)).name;

		switch (type) {
			case "userCallAdmin":
				api.sendMessage({
					body: `📍 เสียงตอบรับจากแอดมิน ${nameSender}\n${args.join(" ")}`
						+ `\n─────────────────\nตอบกลับข้อความนี้เพื่อส่งข้อความถึงผู้ดูแลระบบต่อไป`,
					mentions: [{
						id: event.senderID,
						tag: nameSender
					}]
				}, threadIDSender, (err, info) => {
					if (err) return message.reply(`ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง: ${err.name ? err.name + " " + err.message : err.errorSummary + "\n" + err.errorDescription}`);
					globalGoat.whenReply[info.messageID] = {
						nameCmd: this.config.name,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadIDSender: event.threadID,
						type: "adminReply"
					};
				}, messageIDSender);
				break;
			case "adminReply":
				api.sendMessage({
					body: `📝เสียงตอบรับจากผู้ใช้: ${nameSender}:`
						+ `\n🆔: ${event.senderID}`
						+ `\n🗣️: ${nameSender}`
						+ `\nเนื้อหา:\n${args.join(" ")}`
						+ `\n─────────────────\nตอบกลับข้อความนี้เพื่อส่งข้อความเกี่ยวกับผู้ใช้`,
					mentions: [{
						id: event.senderID,
						tag: nameSender
					}]
				}, threadIDSender, (err, info) => {
					if (err) return message.reply(`ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง: ${err.name ? err.name + " " + err.message : err.errorSummary + "\n" + err.errorDescription}`);
					globalGoat.whenReply[info.messageID] = {
						nameCmd: this.config.name,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadIDSender: event.threadID,
						type: "userCallAdmin"
					};
				}, messageIDSender);
				break;
			default:
				break;
		}

	}
};