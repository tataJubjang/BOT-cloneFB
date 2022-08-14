this.config = {
  name: "dhbc",
  version: "1.0.1",
  author: {
    name: "lnwsck",
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "เกมจับคำ (ตัวอย่าง)",
  longDescription: "เกมจับคำ (ตัวอย่าง)",
  category: "game",
  guide: "{p}{n}"
};

module.exports = {
  config: this.config,
  start: async function({ globalGoat, message, event, download }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const datagame = (await axios.get("https://goatbot.up.railway.app/api/duoihinhbatchu")).data;
    const { wordcomplete, casi, image1, image2 } = datagame.data;
    const pathImage1 = __dirname + "/cache/dhbc1.jpg";
    const pathImage2 = __dirname + "/cache/dhbc2.jpg";
    await download(image1, pathImage1);
    await download(image2, pathImage2);
    message.reply({
      body: `โปรดตอบกลับข้อความนี้พร้อมคำตอบ\n${wordcomplete.replace(/\S/g, "█ ")}${casi ? `\nนี่คือชื่อเพลงของนักร้อง ${casi}` : ''}`,
      attachment: [fs.createReadStream(pathImage1), fs.createReadStream(pathImage2)]
    }, (err, info) => {
      fs.unlinkSync(pathImage1);
      fs.unlinkSync(pathImage2);
      globalGoat.whenReply[info.messageID] = {
        messageID: info.messageID,
        nameCmd: this.config.name,
        author: event.senderID,
        wordcomplete
      };
    });
  },
  whenReply: ({ message, Reply, event, globalGoat }) => {
    let { author, wordcomplete, messageID } = Reply;
    if (event.senderID != author) return message.reply("คุณไม่ใช่ผู้เล่นของคำถามนี้");
    function formatText(text) {
      return text.normalize("NFD")
        .toLowerCase()
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
    }

    (formatText(event.body) == formatText(wordcomplete)) ? message.reply("ยินดีด้วย คุณได้คำตอบที่ถูกต้อง") : message.reply(`อ๊ะ ผิด`);
    //message.reply(`ผิด คำตอบที่ถูกต้องคือ: ${wordcomplete}`);
    delete globalGoat.whenReply[messageID];
  }
};