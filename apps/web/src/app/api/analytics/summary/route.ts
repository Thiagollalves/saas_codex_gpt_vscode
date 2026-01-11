import { NextResponse } from "next/server";

const fallback = {
  totalLeads: 3428,
  activeConversations: 218,
  salesRevenue: 452318,
  conversionRate: 5.4
};

export const GET = async () => {
  const apiBase = process.env.API_URL ?? "http://localhost:3001";
  try {
    const response = await fetch(`${apiBase}/analytics/summary`);
    if (!response.ok) {
      return NextResponse.json(fallback);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(fallback);
  }
};
