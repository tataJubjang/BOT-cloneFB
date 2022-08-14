this.config = {
	name: "avatar",
	version: "1.0.5",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "สร้างอวาตาร์อนิเมะ",
	longDescription: "สร้างอวตารอะนิเมะพร้อมลายเซ็น",
	category: "image",
	guide: {
		body: "{p}{n} <รหัสอักขระหรือชื่ออักขระ> | <ข้อความ> | <ลายเซ็น> | <ชื่อสีภาษาอังกฤษหรือรหัสสีพื้นหลัง (สีฐานสิบหก)>\n{p}{n} ความช่วยเหลือ: ดูวิธีใช้คำสั่ง",
		attachment: {
			[__dirname + "/cache/hexcolor.png"]: "https://seotct.com/wp-content/uploads/2020/03/code-backgroud.png"
		}
	}
};

module.exports = {
	config: this.config,
	start: async function ({ args, message }) {
		const axios = require("axios");
		if (!args[0] || args[0] == "help") message.guideCmd();
		else {
			message.reply(`การเริ่มต้นรูปภาพ โปรดรอสักครู่...`);
			const content = args.join(" ").split("|").map(item => item = item.trim());
			let idNhanVat, tenNhanvat;
			const chu_Nen = content[1];
			const chu_Ky = content[2];
			const colorBg = content[3];
			try {
				const dataChracter = (await axios.get("https://goatbot.up.railway.app/taoanhdep/listavataranime?apikey=ntkhang")).data.data;
				if (!isNaN(content[0])) {
					idNhanVat = parseInt(content[0]);
					const totalCharacter = dataChracter.length - 1;
					if (idNhanVat > totalCharacter) return message.reply(`ปัจจุบันเท่านั้น ${totalCharacter} ตัวอักษรในระบบ โปรดป้อนรหัสอักขระที่เล็กลง`);
					tenNhanvat = dataChracter[idNhanVat].name;
				}
				else {
					const findChracter = dataChracter.find(item => item.name.toLowerCase() == content[0].toLowerCase());
					if (findChracter) {
						idNhanVat = findChracter.stt;
						tenNhanvat = content[0];
					}
					else return message.reply("ไม่พบตัวละครที่มีชื่อ " + content[0] + " ในรายการตัวละคร");
				}
			}
			catch (error) {
				const err = error.response.data;
				return message.reply(`Đã xảy ra lỗi lấy dữ liệu nhân vật:\n${err.name}: ${err.message}`);
			}

			const endpoint = `https://goatbot.up.railway.app/taoanhdep/avataranime`;
			const params = {
				id: idNhanVat,
				chu_Nen,
				chu_Ky,
				apikey: "ntkhangGoatBot"
			};
			if (colorBg) params.colorBg = colorBg;

			try {
				const response = await axios.get(endpoint, {
					params,
					responseType: "stream"
				});
				response.data.path = "avatar.png";
				message.reply({
					body: `✅ อวตารของคุณ\nรูป: ${tenNhanvat}\nรหัส: ${idNhanVat}\nพื้นหลังข้อความ: ${chu_Nen}\nลายเซ็น: ${chu_Ky}\nสี: ${colorBg || "ค่าเริ่มต้น"}`,
					attachment: response.data
				});
			}
			catch (error) {
				error.response.data.on("data", function (e) {
					const err = JSON.parse(e);
					message.reply(`ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง ${err.name}: ${err.message}`);
				});
			}
		}
	}
};