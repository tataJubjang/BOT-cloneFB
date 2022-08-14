this.config = {
	name: "ytb",
	version: "1.0.2",
	author: {
		name: "NTKhang",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "YouTube",
	longDescription: "ดาวน์โหลดข้อมูลวิดีโอ เสียง หรือดูวิดีโอบน YouTube",
	category: "media",
	guide: "{p}{n} [video|-v] [<ชื่อวิดีโอ>|<ลิงก์วิดีโอ>]: ใช้สำหรับดาวน์โหลดวิดีโอจาก youtube."
		+ "\n{p}{n} [audio|-a] [<ชื่อวิดีโอ>|<ลิงก์วิดีโอ>]: ใช้เพื่อดาวน์โหลดไฟล์เสียงจาก youtube"
		+ "\n{p}{n} [info|-i] [<ชื่อวิดีโอ>|<ลิงก์วิดีโอ>]: ใช้เพื่อดูข้อมูลวิดีโอจาก youtube"
		+ "\nตัวอย่างเช่น:"
		+ "\n  {p}{n} -v น้องฝน"
		+ "\n  {p}{n} -a น้องฝน"
		+ "\n  {p}{n} -i น้องฝน",
	packages: "ytdl-core",
	envGlobal: {
		youtube: "AIzaSyBZjYk2QtAvsZjAzUJ5o4qGl8eRl6gr2SA"
	}
};

module.exports = {
	config: this.config,
	start: async function ({ api, globalGoat, args, download, message, event }) {
		const axios = require("axios");
		const ytdl = require("ytdl-core");
		const { createReadStream, unlinkSync } = require("fs-extra");
		const API_KEY = globalGoat.configCommands.envGlobal.youtube;
		let type;
		if (["video", "-v"].includes(args[0])) type = "video";
		else if (["audio", "-a", "sing", "-s"].includes(args[0])) type = "audio";
		else if (["info", "-i"].includes(args[0])) type = "info";
		else return message.SyntaxError();

		const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
		const urlYtb = checkurl.test(args[1]);

		if (urlYtb) {
			const infoVideo = await ytdl.getInfo(args[1]);
			const idvideo = infoVideo.videoDetails.videoId;
			await handle({ type, infoVideo, idvideo, message, api, event, download });
			return;
		}

		const search = args.slice(1).join(" ");
		const maxResults = 6;
		const url = encodeURI(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&part=snippet&q=${search}&maxResults=${maxResults}&type=video`);
		let result;
		try {
			result = (await axios.get(url)).data;
		}
		catch (err) {
			return message.reply("ผิดพลาด! เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง: " + err.response.data.error.message);
		}
		result = result.items;
		if (result.length == 0) return message.reply("ไม่มีผลการค้นหาที่ตรงกับคำหลักของคุณ " + search);
		let msg = "";
		let i = 1;
		const thumbnails = [];
		const arrayID = [];

		for (let info of result) {
			const idvideo = info.id.videoId;
			const infoWithApi = (await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${idvideo}&key=${API_KEY}`)).data.items[0];
			const time = infoWithApi.contentDetails.duration.slice(2).toLowerCase();
			const listthumbnails = Object.values(infoWithApi.snippet.thumbnails);
			const linkthumbnails = listthumbnails[listthumbnails.length - 1].url;
			const streamThumbnail = (await axios.get(linkthumbnails, {
				responseType: "stream"
			})).data;
			thumbnails.push(streamThumbnail);
			arrayID.push(idvideo);

			msg += `${i++}. ${info.snippet.title}\nTime: ${time}\n\n`;
		}

		message.reply({
			body: msg + "ตอบกลับข้อความพร้อมหมายเลขให้เลือกหรือเนื้อหาใด ๆ ที่จะลบ",
			attachment: thumbnails
		}, (err, info) => {
			globalGoat.whenReply[info.messageID] = {
				messageID: info.messageID,
				author: event.senderID,
				nameCmd: require(__filename).config.name,
				arrayID,
				result,
				type
			};
		});
	},

	whenReply: async ({ event, api, Reply, download, message }) => {
		const ytdl = require("ytdl-core");
		const { result, type } = Reply;
		const choice = event.body;
		if (!isNaN(choice) && choice <= 6) {
			const infochoice = result[choice - 1];
			const idvideo = infochoice.id.videoId;
			const infoVideo = await ytdl.getInfo(idvideo);
			api.unsendMessage(Reply.messageID);
			await handle({ type, infoVideo, idvideo, message, api, event, download });
		}
		else api.unsendMessage(Reply.messageID);
	}
};

