this.config = {
	name: "banner",
	version: "1.0.3",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "สร้างแบนเนอร์บริการออนไลน์",
	longDescription: "สร้างแบนเนอร์บริการออนไลน์",
	category: "image",
	guide: "{prefix}banner <facebook> | <zalo> | <phone> | <momo> | <title> | <subtitle> | <titlefacebook> | <info> | [<ลิงก์รูปภาพ> | หรือตอบกลับที่ภาพ]"
};

module.exports = {
	config: this.config,
	start: async function ({ message, event, args }) {
		const axios = require("axios");
		const fs = require("fs-extra");

		const content = args.join(" ").split("|").map(item => item = item.trim());
		const apikey = "ntkhangGoatBot";
		const facebook = content[0],
			zalo = content[1],
			phone = content[2],
			momo = content[3],
			title = content[4],
			subtitle = content[5],
			titlefacebook = content[6],
			info = content[7];
		const avatarurl = event.messageReply ? ((event.messageReply.attachments.length > 0) ? event.messageReply.attachments[0].url : content[8]) : content[8];
		if (!avatarurl || !avatarurl.includes("http")) return message.reply(`โปรดป้อนลิงก์รูปภาพที่ถูกต้อง ใช้ความช่วยเหลือ ${this.config.name} เพื่อดูรายละเอียดวิธีใช้คำสั่ง`);
		const params = { facebook, zalo, phone, momo, title, subtitle, titlefacebook, info, avatarurl, apikey };
		for (const i in params) if (!params[i]) return message.SyntaxError();
		message.reply(`กำลังเริ่มต้นรูปภาพ โปรดรอสักครู่...`);

		axios.get("https://goatbot.up.railway.app/taoanhdep/banner1", {
			params,
			responseType: "arraybuffer"
		})
			.then(data => {
				const imageBuffer = data.data;
				const pathSave = __dirname + "/cache/banner.jpg";
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