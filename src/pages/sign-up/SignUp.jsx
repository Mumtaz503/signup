import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/protected/ProtectedContent");
    }
    const checkVerificationStatus = async () => {
      try {
        const response = await fetch(
          `/api/verify-status?email=${formData.email}`
        );
        const data = await response.json();
        if (data.exists) {
          setShowVerifyPage(true);
        }
      } catch (error) {
        console.error("Error checking verification status:", error.message);
      }
    };

    if (formData.email) {
      checkVerificationStatus();
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("Form data changed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(
          "Signup successful! Check your email for the verification code."
        );
        router.push({
          pathname: "/verification/Verify",
          query: { email: formData.email },
        });
      } else {
        setMessage(data.message || "An error occurred");
      }
    } catch (error) {
      setMessage("An error occurred while signing up.");
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
