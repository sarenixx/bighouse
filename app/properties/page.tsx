import { PropertiesClient } from "@/app/properties/properties-client";
import { getCurrentTenantDataset } from "@/lib/server/portfolio-service";

export default async function PropertiesPage() {
  const { dataset } = await getCurrentTenantDataset();

  return (
    <PropertiesClient properties={dataset.properties} managers={dataset.managers} />
  );
}
