// app/transactions/components/TransactionTable.jsx
"use client";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function TransactionTable({
  transactions,
  categories,
  groups,
  setEditingTxn,
  apiCall,
  fetchTransactions,
}) {
  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await apiCall(`/api/transactions/${id}`, { method: "DELETE" });
      fetchTransactions();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Transactions</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Group</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr
                key={t.id}
                className="border-b hover:bg-gray-50 transition text-gray-700"
              >
                <td className="p-3">{t.txn_date?.split("T")[0]}</td>
                <td className="p-3">{t.description}</td>
                <td className="p-3">
                  {categories.find((c) => c.id === t.category_id)?.name ||
                    "Uncategorized"}
                </td>
                <td className="p-3">
                  {groups.find((g) => g.id === t.group_id)?.name || "-"}
                </td>
                <td className="p-3 capitalize">{t.txn_type}</td>
                <td
                  className={`p-3 font-semibold ${
                    t.txn_type === "income" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  ₹{Number(t.amount).toFixed(2)}
                </td>
                <td className="p-3 flex gap-3">
                  <button
                    onClick={() => setEditingTxn(t)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
