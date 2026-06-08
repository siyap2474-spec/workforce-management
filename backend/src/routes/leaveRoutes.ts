import express from "express";
import { protect } from "../middleware/authMiddleware";
import { applyLeave, getAllLeaves, approveLeave, rejectLeave} from "../controllers/leaveController";

const router =
  express.Router();

//apply leave
router.post(
  "/",
  protect,
  applyLeave
);

//get all leave
router.get(
  "/",
  protect,
  getAllLeaves
);

//Approve Leave
router.put(
  "/:id/approve",
  protect,
  approveLeave
);

//Reject Leave
router.put(
  "/:id/reject",
  protect,
  rejectLeave
);



export default router;