this.config = {
	name: "sleep",
	version: "1.0.0",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "เวลาตื่น",
	longDescription: "คำนวณเวลาตื่นจากเวลานอน เพื่อให้คุณนอนหลับสบาย 😪😪",
	category: "healthy",
	guide: "{p}{n} [เว้นว่างไว้|<เวลาเข้านอน (ชช:นน ในรูปแบบ 24 ชม.)>]\nตัวอย่างเช่น:\n  {p}{n}\n  {p}{n} 08:30\n  {p}{n} 22:02",
	envGlobal: {
		sleepCycle: 110
	}
};

module.exports = {
	config: this.config,
	start: async function ({ message, event, args, globalGoat }) {
		const Canvas = require("canvas");
		const moment = require("moment-timezone");
		const sleepCycle = globalGoat.configCommands.envGlobal.sleepCycle;
		function formatTwoNumber(t) {
			return t < 10 ? "0" + Number(t) : t;
		}

		let msg = "";
		let timeSleep;

		if (!args[0]) timeSleep = moment().tz("Asia/Bangkok").format();
		else {
			if (args[0].split(":").length != 2) return message.reply("โปรดป้อนเวลาเข้านอนที่ถูกต้องในรูปแบบ 24h hh:mm, ví dụ\n 08:30\n 22:02");
			let hoursSleep = formatTwoNumber(args[0].split(":")[0]);
			let minutesSleep = formatTwoNumber(args[0].split(":")[1]);
			if (isNaN(hoursSleep) || isNaN(minutesSleep) ||
				hoursSleep > 23 || minutesSleep > 59 ||
				hoursSleep < 0 || minutesSleep < 0) return message.reply("โปรดป้อนเวลาเข้านอนที่ถูกต้องในรูปแบบ 24h hh:mm, ví dụ\n 08:30\n 22:02");
			const getTime = moment().tz("Asia/Bangkok").format("YYYY-MM-DD") + "T";
			timeSleep = getTime + hoursSleep + ":" + minutesSleep + ":00+07:00";
		}

		for (let i = 1; i < 6; i++) msg += moment(timeSleep).tz("Asia/Bangkok").add(sleepCycle * i, "minutes").format("HH:mm") + "  เวลานอน " + formatTwoNumber(Math.floor(sleepCycle * i / 60)) + ":" + formatTwoNumber(Math.floor(sleepCycle * i % 60)) + "\n";

		message.reply(`ถ้าคุณนอนที่ ${moment(timeSleep).tz("Asia/Bangkok").format("HH:mm:ss")}, ตื่นนอนที่:\n\n${msg}\nวงจรการนอนหลับ ${sleepCycle}p (${Math.floor(sleepCycle / 60)}h${Math.floor(sleepCycle % 60)}p)`);
	}
};