import express from "express";
import { Readable } from "stream";

const app = express();
const PORT = 3000;

// CHANGE THIS
const TARGET = "https://azbyka.ru";

app.use(async (req, res) => {
  try {
    const url = new URL(req.originalUrl, TARGET);

    const response = await fetch(url.href, {
      method: req.method,
      headers: {
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
        Accept: "*/*",
        "Accept-Encoding": "identity", // 🔑 avoid compression issues
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
  console.log(`Mobile proxy running on http://localhost:${PORT}`);
});
