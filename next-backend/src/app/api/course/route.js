//src/app/api/course/route.js

/**
 * Course endpoints go here
 *///src/app/api/course/route.js

import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import corsHeaders from "@/lib/cors";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";
import { escapeRegex, formatCourse, getAuthUser, validateCourse } from "@/lib/course";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// GET /api/course?search=...
// Teacher -> own courses | Student -> all courses except Cancel
export async function GET(req) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse("Unauthorized Request", 401);

    let filter;
    if (user.role === "Teacher") {
      filter = { teacherId: user.id };
    } else if (user.role === "Student") {
      filter = { status: { $ne: "Cancel" } };
    } else {
      return errorResponse("Forbidden", 403);
    }

    // filter by part of course name or teacher name
    const search = (req.nextUrl.searchParams.get("search") || "").trim();
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ name: regex }, { teacherName: regex }];
    }

    const db = (await getClientPromise()).db();
    const courses = await db
      .collection("courses")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return successResponse(courses.map((c) => formatCourse(c, user)), 200);
  } catch (error) {
    printExceptionLog("GET /api/course", error);
    return errorResponse("Failed to get courses", 500);
  }
}

// POST /api/course -> Teacher creates a course
export async function POST(req) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse("Unauthorized Request", 401);
    if (user.role !== "Teacher")
      return errorResponse("Only teachers can create courses", 403);

    const body = await req.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body", 400);

    const { errors, data } = validateCourse(body);
    if (errors.length) return errorResponse(errors.join(", "), 400);

    const now = new Date();
    const doc = {
      ...data,
      teacherId: user.id,
      teacherName: user.username,
      students: [],
      createdAt: now,
      updatedAt: now,
    };

    const db = (await getClientPromise()).db();
    const result = await db.collection("courses").insertOne(doc);

    return successResponse(formatCourse({ ...doc, _id: result.insertedId }, user), 201);
  } catch (error) {
    printExceptionLog("POST /api/course", error);
    return errorResponse("Failed to create course", 500);
  }
}