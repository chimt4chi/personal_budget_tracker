"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TransactionCharts from "./components/TransactionCharts";
import {
  FaSignOutAlt,
  FaWallet,
  FaListUl,
  FaUsers,
  FaChartPie,
} from "react-icons/fa";

export default function Dashboard() {
  const { user, logout, loading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen text-lg text-gray-600">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 font-sans">
      <title>Dashboard</title>
      {/* Top Navigation */}
      <nav className="flex justify-between items-center bg-white shadow-md px-6 py-4 rounded-xl mb-8">
        <div className="flex gap-6">
          <Link
            className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2 transition"
            href="/transactions"
          >
            <FaListUl /> Transactions
          </Link>
          <Link
            className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2 transition"
            href="/budget"
          >
            <FaWallet /> Budget
          </Link>
          <Link
            className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2 transition"
            href="/groups"
          >
            <FaUsers /> Groups
          </Link>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition"
        >
          <FaSignOutAlt /> Logout
        </button>
      </nav>

      {/* User Info Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white mb-8 flex items-center gap-4">
        <FaChartPie className="text-4xl opacity-90" />
        <div>
          <p className="text-sm">Welcome back 👋</p>
          <h1 className="text-xl font-bold">
            {user.name}{" "}
            <span className="text-sm font-normal">({user.email})</span>
          </h1>
        </div>
      </div>

      {/* Charts Section */}
      <TransactionCharts token={token} />
    </div>
  );
}
