const http = require("node:http");
const fs = require("node:fs/promises");

class Butter {
  #routes = {};
  #middlewares = [];
  constructor() {
    this.server = http.createServer();
    this.#mountRequestListener();
  }

  #mountRequestListener() {
    this.server.on("request", (req, res) => {
      //Handling Methods Mount On Response
      this.#mountResponseMethods(res);

      //Handling beforeEach middlewares callbacks
      let i = 0;

      const next = () => {
        const cb = this.#middlewares[i++];
        if (cb) {
          cb(req, res, next);
        } else {
          //Handling route not found
          const uniqueKey = req.method + req.url;

          if (!this.#routes[uniqueKey]) {
            res.setHeader("Content-Type", "application/json");

            return res
              .status(404)
              .json({ error: `Cannot ${req.method} ${req.url}` });
          }
          //Running callback handler
          this.#routes[uniqueKey](req, res);
        }
      };

      next();
    });
  }

  #mountResponseMethods(res) {
    //Attaching status method on res
    res.status = function (statusCode) {
      res.statusCode = statusCode;
      return res;
    };

    //Attaching sendFile method on res
    res.sendFile = async function (filePath, contentType) {
      const fileHandler = await fs.open(filePath, "r");
      const readStream = fileHandler.createReadStream();

      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }

      readStream.pipe(res);

      readStream.on("end", () => {
        res.end();
      });
    };

    //Attaching json method on res
    res.json = function (json) {
      res.setHeader("Content-Type", "application/json");

      res.end(JSON.stringify(json));
    };
  }

  listen(port, callback) {
    this.server.listen(port, callback);
  }

  route(method, path, cb) {
    const upperCaseMethod = method.toUpperCase();
    const uniqueKey = upperCaseMethod + path;

    this.#routes[uniqueKey] = cb;
  }

  beforeEach(cb) {
    this.#middlewares.push(cb);
  }
}

module.exports = Butter;
