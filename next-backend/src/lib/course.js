// src/lib/course.js

import { ObjectId } from "mongodb";
import {
  X_HEADER_USER_EMAIL,
  X_HEADER_USER_ID,
  X_HEADER_USER_NAME,
  X_HEADER_USER_ROLE,
} from "./constant";

export const COURSE_STATUS = ["Open", "Close", "Cancel"];

export function toObjectId(id) {
  if (typeof id !== "string" || !ObjectId.isValid(id)) return null;
  const oid = new ObjectId(id);
  return oid.toString() === id ? oid : null;
}

// user info set by proxy.js from the JWT
export function getAuthUser(req) {
  const id = toObjectId(req.headers.get(X_HEADER_USER_ID));
  if (!id) return null;
  return {
    id,
    role: req.headers.get(X_HEADER_USER_ROLE),
    username: req.headers.get(X_HEADER_USER_NAME),
    email: req.headers.get(X_HEADER_USER_EMAIL),
  };
}

export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function validateCourse(body) {
  const errors = [];

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) errors.push("Course name is required");

  const duration = Number(body.duration);
  if (!Number.isInteger(duration) || duration < 1)
    errors.push("Duration must be a whole number of days (at least 1)");

  let topics = body.topics;
  if (typeof topics === "string") topics = topics.split(",");
  topics = Array.isArray(topics)
    ? topics.map((t) => String(t).trim()).filter(Boolean)
    : [];
  if (topics.length === 0) errors.push("At least one topic is required");

  const price = Number(body.price);
  if (body.price === "" || body.price == null || !Number.isFinite(price) || price < 0)
    errors.push("Price must be 0 or more");

  const maxStudent = Number(body.maxStudent);
  if (!Number.isInteger(maxStudent) || maxStudent < 1)
    errors.push("Max Student must be a whole number (at least 1)");

  const status = body.status ?? "Open";
  if (!COURSE_STATUS.includes(status))
    errors.push("Status must be Open, Close or Cancel");

  return { errors, data: { name, duration, topics, price, maxStudent, status } };
}

// Teachers see the student list; Students only see counts + isEnrolled
export function formatCourse(course, user) {
  const { students = [], ...rest } = course;
  const result = {
    ...rest,
    enrolledCount: students.length,
    seatsLeft: Math.max(course.maxStudent - students.length, 0),
  };
  if (user.role === "Teacher") {
    result.students = students;
  } else {
    result.isEnrolled = students.some((s) => String(s._id) === String(user.id));
  }
  return result;
}