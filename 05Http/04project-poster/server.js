const Butter = require("../03butter-framework/butter");

const SESSIONS = [];

const USERS = [
  { id: 1, name: "Liam Brown", username: "liam23", password: "string" },
  { id: 2, name: "Meredith Green", username: "merit.sky", password: "string" },
  { id: 3, name: "Ben Adams", username: "ben.poet", password: "string" },
];

const POSTS = [
  {
    id: 1,
    title: "This is a post title",
    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Molestias tenetur iure, hic recusandae libero error dicta necessitatibus, ipsam assumenda consequatur quo. Vitae corrupti suscipit ullam fugiat ut magni blanditiis doloribus.",
    userId: 1,
  },
];

const server = new Butter();

const port = 8000;

//--------------Middlewares----------//

//To Authenticate
server.beforeEach((req, res, next) => {
  const routesToAuthenticate = [
    "GET /api/user",
    "PUT /api/user",
    "POST /api/posts",
    "DELETE /api/logout",
  ];

  if (routesToAuthenticate.indexOf(req.method + " " + req.url) !== -1) {
    if (!req.headers.cookie) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = req.headers.cookie.split("=")[1];

    const session = SESSIONS.find((session) => session.token === token);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.userId = session.userId;
    return next();
  }

  next();
});

// For parsing JSON body
server.beforeEach((req, res, next) => {
  let bodyData = "";
  req.on("data", (chunk) => {
    bodyData = chunk.toString();
  });

  req.on("end", () => {
    if (bodyData) {
      const contentType = req.headers["content-type"];

      try {
        if (contentType?.includes("application/json")) {
          req.body = JSON.parse(bodyData);
        } else {
          req.body = bodyData;
        }
      } catch (e) {
        req.body = null;
      }
    }

    next();
  });
});

// For different routes that need the index.html file
server.beforeEach((req, res, next) => {
  const routes = ["/", "/login", "/profile", "/new-post"];

  if (routes.indexOf(req.url) !== -1 && req.method === "GET") {
    return res.status(200).sendFile("./public/index.html", "text/html");
  } else {
    next();
  }
});

//--------------Files Routes----------//

//Server Main CSS
server.route("GET", "/styles.css", (req, res) => {
  res.sendFile("./public/styles.css", "text/css");
});

//Serves Main JS
server.route("GET", "/scripts.js", (req, res) => {
  res.sendFile("./public/scripts.js", "text/javascript");
});

//--------------JSON Routes------------//

//To Get All Posts
server.route("GET", "/api/posts", (req, res) => {
  res.status(200).json(
    POSTS.map((post) => ({
      ...post,
      author: USERS.find((user) => user.id === post.userId).name,
    }))
  );
});

//To Login
server.route("POST", "/api/login", (req, res) => {
  const { username, password } = req.body;

  const foundUser = USERS.find((user) => user.username === username);

  if (!foundUser || foundUser.password !== password) {
    return res.status(401).json({ error: "Invalid Credentials" });
  }

  const token = Math.floor(Math.random() * 10000000000).toString();

  const existSession = SESSIONS.find(
    (session) => session.userId === foundUser.id
  );

  if (existSession) {
    existSession.token = token;
  } else {
    SESSIONS.push({
      userId: foundUser.id,
      token,
    });
  }

  res.setHeader("Set-Cookie", `token=${token}; Path=/;`);

  return res.status(200).json({
    message: "Logged In Successfully!",
  });
});

//To fetch User Info
server.route("GET", "/api/user", (req, res) => {
  const user = USERS.find((user) => user.id === req.userId);
  return res.json({ username: user.username, name: user.name });
});

// Log a user out
server.route("delete", "/api/logout", (req, res) => {
  const sessionIndex = SESSIONS.findIndex(
    (session) => session.userId === req.userId
  );

  if (sessionIndex > -1) {
    SESSIONS.splice(sessionIndex, 1);
  }

  res.setHeader(
    "Set-Cookie",
    `token=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );

  return res.status(200).json({ message: "Logged out successfully!" });
});

// Update a user info
server.route("put", "/api/user", (req, res) => {
  const { username, name, password } = req.body;

  const user = USERS.find((user) => user.id === req.userId);

  user.username = username;
  user.name = name;

  if (password) {
    user.password = password;
  }

  res.status(200).json({
    username: user.username,
    name: user.name,
    password_status: password ? "updated" : "not updated",
  });
});

// Create a new post
server.route("post", "/api/posts", (req, res) => {
  const { title, body } = req.body;

  const post = {
    id: POSTS.length + 1,
    title: title,
    body: body,
    userId: req.userId,
  };

  POSTS.unshift(post);
  res.status(201).json(post);
});

server.listen(port, () => {
  console.log(`Server is up and running on http://localhost:${port}`);
});
