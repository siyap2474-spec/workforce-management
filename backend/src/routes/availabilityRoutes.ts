import express from "express";
import {authorizePermission}from "../middleware/permissionMiddleware";


import {
 getResourceAvailability
}
from "../controllers/availabilityController";


import {
 protect
}
from "../middleware/authMiddleware";


const router =
express.Router();



router.get(
 "/",
 protect,
 authorizePermission(
  "VIEW_REPORTS"
 ),
 getResourceAvailability
);


export default router;