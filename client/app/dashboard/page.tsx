"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, Calendar, CreditCard, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Subscription,
  useSubscriptionStore,
} from "@/store/useSubscriptionsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { comparePay, parseCurrency, getSubsByInterval } from "@/lib/utils";

const DashboardPage = () => {
  const { subscriptions, setSubscriptions } = useSubscriptionStore();
  const { user, loading, fetchUser } = useAuthStore();
  const [upcomingRenewals, setUpcomingRenewals] = useState<
    Subscription[] | null
  >([]);

  const router = useRouter();

  const totalYearly = getSubsByInterval(subscriptions, "wholeCurrYear").reduce(
    (sum, curr) => sum + +curr.price,
    0,
  );

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchUpcomingRenewals = async () => {
      const res = await fetch(
        `${process.env.SERVER_URL}/api/v1/subscriptions/upcoming-renewals`,
        {
          credentials: "include",
        },
      );

      const result = await res.json();
      setUpcomingRenewals(result.data);
    };

    fetchUpcomingRenewals();
  }, []);

  // Fetch subscriptions
  useEffect(() => {
    if (!user) return;

    const fetchUserSubs = async () => {
      const res = await fetch(
        `${process.env.SERVER_URL}/api/v1/subscriptions/user/${user._id}`,
        {
          credentials: "include",
        },
      );

      const result = await res.json();

      if (!result.success) return;

      setSubscriptions(result.data);
    };

    fetchUserSubs();
  }, [user, loading]);

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
    <div className="bg-background space-y-6">
      {/* Stats grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex items-center justify-between pb-1">
            <CardTitle className="text-muted-foreground text-sm font-bold">
              Monthly spend
            </CardTitle>
            <CreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              $
              {getSubsByInterval(subscriptions, "currentMonth")
                .reduce((sum, current) => sum + +current?.price, 0)
                .toFixed(2)}
            </div>
            <div className="flex items-center font-semibold text-muted-foreground mt-2">
              <span className="text-muted-foreground">
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
        <Card className="bg-card border-border">
          <CardHeader className="flex items-center justify-between pb-1">
            <CardTitle className="text-muted-foreground text-sm font-bold">
              Yearly projection
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">${totalYearly.toFixed(2)}</div>
            <div className="flex items-center font-semibold text-muted-foreground mt-2">
              <span className="text-muted-foreground">
                {comparePay(
                  getSubsByInterval(subscriptions, "prevYear").reduce(
                    (sum, curr) => sum + +curr.price,
                    0,
                  ),
                  getSubsByInterval(subscriptions, "wholeCurrYear").reduce(
                    (sum, curr) => sum + +curr.price,
                    0,
                  ),
                  "year",
                )}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex items-center justify-between pb-1">
            <CardTitle className="text-muted-foreground text-sm font-bold">
              Active subscriptions
            </CardTitle>
            <Bell className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {subscriptions.filter(
                (subscription) => subscription.status == "active",
              ).length || 0}
            </div>
            <div className="font-semibold text-muted-foreground mt-2">
              <span>
                across{" "}
                {
                  new Set(
                    subscriptions
                      .filter((sub) => sub.status == "active")
                      .map((subscription) => subscription.category),
                  ).size
                }{" "}
                categories
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex items-center justify-between pb-1">
            <CardTitle className="text-muted-foreground text-sm font-bold">
              Upcoming renewals (30 days)
            </CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              $
              {
                getSubsByInterval(upcomingRenewals!, "currentMonth")
                  .reduce((sum, current) => sum + +current?.price, 0)
                  .toFixed(2) as any
              }
            </div>
            <div className="flex items-center font-semibold text-muted-foreground mt-2">
              <span>
                {
                  getSubsByInterval(upcomingRenewals!, "currentMonth")
                    .length as any
                }{" "}
                payments scheduled
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-6 h-99">
        <Card className="border-border bg-card lg:col-span-3 md:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming renewals</CardTitle>
            <CardDescription>
              Your scheduled subscriptions payments
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto">
            <div className="space-y-3">
              {getSubsByInterval(upcomingRenewals!, "currentYear").map(
                (sub, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border-border bg-accent/90 px-4 py-3"
                  >
                    <div className="gap-4 flex items-center">
                      <div className="text-sm font-bold w-30">{sub?.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {new Date(sub?.renewalDate).toDateString()}
                      </div>
                      <div className="ml-15">"{sub?.description}"</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="mr-4 text-xs">{sub?.paymentMethod}</div>
                      {/* Diference of days from today until renewal date */}
                      <div className="text-muted-foreground font-semibold">
                        7 days
                      </div>
                      <div className="text-right">
                        <div className="flex space-x-1">
                          {/* compute currency to $ */}
                          <div className="font-bold">
                            {parseCurrency(sub?.currency)}
                          </div>
                          <div className="font-bold">
                            {sub?.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sub?.category.length > 4
                            ? sub.category.slice(0, 4)
                            : sub?.category}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
