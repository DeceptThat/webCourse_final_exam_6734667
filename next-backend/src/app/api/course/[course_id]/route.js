//src/app/api/course/[course_id]/route.js

import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import corsHeaders from "@/lib/cors";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";
import { formatCourse, getAuthUser, toObjectId, validateCourse } from "@/lib/course";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// GET /api/course/:id -> course details
export async function GET(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse("Unauthorized Request", 401);

    const { course_id } = await params;
    const courseId = toObjectId(course_id);
    if (!courseId) return errorResponse("Invalid course id", 400);

    const db = (await getClientPromise()).db();
    const course = await db.collection("courses").findOne({ _id: courseId });
    if (!course) return errorResponse("Course not found", 404);

    if (user.role === "Teacher") {
      if (!course.teacherId.equals(user.id))
        return errorResponse("You can only view your own courses", 403);
    } else if (user.role === "Student") {
      if (course.status === "Cancel") return errorResponse("Course not found", 404);
    } else {
      return errorResponse("Forbidden", 403);
    }

    return successResponse(formatCourse(course, user), 200);
  } catch (error) {
    printExceptionLog("GET /api/course/[course_id]", error);
    return errorResponse("Failed to get course", 500);
  }
}

// PUT /api/course/:id -> Teacher updates own course
export async function PUT(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse("Unauthorized Request", 401);
    if (user.role !== "Teacher")
      return errorResponse("Only teachers can update courses", 403);

    const { course_id } = await params;
    const courseId = toObjectId(course_id);
    if (!courseId) return errorResponse("Invalid course id", 400);

    const db = (await getClientPromise()).db();
    const course = await db.collection("courses").findOne({ _id: courseId });
    if (!course) return errorResponse("Course not found", 404);
    if (!course.teacherId.equals(user.id))
      return errorResponse("You can only update your own courses", 403);

    const body = await req.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body", 400);

    const { errors, data } = validateCourse(body);
    if (errors.length) return errorResponse(errors.join(", "), 400);

    const enrolled = (course.students || []).length;
    if (data.maxStudent < enrolled) {
      return errorResponse(
        `Max Student cannot be less than enrolled students (${enrolled})`,
        400,
      );
    }

    await db
      .collection("courses")
      .updateOne(
        { _id: courseId, teacherId: user.id },
        { $set: { ...data, updatedAt: new Date() } },
      );

    const updated = await db.collection("courses").findOne({ _id: courseId });
    return successResponse(formatCourse(updated, user), 200);
  } catch (error) {
    printExceptionLog("PUT /api/course/[course_id]", error);
    return errorResponse("Failed to update course", 500);
  }
}

// DELETE /api/course/:id -> Teacher deletes own course only if no students enrolled
export async function DELETE(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse("Unauthorized Request", 401);
    if (user.role !== "Teacher")
      return errorResponse("Only teachers can delete courses", 403);

    const { course_id } = await params;
    const courseId = toObjectId(course_id);
    if (!courseId) return errorResponse("Invalid course id", 400);

    const db = (await getClientPromise()).db();
    const course = await db.collection("courses").findOne({ _id: courseId });
    if (!course) return errorResponse("Course not found", 404);
    if (!course.teacherId.equals(user.id))
      return errorResponse("You can only delete your own courses", 403);
    if ((course.students || []).length > 0)
      return errorResponse("Cannot delete a course that has enrolled students", 409);

    // atomic: only deletes if still owned and still has no students
    const result = await db.collection("courses").deleteOne({
      _id: courseId,
      teacherId: user.id,
      students: { $size: 0 },
    });
    if (result.deletedCount === 0)
      return errorResponse("Cannot delete a course that has enrolled students", 409);

    return successResponse({ message: "Course deleted" }, 200);
  } catch (error) {
    printExceptionLog("DELETE /api/course/[course_id]", error);
    return errorResponse("Failed to delete course", 500);
  }
}