import { useEffect } from "react";
import { useRouter } from "next/router";

const ProtectedPage = () => {
  const router = useRouter();

  //Only allows the users to view the protected page if their token is generated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login/Login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login/Login");
  };

  return (
    <div>
      <h1>Protected Content</h1>
      <p>This page is only accessible if you are logged in.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default ProtectedPage;
