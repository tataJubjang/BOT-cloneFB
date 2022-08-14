this.config = {
	name: "qrcode",
	version: "1.0.0",
	author: {
		name: "NTKhang",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "สร้างรหัส qr",
	longDescription: "สร้างรหัส qr ด้วยเนื้อหาที่คุณป้อน",
	category: "image",
	guide: "{p}{n} <nội dung>"
};

module.exports = {
	config: this.config,
	start: function ({ message, event, args }) {
		const axios = require("axios");
		const fs = require("fs-extra");

		if (!args[0]) return message.reply("โปรดป้อนเนื้อหาที่คุณต้องการเพิ่มรหัส qr");
		axios.get("https://api.qrcode-monkey.com//qr/custom?", {
			params: {
				"data": args.join(" "),
				"config": {
					"body": "square",
					"eye": "frame3",
					"eyeBall": "ball0",
					"erf1": ["fv"],
					"erf2": ["fv", "fh"]
				},
				"size": 1000,
				"file": "png"
			},
			responseType: "arraybuffer"
		})
			.then(result => {
				const pathSave = __dirname + "/cache/qrcode.png";
				fs.writeFileSync(pathSave, Buffer.from(result.data));
				message.reply({
					attachment: fs.createReadStream(pathSave)
				}, () => fs.unlinkSync(pathSave));
			})
			.catch((e) => {
				return message.reply("เสียใจ. มีข้อผิดพลาดเกิดขึ้นโปรดลองอีกครั้ง");
			});

	}
};