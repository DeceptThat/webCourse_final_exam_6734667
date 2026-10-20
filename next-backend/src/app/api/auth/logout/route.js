import { NextResponse } from "next/server";
import corsHeaders from "@/lib/cors";
import {successResponse} from "@/lib/utils";

const isProd = process.env.NODE_ENV === "production";

export function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export function POST(request) {
  const response = successResponse({message : "Logged out successfully"}, 200);
  response.cookies.set("token", "",{
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 0, // Set maxAge to 0 to expire the cookie immediately
  })
  return response;
}

