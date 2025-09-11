import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  FaPlus,
  FaTrash,
  FaMoneyBill,
  FaUsers,
  FaBalanceScale,
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

  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newExpense, setNewExpense] = useState({ description: "", amount: "" });
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
    } catch (err) {
      console.error("Error loading group data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount) return;
    try {
      await authFetch(`/api/groups/${id}/expenses`, {
        method: "POST",
        body: JSON.stringify({
          paid_by: members[0]?.id, // for demo, use first member
          amount: parseFloat(newExpense.amount),
          description: newExpense.description,
          split_type: "equal",
          split_details: members.map((m) => ({
            user_id: m.id,
            share_amount: parseFloat(newExpense.amount) / members.length,
          })),
        }),
      });
      setNewExpense({ description: "", amount: "" });
      fetchData();
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const handleAddSettlement = async () => {
    if (!newSettlement.to || !newSettlement.amount) return;
    try {
      await authFetch(`/api/groups/${id}/settlements`, {
        method: "POST",
        body: JSON.stringify({
          from_user_id: members[0]?.id, // demo: first member paying
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
    <div className="max-w-4xl mx-auto mt-10 font-sans p-4">
      <div className="flex gap-4 mb-6">
        <Link href="/groups">
          <span className="text-blue-600 hover:underline">
            ← Back to Groups
          </span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-gray-800">Group Details</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          className={`px-4 py-2 ${
            activeTab === "members"
              ? "border-b-2 border-blue-600 text-blue-600"
              : ""
          }`}
          onClick={() => setActiveTab("members")}
        >
          <FaUsers className="inline mr-2" /> Members
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "expenses"
              ? "border-b-2 border-blue-600 text-blue-600"
              : ""
          }`}
          onClick={() => setActiveTab("expenses")}
        >
          <FaMoneyBill className="inline mr-2" /> Expenses
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "balances"
              ? "border-b-2 border-blue-600 text-blue-600"
              : ""
          }`}
          onClick={() => setActiveTab("balances")}
        >
          <FaBalanceScale className="inline mr-2" /> Balances
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "settlements"
              ? "border-b-2 border-blue-600 text-blue-600"
              : ""
          }`}
          onClick={() => setActiveTab("settlements")}
        >
          🤝 Settlements
        </button>
      </div>

      {/* Members Tab */}
      {activeTab === "members" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Group Members</h2>
          <ul className="space-y-2">
            {members.map((m) => (
              <li key={m.id} className="p-2 border rounded bg-gray-50">
                {m.name} ({m.email})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === "expenses" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Expenses</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
              className="px-2 py-1 border rounded"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: e.target.value })
              }
              className="px-2 py-1 border rounded"
            />
            <button
              onClick={handleAddExpense}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded flex items-center gap-2"
            >
              Add <FaPlus />
            </button>
          </div>
          <ul className="space-y-2">
            {expenses.map((ex) => (
              <li key={ex.id} className="p-2 border rounded bg-gray-50">
                {ex.description} — ₹{ex.amount} (paid by {ex.paid_by_name})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Balances Tab */}
      {activeTab === "balances" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Balances</h2>
          <ul className="space-y-2 mb-4">
            {balances.balances?.map((b) => {
              const member = members.find((m) => m.id === b.user_id);
              return (
                <li key={b.user_id} className="p-2 border rounded bg-gray-50">
                  {member?.name || "Unknown"}{" "}
                  {b.balance > 0
                    ? `should receive ₹${b.balance}`
                    : b.balance < 0
                    ? `owes ₹${Math.abs(b.balance)}`
                    : "is settled"}
                </li>
              );
            })}
          </ul>

          <h2 className="text-lg font-semibold mb-2">Suggested Settlements</h2>
          <ul className="space-y-2">
            {balances.suggestions?.length === 0 ? (
              <p className="text-gray-600">All settled 🎉</p>
            ) : (
              balances.suggestions.map((s, i) => {
                const from = members.find((m) => m.id === s.from_user_id);
                const to = members.find((m) => m.id === s.to_user_id);
                return (
                  <li key={i} className="p-2 border rounded bg-green-50">
                    {from?.name} should pay {to?.name} ₹{s.amount}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* Settlements Tab */}
      {activeTab === "settlements" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Record Settlement</h2>
          <div className="flex gap-2 mb-4">
            <select
              value={newSettlement.to}
              onChange={(e) =>
                setNewSettlement({ ...newSettlement, to: e.target.value })
              }
              className="px-2 py-1 border rounded"
            >
              <option value="">Select member</option>
              {members.map((m) => (
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
              className="px-2 py-1 border rounded"
            />
            <button
              onClick={handleAddSettlement}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
            >
              Settle
            </button>
          </div>
          <h2 className="text-lg font-semibold mb-2">Past Settlements</h2>
          <ul className="space-y-2">
            {settlements.map((s) => (
              <li key={s.id} className="p-2 border rounded bg-gray-50">
                {s.from_user} paid {s.to_user} ₹{s.amount}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
