const { hashSync, compare } = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Router } = require("express");
const { USERS, INFORMATION, REFRESHTOKENS } = require("../helpers");
const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } = require("../env");
const { validateToken } = require("../middlewares");

const users = Router();

users.post("/register", (req, res) => {
  const { email, name, password } = req.body;

  // Check if user exists
  const checkUser = USERS.find((user) => email === user.email);

  // If user exists, send appropriate response
  if (checkUser) {
    return res.status(409).send("user already exists");
  }

  // If user does not exist, create it:
  // Hash password
  const hashedPassword = hashSync(password, 10);

  // Adding user to 'DB'
  USERS.push({
    email,
    name,
    password: hashedPassword,
    isAdmin: false,
  });

  // Adding information to 'DB'
  INFORMATION.push({
    email,
    info: `${name} info`,
  });

  res.status(201).send("Register Success");
});

users.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = USERS.find((entry) => entry.email === email);

  if (!user) {
    return res.status(404).send("cannot find user");
  }

  try {
    const isPasswordCorrect = await compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(403).send("User or Password incorrect");
    }

    const dataInToken = {
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const refreshToken = jwt.sign(dataInToken, REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign(dataInToken, ACCESS_TOKEN_SECRET, {
      expiresIn: "10s",
    });

    REFRESHTOKENS.push(refreshToken);

    res.json({
      accessToken,
      refreshToken,
      ...dataInToken,
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

users.post("/tokenValidate", validateToken, (req, res) => {
  res.json({ valid: true });
});

users.post("/token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).send("Refresh Token Required");
  }

  if (!REFRESHTOKENS.includes(token)) {
    return res.status(403).send("Invalid Refresh Token");
  }

  jwt.verify(token, REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send("Invalid Refresh Token");
    }
    const accessToken = jwt.sign(decoded, ACCESS_TOKEN_SECRET, {
      expiresIn: "10s",
    });

    return res.json({ accessToken });
  });
});

users.post("/logout", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).send("Refresh Token Required");
  }

  const refreshTokenIndex = REFRESHTOKENS.findIndex(
    (rToken) => rToken === token
  );

  if (refreshTokenIndex === -1) {
    return res.status(400).send("Invalid Refresh Token");
  }

  REFRESHTOKENS.splice(refreshTokenIndex, 1);

  return res.send("User Logged Out Successfully");
});

module.exports = users;
