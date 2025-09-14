// app/transactions/components/TransactionForm.jsx
"use client";
import { useState } from "react";
import { FaSave, FaTimes } from "react-icons/fa";

export default function TransactionForm({
  categories,
  groups,
  currentUser,
  apiCall,
  fetchTransactions,
  setShowForm,
}) {
  const [form, setForm] = useState({
    amount: "",
    description: "",
    category_id: "",
    group_id: "",
    txn_type: "expense",
    txn_date: new Date().toISOString().split("T")[0],
    user_id: currentUser?.id || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiCall("/api/transactions", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShowForm(false);
      fetchTransactions();
    } catch (err) {
      console.error("Transaction add error:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg p-6 mb-8"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FaSave className="text-blue-600" /> Add Transaction
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="border rounded-lg p-3 w-full"
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border rounded-lg p-3 w-full"
        />
        <select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          className="border rounded-lg p-3 w-full"
          required
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={form.group_id}
          onChange={(e) => setForm({ ...form, group_id: e.target.value })}
          className="border rounded-lg p-3 w-full"
        >
          <option value="">Select Group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <select
          value={form.txn_type}
          onChange={(e) => setForm({ ...form, txn_type: e.target.value })}
          className="border rounded-lg p-3 w-full"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          type="date"
          value={form.txn_date}
          onChange={(e) => setForm({ ...form, txn_date: e.target.value })}
          className="border rounded-lg p-3 w-full"
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xl transition"
        >
          <FaTimes /> Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow transition"
        >
          <FaSave /> Save
        </button>
      </div>
    </form>
  );
}
