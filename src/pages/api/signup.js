import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import axios from "axios";

const ZEROBOUNCE_API_KEY = "cb05af058e4d4eccb4dbbb9fa613dda7";

async function validateEmail(email) {
  try {
    const response = await axios.get("https://api.zerobounce.net/v2/validate", {
      params: {
        api_key: ZEROBOUNCE_API_KEY,
        email,
      },
    });

    const { status } = response.data;
    return status === "valid";
  } catch (error) {
    console.error("Error validating email with ZeroBounce:", error.message);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { firstname, lastname, email, password } = req.body;

  try {
    await connectToDatabase();

    const isEmailValid = await validateEmail(email);
    if (!isEmailValid) {
      return res
        .status(400)
        .json({ message: "Invalid or undeliverable email address." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    console.error("Error during signup:", error.message);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
}
