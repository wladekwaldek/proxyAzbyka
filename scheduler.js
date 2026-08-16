import cron from "node-cron";
import { processNotifications } from "./services/notification.js";

cron.schedule("* * * * *", async () => {
  console.log("Проверка уведомлений...");

  try {
    await processNotifications();
  } catch (error) {
    console.error("Ошибка scheduler:", error);
  }
});
