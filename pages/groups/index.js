import Link from "next/link";
import {
  FaSpinner,
  FaTrash,
  FaPlus,
  FaEdit,
  FaCheck,
  FaTimes,
  FaUsers,
  FaHome,
  FaWallet,
  FaListUl,
} from "react-icons/fa";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const userObj = JSON.parse(userString);
        setUserId(userObj.id);
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

  // create group
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setError("Please enter a group name.");
      return;
    }
    setCreatingGroup(true);
    setError(null);
    try {
      const res = await authFetch("/api/groups", {
        method: "POST",
        body: JSON.stringify({ name: newGroupName }),
      });
      if (!res.ok) throw new Error("Failed to create group");
      const newGroup = await res.json();

      // If owner_name is not returned from API, we set it manually
      const userString = localStorage.getItem("user");
      let ownerName = "You";
      let ownerId = userId;
      if (userString) {
        try {
          const userObj = JSON.parse(userString);
          ownerName = userObj.name || "You";
          ownerId = userObj.id;
        } catch {}
      }

      setGroups((prev) => [
        ...prev,
        { ...newGroup, owner_name: ownerName, owner_id: ownerId },
      ]);
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
      if (!res.ok) throw new Error("Failed to delete group");
      fetchGroups();
    } catch (err) {
      console.error("Error deleting group:", err);
      setGroups(original);
      setError("Error deleting group. Please try again.");
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

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    setLeavingId(groupId);
    const originalGroups = groups;
    setGroups(groups.filter((g) => g.id !== groupId));
    setError(null);
    try {
      const res = await authFetch("/api/groups/leave", {
        method: "DELETE",
        body: JSON.stringify({ group_id: groupId }),
      });
      if (!res.ok) throw new Error("Failed to leave group");
      fetchGroups();
    } catch (err) {
      console.error("Error leaving group:", err);
      setError("Failed to leave group. Please try again.");
      setGroups(originalGroups);
    } finally {
      setLeavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-72 my-8">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <span className="ml-4 text-lg text-gray-600">Loading groups...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 sm:mt-12 font-sans px-4 sm:px-6">
      <title>Groups</title>

      {/* Top Nav */}
      <div className="flex gap-4 sm:gap-6 mb-6 sm:mb-8 text-gray-600 text-sm sm:text-base font-medium">
        <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
          <FaHome /> Home
        </Link>
        <Link
          href="/transactions"
          className="hover:text-blue-600 flex items-center gap-1"
        >
          <FaListUl /> Transactions
        </Link>
        <Link
          href="/budget"
          className="hover:text-blue-600 flex items-center gap-1"
        >
          <FaWallet /> Budget
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FaUsers className="text-blue-600" /> My Groups
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-md flex items-center gap-2 text-sm sm:text-base transition"
        >
          <FaPlus /> {showForm ? "Close" : "New Group"}
        </button>
      </div>

      {/* New Group Form */}
      {showForm && (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="flex-grow border rounded-lg px-3 py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
              disabled={creatingGroup}
            />
            <button
              onClick={handleCreateGroup}
              disabled={creatingGroup}
              className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg flex items-center gap-2 text-sm sm:text-base transition"
            >
              {creatingGroup ? "Creating..." : "Save"} <FaCheck />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 mb-6 text-sm sm:text-base">{error}</p>
      )}

      {/* Groups List */}
      {groups.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <p className="text-gray-500 text-base sm:text-lg mb-6">
            You are not a member of any groups.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md flex items-center gap-2 text-sm sm:text-base transition"
          >
            <FaPlus /> Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {groups.map((g) => (
            <div
              key={g.id}
              className="bg-white border border-gray-100 rounded-xl shadow-md hover:shadow-lg transition p-5 sm:p-6 flex flex-col justify-between"
            >
              {editingId === g.id ? (
                <div className="flex gap-2 items-center mb-4">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-grow px-3 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleUpdate(g.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center"
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded-lg flex items-center justify-center"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href={`/groups/${g.id}`}
                    className="text-base sm:text-lg font-semibold text-blue-600 hover:underline"
                  >
                    {g.group_name}
                  </Link>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Owner:{" "}
                    <span className="font-medium text-gray-700">
                      {g.owner_name}
                    </span>
                  </p>
                </>
              )}

              {editingId !== g.id && (
                <div className="flex flex-wrap gap-2 mt-5">
                  <button
                    onClick={() => startEditing(g)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base transition"
                  >
                    <FaEdit /> Edit
                  </button>
                  {userId === g.owner_id ? (
                    <button
                      onClick={() => handleDelete(g.id)}
                      disabled={deletingId === g.id}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base transition disabled:opacity-50"
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
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base transition disabled:opacity-50"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base transition"
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
