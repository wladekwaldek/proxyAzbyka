import express from "express";
import { Readable } from "stream";

const app = express();
const PORT = 3000;

app.use(async (req, res) => {
  try {
    const BASE_URL = "https://azbyka.ru";
    const targetUrl = BASE_URL + req.originalUrl;

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        // ❌ DO NOT request compressed content
        "Accept-Encoding": "identity",
      },
    });

    res.status(response.status);

    // Copy headers EXCEPT content-encoding & content-length
    response.headers.forEach((value, key) => {
      if (
        key.toLowerCase() !== "content-encoding" &&
        key.toLowerCase() !== "content-length"
      ) {
        res.setHeader(key, value);
      }
    });

    if (!response.body) {
      return res.end();
    }

    // Stream safely
    Readable.fromWeb(response.body).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error");
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running at http://localhost:${PORT}`);
});
