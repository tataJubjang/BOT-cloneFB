this.config = {
	name: "rules",
	version: "1.0.5",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "กฏของกลุ่ม",
	longDescription: "สร้าง / ดู / เพิ่ม / แก้ไข / เปลี่ยนตำแหน่ง / ลบกฎกลุ่มของคุณ",
	category: "Box chat",
	guide: "{p}{n} [add | -a] <กฎที่คุณต้องการเพิ่ม>: เพิ่มกฎสำหรับกลุ่ม"
		+ "\n{p}{n}: ดูกฎของกลุ่ม"
		+ "\n{p}{n} [edit | -e] <n> <เนื้อหาหลังแก้ไข>: แก้ไขกฎที่ n"
		+ "\m{p}{n} [move | -m] <stt1> <stt2> สลับตำแหน่งของกฎ <stt1> และ <stt2> ซึ่งกันและกัน"
		+ "\n{p}{n} [delete | -d] <n>: ลบกฎด้วยหมายเลข n"
		+ "\n{p}{n} [remove | -r]: ลบกฎกลุ่มทั้งหมด"
		+ "\n"
		+ "\n-ตัวอย่างเช่น:"
		+ "\n + {p}{n} เพิ่มไม่มีสแปม"
		+ "\n + {p}{n} move 1 3"
		+ "\n + {p}{n} -e 1 ห้ามสแปมข้อความในกลุ่ม"
		+ "\n + {p}{n} -d 1"
		+ "\n + {p}{n} -r"
};

