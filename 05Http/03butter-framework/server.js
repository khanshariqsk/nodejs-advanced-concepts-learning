const Butter = require("./butter");
const server = new Butter();
const PORT = 3000;

server.route("GET", "/", (req, res) => {
  res.sendFile("./../02simple-web/public/index.html", "text/html");
});

server.route("GET", "/style.css", (req, res) => {
  res.sendFile("./../02simple-web/public/style.css", "text/css");
});

server.route("GET", "/script.js", (req, res) => {
  res.sendFile("./../02simple-web/public/script.js", "text/javascript");
});

server.route("GET", "/echo", (req, res) => {
  res.json({ message: "Hello From Server" });
});

server.listen(PORT, () => {
  console.log(`Butter server is running on port ${PORT}`);
});
