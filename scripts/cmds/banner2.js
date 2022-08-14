this.config = {
	name: "banner2",
	version: "1.0.2",
	author: {
		name: "NTKhang",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "สร้างภาพปก",
	longDescription: "สร้างภาพปก",
	category: "image",
	guide: "{prefix}{n} <name> | <description> | <facebook> | <instagram> | <phone> | <location> | [<ลิงก์รูปภาพ> | หรือตอบกลับที่ภาพ]"
};

module.exports = {
	config: this.config,
	start: async function ({ api, message, event, args, help }) {
		const axios = require("axios");
		const fs = require("fs-extra");

		const content = args.join(" ").split("|").map(item => item = item.trim());

		const apikey = "ntkhangGoatBot";
		const name = content[0],
			description = content[1],
			facebook = content[2],
			instagram = content[3],
			phone = content[4],
			location = content[5],

			avatarurl = event.messageReply ? ((event.messageReply.attachments.length > 0) ? event.messageReply.attachments[0].url : content[6]) : content[6];
		if (!avatarurl || !avatarurl.includes("http")) return message.reply(`โปรดป้อนลิงก์รูปภาพที่ถูกต้อง ใช้ความช่วยเหลือ ${this.config.name} เพื่อดูรายละเอียดวิธีใช้คำสั่ง`);
		const params = { apikey, name, description, facebook, instagram, phone, location, avatarurl };
		for (const i in params) if (!params[i]) return message.SyntaxError();
		message.reply(`กำลังเริ่มต้นรูปภาพ โปรดรอสักครู่...`);
		const pathSave = __dirname + `/cache/banner2${Date.now()}.png`;

		axios.get("https://goatbot.up.railway.app/taoanhdep/banner2", {
			params,
			responseType: "arraybuffer"
		})
			.then(data => {
				const imageBuffer = data.data;
				fs.writeFileSync(pathSave, Buffer.from(imageBuffer));
				message.reply({
					attachment: fs.createReadStream(pathSave)
				}, () => fs.unlinkSync(pathSave));
			})
			.catch(error => {
				const err = error.response ? JSON.parse(error.response.data.toString()) : error;
				return message.reply(`ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง ${err.name} ${err.message}`);
			});
	}
};