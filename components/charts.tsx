"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimePoint } from "@/lib/types";
import { formatCompactCurrency } from "@/lib/utils";

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.96)",
  borderRadius: "14px",
  border: "1px solid rgba(191, 183, 171, 0.75)"
};

function useChartReady() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
}

function ChartMount({
  children
}: {
  children: React.ReactNode;
}) {
  const ready = useChartReady();

  if (!ready) {
    return <div className="h-full w-full animate-pulse rounded-[1.25rem] bg-secondary/70" />;
  }

  return <>{children}</>;
}

export function PerformanceChart({
  data,
  title,
  description
}: {
  data: TimePoint[];
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ChartMount>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(115,115,115,0.12)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="performance" stroke="#415a63" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartMount>
      </CardContent>
    </Card>
  );
}

export function OccupancyChart({
  data,
  title,
  description
}: {
  data: TimePoint[];
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ChartMount>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="occupancyFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7fa0aa" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#7fa0aa" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(115,115,115,0.12)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="occupancy" stroke="#5a7882" fill="url(#occupancyFill)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartMount>
      </CardContent>
    </Card>
  );
}

export function BudgetComparisonChart({
  data,
  title,
  description
}: {
  data: TimePoint[];
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ChartMount>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(115,115,115,0.12)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) =>
                  typeof value === "number" ? `${formatCompactCurrency(value * 1000)}` : String(value ?? "")
                }
              />
              <Legend />
              <Bar dataKey="collected" fill="#45626f" radius={[10, 10, 0, 0]} />
              <Bar dataKey="budget" fill="#cfbfaa" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartMount>
      </CardContent>
    </Card>
  );
}
