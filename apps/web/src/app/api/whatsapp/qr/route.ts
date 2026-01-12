import { NextResponse } from "next/server";
import QRCode from "qrcode";

const fallbackPayload = "NEXUS-GROWTH-OS-QR";

const fetchWithTimeout = async (url: string, timeoutMs: number) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const GET = async () => {
  const apiBase = process.env.API_URL ?? "http://localhost:3001";
  try {
    const response = await fetchWithTimeout(`${apiBase}/whatsapp/qr`, 2500);
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    // ignore and fallback to local QR
  }

  const qr = await QRCode.toDataURL(fallbackPayload);
  return NextResponse.json({ status: "DISCONNECTED", qr, mode: "fallback" });
};
