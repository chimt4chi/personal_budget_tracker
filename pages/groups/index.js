import Link from "next/link";
import { useEffect, useState } from "react";
import { FaTrash, FaPlus, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

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

  return (
    <div className="max-w-4xl mx-auto mt-10 font-sans p-4">
      <div className="flex gap-4 mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          Home
        </Link>
        <Link href="/transactions" className="text-blue-600 hover:underline">
          Transactions
        </Link>
        <Link href="/budget" className="text-blue-600 hover:underline">
          Budget
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
            <li
              key={g.id}
              className="border rounded p-4 bg-gray-50 shadow-sm flex justify-between items-center"
            >
              <div>
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
                    {/* Group Name → opens dedicated page */}
                    <Link
                      href={`/groups/${g.id}`}
                      className="text-lg font-semibold text-blue-600 hover:underline"
                    >
                      {g.group_name}
                    </Link>
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
                  {/* Explicit "View Details" button */}
                  <Link
                    href={`/groups/${g.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    View Details
                  </Link>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
