this.config = {
	name: "setbox",
	version: "1.0.1",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "แก้ไขกลุ่มของคุณ",
	longDescription: "แก้ไขกลุ่มของคุณ",
	category: "box chat",
	guide: "{p}{n} [name|emoji|avatar] <แก้ไขเนื้อหา>"
		+ "\nรายละเอียด:"
		+ "\n {p}{n} name <ชื่อใหม่>: เปลี่ยนชื่อกลุ่มแชท"
		+ "\n {p}{n} emoji <อิโมจิใหม่>: เปลี่ยนอีโมจิกลุ่ม"
		+ "\n {p}{n} avatar <ลิงก์รูปภาพหรือตอบกลับรูปภาพหรือแนบรูปภาพ>: เปลี่ยนรูปโปรไฟล์ของกลุ่มแชท"
};

module.exports = {
	config: this.config,
	start: async function ({ message, api, event, args, threadsData, download }) {
		const fs = require("fs-extra");
		const axios = require("axios");

		if (args[0] == "name") {
			const newName = args.slice(1).join(" ");
			api.setTitle(newName, event.threadID, async function (err) {
				if (err) return message.reply("ขออภัย มีข้อผิดพลาดเกิดขึ้น");
				message.reply("เปลี่ยนชื่อกลุ่มเป็น: " + newName);
				await threadsData.setData(event.threadID, {
					name: newName
				});
			});
		}
		else if (args[0] == "emoji") {
			const newEmoji = args[1];
			api.changeThreadEmoji(newEmoji, event.threadID, async function (err) {
				if (err) return message.reply("ขออภัย มีข้อผิดพลาดเกิดขึ้น");
				message.reply("เปลี่ยนอิโมจิกลุ่มเป็น: " + newEmoji);
				await threadsData.setData(event.threadID, {
					emoji: newEmoji
				});
			});
		}
		else if (["avatar", "avt", "img"].includes(args[0])) {
			const urlImage = (event.messageReply && event.messageReply.attachments[0] && event.messageReply.attachments[0].type != "share") ? event.messageReply.attachments[0].url : (event.attachments[0] && event.attachments[0].type != "share") ? event.attachments[0].url : args[1];

			if (!urlImage) return message.reply("โปรดแนบหรือตอบกลับพร้อมรูปภาพหรือป้อนลิงก์");
			const pathSave = __dirname + `/avatar${event.threadID}.png`;
			await download(urlImage, pathSave);
			api.changeGroupImage(fs.createReadStream(pathSave), event.threadID, async function (err) {
				if (err) return message.reply("ขออภัย มีข้อผิดพลาดเกิดขึ้น");
				message.reply("เปลี่ยนรูปหมู่");
				fs.unlinkSync(pathSave);
				await threadsData.setData(event.threadID, {
					avatarbox: urlImage
				});
			});
		}
		else message.SyntaxError();
	}
};