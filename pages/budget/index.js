import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaHome,
  FaListUl,
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaWallet,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

// DRY utility: fetch with Authorization header from localStorage
function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

export default function BudgetsPage() {
  const [categories, setCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    user_id: "",
    category_id: "",
    period_month: "",
    limit_amount: "",
    carryover_policy: "none",
  });

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const fetchBudgets = async () => {
    try {
      const res = await authFetch("/api/budgets");
      const data = await res.json();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching budgets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    fetchBudgets();

    authFetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (currentUser && !formData.id) {
      setFormData((prev) => ({ ...prev, user_id: currentUser.id }));
    }
  }, [currentUser]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData, user_id: currentUser.id };
      if (formData.id) {
        await authFetch(`/api/budgets/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(submitData),
        });
      } else {
        await authFetch("/api/budgets", {
          method: "POST",
          body: JSON.stringify(submitData),
        });
      }

      setShowForm(false);
      setFormData({
        id: null,
        user_id: currentUser?.id || "",
        category_id: "",
        period_month: "",
        limit_amount: "",
        carryover_policy: "none",
      });
      fetchBudgets();
    } catch (err) {
      console.error("Error saving budget:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this budget?")) return;
    try {
      await authFetch(`/api/budgets/${id}`, { method: "DELETE" });
      fetchBudgets();
    } catch (err) {
      console.error("Error deleting budget:", err);
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      ...budget,
      period_month: budget.period_month.slice(0, 7),
    });
    setShowForm(true);
  };

  const handleNewBudget = () => {
    setFormData({
      id: null,
      user_id: currentUser?.id || "",
      category_id: "",
      period_month: "",
      limit_amount: "",
      carryover_policy: "none",
    });
    setShowForm(true);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 font-sans px-4">
      {/* Top nav */}
      <div className="flex gap-6 mb-6 text-gray-700">
        <Link
          className="hover:text-blue-600 flex items-center gap-2"
          href={"/"}
        >
          <FaHome /> Home
        </Link>
        <Link
          className="hover:text-blue-600 flex items-center gap-2"
          href={"/transactions"}
        >
          <FaListUl /> Transactions
        </Link>
        <Link
          className="hover:text-blue-600 flex items-center gap-2"
          href={"/groups"}
        >
          <FaUsers /> Groups
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaWallet className="text-blue-600" /> My Budgets
          </h1>
          {currentUser && (
            <p className="text-sm text-gray-600 mt-1">
              Managing budgets for:{" "}
              <span className="font-medium">{currentUser.name}</span>
            </p>
          )}
        </div>
        <button
          onClick={handleNewBudget}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2"
        >
          <FaPlus /> Add Budget
        </button>
      </div>

      {/* Budget Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-6 mb-8 space-y-4 animate-fadeIn"
        >
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 border rounded-lg px-3 py-2 flex items-center gap-2">
              <FaUsers className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {currentUser?.name || "Not logged in"}
              </span>
            </div>

            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
              <input
                type="month"
                name="period_month"
                value={formData.period_month}
                onChange={handleChange}
                required
                className="border rounded-lg px-3 py-2 w-full pl-10"
              />
            </div>

            <div className="relative">
              <FaMoneyBillWave className="absolute left-3 top-3 text-gray-400" />
              <input
                type="number"
                step="0.01"
                name="limit_amount"
                placeholder="Limit Amount"
                value={formData.limit_amount}
                onChange={handleChange}
                required
                className="border rounded-lg px-3 py-2 w-full pl-10"
              />
            </div>

            <select
              name="carryover_policy"
              value={formData.carryover_policy}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="none">None</option>
              <option value="rollover">Rollover</option>
              <option value="cap">Cap</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaCheck /> {formData.id ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      )}

      {/* Budgets List */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No budgets found.</p>
          <button
            onClick={handleNewBudget}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {budgets.map((b) => (
            <div
              key={b.id}
              className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FaWallet className="text-green-600" /> {b.category_name}
                </h2>
                <span className="text-sm text-gray-500">
                  {new Date(b.period_month).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              </div>

              <BudgetProgress id={b.id} />

              <p className="mt-3 text-sm text-gray-600">
                Limit: <strong>₹{parseFloat(b.limit_amount).toFixed(2)}</strong>{" "}
                | Policy:{" "}
                <span className="capitalize">{b.carryover_policy}</span>
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(b)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Progress bar
function BudgetProgress({ id }) {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    fetch(`/api/budgets/${id}/progress`)
      .then((res) => res.json())
      .then((data) => setProgress(data));
  }, [id]);

  if (!progress) return <span className="text-gray-400">Loading...</span>;

  const percent = ((progress.spent / progress.limit_amount) * 100).toFixed(1);

  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${
            percent > 100
              ? "bg-gradient-to-r from-red-500 to-red-700"
              : "bg-gradient-to-r from-green-500 to-green-700"
          }`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-2">
        Spent: <strong>₹{parseFloat(progress.spent).toFixed(2)}</strong> / ₹
        {parseFloat(progress.limit_amount).toFixed(2)} ({percent}%)
      </p>
    </div>
  );
}
