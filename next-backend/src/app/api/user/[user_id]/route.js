//src/app/api/user/[user_id]/route.js

import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import corsHeaders from "@/lib/cors";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";
import { formatCourse, getAuthUser, toObjectId } from "@/lib/course";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// GET /api/user/:id -> own profile + enrolled courses (Student)
export async function GET(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse("Unauthorized Request", 401);

    const { user_id } = await params;
    const targetId = toObjectId(user_id);
    if (!targetId) return errorResponse("Invalid user id", 400);
    if (!targetId.equals(user.id))
      return errorResponse("You can only view your own profile", 403);

    const db = (await getClientPromise()).db();
    const profile = await db
      .collection("users")
      .findOne({ _id: targetId }, { projection: { password: 0 } });
    if (!profile) return errorResponse("User not found", 404);

    let enrolledCourses = [];
    if (profile.role === "Student") {
      const courses = await db
        .collection("courses")
        .find({ "students._id": targetId })
        .sort({ createdAt: -1 })
        .toArray();
      enrolledCourses = courses.map((c) => formatCourse(c, user));
    }

    return successResponse({ ...profile, enrolledCourses }, 200);
  } catch (error) {
    printExceptionLog("GET /api/user/[user_id]", error);
    return errorResponse("Failed to get user", 500);
  }
}