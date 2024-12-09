import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  //Redirects the user to the protected page if their token is in the browser storage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/protected/ProtectedContent");
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      //Calls the login API to generate JWT
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      //Redirect the user to the protected page if the response is okay
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        router.push("/protected/ProtectedContent");
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.message);
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default LoginPage;
