const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const User = require("../models/user-model");
const usersCtrl = {};

// Handle user registration
usersCtrl.register = async function (req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password } = _.pick(req.body, [
      "username",
      "email",
      "password",
    ]);
    const salt = await bcryptjs.genSalt();
    const hashedPassword = await bcryptjs.hash(password, salt);

    const user = new User({ username, email, password: hashedPassword });
    const userDoc = await user.save();

    res.json({ success: true, data: userDoc });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while registering the user.",
    });
  }
};

// Handle user login
usersCtrl.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = _.pick(req.body, [
      "username",
      "email",
      "password",
    ]);
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "Invalid email or password" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(404)
        .json({ success: false, error: "Invalid email or password" });
    }

    const tokenData = { id: user._id };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Include username in the response along with the token
    res.json({ success: true, token, username: user.username });
  } catch (error) {
    console.error("Error logging in:", error);
    res
      .status(500)
      .json({ success: false, error: "An error occurred while logging in." });
  }
};

// Retrieve user account
usersCtrl.account = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const userData = _.pick(user, ["_id", "username", "email"]);
    res.json({ success: true, data: userData });
  } catch (error) {
    console.error("Error retrieving user account:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while retrieving the user account.",
    });
  }
};

module.exports = usersCtrl;
