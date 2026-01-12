import { NextResponse } from "next/server";

const fallback = [
  { day: "Seg", value: 34 },
  { day: "Ter", value: 58 },
  { day: "Qua", value: 41 },
  { day: "Qui", value: 73 },
  { day: "Sex", value: 86 },
  { day: "Sáb", value: 22 },
  { day: "Dom", value: 12 }
];

export const GET = async () => {
  const apiBase = process.env.API_URL ?? "http://localhost:3001";
  try {
    const response = await fetch(`${apiBase}/analytics/chart-data`);
    if (!response.ok) {
      return NextResponse.json(fallback);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(fallback);
  }
};
