import express from "express";
import { Readable } from "stream";
import dotenv from "dotenv";
import cors from "cors";
import TelegramApi from "node-telegram-bot-api";
import router from "./path.js";
import mongoose from "mongoose";
import User from "./models/User_model.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;
const TARGET = process.env.BASE_URL;
const DOMEN = process.env.DOMEN;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MONGO_URI = process.env.MONGO_URI;
const WELCOME_SPEECH = process.env.WELCOME_SPEECH;

const DOMEN_DEV = process.env.DOMEN_DEV;
const DOMEN_LOC = process.env.DOMEN_LOC;

app.use(express.json());
app.use(cors({ origin: [DOMEN_LOC, DOMEN_DEV], credentials: true }));

app.use("/api", router);

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

async function start() {
  try {
    await mongoose.connect(MONGO_URI);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`server run on port ${PORT}`);
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
}

start();

if (TOKEN) {
  const bot = new TelegramApi(TOKEN, { polling: true });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const date = msg.date;
    const { id, is_bot, first_name, username, language_cod } = msg.from;
    if (msg.text && msg.text.trim() !== "") {
      switch (msg.text) {
        case "/start":
          const condidate = await User.findOne({ id });

          if (condidate) {
            bot.sendMessage(chatId, `hi ${condidate.name}`);
          } else {
            const user = new User({
              id,
              name: first_name,
              username,
              language: language_cod,
              is_bot,
              time: new Date(date * 1000),
              notes_time: {
                houres: null,
                minutes: null,
              },
              last_login: new Date(date * 1000),
            });

            await user.save();

            bot.sendMessage(
              chatId,
              `Привет ${first_name}.\n ${WELCOME_SPEECH}
              `,
            );
          }
          break;

        case "/help":
          bot.sendMessage(chatId, "Вот список доступных команд...");
          break;

        default:
          if (msg.text.startsWith("/")) {
            bot.sendMessage(chatId, "Неизвестная команда.");
          } else {
            bot.sendMessage(chatId, "Я пока не понимаю такие сообщения.");
          }
      }
    } else {
      bot.sendMessage(chatId, "Oops, something went wrong. Please try again.");
    }
  });
}
