// /pages/api/groups/[id]/balances.js
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

async function handler(req, res) {
  const { id: group_id } = req.query;

  if (req.method === "GET") {
    try {
      // 1. Get how much each user paid
      const [paidRows] = await pool.query(
        `SELECT ge.paid_by AS user_id, SUM(ge.amount) AS paid_amount
         FROM group_expenses ge
         WHERE ge.group_id=?
         GROUP BY ge.paid_by`,
        [group_id]
      );

      // 2. Get how much each user owes (their share)
      const [owedRows] = await pool.query(
        `SELECT ges.user_id, SUM(ges.share_amount) AS owed_amount
         FROM group_expense_splits ges
         JOIN group_expenses ge ON ges.group_expense_id = ge.id
         WHERE ge.group_id=?
         GROUP BY ges.user_id`,
        [group_id]
      );

      // 3. Get settlements (adjust balances)
      const [settlements] = await pool.query(
        `SELECT from_user_id, to_user_id, amount
         FROM settlements
         WHERE group_id=?`,
        [group_id]
      );

      // 4. Combine balances
      const balancesMap = {};

      paidRows.forEach((p) => {
        balancesMap[p.user_id] =
          (balancesMap[p.user_id] || 0) + Number(p.paid_amount);
      });

      owedRows.forEach((o) => {
        balancesMap[o.user_id] =
          (balancesMap[o.user_id] || 0) - Number(o.owed_amount);
      });

      settlements.forEach((s) => {
        balancesMap[s.from_user_id] =
          (balancesMap[s.from_user_id] || 0) - Number(s.amount);
        balancesMap[s.to_user_id] =
          (balancesMap[s.to_user_id] || 0) + Number(s.amount);
      });

      const balances = Object.entries(balancesMap).map(
        ([user_id, balance]) => ({
          user_id: parseInt(user_id),
          balance,
        })
      );

      // 5. Suggested settlements
      const suggestions = [];
      let creditors = balances
        .filter((b) => b.balance > 0)
        .sort((a, b) => b.balance - a.balance);
      let debtors = balances
        .filter((b) => b.balance < 0)
        .sort((a, b) => a.balance - b.balance);

      while (creditors.length && debtors.length) {
        let creditor = creditors[0];
        let debtor = debtors[0];

        const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

        suggestions.push({
          from_user_id: debtor.user_id,
          to_user_id: creditor.user_id,
          amount,
        });

        creditor.balance -= amount;
        debtor.balance += amount;

        if (creditor.balance === 0) creditors.shift();
        if (debtor.balance === 0) debtors.shift();
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
