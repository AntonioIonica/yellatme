"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { upcomingInterval } from "@/lib/utils";
import { useSubscriptionStore } from "@/store/useSubscriptionsStore";
import { ArrowUp, Badge } from "lucide-react";

const categoryData = [
  { name: "Entertainment", amount: 43.97, percentage: 28, color: "bg-red-500" },
  { name: "Software", amount: 54.99, percentage: 35, color: "bg-blue-500" },
  { name: "Music", amount: 9.99, percentage: 6, color: "bg-green-500" },
  { name: "Design", amount: 12.0, percentage: 8, color: "bg-purple-500" },
  { name: "Development", amount: 4.0, percentage: 3, color: "bg-gray-600" },
  { name: "Storage", amount: 2.99, percentage: 2, color: "bg-sky-500" },
  { name: "Other", amount: 28.98, percentage: 18, color: "bg-orange-500" },
];

const monthlySpending = [
  { month: "Oct", amount: 142.5 },
  { month: "Nov", amount: 158.32 },
  { month: "Dec", amount: 165.99 },
  { month: "Jan", amount: 172.45 },
  { month: "Feb", amount: 178.5 },
  { month: "Mar", amount: 156.97 },
];

const savingsOpportunities = [
  {
    name: "YouTube Premium",
    currentPlan: "Individual ($13.99/mo)",
    suggestedPlan: "Family ($22.99/mo split 5 ways)",
    savings: "$9.39/mo",
  },
  {
    name: "Adobe CC",
    currentPlan: "Monthly ($54.99/mo)",
    suggestedPlan: "Annual ($29.99/mo)",
    savings: "$25.00/mo",
  },
  {
    name: "Spotify",
    currentPlan: "Premium ($9.99/mo)",
    suggestedPlan: "Student ($4.99/mo)",
    savings: "$5.00/mo",
  },
];

const Analytics = () => {
  const { subscriptions } = useSubscriptionStore();

  const totalSpending = categoryData.reduce((acc, cat) => acc + cat.amount, 0);
  const maxAmount = Math.max(...monthlySpending.map((m) => m.amount));

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
                subscriptions
                  .filter((subscription) =>
                    upcomingInterval(new Date(subscription.renewalDate), 7),
                  )
                  .reduce((sum, sub) => sum + +sub.price, 0) as any
              }
            </div>
            <div className="mt-1 flex items-center text-xs text-accent-foreground">
              12% less than last week
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">This month</div>
            <div className="font-bold mt-1 text-2xl">
              $
              {
                subscriptions
                  .filter((subscription) =>
                    upcomingInterval(new Date(subscription.renewalDate), 30),
                  )
                  .reduce((sum, sub) => sum + +sub.price, 0) as any
              }
            </div>
            <div className="mt-1 flex items-center text-xs text-accent-foreground">
              12% less than last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Last 6 months</div>
            <div className="font-bold mt-1 text-2xl">
              $
              {
                subscriptions
                  .filter((subscription) => {
                    const currentDate = new Date();
                    const lastSixMonths = new Date();
                    lastSixMonths.setDate(currentDate.getDate() - 182);

                    return (
                      new Date(subscription.renewalDate).getDate() >=
                        lastSixMonths.getDate() &&
                      new Date(subscription.renewalDate).getDate() <=
                        currentDate.getDate()
                    );
                  })
                  .reduce((sum, sub) => sum + +sub.price, 0) as any
              }
            </div>
            <div className="mt-1 flex items-center text-xs text-accent-foreground">
              12% less than last half the year
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Average monthly</div>
            <div className="font-bold mt-1 text-2xl">
              $
              {
                subscriptions
                  .filter((subscription) => {
                    const currentDate = new Date();
                    const lastSixMonths = new Date();
                    lastSixMonths.setDate(currentDate.getDate() - 182);

                    return (
                      new Date(subscription.renewalDate).getDate() >=
                        lastSixMonths.getDate() &&
                      new Date(subscription.renewalDate).getDate() <=
                        currentDate.getDate()
                    );
                  })
                  .reduce((sum, sub) => (sum + +sub.price) / 6, 0)
                  .toFixed(2) as any
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
              {categoryData.map((category) => (
                <div key={category.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={`size-3 rounded-full ${category.color}`}
                      />
                      <span>{category.name}</span>
                    </div>
                    <span className="font-medium">
                      ${category.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${category.color}`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Opportunities */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Savings Opportunities</CardTitle>
          <CardDescription>
            We found some ways you could save money on your subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {savingsOpportunities.map((opportunity) => (
              <div
                key={opportunity.name}
                className="flex flex-col gap-4 rounded-lg border border-border bg-secondary/30 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="font-medium">{opportunity.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Current: {opportunity.currentPlan}
                  </div>
                  <div className="text-sm text-accent">
                    Suggested: {opportunity.suggestedPlan}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-accent text-accent-foreground">
                    Save {opportunity.savings}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
              <div className="text-sm text-muted-foreground">2025 Total</div>
              <div className="mt-1 text-2xl font-bold">$1,856.32</div>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <div className="text-sm text-muted-foreground">2026 YTD</div>
              <div className="mt-1 text-2xl font-bold">$507.92</div>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <div className="text-sm text-muted-foreground">
                Projected 2026
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-2xl font-bold">$1,949.64</span>
                <div className="flex items-center text-sm text-red-500">
                  <ArrowUp className="size-3" />
                  5%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
