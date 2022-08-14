this.config = {
	name: "uid",
	version: "1.0.0",
	author: { name: "lnwsck", contacts: "" },
	cooldowns: 5,
	role: 0,
	shortDescription: "Xem id",
	longDescription: "ดู facebook id ของผู้ใช้",
	category: "info",
	guide: "{prefix}uid: ใช้เพื่อดู facebook id ของคุณ\n{prefix}uid @tag: ดู facebook id ของคนที่ถูกแท็ก"
};

module.exports = {
	config: this.config,
	start: function ({ message, event }) {
		const { mentions } = event;
		if (Object.keys(mentions) != 0) {
			let msg = "";
			for (let id in mentions) msg += `${mentions[id].replace("@", "")}: ${id}\n`;
			message.reply(msg);
		}
		else message.reply(event.senderID);
	}
};