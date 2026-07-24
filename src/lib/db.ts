import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ordena";
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
  } catch (error) {
    console.warn("[AI Studio] MongoDB not connected — using fallback mode:", error);
  }
}
