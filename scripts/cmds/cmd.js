this.config = {
	name: "cmd",
	version: "1.0.7",
	author: {
		name: "lnwsck",
		contacts: ""
	},
	cooldowns: 5,
	role: 2,
	shortDescription: "การจัดการคำสั่ง",
	longDescription: "จัดการไฟล์คำสั่งของคุณ",
	category: "owner",
	guide: "{prefix}cmd load <ชื่อไฟล์คำสั่ง>",
	packages: "path"
};

module.exports = {
	config: this.config,
	start: ({ envGlobal, globalGoat, args, download, message, event, client }) => {
		const { execSync } = require('child_process');
		const { loading } = globalGoat;
		const { join } = require("path");
		const chalk = require("chalk");
		const fs = require("fs-extra");
		const allWhenChat = globalGoat.whenChat;
		const { configCommands } = globalGoat;

		const loadCommand = function (filename) {
			try {
				const pathCommand = __dirname + `/${filename}.js`;
				if (!fs.existsSync(pathCommand)) throw new Error(`ไม่พบไฟล์ ${filename}.js`);
				const oldCommand = require(join(__dirname, filename + ".js"));
				const oldNameCommand = oldCommand.config.name;
				const oldEnvConfig = oldCommand.config.envConfig || {};
				const oldEnvGlobal = oldCommand.config.envGlobal || {};

				if (oldCommand.config.shortName) {
					let oldShortName = oldCommand.config.shortName;
					if (typeof oldShortName == "string") oldShortName = [oldShortName];
					for (let aliases of oldShortName) globalGoat.shortNameCommands.delete(aliases);
				}

				// delete old command
				delete require.cache[require.resolve(pathCommand)];
				const command = require(join(__dirname, filename + ".js"));
				const configCommand = command.config;
				if (!configCommand) throw new Error("Config of command undefined");

				const nameScript = configCommand.name;
				// Check whenChat function
				const indexWhenChat = allWhenChat.findIndex(item => item == oldNameCommand);
				if (indexWhenChat != -1) allWhenChat[indexWhenChat] = null;
				if (command.whenChat) allWhenChat.push(nameScript);
				// -------------
				if (configCommand.shortName) {
					let { shortName } = configCommand;
					if (typeof shortName == "string") shortName = [shortName];
					for (const aliases of shortName) {
						if (globalGoat.shortName.has(aliases)) throw new Error(`Short Name ${aliases} ซ้ำกับชื่อย่อของคำสั่ง ${chalk.hex("#ff5208")(globalGoat.shortName.get(aliases))}`);
						else globalGoat.shortName.set(aliases, configCommand.name);
					}
				}
				let { packages, envGlobal, envConfig } = configCommand;
				if (!command.start) throw new Error(`คำสั่งต้องไม่พลาดฟังก์ชั่น start!`);
				if (!configCommand.name) throw new Error(`ชื่อคำสั่งไม่สามารถเว้นว่างได้!!`);

				if (packages) {
					typeof packages == "string" ? packages = packages.trim().replace(/\s+/g, '').split(',') : "";
					if (!Array.isArray(packages)) throw new Error("Value packages needs to be array");
					for (let i of packages) {
						try {
							require(i);
						}
						catch (err) {
							try {
								loading(`Install package ${chalk.hex("#ff5208")(i)}`, "PACKAGE");
								execSync("npm install " + i + " -s");
								loading(`ติดตั้งแล้ว package ${chalk.hex("#ff5208")(i)} cho Script ${chalk.hex("#FFFF00")(nameScript)} ประสบความสำเร็จ\n`, "PACKAGE");
							}
							catch (e) {
								loading.err(`ติดตั้งแพ็คเกจไม่ได้ ${chalk.hex("#ff0000")(i)} cho Script ${chalk.hex("#ff0000")(nameScript)} มีข้อผิดพลาด: ${e.stack}\n`, "PACKAGE");
							}
						}
					}
				}
				// env Global
				if (envGlobal && typeof envGlobal == "object") {
					if (!configCommands.envGlobal) configCommands.envGlobal = {};
					if (JSON.stringify(envGlobal) != JSON.stringify(oldEnvGlobal)) configCommands.envGlobal = envGlobal;
				}
				// env Config
				if (envConfig && typeof envConfig == "object") {
					if (!configCommands.envCommands) configCommands.envCommands = {};
					if (!configCommands.envCommands[nameScript]) configCommands.envCommands[nameScript] = {};
					if (JSON.stringify(configCommands.envCommands[nameScript]) != JSON.stringify(oldEnvConfig)) configCommands.envCommands[nameScript] = envConfig;
				}
				globalGoat.commands.delete(oldNameCommand);
				globalGoat.commands.set(nameScript, command);
				fs.writeFileSync(client.dirConfigCommands, JSON.stringify(configCommands, null, 2));
				globalGoat.print.master(`โหลดไฟล์คำสั่ง ${filename}.js`, "LOADED");
				return {
					status: "succes",
					name: filename
				};
			}
			catch (err) {
				return {
					status: "failed",
					name: filename,
					error: err
				};
			}
		};

		if (args[0] == "load") {
			if (!args[1]) return message.reply("โปรดป้อนชื่อคำสั่งที่คุณต้องการโหลดซ้ำ");
			const infoLoad = loadCommand(args[1]);
			if (infoLoad.status == "succes") message.reply(`โหลดคำสั่ง ${infoLoad.name} สำเร็จ`);
			else message.reply(`Load command ${infoLoad.name} ล้มเหลวด้วยความผิดพลาด\n${infoLoad.error.stack.split("\n").filter(i => i.length > 0).slice(0, 3).join("\n")}`);
			globalGoat.whenChat = allWhenChat.filter(item => item != null);
		}
		else if (args[0].toLowerCase() == "loadall") {
			const allFile = fs.readdirSync(__dirname)
				.filter(item => item.endsWith(".js"))
				.map(item => item = item.split(".")[0]);
			const arraySucces = [];
			const arrayFail = [];
			for (let name of allFile) {
				const infoLoad = loadCommand(name);
				infoLoad.status == "succes" ? arraySucces.push(name) :
					arrayFail.push(`${name}: ${infoLoad.error.name}: ${infoLoad.error.message}`);
			}
			globalGoat.whenChat = allWhenChat.filter(item => item != null);
			message.reply(`โหลดสำเร็จ ${arraySucces.length} command`
				+ `\n${arrayFail.length > 0 ? `\nโหลดไม่สำเร็จ ${arrayFail.length} command\n${arrayFail.join("\n")})` : ""}`);
		}
		else message.SyntaxError();
	}
};