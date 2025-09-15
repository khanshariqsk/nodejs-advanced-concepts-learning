const cpeak = require("cpeak");

const server = new cpeak();

server.route("get", "/", (req, res) => {
  res.json({ message: "This is some text." });
});

const PORT = 5090;

server.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
