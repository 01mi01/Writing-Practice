const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  User,
  EnglishLevel,
  Certification,
  UserPreference,
} = require("../models");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

exports.registerUser = async (req, res) => {
  const {
    username,
    email,
    password,
    birth_date,
    english_level_id,
    certification_type_id,
    certification_score,
  } = req.body;

  if (!username || !email || !password || !birth_date || !english_level_id) {
    return res.status(400).json({
      message:
        "Username, email, password, birth_date, and english_level_id are required",
    });
  }

  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const usernameExists = await User.findOne({ where: { username } });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      birth_date,
      english_level_id,
      certification_type_id: certification_type_id || null,
      certification_score: certification_score || null,
    });

    await UserPreference.create({
      user_id: newUser.user_id,
      theme_id: 1,
      color_id: 1,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, is_admin: user.is_admin },
      SECRET_KEY,
      { expiresIn: process.env.TOKEN_EXPIRATION || "2h" },
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
