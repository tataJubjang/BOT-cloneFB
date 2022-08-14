this.config = {
	name: "dhbcemoji",
	version: "1.0.0",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "เกมจับอีโมจิ (ตัวอย่าง)",
	longDescription: "เล่นเกม Word Catcher รุ่นอิโมจิ (สาธิต)",
	category: "game",
	guide: "{p}{n}"
};

module.exports = {
	config: this.config,
	start: async function ({ globalGoat, message, event, download }) {
		const axios = require("axios");
		const fs = require("fs-extra");
		const datagame = (await axios.get("https://goatbot.up.railway.app/api/duoihinhbatchuemoji")).data;
		const random = datagame.data;
		message.reply(`โปรดตอบกลับข้อความนี้พร้อมคำตอบ\n${random.emoji1}${random.emoji2}\n${random.wordcomplete.replace(/\S/g, "█ ")}`,
			(err, info) => globalGoat.whenReply[info.messageID] = {
				messageID: info.messageID,
				nameCmd: this.config.name,
				author: event.senderID,
				wordcomplete: random.wordcomplete
			});
	},

	whenReply: ({ message, Reply, event, globalGoat }) => {
		let { author, wordcomplete, messageID } = Reply;
		if (event.senderID != author) return message.reply("คุณไม่ใช่ผู้เล่นของคำถามนี้");
		function formatText(text) {
			return text.normalize("NFD")
				.toLowerCase()
				.replace(/[\u0300-\u036f]/g, "")
				.replace(/đ/g, "d")
				.replace(/Đ/g, "D");
		}

		(formatText(event.body) == formatText(wordcomplete)) ? message.reply("ยินดีด้วย คุณได้คำตอบที่ถูกต้อง") : message.reply(`อ๊ะ ผิด`);
		//message.reply(`ผิด คำตอบที่ถูกต้องคือ: ${wordcomplete}`);
		delete globalGoat.whenReply[messageID];
	}
};