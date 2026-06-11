import { Request, Response } from "express";

import Project from "../models/Project";


//create project
export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
  name,
  description,
  startDate,
  endDate,
  assignedEmployees,
} = req.body;

if (
  !name ||
  !description ||
  !startDate ||
  !endDate
) {
  res.status(400).json({
    message:
      "All required fields must be provided",
  });
  return;
}

const start = new Date(startDate);
const end = new Date(endDate);

if (isNaN(start.getTime())) {
  res.status(400).json({
    message: "Invalid start date",
  });
  return;
}

if (isNaN(end.getTime())) {
  res.status(400).json({
    message: "Invalid end date",
  });
  return;
}

if (end <= start) {
  res.status(400).json({
    message: "End date must be after start date",
  });
  return;
}

const existingProject =
  await Project.findOne({ name });

    if (existingProject) {
      res.status(400).json({
        message:
          "Project already exists",
      });
      return;
    }

    const project =
      await Project.create({
        name,
        description,
        startDate,
        endDate,
        assignedEmployees,
      });

    res.status(201).json(project);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

//update project
export const updateProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const project =
      await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!project) {
      res.status(404).json({
        message: "Project not found",
      });
      return;
    }

    res.status(200).json(project);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

//close project
export const closeProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const project =
      await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({
        message: "Project not found",
      });
      return;
    }

    project.status = "Closed";

    await project.save();

    res.status(200).json({
      message:
        "Project closed successfully",
      project,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

//assigned resources
export const getAssignedResources =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const project =
        await Project.findById(
          req.params.id
        ).populate(
          "assignedEmployees"
        );

      if (!project) {
        res.status(404).json({
          message:
            "Project not found",
        });
        return;
      }

      res.status(200).json(
        project.assignedEmployees
      );

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server Error",
      });
    }
  };

// get all projects
export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { search, status } = req.query;
    let query: any = {};

    if (search) {
      query.name = { $regex: search as string, $options: "i" };
    }

    if (status) {
      query.status = status as string;
    }

    const projects = await Project.find(query);
    res.status(200).json(projects);
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// get project by id
export const getProjectById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({
        message: "Project not found",
      });
      return;
    }
    res.status(200).json(project);
  } catch (error) {
    console.error("GET PROJECT BY ID ERROR:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

  