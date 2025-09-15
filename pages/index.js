"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TransactionCharts from "./components/TransactionCharts";
import {
  FaWallet,
  FaListUl,
  FaUsers,
  FaChartPie,
  FaSpinner,
  FaUserCircle,
  FaSignOutAlt,
  FaGuilded,
} from "react-icons/fa";

export default function Dashboard() {
  const { user, logout, loading, token } = useAuth();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        <FaSpinner className="animate-spin mr-2 text-blue-500" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      <title>Dashboard</title>

      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-md px-4 sm:px-6 py-4 rounded-xl mb-8 flex flex-wrap justify-between items-center gap-4">
        {/* Links */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6">
          <Link
            className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2 transition"
            href="/transactions"
          >
            <FaListUl className="text-lg" />
            <span className="hidden sm:inline">Transactions</span>
          </Link>
          <Link
            className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2 transition"
            href="/budget"
          >
            <FaWallet className="text-lg" />
            <span className="hidden sm:inline">Budget</span>
          </Link>
          <Link
            className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2 transition"
            href="/groups"
          >
            <FaUsers className="text-lg" />
            <span className="hidden sm:inline">Groups</span>
          </Link>
          <Link
            className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2 transition"
            href="/user-guide"
          >
            <FaGuilded className="text-lg" />
            <span className="hidden sm:inline">User-Guide</span>
          </Link>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpenDropdown((prev) => !prev)}
            className="cursor-pointer flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
          >
            <FaUserCircle className="text-xl text-gray-700" />
            {/* Show name only on md+ screens */}
            <span className="hidden md:inline text-gray-700 font-medium">
              {user.name}
            </span>
          </button>

          {openDropdown && (
            <div className="absolute right-0 mt-2 w-fit bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="cursor-default px-4 py-3 border-b border-gray-100 whitespace-nowrap">
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="cursor-pointer flex items-center gap-2 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition rounded-b-lg"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Charts Section */}
      <section className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Your Transactions Overview
        </h2>
        <TransactionCharts token={token} />
      </section>
    </div>
  );
}
