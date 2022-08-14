this.config = {
	name: "daily",
	version: "1.0.0",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "รายงานประจำวัน",
	longDescription: "รับของขวัญแจ้งเตือนทุกวัน",
	category: "gift",
	guide: "{p}{n} [ว่างเปล่า | info]",
	envConfig: {
		rewardDay1: {
			coin: 100,
			exp: 10
		}
	}
};


module.exports = {
	config: this.config,
	start: async function ({ usersData, message, event, globalGoat, args }) {
		const moment = require("moment-timezone");

		const reward = globalGoat.configCommands.envCommands[this.config.name].rewardDay1;
		if (args[0] == "info") {
			const rewardAll = globalGoat.configCommands.envCommands[this.config.name];
			let msg = "";
			let i = 1;
			for (let i = 1; i < 8; i++) {
				const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((i == 0 ? 7 : i) - 1));
				const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((i == 0 ? 7 : i) - 1));
				msg += `${i == 7 ? "วันอาทิตย์" : "อันดับ " + (i + 1)}: ${getCoin} coin และ ${getExp} exp\n`;
			}
			return message.reply(msg);
		}

		const dateTime = moment.tz("Asia/Bangkok").format("DD/MM/YYYY");
		const date = new Date();
		let current_day = date.getDay(); // รับเลขลำดับของวันที่ปัจจุบัน
		const { senderID } = event;

		const userData = await usersData.getData(senderID);
		if (userData.lastTimeGetReward === dateTime) return message.reply("คุณได้รับของขวัญการลงทะเบียนของวันนี้ โปรดกลับมาในวันพรุ่งนี้");

		const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((current_day == 0 ? 7 : current_day) - 1));
		const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((current_day == 0 ? 7 : current_day) - 1));

		await usersData.setData(senderID, {
			money: userData.money + getCoin,
			exp: userData.exp + getExp,
			lastTimeGetReward: dateTime
		}, (err, data) => {
			if (err) return message.reply(`ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง: ${err.name}: ${err.message}`);
			message.reply(`คุณได้รับ ${getCoin} coin และ ${getExp} exp`);
		});

	}
};