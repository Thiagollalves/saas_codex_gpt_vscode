import { Injectable } from "@nestjs/common";
import QRCode from "qrcode";

export type WhatsappStatus = "DISCONNECTED" | "INITIALIZING" | "CONNECTED";

@Injectable()
export class WhatsappService {
  private status: WhatsappStatus = "INITIALIZING";
  private lastQr = "";

  getStatus() {
    return {
      status: this.status
    };
  }

  async getQrCode() {
    const payload = this.lastQr || `NEXUS-${Date.now()}`;
    const qr = await QRCode.toDataURL(payload);
    this.lastQr = payload;
    return {
      status: this.status,
      qr
    };
  }

  setStatus(nextStatus: WhatsappStatus) {
    this.status = nextStatus;
  }
}
