import { ClientDashboardLandingPage } from "@/components/client-dashboard-landing";

export default function HomePage() {
  return (
    <ClientDashboardLandingPage
      publicMode
      stats={{
        capexProjects: "18",
        totalUnits: "4,280",
        grossMonthlyRent: "$9.4M",
        occupancyTrends: "94.6%"
      }}
    />
  );
}
