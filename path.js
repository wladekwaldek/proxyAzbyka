import Router from "express";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const VERSION = process.env.VERSION;
const APK_URL = process.env.APK_URL;

router.get("/app-version", (req, res) => {
  res.json({ latestVersion: VERSION, apkUrl: APK_URL });
});

router.post("/get-user", (req, res) => {
  const { id } = req.body;
  res.json({ message: `User: ${id}` });
});

export default router;
