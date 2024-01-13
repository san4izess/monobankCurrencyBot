const { Telegraf } = require("telegraf");
const axios = require("axios");
const cc = require("currency-codes");
require("dotenv").config();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply("Welcome to mono currency bot");
});

bot.help((ctx) => {
  ctx.reply(
    "Type the currency code (e.g., USD, EUR) to get the latest exchange rates."
  );
});

bot.hears(/^[A-Z]+$/i, async (ctx) => {
  const clientCurrencyCode = ctx.message.text;
  const currency = cc.code(clientCurrencyCode);
  if (!currency) {
    return ctx.reply(`Currency not found`);
  }
  try {
    if (currency.code === "RUB") {
      return ctx.reply(`Русня сосатб`);
    }

    const currencyObj = await axios.get(
      "https://api.monobank.ua/bank/currency"
    );

    const foundCurrency = currencyObj.data.find((cur) => {
      return cur.currencyCodeA.toString() === currency.number;
    });

    if (!foundCurrency || !foundCurrency.rateBuy || foundCurrency.rateSell) {
      return ctx.reply(`Currency not found in MonoBank API`);
    }

    return ctx.replyWithMarkdown(`
CURRENCY: ${currency.code}
RATE BUY *${foundCurrency.rateBuy}*
RATE SELL *${foundCurrency.rateSell}*
    `);
  } catch (error) {
    console.log(error.message);
    return ctx.reply(`An error occurred: Too many requests`);
  }
});

bot.startPolling();
