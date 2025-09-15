"use client";
import {
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaChartBar,
  FaChartPie,
  FaBalanceScale,
  FaChartLine,
} from "react-icons/fa";
import { Bar, Pie, Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { useEffect, useState } from "react";

export default function TransactionCharts({ token }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date()); // selected month

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const txnRes = await fetch("/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const txnData = await txnRes.json();
        setTransactions(Array.isArray(txnData) ? txnData : []);

        const catRes = await fetch("/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const catData = await catRes.json();
        setCategories(Array.isArray(catData) ? catData : []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    }
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-72 my-8">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <span className="ml-4 text-lg text-gray-600">Loading charts...</span>
      </div>
    );
  }

  const categoryMap = {};
  categories.forEach((cat) => (categoryMap[cat.id] = cat.name));

  // Bar chart - spend by category
  const sums = {};
  transactions.forEach((t) => {
    const label = categoryMap[t.category_id] || "Uncategorized";
    sums[label] = (sums[label] || 0) + Number(t.amount);
  });
  const barData = {
    labels: Object.keys(sums),
    datasets: [
      {
        label: "Spend by Category",
        data: Object.values(sums),
        backgroundColor: [
          "#3b82f6",
          "#06b6d4",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
        ],
        borderRadius: 6,
      },
    ],
  };

  // Pie chart - category breakdown
  const pieData = {
    labels: Object.keys(sums),
    datasets: [
      {
        data: Object.values(sums),
        backgroundColor: [
          "#3b82f6",
          "#06b6d4",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
        ],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  // Income vs Expense (month-wise)
  const monthStart = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const monthEnd = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );

  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.txn_date);
    return d >= monthStart && d <= monthEnd;
  });

  const totalIncome = monthTransactions
    .filter((t) => t.txn_type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = monthTransactions
    .filter((t) => t.txn_type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const incomeExpenseData = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        label: "Amount",
        data: [totalIncome, totalExpense],
        backgroundColor: ["#10b981", "#ef4444"],
        borderRadius: 6,
      },
    ],
  };

  // Monthly spending trend (line chart) - day-wise
  const trendMap = {};
  monthTransactions
    .filter((t) => t.txn_type === "expense")
    .forEach((t) => {
      const date = new Date(t.txn_date).toLocaleDateString("en-CA"); // YYYY-MM-DD
      trendMap[date] = (trendMap[date] || 0) + Number(t.amount);
    });
  const trendLabels = Object.keys(trendMap).sort();
  const trendValues = trendLabels.map((d) => trendMap[d]);
  const lineData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Daily Spending",
        data: trendValues,
        fill: false,
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#374151",
          padding: 16,
          font: { size: 13, weight: "500" },
        },
      },
    },
    animation: { duration: 1200, easing: "easeOutQuart" },
  };

  // Month navigation
  const handlePrevMonth = () =>
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );

  const handleNextMonth = () => {
    const now = new Date();
    if (
      currentMonth.getFullYear() < now.getFullYear() ||
      (currentMonth.getFullYear() === now.getFullYear() &&
        currentMonth.getMonth() < now.getMonth())
    ) {
      setCurrentMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
      );
    }
  };

  return (
    <div className="my-8 space-y-6">
      {/* Month Selector */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <button
          onClick={handlePrevMonth}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          <FaChevronLeft />
        </button>
        <span className="text-lg font-semibold">
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={handleNextMonth}
          disabled={
            currentMonth.getFullYear() > new Date().getFullYear() ||
            (currentMonth.getFullYear() === new Date().getFullYear() &&
              currentMonth.getMonth() >= new Date().getMonth())
          }
          className={`px-3 py-1 rounded ${
            currentMonth.getFullYear() > new Date().getFullYear() ||
            (currentMonth.getFullYear() === new Date().getFullYear() &&
              currentMonth.getMonth() >= new Date().getMonth())
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <FaChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Spending Trend */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartLine className="text-red-500" /> Spending Trend
          </h2>
          <div className="h-72">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        {/* Income vs Expense */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaBalanceScale className="text-green-600" /> Income vs Expense
          </h2>
          <div className="h-72">
            <Bar data={incomeExpenseData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Optional: Bar & Pie charts (full data) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartBar className="text-blue-500" /> Spending Overview
          </h2>
          <div className="h-72">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartPie className="text-purple-500" /> Category Breakdown
          </h2>
          <div className="h-72">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
