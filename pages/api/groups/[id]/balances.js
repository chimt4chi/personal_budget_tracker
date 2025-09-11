// /groups/[id]/balances.js
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth";

async function handler(req, res) {
  const { id: group_id } = req.query;

  if (req.method === "GET") {
    try {
      // --- Step 1: Gather paid, owed, settlements ---
      const [paidRows] = await pool.query(
        "SELECT paid_by AS user_id, SUM(amount) AS paid FROM group_expenses WHERE group_id=? GROUP BY paid_by",
        [group_id]
      );

      const [owedRows] = await pool.query(
        `SELECT ges.user_id, SUM(ges.share_amount) AS owed
         FROM group_expense_splits ges
         JOIN group_expenses ge ON ges.group_expense_id = ge.id
         WHERE ge.group_id=?
         GROUP BY ges.user_id`,
        [group_id]
      );

      const [settledPaid] = await pool.query(
        "SELECT from_user_id AS user_id, SUM(amount) AS paid_settlements FROM settlements WHERE group_id=? GROUP BY from_user_id",
        [group_id]
      );

      const [settledReceived] = await pool.query(
        "SELECT to_user_id AS user_id, SUM(amount) AS received_settlements FROM settlements WHERE group_id=? GROUP BY to_user_id",
        [group_id]
      );

      // --- Step 2: Build balances map ---
      const balances = {};
      const ensureUser = (id) => {
        if (!balances[id]) {
          balances[id] = {
            user_id: id,
            paid: 0,
            owed: 0,
            paid_settlements: 0,
            received_settlements: 0,
          };
        }
      };

      paidRows.forEach((r) => {
        ensureUser(r.user_id);
        balances[r.user_id].paid = r.paid || 0;
      });
      owedRows.forEach((r) => {
        ensureUser(r.user_id);
        balances[r.user_id].owed = r.owed || 0;
      });
      settledPaid.forEach((r) => {
        ensureUser(r.user_id);
        balances[r.user_id].paid_settlements = r.paid_settlements || 0;
      });
      settledReceived.forEach((r) => {
        ensureUser(r.user_id);
        balances[r.user_id].received_settlements = r.received_settlements || 0;
      });

      // --- Step 3: Compute net balance per user ---
      const results = Object.values(balances).map((b) => ({
        user_id: b.user_id,
        balance:
          (b.paid || 0) +
          (b.received_settlements || 0) -
          ((b.owed || 0) + (b.paid_settlements || 0)),
      }));

      // --- Step 4: Generate settlement suggestions ---
      const debtors = results
        .filter((r) => r.balance < 0)
        .map((r) => ({ ...r, balance: Math.abs(r.balance) }))
        .sort((a, b) => b.balance - a.balance);

      const creditors = results
        .filter((r) => r.balance > 0)
        .sort((a, b) => b.balance - a.balance);

      const suggestions = [];
      let i = 0,
        j = 0;

      while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const settleAmount = Math.min(debtor.balance, creditor.balance);

        suggestions.push({
          from_user_id: debtor.user_id,
          to_user_id: creditor.user_id,
          amount: settleAmount,
        });

        debtor.balance -= settleAmount;
        creditor.balance -= settleAmount;

        if (debtor.balance === 0) i++;
        if (creditor.balance === 0) j++;
      }

      return res.status(200).json({
        balances: results,
        suggestions,
      });
    } catch (err) {
      console.error("Error calculating balances:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default requireAuth(handler);
