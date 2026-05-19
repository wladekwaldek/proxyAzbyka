import express from "express";
import { Readable } from "stream";
import dotenv from "dotenv";
import cors from "cors";
import TelegramApi from "node-telegram-bot-api";

dotenv.config();

const app = express();

const PORT = process.env.PORT;
const TARGET = process.env.BASE_URL;
const VERSION = process.env.VERSION;
const APK_URL = process.env.APK_URL;
const DOMEN = process.env.DOMEN;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

app.use(express.json());
app.use(cors({ origin: DOMEN, credentials: true }));

app.get("/app-version", (req, res) => {
  res.json({ latestVersion: VERSION, apkUrl: APK_URL });
});

app.use(async (req, res) => {
  try {
    const url = new URL(req.originalUrl, TARGET);

    const response = await fetch(url.href, {
      method: req.method,
      headers: {
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
        Accept: "*/*",
        "Accept-Encoding": "identity",
      },
    });

    res.status(response.status);

    response.headers.forEach((value, key) => {
      if (!["content-encoding", "content-length"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    if (!response.body) {
      return res.end();
    }

    Readable.fromWeb(response.body).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error");
  }
});

app.listen(PORT, () => {
  console.log(
    `Mobile proxy running on http://localhost:${PORT}\nVersion: ${VERSION}\nAPK URL: ${APK_URL}`,
  );
});

if (TOKEN) {
  const bot = new TelegramApi(TOKEN, { polling: true });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const date = msg.date;
    const { id, is_bot, first_name, username, language_cod } = msg.from;
    if (msg.text && msg.text.trim() !== "") {
      switch (msg.text) {
        case "/start":
          await bot.sendMessage(
            chatId,
            `Привет, ${first_name}! Я прокси-сервер для мобильного приложения Азбука Веры. Я могу помочь тебе получить последнюю версию приложения и ответить на твои вопросы. Просто напиши мне!`,
          );
          break;
        case "/version":
          await bot.sendMessage(
            chatId,
            `Последняя версия приложения: ${VERSION}\nСсылка для скачивания: ${APK_URL}`,
          );
          break;
        default:
          await bot.sendMessage(
            chatId,
            `Извини, я не понимаю эту команду. Попробуй /start или /version.`,
          );
      }
    }
  });
}
