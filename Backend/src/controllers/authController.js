const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateTokens } = require("../utils/token");

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password, role = "CUSTOMER" } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists", code: "USER_EXISTS" });
    }

    const user = new User({ name, email, passwordHash: password, role });
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: user.toJSON(),
      tokens: { accessToken, refreshToken }
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", details: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isActive: true }).select("+passwordHash");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials", code: "INVALID_CREDENTIALS" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);
    await user.save();

    res.json({
      message: "Login successful",
      user: user.toJSON(),
      tokens: { accessToken, refreshToken }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", details: error.message });
  }
};

// Refresh token
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) return res.status(401).json({ message: "Invalid refresh token" });

    const tokenExists = user.refreshTokens.some((t) => t.token === refreshToken);
    if (!tokenExists) return res.status(401).json({ message: "Invalid refresh token" });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== refreshToken);
    user.refreshTokens.push({ token: newRefreshToken, createdAt: new Date() });
    await user.save();

    res.json({ message: "Tokens refreshed", tokens: { accessToken, refreshToken: newRefreshToken } });
  } catch (error) {
    res.status(500).json({ message: "Token refresh failed", details: error.message });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = req.user;

    if (refreshToken) {
      await User.findByIdAndUpdate(user._id, { $pull: { refreshTokens: { token: refreshToken } } });
    } else {
      await User.findByIdAndUpdate(user._id, { $set: { refreshTokens: [] } });
    }

    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", details: error.message });
  }
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("addresses");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile retrieved", user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: "Profile fetch failed", details: error.message });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ["name", "addresses"];
    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) updates[key] = req.body[key];
    });

    if (updates.addresses) {
      const defaultCount = updates.addresses.filter((a) => a.isDefault).length;
      if (defaultCount > 1) updates.addresses.forEach((a, i) => { if (i > 0) a.isDefault = false; });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated", user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: "Profile update failed", details: error.message });
  }
};

module.exports = { register, login, refresh, logout, getProfile, updateProfile };
