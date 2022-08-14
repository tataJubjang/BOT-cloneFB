this.config = {
	name: "count",
	version: "1.0.3",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "นับข้อความกลุ่ม",
	longDescription: "ดูจำนวนข้อความของสมาชิกทั้งหมดหรือตัวคุณเอง (ตั้งแต่บอทเข้ากลุ่ม)",
	category: "box chat",
	guide: "{prefix}count: เคยดูจำนวนข้อความของคุณ" + "\n{prefix}count @tag: ใช้เพื่อดูจำนวนข้อความของคนที่แท็ก" + "\n{prefix}นับทั้งหมด: ใช้เพื่อดูจำนวนข้อความของสมาชิกทั้งหมด"
};

module.exports = {
	config: this.config,
	start: async function ({ args, threadsData, message, event, globalGoat, api }) {
		const { threadID, senderID, messageID } = event;
		const threadData = await threadsData.getData(threadID);
		const { members } = threadData;
		const arraySort = [];
		const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;
		for (let id in members) {
			if (!usersInGroup.includes(id)) continue;
			const count = members[id].count;
			const name = members[id].name;
			arraySort.push({ name, count, uid: id });
		}
		let stt = 1;
		arraySort.sort((a, b) => b.count - a.count);
		arraySort.map(item => item.stt = stt++);

		if (args[0]) {
			if (args[0].toLowerCase() == "all") {
				let msg = "ข้อความของสมาชิก:\n";
				for (const item of arraySort) {
					if (item.count > 0) msg += `\n${item.stt}/ ${item.name}: ${item.count}`;
				}
				message.reply(msg + "\n\nส่วนใครที่ไม่ได้อยู่ในรายชื่อก็ยังไม่ได้ส่งข้อความใดๆ");
			}
			else if (event.mentions) {
				let msg = "";
				for (const id in event.mentions) {
					const findUser = arraySort.find(item => item.uid == id);
					msg += `${findUser.name} hạng ${findUser.stt} กับ ${findUser.count} ข้อความ\n`;
				}
				message.reply(msg);
			}
		}
		else {
			return message.reply(`คุณติดอันดับ ${arraySort.find(item => item.uid == senderID).stt} และส่ง ${members[senderID].count} ข้อความในกลุ่มนี้`);
		}
	},

	whenChat: async ({ args, threadsData, message, client, event, api }) => {
		try {
			let { senderID, threadID, messageID, isGroup } = event;
			if (!client.allThreadData[threadID]) await threadsData.createData(threadID);
			const members = (await threadsData.getData(threadID)).members;

			if (!members[senderID]) {
				members[senderID] = {
					id: senderID,
					name: (await api.getUserInfo(senderID))[senderID].name,
					nickname: null,
					inGroup: true,
					count: 1
				};
				await threadsData.setData(threadID, { members });
			}
			else members[senderID].count += 1;
			await threadsData.setData(threadID, { members });
		}
		catch (err) { }
	}

};