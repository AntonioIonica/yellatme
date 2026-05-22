"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { comparePay, getIntervalSubs, getSubsByInterval } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Subscription,
  useSubscriptionStore,
} from "@/store/useSubscriptionsStore";
import { ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { randomColor } from "../calendar/page";

// To programmatically get "amount"
const monthlySpending = [
  { month: "Oct", amount: 1242.5 },
  { month: "Nov", amount: 158.32 },
  { month: "Dec", amount: 165.99 },
  { month: "Jan", amount: 172.45 },
  { month: "Feb", amount: 178.5 },
  { month: "Mar", amount: 156.97 },
];

const categories = [
  "technology",
  "auto",
  "lifestyle",
  "entertainment",
  "finance",
  "house",
  "work",
  "garden",
  "tools",
  "other",
];

const Analytics = () => {
  const [upcomingRenewals, setUpcomingRenewals] = useState<
    Subscription[] | null
  >(null);
  const { subscriptions } = useSubscriptionStore();
  const { user, loading, fetchUser } = useAuthStore();

  const now = new Date();
  const lastSixtyDays = new Date();
  lastSixtyDays.setDate(lastSixtyDays.getDate() - 60);
  const lastThirtyDays = new Date();
  lastThirtyDays.setDate(lastThirtyDays.getDate() - 30);
  const lastFourteenDays = new Date();
  lastFourteenDays.setDate(lastFourteenDays.getDate() - 14);
  const lastSevenDays = new Date();
  lastSevenDays.setDate(lastSevenDays.getDate() - 7);
  const lastYear = new Date();
  lastYear.setDate(lastYear.getDate() - 365);
  const lastSixMonths = new Date();
  lastSixMonths.setDate(lastSixMonths.getDate() - 182);

  const router = useRouter();

  const maxAmount = Math.max(...monthlySpending.map((m) => m.amount));

  const subscriptionsTotalPrice = subscriptions.reduce(
    (sum, curr) => sum + +curr.price,
    0,
  );

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchUpcomingRenewals = async () => {
      const res = await fetch(
        `http://localhost:5500/api/v1/subscriptions/upcoming-renewals`,
        {
          credentials: "include",
        },
      );

      const result = await res.json();
      setUpcomingRenewals(result.data);
    };

    fetchUpcomingRenewals();
  }, []);

  useEffect(() => {
    if (!user && !loading) router.push("/login");
  }, [user, loading]);

  if (!user)
    return (
      <div className="bg-background space-y-6">
        <div className="flex items-center justify-center text-lg">
          Loading...
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid gap-4 grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">This week</div>
            <div className="font-bold mt-1 text-2xl">
              $
              {
                getSubsByInterval(subscriptions!, "currentWeek")
                  .reduce((sum, sub) => sum + +sub.price, 0)
                  .toFixed(2) as any
              }
            </div>
            <div className="mt-1 flex items-center text-xs text-accent-foreground">
              <span>
                {comparePay(
                  getSubsByInterval(subscriptions, "prevWeek").reduce(
                    (sum, curr) => sum + +curr.price,
                    0,
                  ),

                  getSubsByInterval(subscriptions, "currentWeek").reduce(
                    (sum, curr) => sum + +curr.price,
                    0,
                  ),
                  "week",
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">This month</div>
            <div className="font-bold mt-1 text-2xl">
              $
              {
                getSubsByInterval(subscriptions, "currentMonth")
                  .reduce((sum, sub) => sum + +sub.price, 0)
                  .toFixed(2) as any
              }
            </div>
            <div className="mt-1 flex items-center text-xs text-accent-foreground">
              <span>
                {comparePay(
                  getSubsByInterval(subscriptions, "prevMonth").reduce(
                    (sum, curr) => sum + +curr.price,
                    0,
                  ),
                  getSubsByInterval(subscriptions, "currentMonth").reduce(
                    (sum, curr) => sum + +curr.price,
                    0,
                  ),
                  "month",
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Last 6 months</div>
            <div className="font-bold mt-1 text-2xl">
              $
              {
                getSubsByInterval(subscriptions, "pastSixMonths")
                  .reduce((sum, sub) => sum + +sub.price, 0)
                  .toFixed(2) as any
              }
            </div>
            <div className="mt-1 flex items-center text-xs text-accent-foreground">
              <span>
                {comparePay(
                  getSubsByInterval(subscriptions, "prevSixMonths").reduce(
                    (sum, curr) => sum + +curr.price,
                    0,
                  ),
                  getSubsByInterval(subscriptions, "pastSixMonths").reduce(
                    (sum, curr) => sum + +curr.price,
                    0,
                  ),
                  "12 months",
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Average monthly</div>
            <div className="font-bold mt-1 text-2xl">
              $
              {
                (
                  getSubsByInterval(subscriptions, "pastSixMonths").reduce(
                    (sum, sub, _, arr) => sum + Number(sub.price) / arr.length,
                    0,
                  ) || 0
                ).toFixed(2) as any
              }
            </div>
            <div className="mt-1 flex items-center text-xs text-accent-foreground">
              Based on last 6 months
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Spending Trend */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Spending Trend</CardTitle>
            <CardDescription>Monthly subscription spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-2">
              {monthlySpending.map((month) => {
                const height = (month.amount / maxAmount) * 100;
                const isCurrentMonth = month.month === "Mar";
                return (
                  <div
                    key={month.month}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isCurrentMonth ? "bg-accent" : "bg-secondary"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-xs text-muted-foreground">
                      {month.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>By Category</CardTitle>
            <CardDescription>How your spending is distributed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat} className="space-y-1 overflow-auto">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{cat}</span>
                    </div>
                    <span className="font-medium">
                      $
                      {subscriptions
                        .filter((sub) => sub.category == cat)
                        .reduce((sum, curr) => sum + +curr.price, 0)
                        .toFixed(1)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${randomColor()}`}
                      style={{
                        width: `${
                          (subscriptions
                            .filter((sub) => sub.category == cat)
                            .reduce((sum, curr) => sum + +curr.price, 0) /
                            subscriptionsTotalPrice) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Year Over Year */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Year Over Year</CardTitle>
          <CardDescription>
            Compare your spending with last year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <div className="text-sm text-muted-foreground">
                {new Date().getFullYear() - 1} Total
              </div>
              <div className="mt-1 text-2xl font-bold">
                $
                {getSubsByInterval(subscriptions, "prevYear")
                  .reduce((sum, curr) => sum + +curr.price, 0)
                  .toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <div className="text-sm text-muted-foreground">
                {new Date().getFullYear()} YTD
              </div>
              <div className="mt-1 text-2xl font-bold">
                $
                {getSubsByInterval(subscriptions, "pastYear")
                  .reduce((sum, curr) => sum + +curr.price, 0)
                  .toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <div className="text-sm text-muted-foreground">
                Projected {new Date().getFullYear()}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-2xl font-bold">
                  $
                  {(
                    getSubsByInterval(subscriptions, "pastYear").reduce(
                      (sum, curr) => sum + +curr.price,
                      0,
                    ) +
                    getSubsByInterval(subscriptions, "currentYear").reduce(
                      (sum, curr) => sum + +curr.price,
                      0,
                    )
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
