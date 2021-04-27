const { Router } = require("express");
const { INFORMATION, USERS } = require("../helpers");
const { validateToken } = require("../middlewares");

const api = Router();

api.get("/information", validateToken, (req, res) => {
  const { email } = req.user;

  const info = INFORMATION.find((info) => info.email === email);

  res.json([{ email, info }]);
});

api.get("/users", validateToken, (req, res) => {
  const { isAdmin } = req.user;

  if (!isAdmin) {
    return res.json("Invalid Access Token");
  }
  res.json(USERS);
});

module.exports = api;
