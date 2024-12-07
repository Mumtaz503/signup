import mongoose from "mongoose";

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) return;

  try {
    console.log("Connecting to DB");
    const { connection } = await mongoose.connect(
      "mongodb+srv://btee88860:S0M0898d6XVW2OSY@cluster0.vndye.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    isConnected = connection.readyState === 1;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
