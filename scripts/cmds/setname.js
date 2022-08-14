this.config = {
	name: "setname",
	version: "1.0.0",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "เปลี่ยนชื่อเล่น/แท็กของคุณ",
	longDescription: "เปลี่ยนชื่อเล่นของคุณหรือคนที่แท็ก",
	category: "box chat",
	guide: "{prefix}{name} [<ชื่อเล่น>|เว้นว่างไว้]"
};

module.exports = {
	config: this.config,
	start: async function ({ args, threadsData, message, event, api }) {
		let uid, nickname;
		if (event.type == "message_reply") {
			uid = event.messageReply.senderID;
			nickname = args.join(" ");
		}
		else if (Object.keys(event.mentions)[0]) {
			uid = Object.keys(event.mentions)[0];
			nickname = args.join(" ").replace(event.mentions[uid], "");
		}
		else {
			uid = event.senderID;
			nickname = args.join(" ");
		}

		api.changeNickname(nickname || "", event.threadID, uid, async (err) => {
			if (err) return;
			const data = await threadsData.getData(event.threadID);
			const members = data.members;
			if (!members[uid]) {
				members[uid] = {
					id: uid,
					name: (await api.getUserInfo(uid))[uid].name,
					nickname: nickname || null,
					inGroup: true,
					count: 0
				};
			}
			else {
				members[uid].nickname = nickname;
			}
			await threadsData.setData(event.threadID, { members });
		});
	}
};
