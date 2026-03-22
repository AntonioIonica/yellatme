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

const upcomingSubscriptions = [
  {
    name: "Netflix",
    description: "Netflix family plan",
    price: 15.99,
    currency: "USD",
    startDate: "Mar 01, 2026",
    renewalDate: "Mar 30 2026",
    frequency: "monthly",
    daysUntil: 20,
    category: "entertainment",
    status: "active",
    paymentMethod: "Credit card",
  },
  {
    name: "HBO max",
    description: "Hbo premium",
    price: 12.99,
    currency: "USD",
    startDate: "Mar 05, 2026",
    renewalDate: "Apr 04 2026",
    frequency: "monthly",
    daysUntil: 25,
    category: "entertainment",
    status: "active",
    paymentMethod: "Credit card",
  },
  {
    name: "HBO Great max",
    description: "Hbo premium",
    price: 12.99,
    currency: "USD",
    startDate: "Mar 05, 2026",
    renewalDate: "Apr 04 2026",
    frequency: "monthly",
    daysUntil: 25,
    category: "entertainment",
    status: "active",
    paymentMethod: "Credit card",
  },
  {
    name: "HBO Small max",
    description: "Hbo premium",
    price: 12.99,
    currency: "USD",
    startDate: "Mar 05, 2026",
    renewalDate: "Apr 04 2026",
    frequency: "monthly",
    daysUntil: 25,
    category: "entertainment",
    status: "active",
    paymentMethod: "Credit card",
  },
  {
    name: "HBO BIg max",
    description: "Hbo premium",
    price: 12.99,
    currency: "USD",
    startDate: "Mar 05, 2026",
    renewalDate: "Apr 04 2026",
    frequency: "monthly",
    daysUntil: 25,
    category: "entertainment",
    status: "active",
    paymentMethod: "Credit card",
  },
  {
    name: "HBO PRO max",
    description: "Hbo premium",
    price: 12.99,
    currency: "USD",
    startDate: "Mar 05, 2026",
    renewalDate: "Apr 04 2026",
    frequency: "monthly",
    daysUntil: 25,
    category: "entertainment",
    status: "active",
    paymentMethod: "Credit card",
  },
];

const DashboardPage = () => {
  const totalMonthly = 156.97;
  const totalYearly = totalMonthly * 12;
  const activeSubscriptions = 12;
  const upcomingPayments = 5;

  const [user, setUser] = useState({ userName: "", userEmail: "" });
  const [loaded, setLoaded] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const fetchUser = async () => {
      const res = await fetch("http://localhost:5500/api/v1/auth/jwt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      setUser((prev) => ({
        ...prev,
        userName: result.userName,
        userEmail: result.userEmail,
      }));
      setLoaded(true);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (loaded && !user) router.push("/login");
  }, [user, loaded]);

  if (!user) return <div>Loading...</div>;

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
            <div className="font-bold text-2xl">${totalMonthly.toFixed(2)}</div>
            <div className="flex items-center font-semibold text-muted-foreground mt-2">
              <span className="text-red-600">12% more</span>
              <span className="ml-1">than last month</span>
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
              <span className="text-red-600">5% more</span>
              <span className="ml-1">than last year</span>
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
            <div className="font-bold text-2xl">{activeSubscriptions}</div>
            <div className="font-semibold text-muted-foreground mt-2">
              <span>Across 5 categories</span>
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
            <div className="font-bold text-2xl">${(65.433).toFixed(2)}</div>
            <div className="flex items-center font-semibold text-muted-foreground mt-2">
              <span>{upcomingPayments} payments scheduled</span>
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
              {upcomingSubscriptions.map((sub) => (
                <div
                  key={sub.name}
                  className="flex items-center justify-between rounded-lg border-border bg-accent/90 px-4 py-3"
                >
                  <div className="gap-4 flex items-center">
                    <div className="text-sm font-bold w-30">{sub.name}</div>
                    <div className="text-muted-foreground text-sm">
                      {sub.renewalDate}
                    </div>
                    <div className="ml-15">"{sub.description}"</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="mr-4 text-xs">{sub.paymentMethod}</div>
                    {/* Diference of days from today until renewal date */}
                    <div className="text-muted-foreground font-semibold">
                      7 days
                    </div>
                    <div className="text-right">
                      <div className="flex">
                        {/* compute currency to $ */}
                        <div className="font-bold">{sub.currency}</div>
                        <div className="font-bold">{sub.price.toFixed(2)}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sub.category}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
