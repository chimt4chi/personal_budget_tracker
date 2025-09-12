// todo -> search functionality, more modern ui
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Home() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    amount: "",
    description: "",
    category_id: "",
    txn_type: "expense",
    txn_date: "",
    group_id: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingTxn, setEditingTxn] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Helper function to make authenticated API calls
  const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Request failed");
    }

    return response.json();
  };

  // Helper function to get current user from localStorage
  const getCurrentUser = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        return null;
      }
    }
    return null;
  };

  // Helper function to get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "No Category";
  };

  // Helper function to get group name by ID
  const getGroupName = (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    return group ? group.name : "-";
  };

  // Helper function to get user name by ID
  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  useEffect(() => {
    // Get current user from localStorage
    const user = getCurrentUser();
    setCurrentUser(user);

    const loadData = async () => {
      try {
        const [categoriesData, groupsData, usersData] = await Promise.all([
          apiCall("/api/categories"),
          apiCall("/api/groups"),
          apiCall("/api/users"),
        ]);

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setGroups(Array.isArray(groupsData) ? groupsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);

        await fetchTransactions();
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadData();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await apiCall("/api/transactions");

      if (!Array.isArray(data)) {
        console.error("Transactions API did not return an array:", data);
        setTransactions([]);
        return;
      }

      const sorted = data.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      );
      setTransactions(sorted);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      await apiCall(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      await fetchTransactions();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser || !currentUser.id) {
      alert("User not found. Please login again.");
      return;
    }

    try {
      const formData = {
        ...form,
        user_id: currentUser.id, // Automatically use current user's ID
      };

      await apiCall("/api/transactions", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      await fetchTransactions();
      setForm({
        amount: "",
        description: "",
        category_id: "",
        txn_type: "expense",
        txn_date: "",
        group_id: "",
      });
    } catch (error) {
      alert(error.message);
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

  const filteredTransactions = transactions.filter((t) => {
    const amountMatch = t.amount?.toString().includes(searchTerm);
    const descriptionMatch = t.description
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const categoryName = getCategoryName(t.category_id);
    const categoryMatch = categoryName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const groupName = getGroupName(t.group_id);
    const groupMatch = groupName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    return amountMatch || descriptionMatch || categoryMatch || groupMatch;
  });

  return (
    <div className="max-w-4xl mx-auto mt-10 font-sans p-4">
      <div className="flex gap-4 mb-6">
        <Link className="text-blue-600 hover:underline" href={"/"}>
          Home
        </Link>
        <Link className="text-blue-600 hover:underline" href={"/budget"}>
          budget
        </Link>
        <Link className="text-blue-600 hover:underline" href={"/groups"}>
          Groups
        </Link>
      </div>

      {/* Transaction Form */}
      <form
        onSubmit={handleSubmit}
        className="text-black p-6 bg-white shadow rounded-xl space-y-4"
      >
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
          disabled={!currentUser}
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
                  await apiCall(`/api/transactions/${editingTxn.id}`, {
                    method: "PUT",
                    body: JSON.stringify(editForm),
                  });

                  await fetchTransactions();
                  setEditingTxn(null);
                } catch (err) {
                  console.error("Error updating transaction:", err);
                  alert(err.message);
                }
              }}
              className="space-y-4"
            >
              {/* User - Show as read-only info */}
              <div className="w-full border p-2 rounded bg-gray-100 text-gray-600">
                User: {getUserName(editForm.user_id)}
              </div>

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
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold mb-4">Transactions</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by amount, description, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Group</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Amount</th>
              {/* <th className="border p-2">User</th> */}
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="text-center">
                <td className="border p-2">{formatDate(t.txn_date)}</td>
                <td className="border p-2">
                  {t.description || "No Description"}
                </td>
                <td className="border p-2">{getGroupName(t.group_id)}</td>
                <td className="border p-2">{getCategoryName(t.category_id)}</td>
                <td className="border p-2 capitalize">{t.txn_type}</td>
                <td className="border p-2">₹{t.amount}</td>
                {/* <td className="border p-2">{getUserName(t.user_id)}</td> */}
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => {
                      setEditingTxn(t);
                      setEditForm({ ...t });
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
