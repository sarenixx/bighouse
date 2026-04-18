"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { RiskBadge } from "@/components/status-chip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Manager, Property } from "@/lib/types";
import { formatCompactCurrency, formatDate, formatPercent } from "@/lib/utils";

export function PropertiesClient({
  properties,
  managers
}: {
  properties: Property[];
  managers: Manager[];
}) {
  const [search, setSearch] = useState("");
  const [managerFilter, setManagerFilter] = useState("All");
  const [marketFilter, setMarketFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [reviewFilter, setReviewFilter] = useState("All");

  const markets = Array.from(new Set(properties.map((property) => property.market)));
  const filtered = properties.filter((property) => {
    const manager = managers.find((item) => item.id === property.managerId);
    const matchesSearch = `${property.name} ${property.city} ${property.state}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesManager = managerFilter === "All" || manager?.name === managerFilter;
    const matchesMarket = marketFilter === "All" || property.market === marketFilter;
    const matchesType = typeFilter === "All" || property.type === typeFilter;
    const matchesRisk = riskFilter === "All" || property.risk === riskFilter;
    const matchesReview =
      reviewFilter === "All" ||
      (reviewFilter === "Needs review" &&
        new Date(property.lastReviewDate) < new Date("2026-04-05")) ||
      (reviewFilter === "Current" &&
        new Date(property.lastReviewDate) >= new Date("2026-04-05"));

    return (
      matchesSearch &&
      matchesManager &&
      matchesMarket &&
      matchesType &&
      matchesRisk &&
      matchesReview
    );
  });

  const filters = [
    {
      label: "Manager",
      value: managerFilter,
      setValue: setManagerFilter,
      options: ["All", ...managers.map((manager) => manager.name)]
    },
    {
      label: "Market",
      value: marketFilter,
      setValue: setMarketFilter,
      options: ["All", ...markets]
    },
    {
      label: "Property type",
      value: typeFilter,
      setValue: setTypeFilter,
      options: ["All", "Multifamily", "Retail", "Office", "Industrial"]
    },
    {
      label: "Risk",
      value: riskFilter,
      setValue: setRiskFilter,
      options: ["All", "low", "moderate", "elevated", "critical"]
    },
    {
      label: "Review",
      value: reviewFilter,
      setValue: setReviewFilter,
      options: ["All", "Needs review", "Current"]
    }
  ];

  return (
    <AppShell
      title="Properties"
      subtitle="Sortable portfolio inventory with filters for oversight intensity, market concentration, and review needs."
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search properties, markets, cities..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {filters.map((filter) => (
                <label key={filter.label} className="space-y-2 text-sm">
                  <span className="text-muted-foreground">{filter.label}</span>
                  <select
                    className="h-11 w-full rounded-full border border-border bg-white/80 px-4 text-sm outline-none"
                    value={filter.value}
                    onChange={(event) => filter.setValue(event.target.value)}
                  >
                    {filter.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio properties</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="pb-4">Property</th>
                  <th className="pb-4">Market</th>
                  <th className="pb-4">Type</th>
                  <th className="pb-4">Units</th>
                  <th className="pb-4">Manager</th>
                  <th className="pb-4">Occupancy</th>
                  <th className="pb-4">NOI</th>
                  <th className="pb-4">Risk</th>
                  <th className="pb-4">Open issues</th>
                  <th className="pb-4">Active project</th>
                  <th className="pb-4">Last review</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((property) => {
                  const manager = managers.find((item) => item.id === property.managerId);
                  return (
                    <tr key={property.id} className="border-t border-border/60">
                      <td className="py-4 pr-4">
                        <Link
                          href={`/properties/${property.slug}`}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {property.name}
                        </Link>
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        {property.city}, {property.state}
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground">{property.type}</td>
                      <td className="py-4 pr-4 text-muted-foreground">{property.unitCount}</td>
                      <td className="py-4 pr-4 text-muted-foreground">{manager?.name}</td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        {formatPercent(property.occupancy)}
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        {formatCompactCurrency(property.noi)}
                      </td>
                      <td className="py-4 pr-4">
                        <RiskBadge risk={property.risk} />
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground">{property.openIssues}</td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        {property.activeProjectStatus}
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {formatDate(property.lastReviewDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
