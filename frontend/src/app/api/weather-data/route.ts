import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${API_URL}/weather/`);
  const data = await res.json();

  return NextResponse.json(data);
}
