// src/pages/api/login.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userSchema from "@/models/User";
import { connectToDatabase } from "@/lib/db";

export default async (req, res) => {
  if (req.method === "POST") {
    const { email, password } = req.body;

    try {
      await connectToDatabase();
      const user = await userSchema.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign({ email }, "thisIsAPassword", {
        expiresIn: "1h",
      });
      res.json({ token });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error logging in", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
