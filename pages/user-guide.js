"use client";
import { useRouter } from "next/navigation";

export default function UserGuide() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 flex flex-col items-center">
      <title>User Guide - Personal Budget Tracker</title>

      {/* Top Back Button */}
      <div className="w-full max-w-3xl mb-6">
        <button
          onClick={() => router.back()}
          className="cursor-pointer flex items-center text-blue-600 hover:underline transition text-sm"
        >
          ← Back
        </button>
      </div>

      <h1 className="text-4xl font-bold text-blue-600 mb-4 text-center">
        Personal Budget Tracker
      </h1>
      <h2 className="text-xl text-gray-700 mb-10 text-center">
        Your Quick Start Guide
      </h2>

      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-3xl w-full space-y-6">
        {/* Introduction */}
        <section>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            📘 Introduction
          </h3>
          <p className="text-gray-600">
            Welcome to the Personal Budget Tracker! This app helps you manage
            your income, expenses, and stay on top of your financial goals.
            Whether you&apos;re budgeting monthly or tracking daily expenses,
            we&apos;ve got you covered.
          </p>
        </section>

        {/* Features */}
        <section>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            ⚙️ Key Features
          </h3>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Track your income and expenses in real-time</li>
            <li>Set currency and time zone preferences</li>
            <li>View transaction history with filters</li>
            <li>Get visual insights with charts</li>
            <li>Split your expenses among groups</li>
            <li>Secure login & registration</li>
          </ul>
        </section>

        {/* How to Use */}
        <section>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            🚀 Getting Started
          </h3>
          <ol className="list-decimal list-inside text-gray-600 space-y-1">
            <li>Register an account with your email and password.</li>
            <li>Select your preferred currency and time zone.</li>
            <li>Login to access your dashboard.</li>
            <li>Add income or expense entries under your account.</li>
            <li>Review your spending with summaries.</li>
          </ol>
        </section>

        {/* FAQ */}
        <section>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            ❓ Frequently Asked Questions
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              <strong>Q:</strong> Is my data secure?
              <br />
              <strong>A:</strong> Yes, your data is stored securely and only
              accessible to you.
            </p>
            <p>
              <strong>Q:</strong> Can I change my currency or time zone later?
              <br />
              <strong>A:</strong> Yes, visit your settings page once logged in.
            </p>
          </div>
        </section>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            onClick={() => router.push("/auth/login")}
            className="cursor-pointer w-full py-3 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-50 font-medium transition"
          >
            🔐 Back to Login
          </button>
          <button
            onClick={() => router.push("/auth/register")}
            className="cursor-pointer w-full py-3 rounded-lg border border-green-500 text-green-600 hover:bg-green-50 font-medium transition"
          >
            📝 Go to Register
          </button>
        </div>
      </div>
    </div>
  );
}
