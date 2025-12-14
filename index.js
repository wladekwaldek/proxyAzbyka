import express from "express";

const app = express();
const PORT = 3000;

app.get("/", async (req, res) => {
  const targetUrl = "https://azbyka.ru";

  try {
    const response = await fetch(targetUrl);
    const html = await response.text();

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    res.status(500).send("Error fetching the site");
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on ${PORT}`);
});
