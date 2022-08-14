this.config = {
	name: "unsend",
	version: "1.0.2",
	author: {
		name: "NTKhang",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "ลบข้อความของบอท",
	longDescription: "ลบข้อความของบอท",
	category: "info",
	guide: "ตอบกลับข้อความของบอทด้วยเนื้อหา {p}{n}"
};

module.exports = {
	config: this.config,
	start: async function ({ message, api, event, args, globalGoat }) {
		if (event.type != "message_reply") return message.reply('โปรดตอบกลับข้อความของบอทที่ต้องการลบ');
		if (event.messageReply.senderID != globalGoat.botID) return message.reply('ลบข้อความคนอื่นไม่ได้!!');
		return api.unsendMessage(event.messageReply.messageID);
	}
};