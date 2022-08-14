(async () => {

	process.on('unhandledRejection', error => console.error(error));
	process.on('uncaughtException', error => console.error(error));

	const chalk = require("chalk");
	const login = require("fb-chat-api");
	const { writeFileSync } = require("fs-extra");

	const print = require("./logger/print.js");
	const loading = require("./logger/loading.js");

	const globalGoat = {
		print,
		loading,
		commands: new Map(),
		shortNameCommands: new Map(),
		events: new Map(),
		whenChat: [],
		whenReply: {},
		whenReaction: {},
		config: require("./config.json"),
		configCommands: require("./configCommands.json")
	};
	// ————————————————— LOAD CONFIG ————————————————— //
	print("ติดตั้งการตั้งค่าบอท", "CONFIG");
	const { configCommands, config } = globalGoat;

	const client = {
		dirConfig: __dirname + "/config.json",
		dirConfigCommands: __dirname + "/configCommands.json",
		allThreadData: {},
		allUserData: {},
		cooldowns: {},
		cache: {},
		database: {
			threadBusy: false,
			userBusy: false
		},
		allThread: [],
		allUser: [],
		commandBanned: configCommands.commandBanned,
		getPrefix: function (threadID) {
			let prefix = globalGoat.config.prefix;
			client.allThreadData[threadID] ? prefix = client.allThreadData[threadID].prefix || prefix : "";
			return prefix;
		}
	};

	// ———————————— โหลดไฟล์คำสั่งทั้งหมด ———————————— //
	print("ดำเนินการดาวน์โหลดไฟล์คำสั่ง โปรดรอสักครู่", "LOAD COMMANDS");
	await require("./bot/loadAllScript.js")(globalGoat);
	// ———————— // ———————— // ———————— // ———————— //
	console.log(chalk.blue(`===========================================`));
	print(`โหลดสำเร็จ: ${globalGoat.commands.size} Script commands`, "LOADED");
	print(`โหลดสำเร็จ: ${globalGoat.events.size} Script events`, "LOADED");
	console.log(chalk.blue(`===========================================`));
	// —————————————————— LOGIN ————————————————— //
	require("./bot/login.js")(login, print, loading, config, client, globalGoat, configCommands, writeFileSync);
})();

/*
 *
 *ซอร์สโค้ดเขียนโดย NTKhang โปรดอย่าเปลี่ยนชื่อผู้เขียนในไฟล์ใดๆ ขอบคุณที่ใช้บริการ
 *ซอร์สโค้ดเขียนโดย NTKhang โปรดอย่าเปลี่ยนชื่อผู้แต่งทุกที่ ขอบคุณที่ใช้บริการ
 *
 */