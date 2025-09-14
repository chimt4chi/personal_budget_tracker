import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaTrash,
  FaPlus,
  FaEdit,
  FaCheck,
  FaTimes,
  FaUsers,
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
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState(null);
  const [leavingId, setLeavingId] = useState(null);

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;

    setLeavingId(groupId);
    const originalGroups = groups;

    // Optimistic UI update — remove group immediately
    setGroups(groups.filter((g) => g.id !== groupId));
    setError(null);

    try {
      const res = await authFetch("/api/groups/leave", {
        method: "DELETE",
        body: JSON.stringify({ group_id: groupId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message =
          errorData?.error || "Failed to leave group. Please try again.";
        throw new Error(message);
      }

      // Optionally, refetch groups to stay synced
      fetchGroups();
    } catch (err) {
      console.error("Error leaving group:", err);
      setError(err.message);
      setGroups(originalGroups); // Roll back removal on error
    } finally {
      setLeavingId(null);
    }
  };

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const userObj = JSON.parse(userString);
        setUserId(userObj.id); // Assuming id is a number
      } catch {
        setUserId(null);
      }
    }
  }, []);

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
      setShowForm(false);
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

      if (!res.ok) {
        let message = "Failed to delete group. Please try again.";
        try {
          const errorData = await res.json();
          if (errorData?.error) {
            message = errorData.error;
          }
        } catch (jsonErr) {
          console.warn("Could not parse JSON error response", jsonErr);
        }

        // Don’t throw here. Just update error state.
        setGroups(original); // Roll back UI
        setError(message);
        return;
      }

      // Success: refetch if needed
      fetchGroups();
    } catch (err) {
      console.error("Unexpected error deleting group:", err);
      setGroups(original); // Roll back UI
      setError("Unexpected error deleting group. Please try again.");
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
    <div className="max-w-5xl mx-auto mt-10 font-sans p-4">
      {/* Top Nav */}
      <div className="flex gap-6 mb-6">
        <Link href="/" className="hover:text-blue-600 text-gray-700">
          Home
        </Link>
        <Link
          href="/transactions"
          className="hover:text-blue-600 text-gray-700"
        >
          Transactions
        </Link>
        <Link href="/budget" className="hover:text-blue-600 text-gray-700">
          Budget
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaUsers className="text-blue-600" /> My Groups
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow"
        >
          <FaPlus /> {showForm ? "Close" : "New Group"}
        </button>
      </div>

      {/* New Group Form */}
      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-6 animate-fadeIn">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="flex-grow border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              disabled={creatingGroup}
            />
            <button
              onClick={handleCreateGroup}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              disabled={creatingGroup}
            >
              {creatingGroup ? "Creating..." : "Save"} <FaCheck />
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Groups List */}
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : groups.length === 0 ? (
        <p className="text-gray-600">You are not a member of any groups.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {groups.map((g) => (
            <div
              key={g.id}
              className="bg-white border rounded-lg shadow hover:shadow-lg transition p-5 flex flex-col justify-between"
            >
              {editingId === g.id ? (
                <div className="flex gap-2 items-center mb-3">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-grow px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleUpdate(g.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href={`/groups/${g.id}`}
                    className="text-xl font-semibold text-blue-600 hover:underline"
                  >
                    {g.group_name}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    Owner: {g.owner_name}
                  </p>
                </>
              )}

              {editingId !== g.id && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => startEditing(g)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center gap-2"
                  >
                    <FaEdit /> Edit
                  </button>
                  {userId === g.owner_id ? (
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-2"
                      disabled={deletingId === g.id}
                    >
                      {deletingId === g.id ? (
                        "Deleting..."
                      ) : (
                        <>
                          <FaTrash /> Delete
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLeaveGroup(g.id)}
                      disabled={leavingId === g.id}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-2"
                    >
                      {leavingId === g.id ? (
                        "Leaving..."
                      ) : (
                        <>
                          <FaTimes /> Leave
                        </>
                      )}
                    </button>
                  )}

                  <Link
                    href={`/groups/${g.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-2"
                  >
                    View
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