async function handle({ type, infoVideo, idvideo, api, event, download, message }) {
	const { createReadStream, createWriteStream, unlinkSync } = require("fs-extra");
	const ytdl = require("ytdl-core");
	const axios = require("axios");
	if (type == "video") {
		const idvideo = infoVideo.videoDetails.videoId;
		const path_video = __dirname + `/cache/${idvideo}.mp4`;
		const getFormat = infoVideo.formats.filter(i => i.mimeType.includes("video/mp4") && i.mimeType.includes("mp4a")).sort((a, b) => parseInt(b.contentLength) - parseInt(a.contentLength));
		if (getFormat.contentLength > 26214400) return api.sendMessage('ส่งวิดีโอนี้ไม่ได้เพราะใหญ่กว่า 25MB.', event.threadID, event.messageID);
		message.reply("กำลังดาวน์โหลด " + infoVideo.videoDetails.title);

		ytdl(idvideo)
			.pipe(createWriteStream(path_video))
			.on("close", () => {
				return message.reply({
					body: infoVideo.videoDetails.title,
					attachment: createReadStream(path_video)
				}, () => unlinkSync(path_video));
			})
			.on("error", (error) => message.reply(`เกิดข้อผิดพลาดขณะดาวน์โหลดวิดีโอ\n${error.stack}`));
	}
	else if (type == "audio") {
		const audio = infoVideo.formats.find(item => item.mimeType.indexOf("audio/webm") != -1);
		if (audio.contentLength > 26214400) return api.sendMessage('ส่งไฟล์เสียงนี้ไม่ได้เพราะใหญ่กว่า 25MB.', event.threadID, event.messageID);
		const linkaudio = audio.url;
		const path_audio = `${__dirname}/cache/${idvideo}.mp3`;
		await download(linkaudio, path_audio);
		return api.sendMessage({
			body: infoVideo.videoDetails.title,
			attachment: createReadStream(path_audio)
		}, event.threadID, () => unlinkSync(path_audio), event.messageID);
	}
	else if (type == "info") {
		const info = infoVideo.videoDetails;
		const { title, lengthSeconds, viewCount, videoId, uploadDate, likes, dislikes } = infoVideo.videoDetails;

		let msg = "";
		const hours = Math.floor(lengthSeconds / 3600);
		const minutes = Math.floor(lengthSeconds % 3600 / 60);
		const seconds = Math.floor(lengthSeconds % 3600 % 60);
		msg += "💠ชื่อ: " + title + "\n";
		msg += "🏪Channel: " + info.author.name + "\n";
		if (info.author.subscriber_count) msg += "👨‍👩‍👧‍👦Subscriber: " + info.author.subscriber_count + "\n";
		msg += `⏱เวลาวิดีโอ: ${hours}:${minutes}:${seconds}\n`;
		msg += "👀ดู: " + viewCount + "\n";
		msg += "👍ชอบ: " + likes + "\n";
		msg += "👎ไม่ชอบ: " + dislikes + "\n";
		msg += "🆙วันที่อัพโหลด: " + uploadDate + "\n";
		msg += "#️⃣ID: " + videoId + "\n";
		const paththumnailsChanel = __dirname + "/cache/thumbnailsChanel.jpg";
		const paththumnailsVideo = __dirname + "/" + info.videoId + ".jpg";
		await download(info.author.thumbnails[info.author.thumbnails.length - 1].url, paththumnailsChanel);
		await download(info.thumbnails[info.thumbnails.length - 1].url, paththumnailsVideo);
		const arrayThumnails = [];
		arrayThumnails.push(createReadStream(paththumnailsChanel));
		arrayThumnails.push(createReadStream(paththumnailsVideo));
		message.reply({
			body: msg,
			attachment: arrayThumnails
		}, () => {
			unlinkSync(paththumnailsChanel);
			unlinkSync(paththumnailsVideo);
		});
	}
}