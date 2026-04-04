"use client";

import { Card, CardContent } from "@/components/ui/card";
import { upcomingInterval } from "@/lib/utils";
import { useSubscriptionStore } from "@/store/useSubscriptionsStore";

const Analytics = () => {
  const { subscriptions } = useSubscriptionStore();

  const totalSpending = subscriptions.reduce((sum, sub) => sum + +sub.price, 0);
  const maxAmount = Math.max(...subscriptions.map((sub) => +sub.price));

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
                  .reduce((sum, sub) => (sum + +sub.price) / 6, 0) as any
              }
            </div>
            <div className="mt-1 flex items-center text-xs text-accent-foreground">
              Based on last 6 months
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
