import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaTrash,
  FaPlus,
  FaEdit,
  FaCheck,
  FaTimes,
  FaUsers,
  FaMoneyBill,
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

export default function MyGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [payerId, setPayerId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // For expanded group sections
  const [expandedGroupId, setExpandedGroupId] = useState(null);

  // Members state
  const [members, setMembers] = useState({});
  const [newMemberEmail, setNewMemberEmail] = useState("");

  // Expenses state
  const [expenses, setExpenses] = useState({});
  const [newExpense, setNewExpense] = useState({ description: "", amount: "" });

  // User search
  const [suggestions, setSuggestions] = useState([]);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/groups");
      if (!res.ok) throw new Error("Failed to fetch groups");
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setError("Failed to load groups. Please try again.");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (groupId) => {
    try {
      const [mRes, eRes] = await Promise.all([
        authFetch(`/api/groups/${groupId}/members`),
        authFetch(`/api/groups/${groupId}/expenses`),
      ]);
      if (!mRes.ok || !eRes.ok) throw new Error("Failed to fetch details");
      const [m, e] = await Promise.all([mRes.json(), eRes.json()]);
      setMembers((prev) => ({ ...prev, [groupId]: m }));
      setExpenses((prev) => ({ ...prev, [groupId]: e }));
    } catch (err) {
      console.error("Error fetching group details:", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setError("Please enter a group name.");
      return;
    }
    setCreatingGroup(true);
    setError(null);
    try {
      const createRes = await authFetch("/api/groups", {
        method: "POST",
        body: JSON.stringify({ name: newGroupName }),
      });
      if (!createRes.ok) throw new Error("Failed to create group");
      const newGroup = await createRes.json();
      setGroups((prev) => [...prev, newGroup]);
      setNewGroupName("");
    } catch (error) {
      console.error("Error creating group:", error);
      setError("Error creating group. Please try again.");
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    setDeletingId(groupId);
    const original = groups;
    setGroups(groups.filter((g) => g.id !== groupId));
    try {
      const res = await authFetch("/api/groups", {
        method: "DELETE",
        body: JSON.stringify({ group_id: groupId }),
      });
      if (!res.ok) throw new Error("Failed to delete group");
    } catch (err) {
      console.error("Error deleting group:", err);
      setError("Error deleting group. Please try again.");
      setGroups(original);
    } finally {
      setDeletingId(null);
    }
  };

  const startEditing = (group) => {
    setEditingId(group.id);
    setEditedName(group.group_name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedName("");
  };

  const handleUpdate = async (groupId) => {
    if (!editedName.trim()) {
      setError("Please enter a new group name.");
      return;
    }
    try {
      const res = await authFetch("/api/groups", {
        method: "PUT",
        body: JSON.stringify({ group_id: groupId, new_name: editedName }),
      });
      if (!res.ok) throw new Error("Failed to update group");
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, group_name: editedName } : g
        )
      );
      cancelEditing();
    } catch (err) {
      console.error("Error updating group:", err);
      setError("Error updating group. Please try again.");
    }
  };

  const handleAddMember = async (groupId) => {
    if (!selectedUser) {
      alert("Please select a user from suggestions.");
      return;
    }

    try {
      const res = await authFetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        body: JSON.stringify({ target_user_id: selectedUser.id }), // ✅ correct key
      });
      if (!res.ok) throw new Error("Failed to add member");

      setNewMemberEmail("");
      setSelectedUser(null); // reset after add
      fetchGroupDetails(groupId);
    } catch (err) {
      console.error("Error adding member:", err);
    }
  };

  const handleAddExpense = async (groupId) => {
    if (!newExpense.description || !newExpense.amount || !payerId) {
      alert("Please fill description, amount, and select who paid.");
      return;
    }

    const groupMembers = members[groupId] || [];
    const amount = parseFloat(newExpense.amount);
    const perMember = amount / groupMembers.length;

    const splitDetails = groupMembers.map((m) => ({
      user_id: m.id,
      share_amount: perMember,
    }));

    try {
      await authFetch(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        body: JSON.stringify({
          paid_by: payerId, // ✅ selected payer
          amount,
          description: newExpense.description,
          split_type: "equal",
          split_details: splitDetails,
        }),
      });
      setNewExpense({ description: "", amount: "" });
      setPayerId(null); // ✅ reset after submit
      fetchGroupDetails(groupId);
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const toggleExpand = (groupId) => {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
    } else {
      setExpandedGroupId(groupId);
      fetchGroupDetails(groupId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 font-sans p-4">
      <div className="flex gap-4 mb-6">
        <Link href="/">
          <span className="text-blue-600 hover:underline">Home</span>
        </Link>
        <Link href="/transactions">
          <span className="text-blue-600 hover:underline">Transactions</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Groups</h1>

      <div className="flex mb-8">
        <input
          type="text"
          placeholder="Enter new group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={creatingGroup}
        />
        <button
          onClick={handleCreateGroup}
          className="bg-blue-600 text-white px-5 rounded-r-md hover:bg-blue-700 transition flex items-center gap-2"
          disabled={creatingGroup}
        >
          {creatingGroup ? "Creating..." : "Create Group"}
          <FaPlus />
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : groups.length === 0 ? (
        <p className="text-gray-600">You are not a member of any groups.</p>
      ) : (
        <ul className="space-y-4">
          {groups.map((g) => (
            <li key={g.id} className="border rounded p-4 bg-gray-50 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  {editingId === g.id ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleUpdate(g.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleExpand(g.id)}
                        className="text-lg font-semibold text-blue-600 hover:underline"
                      >
                        {g.group_name}
                      </button>
                      <p className="text-sm text-gray-600">
                        Owner: {g.owner_name}
                      </p>
                    </>
                  )}
                </div>

                {editingId !== g.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(g)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                      Edit <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
                      disabled={deletingId === g.id}
                    >
                      {deletingId === g.id ? "Deleting..." : "Delete"}
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>

              {expandedGroupId === g.id && (
                <div className="mt-4 space-y-6">
                  {/* Members Section */}
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FaUsers /> Members
                    </h3>
                    <ul className="space-y-1 mb-2">
                      {(members[g.id] || []).map((m) => (
                        <li
                          key={m.id}
                          className="p-2 border rounded bg-white text-sm flex justify-between items-center"
                        >
                          <span>
                            {m.name} ({m.email})
                          </span>
                          {m.role !== "admin" && ( // ✅ Don't allow removing owner/admin
                            <button
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    `Remove ${m.name} from this group?`
                                  )
                                )
                                  return;
                                try {
                                  await authFetch(
                                    `/api/groups/${g.id}/members`,
                                    {
                                      method: "DELETE",
                                      body: JSON.stringify({ member_id: m.id }),
                                    }
                                  );
                                  fetchGroupDetails(g.id); // refresh members list
                                } catch (err) {
                                  console.error("Error removing member:", err);
                                }
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>

                    {/* Add Member Input */}
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
                              const res = await authFetch(
                                `/api/users/search?q=${val}`
                              );
                              if (res.ok) {
                                const data = await res.json();
                                setSuggestions(data);
                              }
                            } catch (err) {
                              console.error("Error fetching suggestions:", err);
                            }
                          } else {
                            setSuggestions([]);
                          }
                        }}
                        className="px-2 py-1 border rounded w-full"
                      />

                      {/* Suggestions Dropdown */}
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
                      onClick={() => handleAddMember(g.id)}
                      className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Add
                    </button>
                  </div>

                  {/* Expenses Section */}
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FaMoneyBill /> Expenses
                    </h3>
                    <ul className="space-y-1 mb-2">
                      {(expenses[g.id] || []).map((ex) => (
                        <li
                          key={ex.id}
                          className="p-2 border rounded bg-white text-sm"
                        >
                          {ex.description} — ₹{ex.amount} (paid by{" "}
                          {ex.paid_by_name})
                        </li>
                      ))}
                    </ul>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Description"
                        value={newExpense.description}
                        onChange={(e) =>
                          setNewExpense({
                            ...newExpense,
                            description: e.target.value,
                          })
                        }
                        className="px-2 py-1 border rounded"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={newExpense.amount}
                        onChange={(e) =>
                          setNewExpense({
                            ...newExpense,
                            amount: e.target.value,
                          })
                        }
                        className="px-2 py-1 border rounded"
                      />

                      {/* ✅ Payer dropdown */}
                      <select
                        value={payerId || ""}
                        onChange={(e) => setPayerId(e.target.value)}
                        className="px-2 py-1 border rounded"
                      >
                        <option value="">Who Paid?</option>
                        {(members[g.id] || []).map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.email})
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleAddExpense(g.id)}
                        className="bg-green-600 text-white px-3 rounded"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
