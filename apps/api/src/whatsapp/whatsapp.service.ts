import { Injectable } from "@nestjs/common";
import QRCode from "qrcode";
import { Client, LocalAuth } from "whatsapp-web.js";

export type WhatsappStatus = "DISCONNECTED" | "INITIALIZING" | "CONNECTED";

@Injectable()
export class WhatsappService {
  private status: WhatsappStatus = "INITIALIZING";
  private lastQr = "";
  private client: Client | null = null;
  private initializing = false;

  constructor() {
    void this.ensureClient();
  }

  getStatus() {
    return {
      status: this.status
    };
  }

  async getQrCode() {
    await this.ensureClient();
    if (!this.lastQr) {
      const payload = `NEXUS-${Date.now()}`;
      this.lastQr = await QRCode.toDataURL(payload);
    }
    return {
      status: this.status,
      qr: this.lastQr
    };
  }

  async refreshQr() {
    await this.ensureClient();
    if (this.lastQr) {
      return {
        status: this.status,
        qr: this.lastQr
      };
    }
    return this.getQrCode();
  }

  setStatus(nextStatus: WhatsappStatus) {
    this.status = nextStatus;
  }

  private async ensureClient() {
    if (this.client || this.initializing) {
      return;
    }
    this.initializing = true;
    this.status = "INITIALIZING";
    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: "nexus-growth-os" }),
      puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      }
    });

    this.client.on("qr", async (qr) => {
      this.lastQr = await QRCode.toDataURL(qr);
      this.status = "INITIALIZING";
    });

    this.client.on("ready", () => {
      this.status = "CONNECTED";
      this.lastQr = "";
    });

    this.client.on("disconnected", () => {
      this.status = "DISCONNECTED";
    });

    try {
      await this.client.initialize();
    } catch (error) {
      this.status = "DISCONNECTED";
    } finally {
      this.initializing = false;
    }
  }
}
