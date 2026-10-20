//src/app/api/user/route.js

import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import corsHeaders from "@/lib/cors";
import { X_HEADER_USER_ID } from "@/lib/constant";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// GET /api/user -> current logged-in user
export async function GET(req) {
  try {
    const userId = req.headers.get(X_HEADER_USER_ID);
    if (!userId || !ObjectId.isValid(userId)) {
      return errorResponse("Unauthorized Request", 401);
    }

    const client = await getClientPromise();
    const db = client.db();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse(user, 200);
  } catch (error) {
    printExceptionLog("GET /api/user", error);
    return errorResponse("Failed to get user", 500);
  }
}