import mongoose from "mongoose";
import dns from "dns";

// Some ISPs/routers (common in Bangladesh) block the DNS "SRV" lookups that
// mongodb+srv:// connection strings rely on, causing "querySrv ECONNREFUSED".
// Forcing Node to resolve DNS via Google's public resolver fixes this without
// needing to change the computer's system-wide network settings at all.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};