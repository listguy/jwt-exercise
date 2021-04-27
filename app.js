const express = require("express");
const api = require("./routes/api");
const users = require("./routes/users");
const { ACCESS_TOKEN_SECRET } = require("./env");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());

app.use("/api/v1", api);
app.use("/users", users);

app.options("/", (req, res) => {
  const Alloptions = [
    {
      method: "post",
      path: "/users/register",
      description: "Register, Required: email, user, password",
      example: {
        body: { email: "user@email.com", name: "user", password: "password" },
      },
    },
    {
      method: "post",
      path: "/users/login",
      description: "Login, Required: valid email and password",
      example: { body: { email: "user@email.com", password: "password" } },
    },
    {
      method: "post",
      path: "/users/token",
      description: "Renew access token, Required: valid refresh token",
      example: { headers: { token: "*Refresh Token*" } },
    },
    {
      method: "post",
      path: "/users/tokenValidate",
      description: "Access Token Validation, Required: valid access token",
      example: { headers: { authorization: "Bearer *Access Token*" } },
    },
    {
      method: "get",
      path: "/api/v1/information",
      description: "Access user's information, Required: valid access token",
      example: { headers: { authorization: "Bearer *Access Token*" } },
    },
    {
      method: "post",
      path: "/users/logout",
      description: "Logout, Required: access token",
      example: { body: { token: "*Refresh Token*" } },
    },
    {
      method: "get",
      path: "api/v1/users",
      description: "Get users DB, Required: Valid access token of admin user",
      example: { headers: { authorization: "Bearer *Access Token*" } },
    },
  ];
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.slice(7);
  let returnedOptions = [];
  let returnedIndexes = [0, 1];

  if (token) {
    returnedIndexes.push(2);
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, data) => {
      if (err) return;
      returnedIndexes.push(3, 4, 5);
      if (data.isAdmin) returnedIndexes.push(6);
    });
  }
  returnedOptions = Alloptions.filter((op, i) => returnedIndexes.includes(i));

  res.set("Allow", "OPTIONS, GET, POST").json(returnedOptions);
});

module.exports = app;
