import { Controller, Get } from "@nestjs/common";

@Controller("analytics")
export class AnalyticsController {
  @Get("summary")
  getSummary() {
    return {
      totalLeads: 3428,
      activeConversations: 218,
      salesRevenue: 452318,
      conversionRate: 5.4
    };
  }

  @Get("chart-data")
  getChartData() {
    return [
      { day: "Seg", value: 34 },
      { day: "Ter", value: 58 },
      { day: "Qua", value: 41 },
      { day: "Qui", value: 73 },
      { day: "Sex", value: 86 },
      { day: "Sáb", value: 22 },
      { day: "Dom", value: 12 }
    ];
  }
}
