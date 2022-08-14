module.exports = async (globalGoat) => {
	const chalk = require("chalk");
	const { print, loading, configCommands } = globalGoat;
	const { execSync } = require('child_process');
	const { readdirSync, readFileSync, writeFileSync } = require("fs-extra");

	const folder = ["cmds", "events"];

	for (const folderModules of folder) {
		const makeColor = folderModules == "cmds" ?
			"============ LOADING COMMANDS ============" :
			"========= LOADING COMMANDS EVENTS =========";
		console.log(chalk.blue(makeColor));
		const commandError = [];
		let text = "", typeEnvCommand = "", setMap = "";
		if (folderModules == "cmds") {
			text = "command";
			typeEnvCommand = "envCommands";
			setMap = "commands";
		}
		else {
			text = "command event";
			typeEnvCommand = "envEvents";
			setMap = "events";
		}
		const Files = readdirSync(__dirname + "/../scripts/" + folderModules).filter((item) => item.endsWith(".js"));

		for (const file of Files) {
			try {
				const pathCommand = __dirname + `/../scripts/${folderModules}/${file}`;
				const command = require(pathCommand);
				const configCommand = command.config;
				// ——————————————— CHECK SYNTAXERROR ——————————————— //
				if (!configCommand) throw new Error("Config of command undefined");
				if (!command.start) throw new Error(`คำสั่งต้องไม่พลาดฟังก์ชั่น start!`);
				if (!configCommand.name) throw new Error(`ชื่อคำสั่งไม่สามารถเว้นว่างได้!`);
				const commandName = configCommand.name;
				if (globalGoat[setMap].has(commandName)) throw new Error("ชื่อคำสั่งซ้ำกับ Command . อื่น");
				// ——————————————— CHECK SHORT NAME ———————————————— //
				if (configCommand.shortName) {
					let { shortName } = configCommand;
					if (typeof shortName == "string") shortName = [shortName];
					for (const aliases of shortName) {
						if (globalGoat.shortNameCommands.has(aliases)) throw new Error(`Short Name ${aliases} ซ้ำกับชื่อย่อของ command ${chalk.hex("#ff5208")(globalGoat.shortNameCommands.get(aliases))}`);
						else globalGoat.shortNameCommands.set(aliases, configCommand.name);
					}
				}
				// ————————————————— CHECK PACKAGE ————————————————— //
				if (configCommand.packages) {
					const packages = (typeof configCommand.packages == "string") ? configCommand.packages.trim().replace(/\s/g, '').split(',') : configCommand.packages;
					if (!Array.isArray(packages)) throw new Error("Value packages needs to be array");
					for (const i of packages) {
						try {
							require(i);
						}
						catch (err) {
							try {
								loading(`install package ${chalk.hex("#ff5208")(i)}, wating...`, "INSTALL PACKAGE");
								execSync("npm install " + i + " -s");
								loading(`แพ็คเกจที่ติดตั้ง ${chalk.hex("#ff5208")(i)} cho ${text} ${chalk.hex("#FFFF00")(commandName)} ประสบความสำเร็จ\n`, "PACKAGE");
							}
							catch (e) {
								loading.err(`ติดตั้งแพ็คเกจไม่ได้ ${chalk.hex("#ff0000")(i)} cho ${text} ${chalk.hex("#ff0000")(commandName)}\n`, "INSTALL PACKAGE FAILED");
							}
						}
					}
				}
				// ——————————————— CHECK ENV GLOBAL ——————————————— //
				if (configCommand.envGlobal) {
					const { envGlobal } = configCommand;
					if (typeof envGlobal != "object" && Array.isArray(envGlobal)) throw new Error("envGlobal need to be a object");
					if (!configCommands.envGlobal) configCommands.envGlobal = {};
					for (const i in envGlobal) {
						if (!configCommands.envGlobal[i]) configCommands.envGlobal[i] = envGlobal[i];
						else {
							let readCommand = readFileSync(pathCommand).toString();
							readCommand = readCommand.replace(envGlobal[i], configCommands.envGlobal[i]);
							writeFileSync(pathCommand, readCommand);
						}
					}
				}
				// ———————————————— CHECK CONFIG CMD ——————————————— //
				if (configCommand.envConfig && typeof configCommand.envConfig == "object") {
					if (!configCommands[typeEnvCommand]) configCommands[typeEnvCommand] = {};
					if (!configCommands[typeEnvCommand][commandName]) configCommands[typeEnvCommand][commandName] = {};

					for (const [key, value] of Object.entries(configCommand.envConfig)) {
						if (!configCommands[typeEnvCommand][commandName][key]) configCommands[typeEnvCommand][commandName][key] = value;
						else {
							let readCommand = readFileSync(pathCommand).toString();
							readCommand = readCommand.replace(value, configCommands[typeEnvCommand][commandName][key]);
							writeFileSync(pathCommand, readCommand);
						}
					}
				}
				// ——————————————— CHECK RUN ANYTIME ——————————————— //
				if (command.whenChat) globalGoat.whenChat.push(commandName);
				// ————————————— IMPORT TO GLOBALGOAT ————————————— //
				globalGoat[setMap].set(commandName.toLowerCase(), command);
				const color = text == "command" ? "#ff7100" : "#00ff2f";
				loading(`${chalk.hex(color)(`[ ${text.toUpperCase()} ]`)} ${chalk.hex("#FFFF00")(commandName)} succes\n`, "LOADED");
			}
			catch (error) {
				const color = text == "command" ? "#ff7100" : "#00ff2f";
				loading.error(`${chalk.hex(color)(`[ ${text.toUpperCase()} ]`)} ${chalk.hex("#FFFF00")(file)} failed: ${error.message}\n`, "FAILED");
				commandError.push({ name: file, error });
			}
		}
		if (commandError.length > 0) {
			print.err(`ไฟล์ ${chalk.yellow(text)} เกิดข้อผิดพลาดขณะโหลด:`, "LOADED");
			for (const item of commandError) print.err(`${chalk.hex("#ff4112")(item.name)}: ${item.error.stack}`, text.toUpperCase());
		}
	}
};