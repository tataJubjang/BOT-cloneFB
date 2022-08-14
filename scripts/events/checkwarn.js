module.exports = {
	config: {
		name: "checkwarn",
		version: "1.0.0",
		type: ["log:subscribe"],
		author: {
			name: "lnw",
			contacts: ""
		},
	},
	start: async ({ threadsData, message, event, globalGoat, api, client }) => {
		const { threadID } = event;
		const { data, adminIDs } = await threadsData.getData(event.threadID);
		if (!data.warn) return;
		const { banned } = data.warn;
		const { addedParticipants } = event.logMessageData;
		for (const user of addedParticipants) {
			if (banned.includes(user.userFbId)) {
				message.send({
					body: `สมาชิกคนนี้เคยโดนเตือน 3 ครั้งแล้วโดนแบน box\nName: ${user.fullName}\nUid: ${user.userFbId}\nหากต้องการถอนการติดตั้ง โปรดใช้คำสั่ง "${client.getPrefix(threadID)}warn unban <uid>" (โดยที่ uid คือ uid ของบุคคลที่ต้องการลบการแบน)`,
					mentions: [{
						tag: user.fullName,
						id: user.userFbId
					}]
				}, function () {
					api.removeUserFromGroup(user.userFbId, threadID, (err) => {
						if (err) return message.send(`บอทต้องการสิทธิ์แอดมินเตะสมาชิกที่ถูกแบน`);
					});
				});
			}
		}
	}
};