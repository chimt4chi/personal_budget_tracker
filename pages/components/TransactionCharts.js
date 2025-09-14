"use client";
import { Bar, Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { useEffect, useState } from "react";
import { FaChartBar, FaChartPie, FaBalanceScale } from "react-icons/fa";

export default function TransactionCharts({ token }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchData() {
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
    }
    fetchData();
  }, [token]);

  // category mapping
  const categoryMap = {};
  categories.forEach((cat) => {
    categoryMap[cat.id] = cat.name;
  });

  // sums by category
  const sums = {};
  transactions.forEach((t) => {
    const label = categoryMap[t.category_id] || "Uncategorized";
    sums[label] = (sums[label] || 0) + Number(t.amount);
  });

  // income vs expense
  const totalIncome = transactions
    .filter((t) => t.txn_type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.txn_type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const labels = Object.keys(sums);
  const dataValues = Object.values(sums);

  const colors = [
    "#3b82f6", // blue
    "#06b6d4", // cyan
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
  ];

  const barData = {
    labels,
    datasets: [
      {
        label: "Spend by Category",
        data: dataValues,
        backgroundColor: colors,
        borderRadius: 6,
      },
    ],
  };

  const pieData = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: colors,
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

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
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-8">
      {/* Bar Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaChartBar className="text-blue-500" /> Spending Overview
        </h2>
        <div className="h-72">
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaChartPie className="text-purple-500" /> Category Breakdown
        </h2>
        <div className="h-72">
          <Pie data={pieData} options={chartOptions} />
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
  );
}
