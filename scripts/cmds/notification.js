this.config = {
	name: "notification",
	version: "1.0.2",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 2,
	shortDescription: "ส่งการแจ้งเตือนจากแอดมินถึงทั้งหมด",
	longDescription: "ส่งการแจ้งเตือนจากแอดมินถึงทุกคน box",
	category: "owner",
	guide: "{p}{n} <ข้อความ>",
	envConfig: {
		delayPerGroup: 250
	}
};

module.exports = {
	config: this.config,
	start: async function ({ message, api, client, event, args, download, globalGoat }) {
		const fs = require("fs-extra");
		const axios = require("axios");
		const { delayPerGroup } = globalGoat.configCommands.envCommands["notification"];
		if (!args[0]) return message.reply("กรุณากรอกข้อความที่ต้องการส่งให้ทุกกลุ่ม");
		const formSend = {
			body: "ประกาศจากแอดมินบอท\n────────────────\n" + args.join(" ")
		};
		const attachmentSend = [];
		const arrPathSave = [];

		async function getAttachments(attachments) {
			let startFile = 0;
			for (const data of attachments) {
				const ext = data.type == "photo" ? "jpg" :
					data.type == "video" ? "mp4" :
						data.type == "animated_image" ? "gif" :
							data.type == "audio" ? "mp3" :
								"txt";
				const pathSave = __dirname + `/cache/notification${startFile}.${ext}`;
				++startFile;
				const url = data.url;
				const res = await axios.get(url, {
					responseType: "arraybuffer"
				});
				fs.writeFileSync(pathSave, Buffer.from(res.data));
				attachmentSend.push(fs.createReadStream(pathSave));
				arrPathSave.push(pathSave);
			}
		}

		if (event.messageReply) {
			if (event.messageReply.attachments.length > 0) {
				await getAttachments(event.messageReply.attachments);
			}
		}
		else if (event.attachments.length > 0) {
			await getAttachments(event.attachments);
		}

		if (attachmentSend.length > 0) formSend.attachment = attachmentSend;
		const allThreadID = (await api.getThreadList(500, null, ["INBOX"])).filter(item => item.isGroup === true && item.threadID != event.threadID).map(item => item = item.threadID);

		let sendSucces = 0;
		let sendError = [];

		for (let tid of allThreadID) {
			let errorWhenSend = false;
			api.sendMessage(formSend, tid, async function (err) {
				if (err) {
					sendError.push(tid);
					errorWhenSend = true;
				}
				await new Promise(resolve => setTimeout(resolve, delayPerGroup));
			});
			if (errorWhenSend === true) continue;
			++sendSucces;
		}

		message.reply(`ส่งข้อความถึง ${sendSucces} กลุ่มความสำเร็จ\n${sendError.length > 0 ? `เกิดข้อผิดพลาดขณะส่งไปที่ ${sendError.length} กลุ่ม` : ""}`);
		for (const pathSave of arrPathSave) fs.unlinkSync(pathSave);
	}
};