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

  const handleSubmit = async (e) => {
    // e.preventDefault();
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      // ✅ Assume your API returns the inserted transaction
      const newTxn = data.transaction;

      if (newTxn) {
        setTransactions((prev) => [newTxn, ...prev]); // put it on top
      } else {
        fetchTransactions(); // fallback if no transaction returned
      }

      // reset form
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