module.exports = {
	config: this.config,
	start: async function ({ api, role, globalGoat, args, message, event, threadsData }) {
		const { senderID, threadID, messageID } = event;

		const type = args[0];
		const threadData = await threadsData.getData(threadID);
		const dataOfThread = threadData.data;

		if (!dataOfThread.rules) dataOfThread.rules = [];
		const rulesOfThread = dataOfThread.rules;
		const totalRules = rulesOfThread.length;

		if (!type) {
			let i = 1;
			const msg = rulesOfThread.reduce((text, rules) => text += `${i++}. ${rules}\n`, "");
			message.reply(msg || "ขณะนี้กลุ่มของคุณไม่มีกฎเกณฑ์ใดๆ หากต้องการเพิ่มกฎให้กับกลุ่ม ให้ใช้ `กฎเพิ่ม`");
		}
		else if (["add", "-a"].includes(type)) {
			if (role < 1) return message.reply("เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเพิ่มกฎของกลุ่ม");
			if (!args[1]) return message.reply("โปรดป้อนข้อความสำหรับกฎที่คุณต้องการเพิ่ม");
			rulesOfThread.push(args.slice(1).join(" "));
			threadsData.setData(threadID, {
				data: dataOfThread
			}, (err) => {
				if (err) return message.reply("ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง: " + err.name + "\n" + err.message);
				message.reply(`เพิ่มกฎใหม่สำหรับกลุ่ม`);
			});
		}
		else if (["edit", "-e"].includes(type)) {
			if (role < 1) return message.reply("เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถแก้ไขกฎของกลุ่ม");
			const stt = parseInt(args[1]);
			if (isNaN(stt)) return message.reply(`โปรดป้อนหมายเลขคำสั่งซื้อของข้อบังคับที่คุณต้องการแก้ไข`);
			if (!rulesOfThread[stt - 1]) return message.reply(`ไม่มีกฎรองอยู่ ${stt}, กลุ่มเพื่อนตอนนี้ ${totalRules == 0 ? `ไม่ได้ตั้งกฎไว้` : `เท่านั้น ${totalRules} กฎ`}`);
			if (!args[2]) return message.reply(`โปรดป้อนสิ่งที่คุณต้องการเปลี่ยนแปลงสำหรับ กฎ อันดับ ${stt}`);
			const newContent = args.slice(2).join(" ");
			rulesOfThread[stt - 1] = newContent;
			threadsData.setData(threadID, {
				data: dataOfThread
			}, (err) => {
				if (err) return message.reply("ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง: " + err.name + "\n" + err.message);
				message.reply(`แก้ไขแล้ว กฎ อันดับ ${stt} ของกลุ่ม: ${newContent}`);
			});
		}
		else if (["move", "-m"].includes(type)) {
			if (role < 1) return message.reply("เฉพาะแอดมินเท่านั้นที่เปลี่ยนที่ตั้งกลุ่มได้");
			const stt1 = parseInt(args[1]);
			const stt2 = parseInt(args[2]);
			if (isNaN(stt1) || isNaN(stt2)) return message.reply(`โปรดป้อนหมายเลขคำสั่ง กฎ 2 กลุ่มที่คุณต้องการสลับตำแหน่งด้วยกัน`);
			if (!rulesOfThread[stt1 - 1] || !rulesOfThread[stt2 - 1]) return message.reply(`ไม่ได้อยู่ใน กฎ อันดับ ${!rulesOfThread[stt1 - 1] ? (stt1 + (!rulesOfThread[stt2 - 1] ? ` และ ${stt2}` : '')) : stt2}, กลุ่มเพื่อนตอนนี้ ${totalRules == 0 ? `ไม่ได้ตั้งกฎไว้` : `เท่านั้น ${totalRules} กฎ`}`);
			[rulesOfThread[stt1 - 1], rulesOfThread[stt2 - 1]] = [rulesOfThread[stt2 - 1], rulesOfThread[stt1 - 1]];
			threadsData.setData(threadID, {
				data: dataOfThread
			}, (err) => {
				if (err) return message.reply("ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง: " + err.name + "\n" + err.message);
				message.reply(`เปลี่ยนตำแหน่ง 2 อย่าง ${stt1} และ ${stt2}`);
			});
		}
		else if (["delete", "del", "-d"].includes(type)) {
			if (role < 1) return message.reply("แอดมินเท่านั้นที่ลบได้ กฎ ของกลุ่ม");
			if (!args[1] || isNaN(args[1])) return message.reply("โปรดป้อนหมายเลขซีเรียลของ กฎ คุณต้องการที่จะลบ");
			const rulesDel = rulesOfThread[parseInt(args[1]) - 1];
			if (!rulesDel) return message.reply(`ไม่ได้อยู่ กฎ อันดับ ${args[1]}, กลุ่มเพื่อนตอนนี้ có ${totalRules} กฎ`);
			rulesOfThread.splice(parseInt(args[1]) - 1, 1);
			threadsData.setData(threadID, {
				data: dataOfThread
			}, (err) => {
				if (err) return message.reply("ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง: " + err.name + "\n" + err.message);
				message.reply(`ถูกลบ กฎ อันดับ ${args[1]} ของกลุ่มเนื้อหา: ${rulesDel}`);
			});
		}
		else if (type == "remove" || type == "-r") {
			if (role < 1) return message.reply("เท่านั้น ผู้ดูแลกลุ่มใหม่สามารถลบกลุ่มทั้งหมดได้");
			dataOfThread.rules = [];
			threadsData.setData(threadID, {
				data: dataOfThread
			}, (err) => {
				if (err) return message.reply("ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง: " + err.name + "\n" + err.message);
				message.reply(`ลบทั้งกลุ่ม`);
			});
		}
		else if (!isNaN(type)) {
			let msg = "";
			for (const stt of args) {
				const rules = rulesOfThread[parseInt(stt) - 1];
				if (rules) msg += `${stt}. ${rules}\n`;
			}
			message.reply(msg || `ไม่ได้อยู่ กฎ อันดับ ${type}, กลุ่มเพื่อนตอนนี้ ${totalRules == 0 ? `ไม่ได้ตั้งกฎไว้` : `เท่านั้น ${totalRules} กฎ`}`);
		}
	}
};
