
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('Не найден BOT_TOKEN в Secrets GitHub');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const freeUsers = new Set();
const offers = new Map();
let nextId = 1;

function hasAccess(userId) {
  return freeUsers.has(userId);
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
    '👋 Добро пожаловать!\n\n' +
    '🧪 Это тестовый NFT Offer Bot.\n\n' +
    'Команды:\n' +
    '/negative — бесплатный тестовый доступ\n' +
    '/q ссылка цена(stars)\n' +
    '/q ссылка цена(Gram)\n' +
    '/offers — мои тестовые офферы'
  );
});

bot.onText(/\/negative/, (msg) => {
  freeUsers.add(msg.from.id);
  bot.sendMessage(msg.chat.id,
    '✅ Бесплатный тестовый доступ активирован!\n\n' +
    'Теперь можешь создавать демонстрационные офферы.'
  );
});

bot.onText(/\/offers/, (msg) => {
  const userOffers = [...offers.values()]
    .filter(o => o.userId === msg.from.id);

  if (!userOffers.length) {
    return bot.sendMessage(msg.chat.id, 'У тебя пока нет тестовых офферов.');
  }

  const text = userOffers.map(o =>
    `#${o.id} — ${o.amount} ${o.currency}\n${o.url}\nСтатус: ${o.status}`
  ).join('\n\n');

  bot.sendMessage(msg.chat.id, text);
});

bot.onText(/\/q\s+(\S+)\s+(\d+(?:\.\d+)?)\s*\((stars|gram)\)/i,
  (msg, match) => {
    if (!hasAccess(msg.from.id)) {
      return bot.sendMessage(msg.chat.id,
        '🔒 Сначала активируй доступ командой /negative.'
      );
    }

    const url = match[1];
    const amount = Number(match[2]);
    const currency = match[3].toLowerCase() === 'stars' ? 'Stars' : 'Gram';

    if (!/^https?:\/\/\S+/i.test(url) || amount <= 0) {
      return bot.sendMessage(msg.chat.id, 'Проверь ссылку и сумму.');
    }

    const id = nextId++;

    offers.set(id, {
      id,
      userId: msg.from.id,
      url,
      amount,
      currency,
      status: 'Ожидает тестовой проверки'
    });

    bot.sendMessage(msg.chat.id,
      `🧪 ТЕСТОВОЕ NFT-ПРЕДЛОЖЕНИЕ\n\n` +
      `🎁 NFT: ${url}\n` +
      `💰 Сумма: ${amount} ${currency}\n` +
      `🆔 Номер: ${id}\n\n` +
      `⚠️ Это симуляция. Настоящая ставка или покупка не создаётся, средства не переводятся.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 Проверить (тест)', callback_data: `check_${id}` }],
            [{ text: '❌ Закрыть', callback_data: `close_${id}` }]
          ]
        }
      }
    );
  }
);

bot.on('callback_query', (query) => {
  const [action, idText] = query.data.split('_');
  const id = Number(idText);
  const offer = offers.get(id);

  if (!offer || offer.userId !== query.from.id) {
    return bot.answerCallbackQuery(query.id, {
      text: 'Оффер не найден.'
    });
  }

  if (action === 'check') {
    offer.status = 'Тестовая проверка выполнена';
    bot.answerCallbackQuery(query.id, {
      text: 'Тестовая проверка выполнена.'
    });
  }

  if (action === 'close') {
    offer.status = 'Закрыт';
    bot.answerCallbackQuery(query.id, {
      text: 'Тестовый оффер закрыт.'
    });
  }
});

console.log('Test NFT Offer Bot запущен!');
