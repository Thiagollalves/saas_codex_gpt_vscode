import { NextResponse } from "next/server";

export const GET = async () => {
  const apiBase = process.env.API_URL ?? "http://localhost:3001";
  try {
    const response = await fetch(`${apiBase}/whatsapp/status`);
    if (!response.ok) {
      return NextResponse.json({ status: "DISCONNECTED" });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ status: "DISCONNECTED" });
  }
};
