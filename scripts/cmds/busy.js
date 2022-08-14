this.config = {
	name: "busy",
	version: "1.0.0",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "เปิดโหมดห้ามรบกวน",
	longDescription: "เปิดโหมดห้ามรบกวนเมื่อคุณถูกแท็กบอทจะแจ้งเตือน",
	category: "box chat",
	guide: "{prefix}{name} [เว้นว่างไว้|เหตุผล]"
};

module.exports = {
	config: this.config,
	start: async function ({ args, client, message, event }) {
		const { senderID } = event;
		if (!client.busyList) client.busyList = {};

		const reason = args.join(" ") || null;
		client.busyList[senderID] = reason;

		return message.reply(`เปิดใช้งาน ห้ามรบกวน${reason ? ` ด้วยเหตุผล:${reason}` : ""}`);
	},


	whenChat: async ({ event, client, message }) => {
		if (!client.busyList) return;
		const { senderID, mentions } = event;
		const { busyList } = client;

		if (busyList[senderID]) {
			delete busyList[senderID];
			const text = "ยินดีต้อนรับกลับ =)";
			message.reply({
				body: text,
				mentions: [{
					id: senderID,
					tag: text
				}]
			});
		}

		if (!mentions || Object.keys(mentions).length == 0) return;
		const arrayMentions = Object.keys(mentions);

		for (const userID of arrayMentions) {
			if (Object.keys(client.busyList).includes(userID))
				return message.reply(`ผู้ใช้ปัจจุบัน ${mentions[userID].replace("@", "")} ผมยุ่งอยู่${busyList[userID] ? ` ด้วยเหตุผล: ${busyList[userID]}` : ""}`);
		}
	}
};