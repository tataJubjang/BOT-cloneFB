this.config = {
	name: "sorthelp",
	version: "1.0.0",
	author: {
		name: "NTKhang",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "สร้างภาพปก",
	longDescription: "สร้างภาพปกที่สวยงาม",
	category: "image",
	guide: "{prefix}{n} [name|category]\nตัวอย่างเช่น: {p}{n} name"
};

module.exports = {
	config: this.config,
	start: async function ({ message, event, args, threadsData }) {
		if (args[0] == "name") {
			threadsData.setData(event.threadID, { sortHelp: "name" }, (err) => {
				if (err) return message.reply("มีข้อผิดพลาดเกิดขึ้นโปรดลองอีกครั้ง" + err.stack);
				else message.reply("การตั้งค่าที่บันทึกไว้เพื่อจัดเรียงรายการช่วยเหลือตามลำดับตัวอักษร");
			});
		}
		else if (args[0] == "category") {
			threadsData.setData(event.threadID, { sortHelp: "category" }, (err) => {
				if (err) return message.reply("มีข้อผิดพลาดเกิดขึ้นโปรดลองอีกครั้ง" + err.stack);
				else message.reply("บันทึกการตั้งค่าการจัดเรียงรายการความช่วยเหลือในลำดับกลุ่ม");
			});
		}
		else message.SyntaxError();
	}
};