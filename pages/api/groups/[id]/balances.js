// /pages/api/groups/[id]/balances.js
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

const EPSILON = 0.01; // small tolerance for floating point errors

async function handler(req, res) {
  const { id: group_id } = req.query;

  if (req.method === "GET") {
    try {
      // 1️⃣ Get all users involved in this group
      const [paidRows] = await pool.query(
        `SELECT DISTINCT paid_by AS user_id FROM group_expenses WHERE group_id = ?`,
        [group_id]
      );

      const [owedRows] = await pool.query(
        `SELECT DISTINCT ges.user_id
         FROM group_expense_splits ges
         JOIN group_expenses ge ON ges.group_expense_id = ge.id
         WHERE ge.group_id = ?`,
        [group_id]
      );

      const [settlementRows] = await pool.query(
        `SELECT DISTINCT from_user_id AS user_id FROM settlements WHERE group_id = ?
         UNION
         SELECT DISTINCT to_user_id AS user_id FROM settlements WHERE group_id = ?`,
        [group_id, group_id]
      );

      // Collect unique user IDs
      const userIds = new Set();
      paidRows.forEach((r) => userIds.add(r.user_id));
      owedRows.forEach((r) => userIds.add(r.user_id));
      settlementRows.forEach((r) => userIds.add(r.user_id));

      // 2️⃣ Initialize balances map
      const balancesMap = {};
      userIds.forEach((id) => (balancesMap[id] = 0));

      // 3️⃣ Get how much each user paid
      const [paidAmounts] = await pool.query(
        `SELECT paid_by AS user_id, SUM(amount) AS paid_amount
         FROM group_expenses
         WHERE group_id = ?
         GROUP BY paid_by`,
        [group_id]
      );

      // 4️⃣ Get how much each user owes
      const [owedAmounts] = await pool.query(
        `SELECT ges.user_id, SUM(ges.share_amount) AS owed_amount
         FROM group_expense_splits ges
         JOIN group_expenses ge ON ges.group_expense_id = ge.id
         WHERE ge.group_id = ?
         GROUP BY ges.user_id`,
        [group_id]
      );

      // 5️⃣ Get settlements
      const [settlements] = await pool.query(
        `SELECT from_user_id, to_user_id, amount
         FROM settlements
         WHERE group_id = ?`,
        [group_id]
      );

      // 6️⃣ Apply paid amounts
      paidAmounts.forEach((p) => {
        if (balancesMap[p.user_id] !== undefined) {
          balancesMap[p.user_id] += Number(p.paid_amount);
        }
      });

      // 7️⃣ Subtract owed amounts
      owedAmounts.forEach((o) => {
        if (balancesMap[o.user_id] !== undefined) {
          balancesMap[o.user_id] -= Number(o.owed_amount);
        }
      });

      // 8️⃣ Apply settlements
      settlements.forEach((s) => {
        if (balancesMap[s.from_user_id] !== undefined) {
          balancesMap[s.from_user_id] -= Number(s.amount);
        }
        if (balancesMap[s.to_user_id] !== undefined) {
          balancesMap[s.to_user_id] += Number(s.amount);
        }
      });

      // 9️⃣ Convert balances map to array and round
      const balances = Object.entries(balancesMap).map(
        ([user_id, balance]) => ({
          user_id: parseInt(user_id),
          balance: parseFloat(balance.toFixed(2)),
        })
      );

      // 🔟 Calculate suggested settlements
      const suggestions = [];
      const balancesCopy = balances.map((b) => ({ ...b }));

      let creditors = balancesCopy
        .filter((b) => b.balance > EPSILON)
        .sort((a, b) => b.balance - a.balance);

      let debtors = balancesCopy
        .filter((b) => b.balance < -EPSILON)
        .sort((a, b) => a.balance - b.balance);

      while (creditors.length && debtors.length) {
        const creditor = creditors[0];
        const debtor = debtors[0];

        const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
        if (amount < EPSILON) break;

        suggestions.push({
          from_user_id: debtor.user_id,
          to_user_id: creditor.user_id,
          amount: parseFloat(amount.toFixed(2)),
        });

        creditor.balance -= amount;
        debtor.balance += amount;

        if (creditor.balance <= EPSILON) creditors.shift();
        if (debtor.balance >= -EPSILON) debtors.shift();
      }

      return res.status(200).json({ balances, suggestions });
    } catch (err) {
      console.error("Error calculating balances:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default requireAuth(handler);
