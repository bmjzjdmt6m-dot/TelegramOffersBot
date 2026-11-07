const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;

if (!TOKEN) {

  throw new Error("Не указан BOT_TOKEN");

}

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {

  bot.sendMessage(msg.chat.id,

    "🎁 NFT FAKE OFFER MARKET\n\n" +

    "Добро пожаловать!\n\n" +

    "Здесь можно создавать демонстрационные NFT-офферы.",

    {

      reply_markup: {

        keyboard: [

          ["➕ Создать оффер"],

          ["📋 Мои офферы"]

        ],

        resize_keyboard: true

      }

    }

  );

});

const offers = {};

bot.on("message", (msg) => {

  const chatId = msg.chat.id;

  const text = msg.text;

  if (!text || text.startsWith("/")) return;

  if (text === "➕ Создать оффер") {

    offers[chatId] = { step: "nft" };

    return bot.sendMessage(chatId, "🎁 Введи название NFT:");

  }

  if (text === "📋 Мои офферы") {

    const offer = offers[chatId];

    if (!offer || !offer.name) {

      return bot.sendMessage(chatId, "У тебя пока нет офферов.");

    }

    return bot.sendMessage(

      chatId,

      `🎁 NFT: ${offer.name}\n💎 Сумма: ${offer.amount} TON\n🧪 Статус: ДЕМО`

    );

  }

  const offer = offers[chatId];

  if (!offer) return;

  if (offer.step === "nft") {

    offer.name = text;

    offer.step = "amount";

    return bot.sendMessage(chatId, "💎 Введи сумму оффера в TON:");

  }

  if (offer.step === "amount") {

    const amount = Number(text);

    if (!Number.isFinite(amount) || amount <= 0) {

      return bot.sendMessage(chatId, "Введи корректную сумму.");

    }

    offer.amount = amount;

    offer.step = "done";

    return bot.sendMessage(

      chatId,

      `🎁 NFT: ${offer.name}\n` +

      `💎 Предложение: ${amount} TON\n` +

      `🧪 ДЕМО — платежа не было.`,

      {

        reply_markup: {

          inline_keyboard: [

            [{ text: "✅ Принять (демо)", callback_data: "accept" }],

            [{ text: "❌ Отклонить", callback_data: "decline" }]

          ]

        }

      }

    );

  }

});

bot.on("callback_query", async (query) => {

  const message = query.message;

  const answer = query.data === "accept"

    ? "✅ Демо-оффер принят!"

    : "❌ Демо-оффер отклонён.";

  await bot.answerCallbackQuery(query.id, {

    text: answer

  });

  await bot.sendMessage(message.chat.id, answer);

});

console.log("NFT Demo Offer Bot started!");