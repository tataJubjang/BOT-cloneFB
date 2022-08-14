this.config = {
	name: "customrankcard",
	version: "1.0.1",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "การออกแบบการ์ดอันดับ",
	longDescription: "ออกแบบการ์ดอันดับของคุณ",
	category: "rank",
	guide: {
		body: "{p}{n} [maincolor | subcolor | expcolor | expnextlevelcolor | alphasubcolor | textcolor | reset] <value>\ในนั้น: "
			+ "\n+ สีหลัก: พื้นหลังหลักของแท็กอันดับ (สีฐานสิบหกหรือ rgba หรือรูปภาพ url)" + "\n+ สีย่อย: พื้นหลังรอง (สีฐานสิบหกหรือ rgba หรือรูปภาพ url)" + "\n+ Expcolor: สีของแถบ exp ปัจจุบัน" + "\n+ Expnextlevelcolor: สีของแถบ exp เต็ม" + "\n+ Alphasubcolor: ความทึบของพื้นหลังรอง (จาก 0 -> 1)" + "\n Textcolor: สีข้อความ (สีฐานสิบหกหรือ rgba)" + "\n รีเซ็ต: รีเซ็ตเป็นค่าเริ่มต้น" + "\n\nตัวอย่าง:"
			+ "\n  {p}{n} maincolor #fff000"
			+ "\n  {p}{n} subcolor rgba(255,136,86,0.4)"
			+ "\n  {p}{n} reset",
		attachment: {
			[__dirname + "/src/image/helpcustomrankcard.jpg"]: "https://github.com/ntkhang03/resources-goat-bot/raw/master/image/helpcustomrankcard.jpg"
		}
	}
};

module.exports = {
	config: this.config,
	start: async function ({ message, threadsData, event, args }) {
		const axios = require("axios");

		const threadInfo = await threadsData.getData(event.threadID);

		const dataThread = threadInfo.data;
		if (!dataThread.customRankCard) dataThread.customRankCard = {};
		let oldDesign = dataThread.customRankCard;
		if (!args[0]) return message.SyntaxError();
		const key = args[0].toLowerCase();
		const value = args.slice(1).join(" ");

		const rgbRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/;
		const checkUrlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
		const hexColorRegex = /^#([0-9a-f]{6})$/i;

		if (["subcolor", "maincolor", "expcolor", "expnextlevelcolor"].includes(key)) {
			// if image url
			if (value.match(checkUrlRegex)) {
				const response = await axios.get("https://goatbot.up.railway.app/taoanhdep/checkurlimage?url=" + encodeURIComponent(value));
				if (response.data == false) return message.reply("URL รูปภาพไม่ถูกต้อง โปรดเลือก 1 URL ที่มีหน้า Landing Page ของรูปภาพ");
				key == "maincolor" ? oldDesign.main_color = value
					: key == "subcolor" ? oldDesign.sub_color = value
						: key == "expcolor" ? oldDesign.exp_color = value
							: key == "textcolor" ? oldDesign.text_color = value
								: oldDesign.expNextLevel_color = value;
			}
			else {
				// if color
				if (!value.match(rgbRegex) && !value.match(hexColorRegex)) return message.reply("รหัสสีไม่ถูกต้อง โปรดป้อนรหัสสีฐานสิบหก (6 หลัก) หรือรหัสสี rgba");
				key == "maincolor" ? oldDesign.main_color = value
					: key == "subcolor" ? oldDesign.sub_color = value
						: key == "expcolor" ? oldDesign.exp_color = value
							: key == "textcolor" ? oldDesign.text_color = value
								: oldDesign.expNextLevel_color = value;
			}
			await threadsData.setData(event.threadID, {
				data: dataThread
			}, (e, i) => {
				if (e) return message.reply("มีข้อผิดพลาดเกิดขึ้นโปรดลองอีกครั้ง\n" + e.name + ": " + e.message);
				message.reply("การเปลี่ยนแปลงของคุณได้รับการบันทึก");
			});
		}
		else if (key == "alphasubcolor" || key == "alphasubcard") {
			if (parseFloat(value) < 0 && parseFloat(value) > 1) return message.reply("โปรดเลือกดัชนีระหว่าง 0 -> 1");
			oldDesign.alpha_subcard = parseFloat(value);
			await threadsData.setData(event.threadID, {
				data: dataThread
			}, (e, i) => {
				if (e) return message.reply("มีข้อผิดพลาดเกิดขึ้นโปรดลองอีกครั้ง\n" + e.name + ": " + e.message);
				message.reply("การเปลี่ยนแปลงของคุณได้รับการบันทึก");
			});
		}
		else if (key == "reset") {
			dataThread.customRankCard = {};
			await threadsData.setData(event.threadID, {
				data: dataThread
			}, (e, i) => {
				if (e) return message.reply("มีข้อผิดพลาดเกิดขึ้นโปรดลองอีกครั้ง\n" + e.name + ": " + e.message);
				message.reply("บันทึกการเปลี่ยนแปลงของคุณ (รีเซ็ต)");
			});
		}
		else message.SyntaxError();

	}
};