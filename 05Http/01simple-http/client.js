const http = require("node:http");

const agent = new http.Agent({
  keepAlive: true,
});

const request = http.request({
  agent: agent,
  hostname: "localhost",
  port: 8050,
  method: "POST",
  path: "/create-post",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(
      JSON.stringify({ title: "Hello World", content: "This is a test post." })
    ),
  },
});

request.on("response", (response) => {
  console.log("Response Headers:", response.headers);
  console.log("Response Status Code:", response.statusCode);
  response.on("data", (chunk) => {
    console.log("Response body:", chunk.toString("utf-8"));
  });
});

request.write(
  JSON.stringify({ title: "Hello World", content: "This is a test post." })
);
request.end(() => {
  console.log("Request sent successfully.");
});
