bot.onText(/^\/start(?:@\w+)?$/, (msg) => {
  bot.sendMessage(msg.chat.id,
    '👋 Добро пожаловать в FakeOffer!\n\n' +
    '🔐 Для открытия доступа FakeOffer оплатите подписку навсегда.\n\n' +
    '💎 Стоимость: 10 Gram\n\n' +
    '📬 Адрес для оплаты:\n' +
    'UQAMZDQPqy0Z-_GYjV8RcBbP89JyGAFcB2NFu2udy_t9rFB6\n\n' +
    'Пользуйтесь на здоровье! ❤️'
  );
});
