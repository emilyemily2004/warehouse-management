import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // ✅ Ensure this runs first

const MONGO_URI: string = process.env.MONGO_URI as string;

if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not defined. Check your .env file.");
    process.exit(1);
}

export async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}
