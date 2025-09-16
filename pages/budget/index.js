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
  FaSpinner,
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

  // Loader states
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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
    setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this budget?")) return;
    setDeletingId(id);
    try {
      await authFetch(`/api/budgets/${id}`, { method: "DELETE" });
      fetchBudgets();
    } catch (err) {
      console.error("Error deleting budget:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (budget) => {
    const date = new Date(budget.period_month);
    const monthValue = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    setFormData({
      ...budget,
      period_month: monthValue,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-72 my-8">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <span className="ml-4 text-lg text-gray-600">Loading budgets...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-6 sm:mt-10 font-sans px-4 sm:px-6 lg:px-8">
      <title>Create/View Budget</title>

      {/* Top nav */}
      <div className="flex flex-wrap gap-4 sm:gap-6 mb-6 sm:mb-8 text-gray-600 text-sm sm:text-base font-medium">
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FaWallet className="text-blue-600" /> My Budgets
          </h1>
          {currentUser && (
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Managing budgets for:{" "}
              <span className="font-semibold text-gray-700">
                {currentUser.name}
              </span>
            </p>
          )}
        </div>
        <button
          onClick={handleNewBudget}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-md flex items-center justify-center gap-2 text-sm sm:text-base transition"
        >
          <FaPlus /> Add Budget
        </button>
      </div>

      {/* Budget Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-xl p-5 sm:p-6 mb-8 space-y-5 border border-gray-100"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {/* User */}
            <div className="bg-gray-50 border rounded-lg px-3 py-2.5 flex items-center gap-2 text-gray-600 text-sm sm:text-base">
              <FaUsers className="text-gray-400" />
              <span>{currentUser?.name || "Not logged in"}</span>
            </div>

            {/* Category */}
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2.5 w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Month */}
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
              <input
                type="month"
                name="period_month"
                value={formData.period_month}
                onChange={handleChange}
                required
                className="border rounded-lg px-3 py-2.5 w-full pl-10 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Limit */}
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
                className="border rounded-lg px-3 py-2.5 w-full pl-10 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Carryover */}
            <select
              name="carryover_policy"
              value={formData.carryover_policy}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2.5 w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="rollover">Rollover</option>
              <option value="cap">Cap</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className={`${
                saving
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg flex items-center gap-2 text-sm sm:text-base transition`}
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <FaCheck /> {formData.id ? "Update" : "Save"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              disabled={saving}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg flex items-center gap-2 text-sm sm:text-base transition"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      )}

      {/* Budgets List */}
      {budgets.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <p className="text-gray-500 text-base sm:text-lg mb-6">
            No budgets found.
          </p>
          <button
            onClick={handleNewBudget}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg flex items-center justify-center gap-2 shadow-md text-sm sm:text-base transition"
          >
            <FaPlus /> Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgets.map((b) => (
            <div
              key={b.id}
              className="bg-white shadow-md rounded-xl p-5 sm:p-6 hover:shadow-lg border border-gray-100 transition"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaWallet className="text-green-600" /> {b.category_name}
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">
                  {new Date(b.period_month).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              </div>

              <BudgetProgress
                id={b.id}
                month={b.period_month}
                key={`${b.id}-${b.period_month}`}
              />

              <p className="mt-4 text-sm sm:text-base text-gray-600">
                Limit:{" "}
                <strong className="text-gray-800">
                  ₹{parseFloat(b.limit_amount).toFixed(2)}
                </strong>{" "}
                | Policy:{" "}
                <span className="capitalize font-medium">
                  {b.carryover_policy}
                </span>
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => handleEdit(b)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  disabled={deletingId === b.id}
                  className={`${
                    deletingId === b.id
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base`}
                >
                  {deletingId === b.id ? (
                    <>
                      <FaSpinner className="animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash /> Delete
                    </>
                  )}
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
function BudgetProgress({ id, month }) {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    setProgress(null); // reset before fetching
    fetch(`/api/budgets/${id}/progress`)
      .then((res) => res.json())
      .then((data) => setProgress(data));
  }, [id, month]); // <-- watch both id & month

  if (!progress)
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <FaSpinner className="animate-spin" /> Loading...
      </div>
    );

  const percent = ((progress.spent / progress.limit_amount) * 100).toFixed(1);

  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`h-4 rounded-full transition-all duration-500 ${
            percent >= 90
              ? "bg-gradient-to-r from-red-500 to-red-700"
              : "bg-gradient-to-r from-green-500 to-green-700"
          }`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-2">
        Spent:{" "}
        <strong className="text-gray-800">
          ₹{parseFloat(progress.spent).toFixed(2)}
        </strong>{" "}
        / ₹{parseFloat(progress.limit_amount).toFixed(2)} ({percent}%)
      </p>
    </div>
  );
}
