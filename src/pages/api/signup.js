import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import axios from "axios";
import client, { connectRedis } from "@/lib/redis";
import nodemailer from "nodemailer";

//Your zerobounce API key
const ZEROBOUNCE_API_KEY = "cb05af058e4d4eccb4dbbb9fa613dda7";

//Setup nodemailer to send emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "btee88860@gmail.com",
    pass: "mpxo dusx siak gntb ",
  },
});

//Function that checks and validates the email input by the user
async function validateEmail(email) {
  try {
    const response = await axios.get("https://api.zerobounce.net/v2/validate", {
      params: {
        api_key: ZEROBOUNCE_API_KEY,
        email,
      },
    });
    return response.data.status === "valid";
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
    await connectRedis();

    //Validates the email input
    const isEmailValid = await validateEmail(email);
    if (!isEmailValid) {
      return res
        .status(400)
        .json({ message: "Invalid or undeliverable email address." });
    }

    //Checks if the email is already in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    //Checks if an email is already in pending verification
    const existing = await client.get(email);
    if (existing) {
      return res
        .status(400)
        .json({ message: "Email verification already in progress." });
    }

    //Generate a random 6 digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    //Set the credentials of the user for redis
    await client.set(
      email,
      JSON.stringify({
        firstname,
        lastname,
        email,
        password: await bcrypt.hash(password, 10),
        verificationCode,
      }),
      { EX: 600 }
    );

    //Send a mail to the user's email address
    try {
      await transporter.sendMail({
        from: "btee88860@gmail.com",
        to: email,
        subject: "Email Verification Code",
        text: `Your verification code is: ${verificationCode}`,
      });
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error sending email from /api/signup:", error.message);
      res.status(500).json({ message: "Failed to send verification email." });
      return;
    }

    res.status(200).json({ message: "Verification email sent." });
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
}
