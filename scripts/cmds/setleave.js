this.config = {
	name: "setleave",
	version: "1.0.1",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "แก้ไขเนื้อหาของข้อความออกจากลุ่ม",
	longDescription: "แก้ไขข้อความบอกลาสมาชิกที่ออกจากกลุ่มแชทของคุณ",
	category: "custom",
	guide: "{p}{n} text [<เนื้อหา>|reset]: แก้ไขเนื้อหาข้อความหรือรีเซ็ตเป็นค่าเริ่มต้น ทางลัดที่มีให้:"
		+ "\n+ {userName}: ชื่อสมาชิกใหม่"
		+ "\n+ {boxName}:  ชื่อกลุ่มแชท"
		+ "\n+ {type}: ซ้าย/ลบออกจากกลุ่มโดย qtv"
		+ "\n+ {session}: เซสชั่นของวัน"
		+ "\n* ตัวอย่างเช่น: {p}{n} text {userName} แล้ว {type} จากกลุ่มเจอกันใหม่ครับ 🤧"
		+ "\n"
		+ "\nReply (ตอบกลับ) ข้อความพร้อมไฟล์ที่มีเนื้อหา {p}{n} file: ให้ส่งไฟล์นั้นเมื่อสมาชิกออกจากกลุ่ม (ภาพ, video, audio)"
		+ "\n{p}{n} file reset: ลบส่งไฟล์"
};

module.exports = {
	config: this.config,
	start: async function ({ args, threadsData, globalGoat, message, event, download }) {
		const fs = require("fs-extra");
		const { threadID } = event;
		const data = (await threadsData.getData(threadID)).data;

		if (args[0] == "text") {
			if (!args[1]) return message.reply("กรุณากรอกข้อความ");
			else if (args[1] == "reset") data.leaveMessage = null;
			else data.leaveMessage = args.slice(1).join(" ");
		}
		else if (args[0] == "file") {
			if (args[1] == "reset") {
				try {
					fs.unlinkSync(__dirname + "/../events/src/mediaLeave/" + data.leaveAttachment);
				}
				catch (e) { }
				data.leaveAttachment = null;
			}
			else if (!event.messageReply || event.messageReply.attachments.length == 0) return message.reply("โปรดตอบกลับ (ตอบกลับ) ข้อความที่มีไฟล์ รูปภาพ/video/audio");
			else {
				const attachments = event.messageReply.attachments;
				const typeFile = attachments[0].type;
				const ext = typeFile == "audio" ? ".mp3" :
					typeFile == "video" ? ".mp4" :
						typeFile == "photo" ? ".png" :
							typeFile == "animated_image" ? ".gif" : "";
				const fileName = "leave" + threadID + ext;
				await download(attachments[0].url, __dirname + "/../events/src/mediaLeave/" + fileName);
				data.leaveAttachment = fileName;
			}
		}
		else return message.SyntaxError();

		await threadsData.setData(threadID, {
			data
		}, (err, info) => {
			if (err) return message.reply(`มีข้อผิดพลาดเกิดขึ้นโปรดลองอีกครั้ง: ${err.name}: ${err.message}`);
			message.reply(`การเปลี่ยนแปลงของคุณได้รับการบันทึก`);
		});

	}
};