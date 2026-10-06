import User from "../models/User.js";

// Admin = the account whose email matches ADMIN_EMAIL in backend/.env
export const isAdminEmail = (email) =>
  !!email &&
  !!process.env.ADMIN_EMAIL &&
  email.toLowerCase().trim() === process.env.ADMIN_EMAIL.toLowerCase().trim();

// Use after `protect`.
export const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("email");
    if (!user || !isAdminEmail(user.email)) {
      return res.status(403).json({ message: "Admin only" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};