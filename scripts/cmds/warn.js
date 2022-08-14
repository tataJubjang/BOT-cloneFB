const moment = require("moment-timezone");
this.config = {
	name: "warn",
	version: "1.0.1",
	author: {
		name: "lnwSCK",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "คำเตือนสมาชิก",
	longDescription: "เตือนสมาชิกกลุ่มโดนแบน3ครั้งจากกล่อง",
	category: "box chat",
	guide: "{p}{n} @tag <เหตุผล>: ใช้การเตือนสมาชิก"
		+ "\n{p}{n} list: ดูรายชื่อสมาชิกที่ได้รับการเตือน"
		+ "\n{p}{n} listban: ดูรายชื่อสมาชิกที่โดนเตือน 3 ครั้งแล้วโดนแบนจากกล่อง"
		+ "\n{p}{n} check [@tag | <uid> | เว้นว่างไว้]: ดูข้อมูลการแจ้งเตือนของบุคคลที่แท็กหรือ uid หรือตัวคุณเอง"
		+ "\n{p}{n} unban <uid>: ลบกระดานสมาชิกโดย uid"
		+ "\n⚠️ ต้องตั้งแอดมินให้บอทให้บอทเตะสมาชิกที่ถูกแบนได้"
};

module.exports = {
	config: this.config,
	start: async function ({ message, api, event, args, threadsData, usersData, client }) {
		if (!args[0]) return message.SyntaxError();
		const { threadID, senderID } = event;
		const { data, adminIDs } = await threadsData.getData(threadID);
		if (!data.warn) data.warn = {
			banned: [],
			warnList: []
		};
		const { warnList, banned } = data.warn;


		if (args[0] == "list") {
			let msg = "";
			for (const user of warnList) {
				msg += `\nName: ${user.name}`
					+ `\nUid: ${user.uid}`
					+ `\nจำนวนครั้งที่ถูกเตือน: ${user.data.length}`
					+ '\n';
			}
			message.reply(msg ? "รายชื่อสมาชิกที่ได้รับการเตือน:\n" + msg + `\nดูรายละเอียดคำเตือน ใช้คำสั่ง "${client.getPrefix(threadID) + "warn check  [@tag | <uid> | ว่างเปล่า]\": เพื่อดูข้อมูลการแจ้งเตือนของบุคคลที่แท็กหรือ uid หรือตัวคุณเอง"}` : "ยังไม่มีการเตือนสมาชิกในกลุ่มของคุณ");
		}


		else if (args[0] == "listban") {
			let msg = "";
			for (const uid of banned) {
				msg += `\nName: ${warnList.find(user => user.uid == uid).name}`
					+ `\nUid: ${uid}`
					+ '\n';
			}
			message.reply(msg ? "รายชื่อสมาชิกที่ถูกเตือน 3 ครั้งและถูกแบนจากกล่อง:\n" + msg : "กลุ่มของคุณไม่มีสมาชิกที่ถูกแบนจากกล่อง");
		}


		else if (args[0] == "check" || args[0] == "info") {
			let uids, msg = "";
			if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
			else if (args.slice(1).length > 0) uids = args.slice(1);
			else uids = [event.senderID];
			if (!uids) return message.reply("โปรดป้อน uid ที่ถูกต้องของบุคคลที่คุณต้องการดูข้อมูล");
			for (const uid of uids) {
				const dataWarnOfUser = warnList.find(user => user.uid == uid);
				msg += `\nUid: ${uid}`;
				if (!dataWarnOfUser || dataWarnOfUser.data.length == 0) msg += `\nไม่มีข้อมูล\n`;
				else {
					msg += `\nName: ${dataWarnOfUser.name}`
						+ `\nWarn list:`;
					for (const dataW of dataWarnOfUser.data) {
						msg += `\n  Reason: ${dataW.reason}`
							+ `\n  Time: ${dataW.dateTime}\n`;
					}
				}
			}
			message.reply(msg);
		}


		else if (args[0] == "unban") {
			if (!adminIDs.includes(senderID)) return message.reply("เฉพาะผู้ดูแลกลุ่มเท่านั้นที่สามารถเลิกแบนสมาชิกจากกล่องได้");
			const uidUnban = args[1];
			if (!uidUnban || isNaN(uidUnban)) return message.reply("โปรดป้อน uid ที่ถูกต้องของบุคคลที่คุณต้องการลบ");
			if (!banned.includes(uidUnban)) return message.reply(`ผู้ใช้ที่มีรหัส ${uidUnban} ยังไม่ถูกแบนจากกล่องของคุณ`);
			banned.splice(banned.findIndex(uid => uid == uidUnban), 1);
			warnList.splice(warnList.findIndex(user => user.uid == uidUnban), 1);
			const userName = warnList.find(user => user.uid == uidUnban).name;
			await threadsData.setData(threadID, {
				data
			});
			return message.reply(`ถอดบอร์ดสมาชิกออก [${uidUnban} | ${userName}], บุคคลนี้สามารถเข้าร่วมกล่องแชทของคุณได้แล้ว`);
		}


		else {
			if (!adminIDs.includes(senderID)) return message.reply("เฉพาะผู้ดูแลกลุ่มเท่านั้นที่สามารถเตือนสมาชิกกลุ่มได้");
			let reason, uid;
			if (event.messageReply) {
				uid = event.messageReply.senderID;
				reason = args.join(" ").trim();
			}
			else if (Object.keys(event.mentions)[0]) {
				uid = Object.keys(event.mentions)[0];
				reason = args.join(" ").replace(event.mentions[uid], "").trim();
			}
			else {
				return message.reply("คุณต้องแท็กหรือตอบกลับข้อความของบุคคลที่คุณต้องการเตือน");
			}
			if (!reason) reason = "ไม่มีเหตุผล";
			const dataWarnOfUser = warnList.find(item => item.uid == uid);
			const times = (dataWarnOfUser ? dataWarnOfUser.data.length : 0) + 1;
			const dateTime = moment.tz("Asia/Bangkok").format("DD/MM/YYYY hh:mm:ss");
			if (times >= 3) banned.push(uid);
			const userName = (await usersData.getData(uid)).name;
			if (!dataWarnOfUser) {
				warnList.push({
					uid,
					name: userName,
					data: [{ reason, dateTime }]
				});
			}
			else {
				dataWarnOfUser.data.push({ reason, dateTime });
			}
			await threadsData.setData(threadID, {
				data
			});

			if (times >= 3) {
				message.reply(`⚠️ สมาชิกเตือน ${userName} เวลา ${times}`
					+ `\n- Uid: ${uid}`
					+ `\n- เหตุผล: ${reason}`
					+ `\n- Date Time: ${dateTime}`
					+ `\nผู้ใช้รายนี้ถูกเตือน 3 ครั้งและถูกแบนจากกล่อง หากต้องการยกเลิกการแบน โปรดใช้คำสั่ง"${client.getPrefix(threadID)}warn unban <uid>" (โดยที่ uid เป็น uid ของผู้ที่ต้องการยกเลิกการแบน)`,
					function () {
						api.removeUserFromGroup(uid, threadID, (err) => {
							if (err) return message.reply(`บอทต้องการสิทธิ์แอดมินเตะสมาชิกที่ถูกแบน`);
						});
					});
			}
			else return message.reply(`⚠️ สมาชิกเตือน ${userName} เวลา ${times}`
				+ `\n- Uid: ${uid}`
				+ `\n- เหตุผล: ${reason}`
				+ `\n- Date Time: ${dateTime}`
				+ `\nถ้าคุณแหกกฎ ${3 - (times)} คนนี้จะถูกแบนจากกล่องอีกครั้ง`
			);
		}
	},

	whenReply: async function ({ message, api, event, args, threadsData, usersData }) {
		const { data, adminIDs } = await threadsData.getData(threadID);
		if (!data.warn) return;
		const { banned } = data.warn;

		if (banned.includes(event.senderID)) {
			const userName = (await usersData.getData(event.senderID)).name;
			message.send({
				body: `สมาชิกท่านนี้เคยโดนเตือนมาแล้ว 3 ครั้ง และถูกแบนจากกล่อง\nName: ${userName}\nUid: ${event.senderID}\n หากต้องการถอนการติดตั้ง โปรดใช้คำสั่ง "${client.getPrefix(threadID)}warn unban <uid>" (โดยที่ uid เป็น uid ของผู้ที่ต้องการยกเลิกการแบน)`,
				mentions: [{
					tag: userName,
					id: event.senderID
				}]
			}, function () {
				api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
					if (err) return message.send(`บอทต้องการสิทธิ์แอดมินเตะสมาชิกที่ถูกแบน`);
				});
			});
		}
	}
};