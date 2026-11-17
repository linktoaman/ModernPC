import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "Clinic Booking API",
    version: "v1",
    status: "ok"
  });
}
