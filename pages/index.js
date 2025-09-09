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
  console.log(token);

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
    <div className="p-6">
      <div className="flex gap-2">
        <Link className="border p-2" href={"/transactions"}>
          transactions
        </Link>
        <Link className="border p-2" href={"/budget"}>
          budget
        </Link>
      </div>
      {/* <h1 className="text-xl font-bold">Welcome, {user.email} 🎉</h1> */}
      <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center">
        <p className="text-sm text-blue-800">
          Logged in as: <strong>{user.name}</strong>
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
