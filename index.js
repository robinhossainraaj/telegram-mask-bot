const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {
  polling: true
});

const userUrls = {};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🔗 Send:\n/saveurl https://example.com"
  );
});

bot.onText(/\/saveurl (.+)/, (msg, match) => {
  const url = match[1];

  userUrls[msg.chat.id] = url;

  const buttons = {
    inline_keyboard: [
      [
        {
          text: "YouTube",
          callback_data: "youtube"
        },
        {
          text: "Google",
          callback_data: "google"
        }
      ],
      [
        {
          text: "Facebook",
          callback_data: "facebook"
        },
        {
          text: "Instagram",
          callback_data: "instagram"
        }
      ]
    ]
  };

  bot.sendMessage(
    msg.chat.id,
    "🌐 Choose fake domain",
    {
      reply_markup: buttons
    }
  );
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;

  const domains = {
    youtube: "www.youtube.com",
    google: "www.google.com",
    facebook: "www.facebook.com",
    instagram: "www.instagram.com"
  };

  const fakeDomain =
    domains[query.data];

  const originalUrl =
    userUrls[chatId];

  if (!originalUrl) {
    bot.sendMessage(
      chatId,
      "❌ URL missing"
    );
    return;
  }

  try {
    const response =
      await axios.get(
        "https://tinyurl.com/api-create.php?url=" +
        encodeURIComponent(originalUrl)
      );

    const shortUrl =
      response.data;

    const clean =
      shortUrl
        .replace("https://", "")
        .replace("http://", "");

    const masked =
      "https://" +
      fakeDomain +
      "@" +
      clean;

    bot.sendMessage(
      chatId,
      "✅ Masked URL:\n\n" +
      masked
    );
  } catch (e) {
    bot.sendMessage(
      chatId,
      "❌ Error shortening URL"
    );
  }
});