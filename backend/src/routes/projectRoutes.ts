import { Router } from "express";

import {
  createProject,
  updateProject,
  closeProject,
  getAssignedResources,
  getProjects,
  getProjectById,
} from "../controllers/projectController";

import { protect } from "../middleware/authMiddleware";

import { authorizePermission } from "../middleware/permissionMiddleware";
import { validateBody } from "../middleware/validate";

const router = Router();

// get all projects
router.get(
  "/",
  protect,
  getProjects
);

// get project by id
router.get(
  "/:id",
  protect,
  getProjectById
);

//create project
router.post(
  "/",
  protect,
  authorizePermission(
    "CREATE_PROJECT"
  ),
  validateBody([
    { field: "name", required: true, type: "string" },
    { field: "description", required: true, type: "string" },
    { field: "startDate", required: true, type: "date" },
    { 
      field: "endDate", 
      required: true, 
      type: "date",
      custom: (val, req) => {
        if (req.body.startDate && new Date(val) <= new Date(req.body.startDate)) {
          return "End date must be after start date";
        }
        return null;
      }
    },
  ]),
  createProject
);

//update project
router.put(
  "/:id",
  protect,
  authorizePermission(
    "UPDATE_PROJECT"
  ),
  updateProject
);

//close project
router.patch(
  "/:id/close",
  protect,
  authorizePermission(
    "UPDATE_PROJECT"
  ),
  closeProject
);

//assigned resources
router.get(
  "/:id/resources",
  protect,
  authorizePermission(
    "VIEW_ASSIGNED_RESOURCES"
  ),
  getAssignedResources
);

export default router;