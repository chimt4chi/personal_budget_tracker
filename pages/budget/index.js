import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [users, setUsers] = useState([]);
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

  // Fetch all budgets
  const fetchBudgets = async () => {
    try {
      const res = await authFetch("/api/budgets");
      const data = await res.json();
      setBudgets(data);
    } catch (err) {
      console.error("Error fetching budgets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();

    // Fetch categories
    authFetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []));

    // Fetch users
    authFetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []));
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create or Update budget
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formData.id) {
        // Update
        await authFetch(`/api/budgets/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        // Create
        await authFetch("/api/budgets", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }

      setShowForm(false);
      setFormData({
        id: null,
        user_id: "",
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

  // Delete budget
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;

    try {
      await authFetch(`/api/budgets/${id}`, { method: "DELETE" });
      fetchBudgets();
    } catch (err) {
      console.error("Error deleting budget:", err);
    }
  };

  // Edit budget
  const handleEdit = (budget) => {
    setFormData({
      ...budget,
      period_month: budget.period_month.slice(0, 7), // keep only YYYY-MM
    });
    setShowForm(true);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 font-sans p-4">
      <div className="flex gap-4 mb-6">
        <Link className="text-blue-600 hover:underline" href={"/"}>
          Home
        </Link>
        <Link className="text-blue-600 hover:underline" href={"/transactions"}>
          transactions
        </Link>
        <Link className="text-blue-600 hover:underline" href={"/groups"}>
          Groups
        </Link>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Budgets</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          ➕ Add Budget
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 mb-6 space-y-4"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* User Dropdown */}
            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">Select User</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            {/* Category Dropdown */}
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

            <input
              type="month"
              name="period_month"
              value={formData.period_month}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full"
            />
            <input
              type="number"
              name="limit_amount"
              placeholder="Limit Amount"
              value={formData.limit_amount}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 w-full"
            />
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

          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              {formData.id ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : budgets.length === 0 ? (
        <p className="text-gray-500">No budgets found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 border">#</th>
                {/* <th className="px-4 py-3 border">User</th> */}
                <th className="px-4 py-3 border">Category</th>
                <th className="px-4 py-3 border">Period</th>
                <th className="px-4 py-3 border">Limit</th>
                <th className="px-4 py-3 border">Policy</th>
                <th className="px-4 py-3 border">Progress</th>
                <th className="px-4 py-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b, i) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border">{i + 1}</td>
                  {/* <td className="px-4 py-3 border">{b.user_name}</td> */}
                  <td className="px-4 py-3 border">{b.category_name}</td>
                  <td className="px-4 py-3 border">
                    {new Date(b.period_month).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </td>
                  <td className="px-4 py-3 border">{b.limit_amount}</td>
                  <td className="px-4 py-3 border">{b.carryover_policy}</td>
                  <td className="px-4 py-3 border">
                    <BudgetProgress id={b.id} />
                  </td>
                  <td className="px-4 py-3 border space-x-2">
                    <button
                      onClick={() => handleEdit(b)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Budget progress sub-component
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
    <div className="w-40">
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full ${
            percent > 100 ? "bg-red-600" : "bg-green-600"
          }`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-600 mt-1">
        {progress.spent} / {progress.limit_amount}
      </p>
    </div>
  );
}
