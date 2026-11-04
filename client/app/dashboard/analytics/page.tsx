"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { comparePay, getSubsByInterval } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Subscription,
  useSubscriptionStore,
} from "@/store/useSubscriptionsStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { randomColor } from "../calendar/page";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { subMonths, format } from "date-fns";
import { toast } from "sonner";

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
  const { allSubs, setAllSubs } = useSubscriptionStore();
  const { user, loading, fetchUser } = useAuthStore();

  const router = useRouter();

  const subscriptionsTotalPrice = allSubs.reduce(
    (sum, curr) => sum + +curr.price,
    0,
  );

  // returns the date array for charts
  const groupByMonth = (subscriptions: Subscription[]) => {
    const now = new Date();

    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, 5 - i);

      return {
        key: format(date, "yyyy-MM"),
        month: format(date, "MMM"),
        total: 0,
      };
    });

    // to be able to generate total prices for months
    const monthMap = new Map(months.map((m) => [m.key, m]));

    for (const sub of subscriptions) {
      const key = format(sub.renewalDate, "yyyy-MM");

      if (monthMap.has(key)) {
        monthMap.get(key)!.total += sub.price;
      }
    }

    return Array.from(monthMap.values());
  };

  useEffect(() => {
    if (!user) return;

    const fetchAllSubs = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/subscriptions/analytics`,
          { credentials: "include" },
        );

        const result = await res.json();

        if (result.success) {
          setAllSubs(result.data);
        }
      } catch (error) {
        toast.error("Something went wrong. Please try again.", {
          position: "top-center",
          style: { fontWeight: 600 },
          closeButton: true,
        });
      }

      fetchAllSubs();
    };
  }, [user, setAllSubs]);

  useEffect(() => {
    fetchUser();
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
                getSubsByInterval(allSubs, "currentWeek")
                  .filter((sub) => sub.status == "active")
                  .reduce((sum, sub) => sum + +sub.price, 0)
                  .toFixed(2) as any
              }
            </div>
            <div className="mt-1 flex items-center text-xs text-accent-foreground">
              <span>
                {comparePay(
                  getSubsByInterval(allSubs, "prevWeek").reduce(
                    (sum, curr) => sum + +curr.price,
                    0,
                  ),

                  getSubsByInterval(allSubs, "currentWeek")
                    .filter((sub) => sub.status === "active")
                    .reduce((sum, curr) => sum + +curr.price, 0),
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
                getSubsByInterval(allSubs, "currentMonth")
                  .filter((sub) => sub.status === "active")
                  .reduce((sum, sub) => sum + +sub.price, 0)
                  .toFixed(2) as any
              }
            </div>
            <div className="mt-1 flex items-center text-xs text-accent-foreground">
              <span>
                {comparePay(
                  getSubsByInterval(allSubs, "prevMonth").reduce(
                    (sum, curr) => sum + +curr.price,
                    0,
                  ),
                  getSubsByInterval(allSubs, "currentMonth")
                    .filter((sub) => sub.status === "active")
                    .reduce((sum, curr) => sum + +curr.price, 0),
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
                getSubsByInterval(allSubs, "pastSixMonths")
                  .reduce((sum, sub) => sum + +sub.price, 0)
                  .toFixed(2) as any
              }
            </div>
            <div className="mt-1 flex items-center text-xs text-accent-foreground">
              <span>
                {comparePay(
                  getSubsByInterval(allSubs, "prevSixMonths").reduce(
                    (sum, curr) => sum + +curr.price,
                    0,
                  ),
                  getSubsByInterval(allSubs, "pastSixMonths").reduce(
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
                  getSubsByInterval(allSubs, "pastSixMonths").reduce(
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
            <div className="flex items-center justify-center">
              <BarChart
                className="text-lg font-semibold"
                width={700}
                height={450}
                data={groupByMonth(allSubs)}
              >
                <XAxis dataKey="month" />
                <YAxis dataKey="total" fill="#d3d3d6" />
                <Bar dataKey="total" fill="#0f0f8a" />
              </BarChart>
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
                      {allSubs
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
                          (allSubs
                            .filter((sub) => sub.category == cat)
                            .reduce((sum, curr) => sum + +curr.price, 0) /
                            subscriptionsTotalPrice!) *
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
                {getSubsByInterval(allSubs, "prevYear")
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
                {getSubsByInterval(allSubs, "pastYear")
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
                    getSubsByInterval(allSubs, "pastYear").reduce(
                      (sum, curr) => sum + +curr.price,
                      0,
                    ) +
                    getSubsByInterval(allSubs, "currentYear").reduce(
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
