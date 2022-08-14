const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "welcome",
		version: "1.0.3",
		type: ["log:subscribe"],
		author: {
			name: "lnwsck",
			contacts: ""
		},
	},
	start: async ({ threadsData, message, event, globalGoat, api, client }) => {
		const hours = moment.tz("Asia/Ho_Chi_Minh").format("HH");
		const { threadID } = event;
		const { prefix, nickNameBot } = globalGoat.config;
		const dataAddedParticipants = event.logMessageData.addedParticipants;
		// ถ้าเป็นบอท;
		if (dataAddedParticipants.some(item => item.userFbId == globalGoat.botID)) {
			if (nickNameBot) api.changeNickname(nickNameBot, threadID, globalGoat.botID);
			return message.send(`ขอบคุณที่เชิญฉัน!\nPrefix bot: ${globalGoat.config.prefix}\nหากต้องการดูรายการคำสั่ง ให้พิมพ์: ${prefix}help`);
		}

		// หากคุณเป็นสมาชิกใหม่:
		const threadData = client.allThreadData[threadID].data;
		if (threadData.sendWelcomeMessage == false) return;
		const boxName = client.allThreadData[threadID].name;
		const userName = [], mentions = [];
		let multiple = false;

		if (dataAddedParticipants.length > 1) multiple = true;
		for (let user of dataAddedParticipants) {
			userName.push(user.fullName);
			mentions.push({
				tag: user.fullName,
				id: user.userFbId
			});
		}
		// {userName}: ชื่อสมาชิกใหม่
		// {boxName}:  ชื่อกลุ่มแชท
		// {multiple}: คนเดียว || หลายคน
		// {session}:  เซสชันของวัน
		const messageWelcomeDefault = `ว่าไง {userName}.\nยินดีต้อนรับ {multiple} มาที่กลุ่มแชท: {boxName}\n เท่ {multiple} ขอให้แชตสนุกกับพวก ปยอ {session} `;
		let messageWelcome = threadData.welcomeMessage || messageWelcomeDefault;
		messageWelcome = messageWelcome
			.replace(/\{userName}/g, userName.join(", "))
			.replace(/\{boxName}/g, boxName)
			.replace(/\{multiple}/g, multiple ? "คุณ" : "เพื่อน")
			.replace(/\{session}/g, hours <= 10 ? "ซีซั่น" :
				hours > 10 && hours <= 12 ? "กลางวัน" :
					hours > 12 && hours <= 18 ? "บ่าย" : "ค่ำ");

		const form = {
			body: messageWelcome,
			mentions
		};
		threadData.welcomeAttachment ? form.attachment = fs.createReadStream(__dirname + "/src/mediaWelcome/" + threadData.welcomeAttachment) : "";

		message.send(form);
	}
};