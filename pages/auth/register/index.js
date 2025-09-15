import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/router";
import { FaSpinner } from "react-icons/fa";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    currency_code: "INR",
    time_zone: "Asia/Kolkata",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // auto-login after successful registration
      login(data.user, data.token);
      router.push("/"); // redirect after registration
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6">
      <title>Register</title>

      {/* Heading */}
      <h1 className="text-4xl font-bold text-blue-600 mb-6 text-center">
        Personal Budget Tracker
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl max-w-md w-full space-y-5 animate-fadeIn"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Create Account
        </h2>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <select
            name="currency_code"
            value={form.currency_code}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>

          <select
            name="time_zone"
            value={form.time_zone}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex justify-center items-center gap-2 transition disabled:opacity-70"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" /> Registering...
            </>
          ) : (
            "Register"
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push("/auth/login")}
          disabled={loading}
          className="cursor-pointer w-full py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition disabled:opacity-70"
        >
          Already have an account?{" "}
          <span className="text-blue-500 font-medium">Login</span>
        </button>
        <button
          onClick={() => router.push("/user-guide")}
          className="cursor-pointer w-full py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          User-Guide
        </button>
      </form>
    </div>
  );
}
