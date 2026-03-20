"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SAMPLE_CHART_DATA = [
  { route: "/price-storage", requests: 142 },
  { route: "/storage/upload", requests: 98 },
  { route: "/upload/confirm", requests: 87 },
  { route: "/payment/settle", requests: 76 },
  { route: "/storage/ls", requests: 203 },
  { route: "/storage/download", requests: 64 },
  { route: "/storage/delete", requests: 12 },
];

const SAMPLE_EVENTS = [
  { id: "1", type: "upload_confirmed", wallet: "0xabc…def1", status: "success" as const, time: "2s ago" },
  { id: "2", type: "payment_settled", wallet: "0x123…4567", status: "success" as const, time: "5s ago" },
  { id: "3", type: "wallet_auth_failed", wallet: "0xfed…cba9", status: "error" as const, time: "8s ago" },
  { id: "4", type: "quote_created", wallet: "0xabc…def1", status: "info" as const, time: "12s ago" },
  { id: "5", type: "housekeeping_completed", wallet: "system", status: "success" as const, time: "1m ago" },
];

const STATUS_VARIANT: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  success: "default",
  error: "destructive",
  info: "secondary",
  pending: "outline",
};

export default function Home() {
  const [refreshCount, setRefreshCount] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">MnemoSpark Ops Dashboard</h1>
          <p className="text-sm text-muted-foreground">Internal operations &amp; sales intelligence</p>
        </div>
        <Button variant="outline" onClick={() => setRefreshCount((c) => c + 1)}>
          Refresh ({refreshCount})
        </Button>
      </header>

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Wallets</CardDescription>
              <CardTitle className="text-3xl">1,247</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">+23 in the last 24h</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Quotes Created</CardDescription>
              <CardTitle className="text-3xl">3,891</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">142 today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Uploads (24h)</CardDescription>
              <CardTitle className="text-3xl">98</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">87 confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Payment Settlements</CardDescription>
              <CardTitle className="text-3xl">76</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">2 failures</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart + Events side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>API Route Volume (24h)</CardTitle>
              <CardDescription>Request counts by backend route</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={SAMPLE_CHART_DATA}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="route" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="requests" fill="oklch(0.556 0 0)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Live event stream</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SAMPLE_EVENTS.map((evt) => (
                <div key={evt.id} className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">{evt.type}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{evt.wallet}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={STATUS_VARIANT[evt.status]}>{evt.status}</Badge>
                    <span className="text-xs text-muted-foreground">{evt.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
