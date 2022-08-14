this.config = {
	name: "all",
	version: "1.0.0",
	author: {
		name: "lnwSCK",
		contacts: ""
	},
	cooldowns: 5,
	role: 1,
	shortDescription: "tag all",
	longDescription: "แท็กสมาชิกในกลุ่มทั้งหมด",
	category: "box chat",
	guide: "{prefix}{name} [เว้นว่างไว้|เนื้อหา]"
};

module.exports = {
	config: this.config,
	start: async function ({ args, threadsData, message, event }) {
		const alluser = Object.keys((await threadsData.getData(event.threadID)).members);
		const lengthAllUser = alluser.length;
		const mentions = [];
		let body = args.join(" ") || "@all";
		let lengthbody = body.length;
		let i = 0;
		for (const uid of alluser) {
			let fromIndex = 0;
			if (lengthbody < lengthAllUser) {
				body += body[lengthbody - 1];
				lengthbody++;
			}
			if (body.slice(0, i).lastIndexOf(body[i]) != -1) fromIndex = i;
			mentions.push({ tag: body[i], id: uid, fromIndex });
			i++;
		}
		message.reply({ body, mentions });
	}
};