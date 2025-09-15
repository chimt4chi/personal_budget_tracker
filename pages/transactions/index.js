"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  FaSearch,
  FaPlus,
  FaTimes,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";

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
  const [searchColumn, setSearchColumn] = useState("all");
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingTxn, setEditingTxn] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "txn_date",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ api helper
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
    if (!response.ok)
      throw new Error((await response.json()).error || "Request failed");
    return response.json();
  };

  // ✅ data helpers
  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name || "-";
  const getGroupName = (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    return group ? group.group_name : "-";
  };

  // ✅ Format date for display
  const formatDate = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ✅ Format date for database (MySQL compatible)
  const formatDateForDB = (dateTimeLocal) => {
    if (!dateTimeLocal) return null;
    // Convert datetime-local format to MySQL DATETIME format
    const date = new Date(dateTimeLocal);
    return date.toISOString().slice(0, 19).replace("T", " ");
  };

  // ✅ Format date for datetime-local input
  const formatDateForInput = (isoString) => {
    if (!isoString) return "";
    // Convert ISO string to datetime-local format
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  // ✅ Sorting function
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // ✅ Get sort icon
  const getSortIcon = (column) => {
    if (sortConfig.key !== column) {
      return <FaSort className="ml-1 text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <FaSortUp className="ml-1 text-blue-600" />
    ) : (
      <FaSortDown className="ml-1 text-blue-600" />
    );
  };

  // ✅ Sort transactions
  const getSortedTransactions = (transactions) => {
    return [...transactions].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle different data types
      switch (sortConfig.key) {
        case "amount":
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
          break;
        case "txn_date":
        case "updated_at":
          aVal = new Date(aVal);
          bVal = new Date(bVal);
          break;
        case "category_id":
          aVal = getCategoryName(aVal);
          bVal = getCategoryName(bVal);
          break;
        case "group_id":
          aVal = getGroupName(aVal);
          bVal = getGroupName(bVal);
          break;
        default:
          aVal = String(aVal || "").toLowerCase();
          bVal = String(bVal || "").toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  // ✅ Enhanced search filter
  const getFilteredTransactions = (transactions) => {
    if (!searchTerm) return transactions;

    const term = searchTerm.toLowerCase();

    return transactions.filter((t) => {
      switch (searchColumn) {
        case "amount":
          return t.amount.toString().includes(term);
        case "description":
          return t.description?.toLowerCase().includes(term);
        case "category":
          return getCategoryName(t.category_id).toLowerCase().includes(term);
        case "group":
          return getGroupName(t.group_id).toLowerCase().includes(term);
        case "type":
          return t.txn_type.toLowerCase().includes(term);
        case "date":
          return formatDate(t.txn_date).toLowerCase().includes(term);
        case "all":
        default:
          return (
            t.amount.toString().includes(term) ||
            t.description?.toLowerCase().includes(term) ||
            getCategoryName(t.category_id).toLowerCase().includes(term) ||
            getGroupName(t.group_id).toLowerCase().includes(term) ||
            t.txn_type.toLowerCase().includes(term) ||
            formatDate(t.txn_date).toLowerCase().includes(term)
          );
      }
    });
  };

  // ✅ lifecycle
  useEffect(() => {
    setCurrentUser(getCurrentUser());
    const loadData = async () => {
      try {
        const [cat, grp, usr] = await Promise.all([
          apiCall("/api/categories"),
          apiCall("/api/groups"),
          apiCall("/api/users"),
        ]);
        setCategories(cat);
        setGroups(grp);
        setUsers(usr);
        fetchTransactions();
      } catch (err) {
        console.error("Init load error:", err);
      }
    };
    loadData();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await apiCall("/api/transactions");
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Txn fetch error:", err);
      setTransactions([]);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    try {
      const members = await apiCall(`/api/groups/${groupId}/members`);
      return members;
    } catch (err) {
      console.error("Failed to fetch group members:", err);
      return [];
    }
  };

  const handleAddExpenseForGroup = async (
    groupId,
    amount,
    description,
    paid_by
  ) => {
    console.log(amount, description, paid_by);
    // if (!amount || !description || !paid_by) {
    //   alert("Missing group expense fields");
    //   return;
    // }

    try {
      const group = groups.find((g) => g.id === parseInt(groupId));
      const groupMembers = group?.members || [];

      if (!groupMembers.length) {
        console.warn("Group has no members");
        return;
      }

      await apiCall(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        body: JSON.stringify({
          paid_by: parseInt(paid_by),
          amount: parseFloat(amount),
          description,
          split_type: "equal",
          split_details: groupMembers.map((m) => ({
            user_id: m.id,
            share_amount: parseFloat(amount) / groupMembers.length,
          })),
        }),
      });
    } catch (err) {
      console.error("Error adding group expense:", err);
    }
  };

  // ✅ handlers
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user_id = currentUser?.id;
      const formData = {
        ...form,
        user_id,
        txn_date: formatDateForDB(form.txn_date),
      };

      await apiCall("/api/transactions", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      // 👇 If this is a group expense, also create a group split
      if (form.group_id) {
        const members = await fetchGroupMembers(form.group_id);

        if (!members.length) {
          alert("Group has no members");
          return;
        }

        await apiCall(`/api/groups/${form.group_id}/expenses`, {
          method: "POST",
          body: JSON.stringify({
            paid_by: parseInt(user_id),
            amount: parseFloat(form.amount),
            description: form.description || "Group Expense",
            split_type: "equal",
            split_details: members.map((m) => ({
              user_id: m.id,
              share_amount: parseFloat(form.amount) / members.length,
            })),
          }),
        });
      }

      fetchTransactions(); // ✅ Refresh UI
      setForm({
        amount: "",
        description: "",
        category_id: "",
        txn_type: "expense",
        txn_date: "",
        group_id: "",
      });
      setShowForm(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await apiCall(`/api/transactions/${id}`, { method: "DELETE" });
      fetchTransactions();
    } catch (err) {
      alert(err.message);
    }
  };

  // ✅ Get processed transactions (filtered and sorted)
  const processedTransactions = getSortedTransactions(
    getFilteredTransactions(transactions)
  );

  const paginatedTransactions = processedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Description",
      "Group",
      "Category",
      "Type",
      "Amount",
    ];
    const rows = processedTransactions.map((t) => [
      formatDate(t.txn_date),
      t.description || "-",
      getGroupName(t.group_id),
      getCategoryName(t.category_id),
      t.txn_type,
      parseFloat(t.amount).toFixed(2),
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(processedTransactions, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "transactions.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importTransactions = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      const content = e.target.result;

      try {
        let imported = [];

        if (file.name.endsWith(".json")) {
          imported = JSON.parse(content);
        } else if (file.name.endsWith(".csv")) {
          const lines = content.trim().split("\n");
          const headers = lines[0].split(",");
          imported = lines.slice(1).map((line) => {
            const values = line.split(",");
            return {
              txn_date: new Date(values[0]),
              description: values[1],
              group_id:
                groups.find((g) => g.group_name === values[2])?.id || null,
              category_id:
                categories.find((c) => c.name === values[3])?.id || null,
              txn_type: values[4],
              amount: parseFloat(values[5]),
            };
          });
        }

        // Optional: Confirm before import
        if (!confirm(`Import ${imported.length} transactions?`)) return;

        for (const txn of imported) {
          await apiCall("/api/transactions", {
            method: "POST",
            body: JSON.stringify({
              ...txn,
              user_id: currentUser?.id,
              txn_date: formatDateForDB(txn.txn_date),
            }),
          });
        }

        fetchTransactions();
        alert("Import successful!");
      } catch (err) {
        console.error("Import error:", err);
        alert("Failed to import transactions.");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 font-sans px-4">
      <title>Transactions</title>
      {/* Top Nav */}
      <div className="flex gap-6 mb-8 text-gray-700 font-medium">
        <Link href="/" className="hover:text-blue-600 transition">
          Home
        </Link>
        <Link href="/budget" className="hover:text-blue-600 transition">
          Budget
        </Link>
        <Link href="/groups" className="hover:text-blue-600 transition">
          Groups
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition"
        >
          {showForm ? <FaTimes /> : <FaPlus />}
          {showForm ? "Close" : "New Transaction"}
        </button>

        {/* Search */}
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={searchColumn}
            onChange={(e) => setSearchColumn(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Fields</option>
            <option value="amount">Amount</option>
            <option value="description">Description</option>
            <option value="category">Category</option>
            <option value="group">Group</option>
            <option value="type">Type</option>
            <option value="date">Date</option>
          </select>
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${
                searchColumn === "all" ? "all fields" : searchColumn
              }...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Transaction Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-6 mb-8 space-y-4 animate-fadeIn border"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              name="amount"
              type="number"
              step="0.01"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input
              name="txn_date"
              type="date"
              value={form.txn_date}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              name="group_id"
              value={form.group_id}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No Group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.group_name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow transition"
          >
            Save
          </button>
        </form>
      )}

      {/* Export / Import */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          Export CSV
        </button>
        <button
          onClick={exportToJSON}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          Export JSON
        </button>

        <label className="cursor-pointer bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow transition">
          Import
          <input
            type="file"
            accept=".csv,.json"
            onChange={importTransactions}
            className="hidden"
          />
        </label>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden mt-6 border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {[
                "txn_date",
                "description",
                "group_id",
                "category_id",
                "txn_type",
                "amount",
              ].map((col) => (
                <th
                  key={col}
                  className="p-3 text-left cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center">
                    {col === "txn_date"
                      ? "Date"
                      : col === "txn_type"
                      ? "Type"
                      : col === "group_id"
                      ? "Group"
                      : col === "category_id"
                      ? "Category"
                      : col === "amount"
                      ? "Amount"
                      : "Description"}
                    {getSortIcon(col)}
                  </div>
                </th>
              ))}
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((t) => (
              <tr
                key={t.id}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">{formatDate(t.txn_date)}</td>
                <td className="p-3">{t.description || "-"}</td>
                <td className="p-3 text-center">{getGroupName(t.group_id)}</td>
                <td className="p-3 text-center">
                  {getCategoryName(t.category_id)}
                </td>
                <td
                  className={`p-3 text-center font-semibold ${
                    t.txn_type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.txn_type}
                </td>
                <td className="p-3 font-medium text-center">
                  ₹{parseFloat(t.amount).toFixed(2)}
                </td>
                <td className="p-3 flex gap-2 justify-center">
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg shadow transition">
                    Edit
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg shadow transition">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {processedTransactions.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="p-6 text-center text-gray-500 italic"
                >
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-3 items-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
        >
          Prev
        </button>
        <span className="px-4 py-2 text-gray-600 font-medium">
          Page {currentPage} of{" "}
          {Math.ceil(processedTransactions.length / itemsPerPage)}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              prev < Math.ceil(processedTransactions.length / itemsPerPage)
                ? prev + 1
                : prev
            )
          }
          disabled={
            currentPage ===
            Math.ceil(processedTransactions.length / itemsPerPage)
          }
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
        >
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {editingTxn && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl w-[500px] shadow-2xl animate-fadeIn border">
            <h2 className="text-lg font-bold mb-4">Edit Transaction</h2>
            {/* form stays same — just styled */}
            <form className="space-y-4">
              <input className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              {/* ... other fields ... */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTxn(null)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
