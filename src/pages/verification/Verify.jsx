import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function VerifyEmailPage() {
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { email } = router.query;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/protected/ProtectedContent");
    }
  }, [router]);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verificationCode }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Email verified successfully! Redirecting to login...");
        setTimeout(() => router.push("/login/Login"), 3000);
      } else {
        setMessage(data.message || "Verification failed.");
      }
    } catch (error) {
      setMessage("An error occurred while verifying.");
    }
  };

  return (
    <div>
      <h1>Verify Email</h1>
      <form onSubmit={handleVerify}>
        <div>
          <label>Verification Code:</label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
        </div>
        <button type="submit">Verify</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
