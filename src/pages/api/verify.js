import User from "@/models/User";
import client, { connectRedis } from "@/lib/redis";
import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, verificationCode } = req.body;

  try {
    await connectRedis();
    await connectToDatabase();
    const tempUser = await client.get(email);
    if (!tempUser) {
      return res.status(400).json({ message: "Verification code expired." });
    }

    let storedData;
    try {
      storedData = JSON.parse(tempUser);
      console.log("Stored Data", storedData);
    } catch (error) {
      console.error("Error parsing stored data:", error.message);
      return res.status(500).json({ message: "Internal server error." });
    }

    if (
      storedData.verificationCode.toString() !== verificationCode.toString()
    ) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    const newUser = new User({
      firstname: storedData.firstname,
      lastname: storedData.lastname,
      email,
      password: storedData.password,
    });
    await newUser.save();

    await client.del(email);

    res.status(200).json({ message: "Email verified. Signup complete." });
  } catch (error) {
    console.error("Error verifying email:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
}
