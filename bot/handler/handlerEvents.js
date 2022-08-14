module.exports = function ({ api, globalGoat, client, usersData, threadsData, download, }) {
	const print = globalGoat.print;
	const axios = require("axios");
	const chalk = require("chalk");
	const { readdirSync, writeFileSync, existsSync, mkdirSync, createReadStream } = require("fs-extra");
	const moment = require("moment-timezone");

	return async function ({ event, message }) {
		const { body, messageID, threadID, isGroup } = event;
		const senderID = event.senderID || event.author || event.userID;

		let prefix = globalGoat.config.prefix;
		client.allThreadData[threadID] ? prefix = client.allThreadData[threadID].prefix || prefix : "";

		const contentSyntaxError = `คำสั่งที่คุณใช้ไม่ถูกต้อง โปรดพิมพ์ ${prefix}help {nameCmd} เพื่อดูรายละเอียดวิธีใช้คำสั่งนี้`;

		const parameters = { api, globalGoat, client, usersData, threadsData, message, event, download };

		if (!isNaN(senderID) && !client.allUserData[senderID]) await usersData.createData(senderID);
		if (!isNaN(threadID) && !client.allThreadData[threadID]) await threadsData.createData(threadID);

		//===============================================//
		//                   WHEN CHAT                   //
		//===============================================//
		async function whenChat() {
			const { isGroup } = event;
			const allWhenChat = globalGoat.whenChat || [];
			const args = body ? body.split(" ") : [];
			for (const key of allWhenChat) {
				const command = globalGoat.commands.get(key);
				try {
					message.SyntaxError = function () {
						return message.reply(contentSyntaxError.replace("{nameCmd}", command.config.name));
					};
					command.whenChat({
						...parameters,
						...{ args }
					});
				}
				catch (err) {
					print.err("เกิดข้อผิดพลาดขณะดำเนินการ commamd whenChat at command " + command.config.name + ", ข้อผิดพลาด: " + err.stack, "WHEN CHAT");
				}
			}
		}

		//===============================================//
		//              WHEN CALL COMMAND                //
		//===============================================//
		async function whenStart() {
			// —————————————— CHECK USE BOT —————————————— //
			if (body && !body.startsWith(prefix) || !body) return;
			const dateNow = Date.now();
			const { adminBot } = globalGoat.config;
			const args = body.slice(prefix.length).trim().split(/ +/);
			// —————————  CHECK HAS IN DATABASE  ————————— //
			if (!client.allThreadData[threadID]) await threadsData.createData(threadID);
			if (!client.allUserData[senderID]) await usersData.createData(senderID);
			// ————————————  CHECK HAS COMMAND ——————————— //
			var commandName = args.shift().toLowerCase();
			const command = globalGoat.commands.get(commandName) || globalGoat.commands.get(globalGoat.shortNameCommands.get(commandName));
			if (command) commandName = command.config.name;
			// ————————————— GET THREAD INFO ————————————— //
			const threadInfo = client.allThreadData[threadID] || {};
			if (threadInfo.onlyAdminBox === true && !threadInfo.adminIDs.includes(senderID) && commandName != "rules") return message.reply("เปิดใช้งานกลุ่มนี้แล้วและมีเพียงผู้ดูแลกลุ่มเท่านั้นที่สามารถใช้บอทได้");
			// —————————————— CHECK BANNED —————————————— //
			// +++++++++++     Check User     +++++++++++ //
			const infoBannedUser = client.allUserData[senderID].banned;
			if (infoBannedUser.status == true) {
				return message.reply(
					`คุณถูกห้ามไม่ให้ใช้บอทโดยผู้ดูแลระบบ`
					+ `\n> เหตุผล: ${infoBannedUser.reason}`
					+ `\n> เวลา: ${infoBannedUser.date}`
					+ `\n> User ID: ${senderID}`);
			}
			// +++++++++++    Check Thread    +++++++++++ //
			if (isGroup == true) {
				const infoBannedThread = threadInfo.banned;
				if (infoBannedThread.status == true) return message.reply(
					`กลุ่มของคุณถูกบ็อตผู้ดูแลระบบห้ามไม่ให้ใช้บอท`
					+ `\n> เหตุผล: ${infoBannedThread.reason}`
					+ `\n> เวลา: ${infoBannedThread.date}`
					+ `\n> Thread ID: ${threadID}`);
			}
			if (!command) return message.reply(`Lệnh ${commandName ? `'${commandName}'` : 'คุณใช้'} ไม่มีอยู่ พิมพ์ ${prefix}help เพื่อดูคำสั่งที่มีอยู่ทั้งหมด`);
			//============================================//
			// ————————————— COMMAND BANNED ————————————— //
			if (client.commandBanned[commandName]) return message.reply(`คำสั่ง ${commandName} ถูกห้ามโดยผู้ดูแลระบบจากระบบบอทด้วยเหตุผล: ${client.commandBanned[commandName]}`);
			// ————————————— CHECK PERMISSION ———————————— //
			const needRole = command.config.role || 0;
			const adminBox = threadInfo.adminIDs || [];

			const role = adminBot.includes(senderID) ? 2 :
				adminBox.includes(senderID) ? 1 :
					0;

			if (needRole > role && needRole == 1) return message.reply(`เฉพาะผู้ดูแลระบบของกลุ่มแชทเท่านั้นที่สามารถใช้คำสั่ง '${commandName}'`);
			if (needRole > role && needRole == 2) return message.reply(`บอทผู้ดูแลระบบเท่านั้นที่สามารถใช้คำสั่ง'${commandName}'`);
			// ———————————————— COOLDOWNS ———————————————— //
			if (!client.cooldowns[commandName]) client.cooldowns[commandName] = {};
			const timestamps = client.cooldowns[commandName];
			const cooldownCommand = (command.config.cooldowns || 1) * 1000;
			if (timestamps[senderID]) {
				const expirationTime = timestamps[senderID] + cooldownCommand;
				if (dateNow < expirationTime) return message.reply(`⏱ คุณกำลังรอที่จะใช้คำสั่งนี้ โปรดกลับมาใหม่ภายหลัง ${((expirationTime - dateNow) / 1000).toString().slice(0, 3)}s`);
			}
			// ——————————————— RUN COMMAND ——————————————— //
			try {
				message.SyntaxError = function () {
					return message.reply(contentSyntaxError.replace("{nameCmd}", command.config.name));
				};
				message.guideCmd = async function () {
					let guide = configCommand.guide || {
						body: ""
					};
					if (typeof (guide) == "string") guide = {
						body: guide
					};
					const msg = '\n───────────────\n'
						+ '» คำแนะนำสำหรับการใช้งาน:\n'
						+ guide.body
							.replace(/\{prefix\}|\{p\}/g, prefix)
							.replace(/\{name\}|\{n\}/g, configCommand.name)
						+ '\n───────────────\n'
						+ '» บันทึก:\n• เนื้อหาภายใน <XXXXX> เปลี่ยนแปลงได้\n• เนื้อหาภายใน [a|b|c] คือ a หรือ b หรือ c';

					const formSendMessage = {
						body: msg
					};

					if (guide.attachment) {
						if (guide.attachment && typeof (guide.attachment) == 'object' && !Array.isArray(guide.attachment)) {
							formSendMessage.attachment = [];
							for (const pathFile in guide.attachment) {
								if (!existsSync(pathFile)) await download(guide.attachment[pathFile], pathFile);
								formSendMessage.attachment.push(createReadStream(pathFile));
							}
						}
					}
					message.reply(formSendMessage);
				};
				const time = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss");
				print(`${chalk.hex("#ffb300")(time)} | ${commandName} | ${senderID} | ${threadID} | ${args.join(" ")}`, "CALL CMD");
				parameters.role = role;
				command.start({ ...parameters, ...{ args } });
				timestamps[senderID] = dateNow;
			}
			catch (err) {
				print.err(`เกิดข้อผิดพลาดขณะรันคำสั่ง${commandName}, ข้อผิดพลาด: ${err.stack}`, "CALL COMMAND");
				return message.reply(`❎\nError 420 ${commandName}\n${err.stack}`);
			}
		}

		//===============================================//
		//                   WHEN REPLY                  //
		//===============================================//
		async function whenReply() {
			if (!event.messageReply) return;
			const { whenReply } = globalGoat;
			const Reply = whenReply[event.messageReply.messageID];
			if (!Reply) return;
			const command = globalGoat.commands.get(Reply.nameCmd);
			if (!command) throw new Error("ไม่พบชื่อคำสั่งเพื่อดำเนินการตอบสนองนี้");
			const args = body ? body.split(" ") : [];
			try {
				message.SyntaxError = function () {
					return message.reply(contentSyntaxError.replace("{nameCmd}", command.config.name));
				};
				message.guideCmd = async function () {
					const formSendMessage = {
						body: command.config.guide.replace(/\{prefix\}|\{p\}/g, prefix).replace(/\{name\}|\{n\}/g, commandName)
					};
					const { sendFile } = command.config;
					if (sendFile &&
						typeof (sendFile) == 'object' &&
						!Array.isArray(sendFile)
					) {
						formSendMessage.attachment = [];
						for (let pathFile in sendFile) {
							if (!existsSync(pathFile)) await download(sendFile[pathFile], pathFile);
							formSendMessage.attachment.push(createReadStream(pathFile));
						}
					}
					return api.sendMessage(formSendMessage, threadID, messageID);
				};
				return command.whenReply({ ...parameters, ...{ Reply, args } });
			}
			catch (err) {
				print.err(`เกิดข้อผิดพลาดขณะดำเนินการคำสั่งตอบกลับที่ command ${Reply.nameCmd} ${err.stack}`, "WHEN REPLY");
				message.reply(`❎\nเกิดข้อผิดพลาดที่ command  ${Reply.nameCmd}\n${err.stack}`);
			}
		}

		//===============================================//
		//                 WHEN REACTION                 //
		//===============================================//
		async function whenReaction() {
			const { whenReaction } = globalGoat;
			const Reaction = whenReaction[messageID];
			if (!Reaction) return;
			const command = globalGoat.commands.get(Reaction.nameCmd);
			if (!command) throw new Error("ไม่พบชื่อคำสั่งเพื่อดำเนินการตอบสนองนี้");
			const args = body ? body.split(" ") : [];
			try {
				message.SyntaxError = function () {
					return message.reply(contentSyntaxError.replace("{nameCmd}", command.config.name));
				};
				message.guideCmd = async function () {
					const formSendMessage = {
						body: command.config.guide.replace(/\{prefix\}|\{p\}/g, prefix).replace(/\{name\}|\{n\}/g, commandName)
					};
					const { sendFile } = command.config;
					if (sendFile &&
						typeof (sendFile) == 'object' &&
						!Array.isArray(sendFile)
					) {
						formSendMessage.attachment = [];
						for (let pathFile in sendFile) {
							if (!existsSync(pathFile)) await download(sendFile[pathFile], pathFile);
							formSendMessage.attachment.push(createReadStream(pathFile));
						}
					}
					return api.sendMessage(formSendMessage, threadID, messageID);
				};
				command.whenReaction({ ...parameters, ...{ Reaction, args } });
				return;
			}
			catch (e) {
				print.err(`เกิดข้อผิดพลาดขณะรันคำสั่ง React at command ${Reaction.nameCmd}: ${e.stack}`, "HANDLE REACTION");
				message.reply(`❎\nเกิดข้อผิดพลาดที่ command Reaction ${Reaction.nameCmd}\n${err.stack}`);
			}
		}

		//===============================================//
		//                     EVENT                     //
		//===============================================//
		async function handlerEvent() {
			const { logMessageType, author } = event;
			for (const [key, value] of globalGoat.events.entries()) {
				const getEvent = globalGoat.events.get(key);
				if (!getEvent.config.type.includes(logMessageType)) continue;
				if (getEvent.config.condition && !eval(getEvent.config.condition)) continue;
				try {
					const time = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss");
					print(`${chalk.hex("#ffb300")(time)} | Event: ${getEvent.config.name} | ${author} | ${threadID}`, "EVENT CMD");
					getEvent.start({ event, api, globalGoat, usersData, threadsData, client, download, message });
				}
				catch (err) {
					print.err(`เกิดข้อผิดพลาดที่เหตุการณ์คำสั่ง ${chalk.hex("#ff0000")(getEvent.config.name)}, ${err.stack}`, "EVENT COMMAND");
					message.reply(`❎\nผิดพลาด command event ${getEvent.config.name}\n${err.stack}`)
				}
			}
		}

		//===============================================//
		//                    PRESENCE                   //
		//===============================================//
		async function presence() {
			// Your code here
		}

		//===============================================//
		//                   READ RECEIPT                //
		//===============================================//
		async function read_receipt() {
			// Your code here
		}

		//===============================================//
		//                      TYP                      //
		//===============================================//
		async function typ() {
			// Your code here
		}



		return {
			whenChat,
			whenStart,
			whenReaction,
			whenReply,
			handlerEvent,
			presence,
			read_receipt,
			typ
		}
	};
};