//src/app/api/auth/login/route.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import corsHeaders from "@/lib/cors";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";

const isProd = process.env.NODE_ENV === "production";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!username || !password) {
      return errorResponse("Username and password are required", 400);
    }

    const client = await getClientPromise();
    const db = client.db();

    // allow login with username OR email
    const user = await db.collection("users").findOne({
      $or: [{ username: username }, { email: username.toLowerCase() }],
    });

    if (!user) {
      return errorResponse("Invalid username or password", 401);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return errorResponse("Invalid username or password", 401);
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    const response = successResponse(
      {
        message: "Login successful",
        user: {
          _id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      200,
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    printExceptionLog("POST /api/auth/login", error);
    return errorResponse("Login failed: ", 500);
  }
}