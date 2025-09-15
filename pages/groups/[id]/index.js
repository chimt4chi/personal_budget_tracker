import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  FaPlus,
  FaTrash,
  FaMoneyBill,
  FaUsers,
  FaBalanceScale,
  FaHandshake,
} from "react-icons/fa";

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

export default function GroupDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [activeTab, setActiveTab] = useState("members");
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // form states
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    paid_by: "",
  });
  const [newSettlement, setNewSettlement] = useState({ to: "", amount: "" });

  const fetchData = async () => {
    if (!id) return;

    try {
      const [m, e, b, s] = await Promise.all([
        authFetch(`/api/groups/${id}/members`).then((r) => r.json()),
        authFetch(`/api/groups/${id}/expenses`).then((r) => r.json()),
        authFetch(`/api/groups/${id}/balances`).then((r) => r.json()),
        authFetch(`/api/groups/${id}/settlements`).then((r) => r.json()),
      ]);
      setMembers(m);
      setExpenses(e);
      setBalances(b);
      setSettlements(s);

      const me = await authFetch("/api/me").then((r) => r.json());
      setCurrentUser(me);
    } catch (err) {
      console.error("Error loading group data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddMember = async () => {
    if (!selectedUser) return alert("Please select a user from suggestions");
    try {
      await authFetch(`/api/groups/${id}/members`, {
        method: "POST",
        body: JSON.stringify({ target_user_id: selectedUser.id }),
      });
      setNewMemberEmail("");
      setSelectedUser(null);
      fetchData();
    } catch (err) {
      console.error("Error adding member:", err);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await authFetch(`/api/groups/${id}/members`, {
        method: "DELETE",
        body: JSON.stringify({ member_id: memberId }),
      });
      fetchData();
    } catch (err) {
      console.error("Error removing member:", err);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.paid_by) {
      return alert("Please fill all fields");
    }
    try {
      await authFetch(`/api/groups/${id}/expenses`, {
        method: "POST",
        body: JSON.stringify({
          paid_by: parseInt(newExpense.paid_by),
          amount: parseFloat(newExpense.amount),
          description: newExpense.description,
          split_type: "equal",
          split_details: members.map((m) => ({
            user_id: m.id,
            share_amount: parseFloat(newExpense.amount) / members.length,
          })),
        }),
      });
      setNewExpense({ description: "", amount: "", paid_by: "" });
      fetchData();
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const handleAddSettlement = async () => {
    if (!newSettlement.to || !newSettlement.amount || !currentUser) return;
    try {
      await authFetch(`/api/groups/${id}/settlements`, {
        method: "POST",
        body: JSON.stringify({
          from_user_id: currentUser.id,
          to_user_id: parseInt(newSettlement.to),
          amount: parseFloat(newSettlement.amount),
        }),
      });
      setNewSettlement({ to: "", amount: "" });
      fetchData();
    } catch (err) {
      console.error("Error adding settlement:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 font-sans p-6">
      <title>Group {}</title>
      {/* Back Nav */}
      <div className="mb-6">
        <Link
          href="/groups"
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          ← Back to Groups
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Group Details</h1>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b">
        {[
          { key: "members", label: "Members", icon: <FaUsers /> },
          { key: "expenses", label: "Expenses", icon: <FaMoneyBill /> },
          { key: "balances", label: "Balances", icon: <FaBalanceScale /> },
          { key: "settlements", label: "Settlements", icon: <FaHandshake /> },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 flex items-center gap-2 font-medium transition ${
              activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Members */}
      {activeTab === "members" && (
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaUsers className="text-blue-600" /> Group Members
          </h2>
          <ul className="space-y-3 mb-6">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
              >
                <span>
                  {m.name} <span className="text-gray-500">({m.email})</span>
                </span>
                {m.role !== "admin" && (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                  >
                    <FaTrash /> Remove
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Add Member */}
          <div className="relative">
            <input
              type="email"
              placeholder="Enter member email"
              value={newMemberEmail}
              onChange={async (e) => {
                const val = e.target.value;
                setNewMemberEmail(val);
                if (val.length >= 2) {
                  try {
                    const res = await authFetch(`/api/users/search?q=${val}`);
                    if (res.ok) setSuggestions(await res.json());
                  } catch (err) {
                    console.error("Error fetching suggestions:", err);
                  }
                } else setSuggestions([]);
              }}
              className="px-3 py-2 border rounded w-full focus:ring-2 focus:ring-blue-500"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border w-full rounded mt-1 shadow">
                {suggestions.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => {
                      setNewMemberEmail(s.email);
                      setSelectedUser(s);
                      setSuggestions([]);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {s.name} ({s.email})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={handleAddMember}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add Member
          </button>
        </div>
      )}

      {/* Expenses */}
      {activeTab === "expenses" && (
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaMoneyBill className="text-green-600" /> Expenses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
            <input
              type="text"
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
              className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: e.target.value })
              }
              className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newExpense.paid_by}
              onChange={(e) =>
                setNewExpense({ ...newExpense, paid_by: e.target.value })
              }
              className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Who Paid?</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddExpense}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaPlus /> Add Expense
            </button>
          </div>
          <ul className="space-y-3">
            {expenses.map((ex) => (
              <li
                key={ex.id}
                className="p-3 border rounded-lg bg-gray-50 flex justify-between"
              >
                <span>
                  {ex.description} —{" "}
                  <span className="font-semibold">₹{ex.amount}</span>
                </span>
                <span className="text-gray-600">Paid by {ex.paid_by_name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Balances */}
      {activeTab === "balances" && (
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaBalanceScale className="text-purple-600" /> Balances
          </h2>
          <ul className="space-y-3 mb-6">
            {balances.balances?.map((b) => {
              const member = members.find((m) => m.id === b.user_id);
              return (
                <li
                  key={b.user_id}
                  className="p-3 border rounded-lg bg-gray-50 flex justify-between"
                >
                  <span>{member?.name || "Unknown"}</span>
                  <span className="font-medium">
                    {b.balance > 0
                      ? `should receive ₹${b.balance}`
                      : b.balance < 0
                      ? `owes ₹${Math.abs(b.balance)}`
                      : "is settled"}
                  </span>
                </li>
              );
            })}
          </ul>

          <h2 className="text-lg font-semibold mb-4">Suggested Settlements</h2>
          <ul className="space-y-3">
            {balances.suggestions?.length === 0 ? (
              <p className="text-gray-500">All settled 🎉</p>
            ) : (
              balances.suggestions.map((s, i) => {
                const from = members.find((m) => m.id === s.from_user_id);
                const to = members.find((m) => m.id === s.to_user_id);
                return (
                  <li
                    key={i}
                    className="p-3 border rounded-lg bg-green-50 flex justify-between"
                  >
                    <span>
                      {from?.name} ➝ {to?.name}
                    </span>
                    <span className="font-semibold">₹{s.amount}</span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* Settlements */}
      {activeTab === "settlements" && (
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaHandshake className="text-orange-600" /> Record Settlement
          </h2>
          <div className="flex gap-3 mb-6">
            <select
              value={newSettlement.to}
              onChange={(e) =>
                setNewSettlement({ ...newSettlement, to: e.target.value })
              }
              className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select member</option>
              {members
                .filter((m) => m.id !== currentUser?.id)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={newSettlement.amount}
              onChange={(e) =>
                setNewSettlement({ ...newSettlement, amount: e.target.value })
              }
              className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddSettlement}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Settle
            </button>
          </div>

          <h2 className="text-lg font-semibold mb-4">Past Settlements</h2>
          <ul className="space-y-3">
            {settlements.map((s) => (
              <li
                key={s.id}
                className="p-3 border rounded-lg bg-gray-50 flex justify-between"
              >
                <span>
                  {s.from_user} ➝ {s.to_user}
                </span>
                <span className="font-semibold">₹{s.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
