import Router from "express";
import dotenv from "dotenv";
import { DateTime } from "luxon";
import User from "./models/User_model.js";
import { sendTelegramMessage } from "./services/telegram.js";
import { getNextReminder } from "./services/notification.js";

dotenv.config();

const router = Router();

router.post("/get-user", (req, res) => {
  const { id } = req.body;
  res.json({ message: `User: ${id}` });
});

router.post("/schedule-notification", async (req, res) => {
  try {
    const { id, hours, minutes, timezone } = req.body;

    if (
      typeof id !== "number" ||
      typeof hours !== "number" ||
      typeof minutes !== "number" ||
      typeof timezone !== "string"
    ) {
      return res.status(400).json({
        message: "Некорректные параметры",
      });
    }

    if (hours < 0 || hours > 23) {
      return res.status(400).json({
        message: "Некорректный час",
      });
    }

    if (minutes < 0 || minutes > 59) {
      return res.status(400).json({
        message: "Некорректные минуты",
      });
    }

    const user = await User.findOne({ id });

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    if (!user.chatId) {
      return res.status(400).json({
        message: "У пользователя нет chatId",
      });
    }

    const nextReminderAt = getNextReminder(hours, minutes, timezone);

    user.notes_time = {
      hours,
      minutes,
    };

    user.timezone = timezone;

    user.next_reminder_at = nextReminderAt;

    user.notifications_enabled = true;

    await user.save();

    return res.json({
      success: true,

      reminder: {
        hours,
        minutes,
        timezone,
      },

      nextReminderAt,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Ошибка сервера",
    });
  }
});

router.post("/disable-notification", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Не указан id пользователя",
      });
    }

    const user = await User.findOne({ id });

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    user.notifications_enabled = false;
    user.next_reminder_at = null;

    await user.save();

    return res.json({
      success: true,
      message: "Уведомления отключены",
    });
  } catch (error) {
    console.error("disable-notification:", error);

    return res.status(500).json({
      success: false,
      message: "Ошибка сервера",
    });
  }
});

router.post("/send-test-notification", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Не указан id пользователя",
      });
    }

    const user = await User.findOne({ id });

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    if (!user.chatId) {
      return res.status(400).json({
        message: "У пользователя отсутствует chatId",
      });
    }

    const telegramResponse = await sendTelegramMessage(
      user.chatId,
      "📖 Тестовое уведомление\n\nПора читать Евангелие дня!",
    );

    return res.json({
      success: true,
      message: "Сообщение отправлено",
      telegram: telegramResponse,
    });
  } catch (error) {
    console.error("send-test-notification:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
