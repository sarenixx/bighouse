import { getPrisma } from "@/lib/server/prisma";
import { AppRouteError } from "@/lib/server/app-route-error";

export async function requireTenantPropertyAccess(args: {
  tenantId: string;
  propertyId: string;
}) {
  const prisma = await getPrisma();
  const property = await prisma.property.findFirst({
    where: {
      id: args.propertyId,
      tenantId: args.tenantId
    },
    select: {
      id: true,
      slug: true,
      name: true
    }
  });

  if (!property) {
    throw new AppRouteError("Property not found for the current account.", {
      status: 404,
      code: "property_not_found"
    });
  }

  return property;
}

export function assertMutationCountUpdated(count: number, resourceLabel: string) {
  if (count > 0) {
    return;
  }

  throw new AppRouteError(`${resourceLabel} was not found for the current account.`, {
    status: 404,
    code: "record_not_found"
  });
}
