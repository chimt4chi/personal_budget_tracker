// /pages/api/me.js
import { requireAuth } from "@/lib/middleware/auth";

function handler(req, res) {
  res.status(200).json(req.user); // user is attached by auth middleware
}

export default requireAuth(handler);
