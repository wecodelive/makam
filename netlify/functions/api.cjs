const app = require("../../server/app.cjs");

exports.handler = async (event, context) => {
  try {
    const method = event.httpMethod || "GET";
    const path = event.path || "/";
    const query = event.queryStringParameters || {};
    const headers = event.headers || {};
    let body = event.body || "";

    // Build URL
    const queryStr = new URLSearchParams(query).toString();
    const url = path + (queryStr ? "?" + queryStr : "");

    // Parse request body if present
    if (body && event.isBase64Encoded) {
      body = Buffer.from(body, "base64").toString("utf-8");
    }

    // Collect response
    const responseHeaders = {};
    let statusCode = 200;
    const chunks = [];

    // Create minimal request/response objects compatible with Express
    const req = {
      method,
      url,
      path,
      headers,
      query,
      body,
    };

    const res = {
      statusCode: 200,
      _headers: {},
      
      writeHead(code, hdrs) {
        statusCode = code;
        if (hdrs) Object.assign(this._headers, hdrs);
        return this;
      },
      setHeader(name, value) {
        this._headers[name] = value;
        return this;
      },
      getHeader(name) {
        return this._headers[name];
      },
      getHeaders() {
        return this._headers;
      },
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        this.setHeader("Content-Type", "application/json");
        chunks.push(JSON.stringify(data));
        return this;
      },
      send(data) {
        chunks.push(typeof data === "string" ? data : JSON.stringify(data));
        return this;
      },
      sendStatus(code) {
        statusCode = code;
        return this;
      },
      end(data) {
        if (data) {
          chunks.push(typeof data === "string" ? data : JSON.stringify(data));
        }
      },
    };

    // Call Express app with raw handler
    return new Promise((resolve, reject) => {
      // Inject response helpers to resolve promise
      const originalJson = res.json;
      const originalSend = res.send;
      const originalSendStatus = res.sendStatus;
      const originalEnd = res.end;

      res.json = function (data) {
        originalJson.call(this, data);
        resolve({
          statusCode: statusCode || 200,
          headers: this._headers,
          body: chunks.join(""),
        });
        return this;
      };

      res.send = function (data) {
        originalSend.call(this, data);
        resolve({
          statusCode: statusCode || 200,
          headers: this._headers,
          body: chunks.join(""),
        });
        return this;
      };

      res.sendStatus = function (code) {
        originalSendStatus.call(this, code);
        resolve({
          statusCode: code || 200,
          headers: this._headers,
          body: "",
        });
        return this;
      };

      res.end = function (data) {
        originalEnd.call(this, data);
        resolve({
          statusCode: statusCode || 200,
          headers: this._headers,
          body: chunks.join(""),
        });
      };

      try {
        // Direct call to Express app
        app(req, res);
      } catch (err) {
        console.error("Handler error:", err);
        resolve({
          statusCode: 500,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ success: false, error: err.message }),
        });
      }
    });
  } catch (err) {
    console.error("Outer error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
