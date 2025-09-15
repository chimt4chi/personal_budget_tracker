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
      login(data.user, data.token);
      router.push("/");
    } catch (err) {
      setError("Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <title>Login</title>
      <div className="text-center absolute top-10">
        <h1 className="text-4xl font-bold text-blue-600">
          Personal Budget Tracker
        </h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-96 border border-gray-100"
      >
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
          Welcome Back
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />

        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-5 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full flex items-center justify-center bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
          className="cursor-pointer mt-4 w-full py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          Don&apos;t have an account?{" "}
          <span className="text-blue-500 font-medium">Register</span>
        </button>
        <button
          onClick={() => router.push("/user-guide")}
          className="cursor-pointer mt-4 w-full py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          User-Guide
        </button>
      </form>
    </div>
  );
}
