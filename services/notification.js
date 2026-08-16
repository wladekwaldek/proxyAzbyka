import { DateTime } from "luxon";
import User from "../models/User_model.js";
import { sendTelegramMessage } from "./telegram.js";

export function getNextReminder(hours, minutes, timezone) {
  const now = DateTime.now().setZone(timezone);

  let reminder = now.set({
    hour: hours,
    minute: minutes,
    second: 0,
    millisecond: 0,
  });

  if (reminder <= now) {
    reminder = reminder.plus({ days: 1 });
  }

  return reminder.toUTC().toJSDate();
}

export async function getQuoteOfDay() {
  const response = await fetch(
    `${process.env.BASE_URL}/wp-json/az/v1/bquote-of-day`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.json();
  return data.quote ?? data["quote"] ?? "Не удалось загрузить отрывок.";
}

export async function processNotifications() {
  const now = new Date();

  const users = await User.find({
    chatId: { $exists: true, $ne: null },
    notifications_enabled: true,
    next_reminder_at: {
      $lte: now,
    },
  });

  console.log(`Найдено уведомлений: ${users.length}`);

  const quote = await getQuoteOfDay();

  for (const user of users) {
    try {
      await sendTelegramMessage(
        user.chatId,
        `📖 Пора читать Евангелие дня!\n\n${quote}`,
      );

      user.next_reminder_at = getNextReminder(
        user.notes_time.hours,
        user.notes_time.minutes,
        user.timezone,
      );

      await user.save();

      console.log(`Отправлено пользователю ${user.id}`);
    } catch (error) {
      console.error(`Ошибка пользователя ${user.id}:`, error);
    }
  }
}
