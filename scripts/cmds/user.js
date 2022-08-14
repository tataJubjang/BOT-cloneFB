this.config = {
	name: "user",
	version: "1.0.4",
	author: {
		name: "lnwBan พวกไก่",
		contacts: ""
	},
	cooldowns: 5,
	role: 2,
	shortDescription: "การจัดการผู้ใช้",
	longDescription: "การจัดการผู้ใช้ในระบบบอท",
	category: "owner",
	guide: "{prefix}user [find | -f | search | -s] <ชื่อการค้นหา>: ค้นหาผู้ใช้ในข้อมูลบอทตามชื่อ"
		+ "\n"
		+ "\n{prefix}user [ban | -b] [<id> | @tag | ข้อความตอบกลับ] <reason>: เพื่อแบนผู้ใช้ที่มี id <id> หรือบุคคลที่ถูกแท็กหรือผู้ส่งข้อความตอบกลับโดยใช้บอท"
		+ "\n"
		+ "\n{prefix}user unban [<id> | @tag | ข้อความตอบกลับ]: เพื่อเลิกแบนผู้ใช้จากการใช้บอท"
};

module.exports = {
	config: this.config,
	start: async function ({ api, args, usersData, message, client, event, setup }) {
		const moment = require("moment-timezone");
		const type = args[0];
		// find user
		if (["find", "search", "-f", "-s"].includes(type)) {
			const allUser = await usersData.getAll(["name"]);
			const keyword = args.slice(1).join(" ");
			const result = allUser.filter(item => (item.name || "").toLowerCase().includes(keyword.toLowerCase()));
			const msg = result.reduce((i, user) => i += `\n╭Name: ${user.name}\n╰ID: ${user.id}`, "");
			message.reply(result.length == 0 ? `❌ ไม่พบผู้ใช้ที่มีชื่อตรงกับคำสำคัญ: ${keyword}` : `🔎Có ${result.length} ผลลัพธ์ที่ตรงกันสำหรับคำสำคัญ "${keyword}":\n${msg}`);
		}
		// ban user
		else if (["ban", "-b"].includes(type)) {
			let id, reason;
			if (event.type == "message_reply") {
				id = event.messageReply.senderID;
				reason = args.slice(1).join(" ");
			}
			else if (Object.keys(event.mentions).length > 0) {
				const { mentions } = event;
				id = Object.keys(mentions)[0];
				reason = args.slice(1).join(" ").replace(mentions[id], "");
			}
			else if (args[1]) {
				id = args[1];
				reason = args.slice(2).join(" ");
			}
			else return message.SyntaxError();

			if (!id) return message.reply("id ของบุคคลที่คุณต้องการแบนไม่สามารถเว้นว่างได้ โปรดป้อน id หรือ tag หรือตอบกลับข้อความของบุคคลตามไวยากรณ์ผู้ใช้แบน <id> <reason>");
			if (!reason) return message.reply("เหตุผลในการแบนผู้ใช้ไม่สามารถเว้นว่างได้ โปรดเขียนข้อความโดยใช้ไวยากรณ์การแบนผู้ใช้ <id> <reason>");
			if (!client.allUserData[id]) return message.reply(`ผู้ใช้ที่มีรหัส ${id} ไม่มีอยู่ในข้อมูลบอท`);
			reason = reason.replace(/\s+/g, ' ');

			const userData = await usersData.getData(id);
			const name = userData.name;
			const status = userData.banned.status;

			if (status) return message.reply(`ผู้ใช้ที่มีรหัส [${id} | ${name}] ห้ามแล้ว:\n> เหตุผล: ${userData.banned.reason}\n> เวลา: ${userData.banned.date}`);
			const time = moment.tz("Asia/Bangkok").format("DD/MM/YYYY HH:mm:ss");
			await usersData.setData(id, {
				banned: {
					status: true,
					reason,
					date: time
				}
			}, (err) => {
				if (err) return message.reply(`ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง ${err.name}: ${err.message}`);
				else return message.reply(`ผู้ใช้ถูกแบนไม่ให้นำ ID [${id} | ${name}] ใช้บอท.\n> เหตุผล: ${reason}\n> เวลา: ${time}`);
			});
		}
		// unban user
		else if (["unban", "-u"].includes(type)) {
			let id;
			if (event.type == "message_reply") {
				id = event.messageReply.senderID;
			}
			else if (Object.keys(event.mentions).length > 0) {
				const { mentions } = event;
				id = Object.keys(mentions)[0];
			}
			else if (args[1]) {
				id = args[1];
			}
			else return message.SyntaxError();
			if (!id) return message.reply("id ของบุคคลที่ต้องการยกเลิกการแบนไม่สามารถเว้นว่างได้ โปรดป้อน id หรือ tag หรือตอบกลับข้อความของบุคคลตามไวยากรณ์ unban ของผู้ใช้");
			if (!client.allUserData[id]) return message.reply(`ผู้ใช้ที่มีรหัส ${id} ไม่มีอยู่ในข้อมูลบอท`);
			const userData = await usersData.getData(id);
			const name = userData.name;
			const status = userData.banned.status;
			if (!status) return message.reply(`ปัจจุบันผู้ใช้มี id [${id} | ${name}] ไม่ถูกแบนจากการใช้บอท`);
			await usersData.setData(id, {
				banned: {
					status: false,
					reason: null
				}
			}, (err) => {
				if (err) return message.reply(`ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง ${err.name}: ${err.message}`);
				else message.reply(`เลิกแบนผู้ใช้ด้วย id [${id} | ${name}], บุคคลนี้สามารถใช้บอทได้แล้ว`);
			});
		}
		else return message.SyntaxError();
	}
};