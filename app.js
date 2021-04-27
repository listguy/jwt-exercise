const express = require("express");
const api = require("./routes/api");
const users = require("./routes/users");

const app = express();

app.use(express.json());

app.use("/api/v1", api);
app.use("/users", users);

module.exports = app;
