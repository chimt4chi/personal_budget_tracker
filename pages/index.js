"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TransactionCharts from "./components/TransactionCharts";

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const { token } = useAuth();
  // console.log(token);

  // console.log("🔍 Dashboard - user:", user);
  // console.log("🔍 Dashboard - loading:", loading);

  useEffect(() => {
    // console.log("🔍 Dashboard useEffect - loading:", loading, "user:", user);

    if (!loading && !user) {
      console.log("🔍 Dashboard: Redirecting to login");
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    // console.log("🔍 Dashboard: Showing loading state");
    return (
      <div className="p-6 flex justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    // console.log("🔍 Dashboard: No user, should redirect");
    return null;
  }

  // console.log("🔍 Dashboard: Rendering dashboard");
  return (
    <div className="max-w-4xl mx-auto mt-10 font-sans p-4">
      <div className="flex gap-4 mb-6">
        <Link className="text-blue-600 hover:underline" href={"/transactions"}>
          Transactions
        </Link>
        <Link className="text-blue-600 hover:underline" href={"/budget"}>
          Budget
        </Link>
        <Link className="text-blue-600 hover:underline" href={"/groups"}>
          Groups
        </Link>
      </div>
      {/* <h1 className="text-xl font-bold">Welcome, {user.email} 🎉</h1> */}
      <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center">
        <p className="text-sm text-blue-800">
          Logged in as: <strong>{user.name}</strong> Email:
          <strong>{user.email}</strong>
        </p>
        <button
          onClick={logout}
          className="mt-4 bg-red-500 text-white py-2 px-4 rounded cursor-pointer"
        >
          Logout
        </button>
      </div>

      <TransactionCharts token={token} />
    </div>
  );
}
