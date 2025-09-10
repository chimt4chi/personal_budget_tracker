import Link from "next/link";
import { useEffect, useState } from "react";

// Helper: fetch with Authorization header from localStorage
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
  const [loading, setLoading] = useState(true);

  // Fetch groups on mount
  useEffect(() => {
    setLoading(true);
    authFetch("/api/groups/my-groups")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch groups");
        return res.json();
      })
      .then((data) => {
        setGroups(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setGroups([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Create a new group and add current user as admin member
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const created_by = user.id;

    setLoading(true);
    try {
      // Create group
      const createRes = await authFetch("/api/groups", {
        method: "POST",
        body: JSON.stringify({
          name: newGroupName,
        }),
      });

      if (!createRes.ok) throw new Error("Failed to create group");

      const { id: newGroupId } = await createRes.json();

      // Add current user as admin member
      await authFetch(`/api/groups/${newGroupId}/members`, {
        method: "POST",
        body: JSON.stringify({ role: "admin" }), // user_id inferred from auth middleware
      });

      setNewGroupName("");

      // Refresh groups
      const listRes = await authFetch("/api/groups/my-groups");
      const updatedGroups = await listRes.json();
      setGroups(Array.isArray(updatedGroups) ? updatedGroups : []);
    } catch (error) {
      alert("Error creating group");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Delete group (only if current user is owner/admin, add permission handling as needed)
  const handleDelete = async (groupId) => {
    if (!confirm("Are you sure you want to delete this group?")) return;

    setLoading(true);
    try {
      const res = await authFetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete group");

      setGroups(groups.filter((g) => g.id !== groupId));
    } catch (err) {
      alert("Error deleting group");
      console.error(err);
    } finally {
      setLoading(false);
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
        />
        <button
          onClick={handleCreateGroup}
          className="bg-blue-600 text-white px-5 rounded-r-md hover:bg-blue-700 transition"
          disabled={loading}
        >
          Create Group
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : groups.length === 0 ? (
        <p className="text-gray-600">You are not a member of any groups.</p>
      ) : (
        <ul className="space-y-4">
          {groups.map(({ id, name, owner_name }) => (
            <li
              key={id}
              className="border rounded p-4 flex justify-between items-center bg-gray-50 shadow-sm"
            >
              <div>
                <span
                  href={`/groups/${id}`}
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {name}
                </span>
                <p className="text-sm text-gray-600">Owner: {owner_name}</p>
              </div>

              <button
                onClick={() => handleDelete(id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                disabled={loading}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
