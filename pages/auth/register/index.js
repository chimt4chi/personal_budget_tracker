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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <title>Register</title>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-xl font-bold text-gray-800">Register</h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          disabled={loading}
          className="border px-3 py-2 rounded w-full"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          disabled={loading}
          className="border px-3 py-2 rounded w-full"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          disabled={loading}
          className="border px-3 py-2 rounded w-full"
        />

        <select
          name="currency_code"
          value={form.currency_code}
          onChange={handleChange}
          disabled={loading}
          className="border px-3 py-2 rounded w-full"
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
          className="border px-3 py-2 rounded w-full"
        >
          <option value="Asia/Kolkata">Asia/Kolkata</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> Registering...
            </>
          ) : (
            "Register"
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push("/auth/login")}
          disabled={loading}
          className="mt-2 w-full py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-70"
        >
          Already have an account? Login
        </button>
      </form>
    </div>
  );
}
