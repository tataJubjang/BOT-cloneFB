this.config = {
	name: "wakeup",
	shortName: "wake",
	version: "1.0.0",
	author: {
		name: "lnwsck bot",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "เวลาตื่น",
	longDescription: "คำนวณเวลานอนตั้งแต่ตื่นนอนเพื่อให้คุณนอนหลับสบาย 😪😪",
	category: "healthy",
	guide: "{p}{n} <เวลาปลุก (hh:mm ในรูปแบบ 24 ชั่วโมง)>\nตัวอย่าง: {p}{n} 08:30",
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

		if ((args[0] || "").split(":").length != 2) return message.reply("โปรดป้อนเวลาที่ถูกต้องที่คุณต้องการตื่นในรูปแบบ 24h hh:mm, ตัวอย่างเช่น \n 08:30\n 22:02");
		let hoursWakeup = formatTwoNumber(args[0].split(":")[0]);
		let minutesWakeup = formatTwoNumber(args[0].split(":")[1]);
		if (isNaN(hoursWakeup) || isNaN(minutesWakeup) ||
			hoursWakeup > 23 || minutesWakeup > 59 ||
			hoursWakeup < 0 || minutesWakeup < 0) return message.reply("โปรดป้อนเวลาที่ถูกต้องที่คุณต้องการตื่นในรูปแบบ 24h hh:mm, ตัวอย่างเช่น \n 08:30\n 22:02");
		const getTime = moment().tz("Asia/Bangkok").format("YYYY-MM-DD") + "T";
		const timeWakeup = getTime + hoursWakeup + ":" + minutesWakeup + ":00+07:00";
		message.reply(timeWakeup);

		for (let i = 6; i > 0; i--) msg += moment(timeWakeup).tz("Asia/Bangkok").subtract(sleepCycle * i, "minutes").format("HH:mm") + "  เวลานอน " + formatTwoNumber(Math.floor(sleepCycle * i / 60)) + ":" + formatTwoNumber(Math.floor(sleepCycle * i % 60)) + "\n";

		message.reply(`หากคุณต้องการตื่นนอนที่ ${moment(timeWakeup).tz("Asia/Bangkok").format("HH:mm:ss")}, นอนเวลานี้:\n\n${msg}\nวงจรการนอนหลับ ${sleepCycle}p (${Math.floor(sleepCycle / 60)}h${Math.floor(sleepCycle % 60)}p)`);
	}
};