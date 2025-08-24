const http = require("node:http");
const fs = require("node:fs/promises");
const server = http.createServer();

server.on("request", async (request, response) => {
  if (
    (request.url === "/" || request.url === "/index.html") &&
    request.method === "GET"
  ) {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html");
    const htmlFileHandler = await fs.open("./public/index.html", "r");
    const htmlStream = htmlFileHandler.createReadStream();
    htmlStream.pipe(response);
  } else if (request.url === "/style.css" && request.method === "GET") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/css");
    const cssFileHandler = await fs.open("./public/style.css", "r");
    const cssStream = cssFileHandler.createReadStream();
    cssStream.pipe(response);
  } else if (request.url === "/script.js" && request.method === "GET") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/javascript");
    const jsFileHandler = await fs.open("./public/script.js", "r");
    const jsStream = jsFileHandler.createReadStream();
    jsStream.pipe(response);
  } else if (request.url === "/login" && request.method === "POST") {
    let body = {
      message: "Login successful",
    };

    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(body));
  } else if (request.url === "/user" && request.method === "PUT") {
    let body = {
      message: "You first have to login",
    };

    response.statusCode = 401;
    response.setHeader("Content-Type", "application/json");

    response.end(JSON.stringify(body));
  } else if (request.url === "/upload" && request.method === "PUT   ") {
    let body = {
      message: "File uploaded successfully",
    };

    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json");

    const writeFileHandler = await fs.open("./storage/image.jpeg", "w");

    const writeStream = writeFileHandler.createWriteStream();
    request.pipe(writeStream);

    request.on("end", () => {
      response.end(JSON.stringify(body));
    });
  } else {
    response.statusCode = 404;
    response.setHeader("Content-Type", "text/plain");
    response.end("404 Not Found");
  }
});

const port = 9000;
const host = "localhost";

server.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
});
