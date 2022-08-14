const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "leave",
		version: "1.0.1",
		type: ["log:unsubscribe"],
		author: {
			name: "lnwsck",
			contacts: ""
		},
	},
	start: async ({ threadsData, message, event, globalGoat, api, client, usersData }) => {
		const { leftParticipantFbId } = event.logMessageData;
		if (leftParticipantFbId == globalGoat.botID) return;
		const hours = moment.tz("Asia/Bangkok").format("HH");
		const { threadID } = event;
		const threadData = client.allThreadData[threadID];
		if (threadData.data.sendLeaveMessage == false) return;

		const messageLeaveDefault = "{userName} แล้ว {type} จากกลุ่ม";
		let messageLeave = threadData ? threadData.data.leaveMessage || messageLeaveDefault : messageLeaveDefault;
		const boxName = messageLeave.includes("{boxName}") ? (await api.getThreadInfo(threadID)).threadName : ""; // hạn chế block acc
		const userName = (await usersData.getData(leftParticipantFbId)).name;
		// {userName}: ชื่อสมาชิกที่โดนไล่ออก/ออกเอง
		// {type}: ซ้าย/โดน qtv . เตะ
		// {boxName}:  ชื่อกลุ่มแชท
		// {session}: เซสชั่นของวัน
		messageLeave = messageLeave
			.replace(/\{userName}/g, userName)
			.replace(/\{type}/g, leftParticipantFbId == event.author ? "ออกไปเอง" : "ลบโดยแอดมิน")
			.replace(/\{boxName}/g, boxName)
			.replace(/\{session}/g, hours <= 10 ? "เช้า" :
				hours > 10 && hours <= 12 ? "เที่ยง" :
					hours > 12 && hours <= 18 ? "ค่ำ" :
						"ดึก"
			);

		const form = {
			body: messageLeave,
			mentions: [{
				id: leftParticipantFbId,
				tag: userName
			}]
		};
		threadData.data.leaveAttachment ? form.attachment = fs.createReadStream(__dirname + "/src/mediaLeave/" + threadData.data.leaveAttachment) : "";
		message.send(form);
	}
};