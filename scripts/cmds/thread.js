this.config = {
	name: "thread",
	version: "1.0.6",
	author: {
		name: "NTKhang",
		contacts: ""
	},
	cooldowns: 5,
	role: 2,
	shortDescription: "จัดการกลุ่มแชท",
	longDescription: "จัดการกลุ่มแชทในระบบบอท",
	category: "owner",
	guide: "{prefix}thread [find | -f | search | -s] <ชื่อที่จะค้นหา>: ค้นหาแชทกลุ่มในข้อมูลบอทตามชื่อ"
		+ "\n"
		+ "\n{prefix}thread [ban | -b] [<id> | ว่างเปล่า] <reason>: เคยแบนกลุ่มที่มี id <id> หรือกลุ่มปัจจุบันไม่ให้ใช้ bot"
		+ "\nตัวอย่างเช่น:"
		+ "\n{prefix}thread ban 3950898668362484 spam bot"
		+ "\n{prefix}thread ban spam มากเกินไป"
		+ "\n"
		+ "\n{prefix}thread unban [<id> | เว้นว่างไว้] เพื่อปลดบล็อกกลุ่มที่มี id <id>"
    + "\n หรือกลุ่มปัจจุบัน"
};

module.exports = {
	config: this.config,
	start: async function ({ api, args, threadsData, message, client, event }) {
		const moment = require("moment-timezone");
		const type = args[0];
		// find thread
		if (["find", "search", "-f", "-s"].includes(type)) {
			const allThread = await threadsData.getAll(["name"]);
			const keyword = args.slice(1).join(" ");
			const result = allThread.filter(item => (item.name || "").toLowerCase().includes(keyword.toLowerCase()));
			const msg = result.reduce((i, user) => i += `\n╭Name: ${user.name}\n╰ID: ${user.id}`, "");
			message.reply(result.length == 0 ? `❌ ไม่พบกลุ่มใดที่มีชื่อตรงกับคีย์เวิร์ด: ${keyword}` : `🔎มี ${result.length} ผลลัพธ์ที่ตรงกันสำหรับคำสำคัญ "${keyword}":\n${msg}`);
		}
		// ban thread
		else if (["ban", "-b"].includes(type)) {
			let id, reason;
			if (!isNaN(args[1])) {
				id = args[1];
				reason = args.slice(2).join(" ");
			}
			else {
				id = event.threadID;
				reason = args.slice(1).join(" ");
			}
			if (!id || !reason) return message.SyntaxError();
			reason = reason.replace(/\s+/g, ' ');
			if (!client.allThreadData[id]) return message.reply(`กลุ่มที่มีรหัส ${id} ไม่มีอยู่ในข้อมูลบอท`);
			const threadData = await threadsData.getData(id);
			const name = threadData.name;
			const status = threadData.banned.status;

			if (status) return message.reply(`กลุ่มที่มีรหัส [${id} | ${name}] ถูกแบนก่อนหน้านี้:\n> เหตุผล: ${threadData.banned.reason}\n> เวลา: ${threadData.banned.date}`);
			const time = moment.tz("Asia/Bangkok").format("DD/MM/YYYY HH:mm:ss");

			await threadsData.setData(id, {
				banned: {
					status: true,
					reason,
					date: time
				}
			}, (err) => {
				if (err) return message.reply(`ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง ${err.name}: ${err.message}`);
				else return message.reply(`กลุ่มห้ามถือ id [${id} | ${name}] ใช้บอท.\n> เหตุผล: ${reason}\n> เวลา: ${time}`);
			});
		}
		// unban thread
		else if (["unban", "-u"].includes(type)) {
			let id;
			if (!isNaN(args[1])) id = args[1];
			else id = event.threadID;
			if (!id) return message.SyntaxError();
			if (!client.allThreadData[id]) return message.reply(`กลุ่มที่มีรหัส ${id} ไม่มีอยู่ในข้อมูลบอท`);

			const threadData = await threadsData.getData(id);
			const name = threadData.name;
			const status = threadData.banned.status;

			if (!status) return message.reply(`ปัจจุบันกลุ่มถือ id [${id} | ${name}] ไม่ถูกแบนจากการใช้บอท`);
			await threadsData.setData(id, {
				banned: {
					status: false,
					reason: null
				}
			}, (err, data) => {
				if (err) return message.reply(`ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง ${err.name}: ${err.message}`);
				else message.reply(`เลิกแบนกลุ่มที่มี id [${id} | ${name}], ตอนนี้กลุ่มนี้ใช้บอทได้แล้ว`);
			});
		}
		// info thread
		else if (["info", "-i"].includes(type)) {
			let id;
			if (!isNaN(args[1])) id = args[1];
			else id = event.threadID;
			if (!id) return message.SyntaxError();
			if (!client.allThreadData[id]) return message.reply(`กลุ่มที่มีรหัส ${id} ไม่มีอยู่ในข้อมูลบอท`);
			const threadData = await threadsData.getData(id);
			const valuesMember = Object.values(threadData.members).filter(item => item.inGroup);
			const msg = `> Thread ID: ${threadData.id}`
				+ `\n> Name: ${threadData.name}`
				+ `\n> Create Date: ${moment(threadData.data.createDate).tz("Asia/Bangkok").format("DD/MM/YYYY HH:mm:ss")}`
				+ `\n> สมาชิกทั้งหมด: ${valuesMember.length}`
				+ `\n> ชาย: ${valuesMember.filter(item => item.gender == "MALE").length} สมาชิก`
				+ `\n> หญิง: ${valuesMember.filter(item => item.gender == "FEMALE").length} สมาชิก`
				+ `\n> ข้อความทั้งหมด: ${valuesMember.reduce((i, item) => i += item.count, 0)}`
				+ `\n- Banned: ${threadData.banned.status}`
				+ `\n- Reason: ${threadData.banned.reason}`
				+ `\n- Time: ${threadData.banned.date}`;
			return message.reply(msg);
		}
		else return message.SyntaxError();
	}
};