import { Controller, Get, Patch, Body } from "@nestjs/common";
import { WhatsappService, WhatsappStatus } from "./whatsapp.service";

@Controller("whatsapp")
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get("status")
  getStatus() {
    return this.whatsappService.getStatus();
  }

  @Get("qr")
  async getQr() {
    return this.whatsappService.getQrCode();
  }

  @Patch("status")
  updateStatus(@Body("status") status: WhatsappStatus) {
    this.whatsappService.setStatus(status);
    return this.whatsappService.getStatus();
  }
}
