this.config = {
	name: "money",
	version: "1.0.0",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "ดูเงินของคุณ",
	longDescription: "ดูเงินทุนที่มีอยู่ของคุณ",
	category: "economy",
	guide: "{p}{n}"
};

module.exports = {
	config: this.config,
	start: async function ({ message, usersData, event }) {
		const userData = await usersData.getData(event.senderID);
		message.reply(`คุณคือ ${userData.money} coin`);
	}

};