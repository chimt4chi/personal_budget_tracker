// app/transactions/components/Toolbar.jsx
"use client";
import { FaPlus, FaSearch } from "react-icons/fa";

export default function Toolbar({ showForm, setShowForm, transactions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
      {/* Left: Search & Count */}
      <div className="flex items-center gap-3">
        <FaSearch className="text-gray-500" />
        <span className="text-gray-700 text-sm font-medium">
          {transactions.length} Transactions
        </span>
      </div>

      {/* Right: Add Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow transition"
      >
        <FaPlus /> {showForm ? "Close" : "Add Transaction"}
      </button>
    </div>
  );
}
