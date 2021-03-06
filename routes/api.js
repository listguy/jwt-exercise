const { Router } = require("express");
const { INFORMATION, USERS } = require("../helpers");
const { validateToken } = require("../middlewares");

const api = Router();

api.get("/information", validateToken, (req, res) => {
  const { email } = req.user;

  const info = INFORMATION.filter((info) => info.email === email);

  res.json(info);
});

api.get("/users", validateToken, (req, res) => {
  const { isAdmin } = req.user;

  if (!isAdmin) {
    return res.status(401).json({ message: "Invalid Access Token" });
  }
  res.json(USERS);
});

module.exports = api;
