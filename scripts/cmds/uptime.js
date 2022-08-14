this.config = {
	name: "uptime",
	version: "1.0.2",
	author: {
		name: "lnw SCk",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "ดูเวลาที่บอทออนไลน์",
	longDescription: "ดูเวลาที่บอทออนไลน์",
	category: "info",
	guide: "{p}{n}"
};

module.exports = {
	config: this.config,
	start: async function ({ message }) {
		const timeRun = process.uptime();
		const hours = Math.floor(timeRun / 3600000);
		const minutes = Math.floor((timeRun % 3600) / 60);
		const seconds = Math.floor(timeRun % 60);
		message.reply(`บอททำงาน ${hours ? hours + "h" : ""}${minutes ? minutes + "p" : ""}${seconds}s\n[ 🐐 | Project clone by: lnwSCK ]`);
	}
};