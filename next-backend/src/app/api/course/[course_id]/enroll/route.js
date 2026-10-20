//src/app/api/course/[course_id]/enroll/route.js

import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import corsHeaders from "@/lib/cors";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";
import { formatCourse, getAuthUser, toObjectId } from "@/lib/course";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// POST /api/course/:id/enroll -> Student enrolls
export async function POST(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse("Unauthorized Request", 401);
    if (user.role !== "Student")
      return errorResponse("Only students can enroll in courses", 403);

    const { course_id } = await params;
    const courseId = toObjectId(course_id);
    if (!courseId) return errorResponse("Invalid course id", 400);

    const db = (await getClientPromise()).db();
    const courses = db.collection("courses");

    // One atomic operation: Open + seats left + not already enrolled
    const updated = await courses.findOneAndUpdate(
      {
        _id: courseId,
        status: "Open",
        "students._id": { $ne: user.id },
        $expr: { $lt: [{ $size: "$students" }, "$maxStudent"] },
      },
      {
        $push: {
          students: {
            _id: user.id,
            username: user.username,
            email: user.email,
            enrolledAt: new Date(),
          },
        },
      },
      { returnDocument: "after" },
    );

    if (updated) {
      return successResponse(formatCourse(updated, user), 201);
    }

    // Work out why it failed
    const course = await courses.findOne({ _id: courseId });
    if (!course || course.status === "Cancel")
      return errorResponse("Course not found", 404);
    if ((course.students || []).some((s) => s._id.equals(user.id)))
      return errorResponse("You are already enrolled in this course", 409);
    if (course.status !== "Open")
      return errorResponse("This course is closed for enrollment", 400);
    return errorResponse("This course is full", 409);
  } catch (error) {
    printExceptionLog("POST /api/course/[course_id]/enroll", error);
    return errorResponse("Failed to enroll", 500);
  }
}