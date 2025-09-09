"use client";
import { Bar, Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { useEffect, useState } from "react";

export default function TransactionCharts({ token }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // Fetch transactions
      const txnRes = await fetch("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const txnData = await txnRes.json();
      setTransactions(Array.isArray(txnData) ? txnData : []);

      // Fetch categories
      const catRes = await fetch("/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const catData = await catRes.json();
      setCategories(Array.isArray(catData) ? catData : []);
    }
    fetchData();
  }, [token]);

  const categoryMap = {};
  categories.forEach((cat) => {
    categoryMap[cat.id] = cat.name;
  });

  const sums = {};
  transactions.forEach((t) => {
    const label = categoryMap[t.category_id] || "Uncategorized";
    sums[label] = (sums[label] || 0) + Number(t.amount);
  });

  const labels = Object.keys(sums);
  const dataValues = Object.values(sums);

  const barData = {
    labels,
    datasets: [
      {
        label: "Spend by Category",
        data: dataValues,
        backgroundColor: [
          "#2563eb",
          "#22d3ee",
          "#10b981",
          "#fbbf24",
          "#f87171",
          "#8b5cf6",
        ],
      },
    ],
  };

  const pieData = {
    labels,
    datasets: [
      {
        label: "Spend by Category",
        data: dataValues,
        backgroundColor: [
          "#2563eb",
          "#22d3ee",
          "#10b981",
          "#fbbf24",
          "#f87171",
          "#8b5cf6",
        ],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
  };

  return (
    <div className="flex justify-around bg-white shadow p-6 rounded-xl my-6 space-y-10">
      <div>
        <h2 className="text-lg font-bold mb-4">
          Spending Overview - Bar Chart
        </h2>
        <div style={{ width: 400, height: 300 }}>
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold mb-4">
          Spending Overview - Pie Chart
        </h2>
        <div style={{ width: 400, height: 300 }}>
          <Pie data={pieData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
