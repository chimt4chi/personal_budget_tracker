// todo -> search functionality, more modern ui
"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    user_id: "",
    amount: "",
    description: "",
    category_id: "",
    txn_type: "expense",
    txn_date: "",
    group_id: "",
  });

  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingTxn, setEditingTxn] = useState(null); // holds transaction to edit
  const [editForm, setEditForm] = useState({}); // separate form state for edit

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []));

    fetch("/api/groups")
      .then((res) => res.json())
      .then((data) => setGroups(Array.isArray(data) ? data : []));

    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []));

    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Transactions API did not return an array:", data);
          setTransactions([]);
          return;
        }

        const sorted = data.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
        setTransactions(sorted);
      })
      .catch((err) => {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
      });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    const res = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (data.success) {
      fetchTransactions();
    } else {
      alert(data.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let url = "/api/transactions";
    let method = "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      fetchTransactions();
      setForm({
        user_id: "",
        amount: "",
        description: "",
        category_id: "",
        txn_type: "expense",
        txn_date: "",
        group_id: "",
      });
    } else {
      alert(data.error);
    }
  };

  function formatDate(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Transaction Form */}
      <form
        onSubmit={handleSubmit}
        className="text-black p-6 bg-white shadow rounded-xl space-y-4"
      >
        <select
          name="user_id"
          value={form.user_id}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select User</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          name="txn_type"
          value={form.txn_type}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <input
          name="txn_date"
          type="date"
          value={form.txn_date}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <select
          name="group_id"
          value={form.group_id}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">No Group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Save
        </button>
      </form>

      {/* Edit Transaction Modal */}
      {editingTxn && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-black p-6 rounded-lg w-[500px]">
            <h2 className="text-lg font-bold mb-4">Edit Transaction</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch(
                    `/api/transactions/${editingTxn.id}`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(editForm),
                    }
                  );
                  if (res.ok) {
                    await fetchTransactions();
                    setEditingTxn(null);
                  } else {
                    console.error("Error updating transaction");
                  }
                } catch (err) {
                  console.error("Error:", err);
                }
              }}
              className="space-y-4"
            >
              {/* User */}
              <select
                name="user_id"
                value={editForm.user_id}
                onChange={(e) =>
                  setEditForm({ ...editForm, user_id: e.target.value })
                }
                className="w-full border p-2 rounded text-black"
                required
              >
                <option value="">Select User</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>

              {/* Amount */}
              <input
                type="number"
                name="amount"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: e.target.value })
                }
                className="w-full border p-2 rounded text-black"
                placeholder="Amount"
                required
              />

              {/* Description */}
              <input
                type="text"
                name="description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="w-full border p-2 rounded text-black"
                placeholder="Description"
              />

              {/* Category */}
              <select
                name="category_id"
                value={editForm.category_id}
                onChange={(e) =>
                  setEditForm({ ...editForm, category_id: e.target.value })
                }
                className="w-full border p-2 rounded text-black"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Group */}
              <select
                name="group_id"
                value={editForm.group_id}
                onChange={(e) =>
                  setEditForm({ ...editForm, group_id: e.target.value })
                }
                className="w-full border p-2 rounded text-black"
              >
                <option value="">No Group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              {/* Transaction Type */}
              <select
                name="txn_type"
                value={editForm.txn_type}
                onChange={(e) =>
                  setEditForm({ ...editForm, txn_type: e.target.value })
                }
                className="w-full border p-2 rounded text-black"
                required
              >
                <option value="">Select Type</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              {/* Transaction Date */}
              <input
                type="datetime-local"
                name="txn_date"
                value={editForm.txn_date?.slice(0, 16)}
                onChange={(e) =>
                  setEditForm({ ...editForm, txn_date: e.target.value })
                }
                className="w-full border p-2 rounded text-black"
                required
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingTxn(null)}
                  className="px-4 py-2 rounded bg-gray-300 text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white p-6 shadow rounded-xl overflow-x-auto">
        <h2 className="text-lg font-bold mb-4">Transactions</h2>
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Group</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="text-center">
                <td className="border p-2">{formatDate(t.updated_at)}</td>
                <td className="border p-2">
                  {t.description || "No Description"}
                </td>
                <td className="border p-2">₹{t.amount}</td>
                <td className="border p-2">{t.category || "No Category"}</td>
                <td className="border p-2">{t.group_name || "-"}</td>
                <td className="border p-2 capitalize">{t.txn_type}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => {
                      setEditingTxn(t);
                      setEditForm({ ...t }); // preload form with txn data
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
