import { Module } from "@nestjs/common";
import { AnalyticsModule } from "./analytics/analytics.module";
import { WhatsappModule } from "./whatsapp/whatsapp.module";
import { AuthModule } from "./auth/auth.module";
import { CrmModule } from "./crm/crm.module";
import { MarketingModule } from "./marketing/marketing.module";

@Module({
  imports: [AnalyticsModule, WhatsappModule, AuthModule, CrmModule, MarketingModule]
})
export class AppModule {}
