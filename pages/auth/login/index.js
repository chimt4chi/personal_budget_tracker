"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FaSpinner } from "react-icons/fa";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid login");
      }

      const data = await res.json();
      login(data.user, data.token); // pass full user object, not just { email }

      router.push("/"); // redirect to home
    } catch (err) {
      setError("Login failed. Check credentials.");
    }
    setLoading(true);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <title>Login</title>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push("/auth/register")}
          className="mt-2 w-full py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Don&apos;t have an account? Register
        </button>
      </form>
    </div>
  );
}
