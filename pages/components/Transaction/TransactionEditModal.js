// app/transactions/components/TransactionEditModal.jsx
"use client";
import { useState } from "react";
import { FaSave, FaTimes } from "react-icons/fa";

export default function TransactionEditModal({
  editingTxn,
  setEditingTxn,
  categories,
  groups,
  apiCall,
  fetchTransactions,
}) {
  const [form, setForm] = useState(editingTxn);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiCall(`/api/transactions/${editingTxn.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setEditingTxn(null);
      fetchTransactions();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <form
        onSubmit={handleUpdate}
        className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaSave className="text-blue-600" /> Edit Transaction
        </h2>

        <div className="grid grid-cols-1 gap-4">
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
            value={form.txn_date?.split("T")[0]}
            onChange={(e) => setForm({ ...form, txn_date: e.target.value })}
            className="border rounded-lg p-3 w-full"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => setEditingTxn(null)}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xl transition"
          >
            <FaTimes /> Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow transition"
          >
            <FaSave /> Update
          </button>
        </div>
      </form>
    </div>
  );
}
