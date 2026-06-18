import { Request, Response, NextFunction } from "express";

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "date" | "email" | "password" | "percentage" | "array";
  custom?: (value: any, req: Request) => string | null;
}

const sanitizeValue = (value: any): any => {
  if (typeof value === "string") {
    let sanitized = value.trim();
    // Strip HTML tags to prevent basic XSS
    sanitized = sanitized.replace(/<[^>]*>/g, "");
    return sanitized;
  }
  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item));
  }
  if (typeof value === "object" && value !== null) {
    const sanitizedObj: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      sanitizedObj[key] = sanitizeValue(value[key]);
    }
    return sanitizedObj;
  }
  return value;
};

export const validateBody = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string> = {};

    for (const rule of rules) {
      let value = req.body[rule.field];

      // Input Sanitization
      if (value !== undefined) {
        req.body[rule.field] = sanitizeValue(value);
        value = req.body[rule.field];
      }

      // Required check
      if (rule.required && (value === undefined || value === null || value === "")) {
        errors[rule.field] = `${rule.field} is required`;
        continue;
      }

      if (value !== undefined && value !== null && value !== "") {
        // Type / format checks
        if (rule.type === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof value !== "string" || !emailRegex.test(value)) {
            errors[rule.field] = "Invalid email format";
          }
        } else if (rule.type === "password") {
          if (typeof value !== "string" || value.length < 6) {
            errors[rule.field] = "Password must be at least 6 characters long";
          } else if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
            errors[rule.field] = "Password must contain at least one letter and one number";
          }
        } else if (rule.type === "date") {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors[rule.field] = "Invalid date format";
          }
        } else if (rule.type === "percentage") {
          const num = Number(value);
          if (isNaN(num) || num < 1 || num > 100) {
            errors[rule.field] = "Allocation percentage must be a number between 1 and 100";
          }
        } else if (rule.type === "number") {
          const num = Number(value);
          if (isNaN(num)) {
            errors[rule.field] = "Must be a valid number";
          }
        } else if (rule.type === "array") {
          if (!Array.isArray(value)) {
            errors[rule.field] = "Must be an array";
          }
        }
      }

      // Custom check
      if (rule.custom && value !== undefined && value !== null && value !== "") {
        const customErr = rule.custom(value, req);
        if (customErr) {
          errors[rule.field] = customErr;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        message: "Validation error",
        errors,
      });
      return;
    }

    next();
  };
};

export const validateQuery = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string> = {};

    for (const rule of rules) {
      let value = req.query[rule.field];

      if (value !== undefined) {
        req.query[rule.field] = sanitizeValue(value);
        value = req.query[rule.field];
      }

      if (rule.required && (value === undefined || value === null || value === "")) {
        errors[rule.field] = `${rule.field} query parameter is required`;
        continue;
      }

      if (value !== undefined && value !== null && value !== "") {
        if (rule.type === "date") {
          const date = new Date(value as string);
          if (isNaN(date.getTime())) {
            errors[rule.field] = "Invalid date format";
          }
        } else if (rule.type === "number") {
          const num = Number(value);
          if (isNaN(num)) {
            errors[rule.field] = "Must be a valid number";
          }
        }
      }

      if (rule.custom && value !== undefined && value !== null && value !== "") {
        const customErr = rule.custom(value, req);
        if (customErr) {
          errors[rule.field] = customErr;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        message: "Validation error",
        errors,
      });
      return;
    }

    next();
  };
};
