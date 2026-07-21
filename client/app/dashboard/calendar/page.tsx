"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { parseCurrency, getSubsByInterval } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { Subscription } from "@/store/useSubscriptionsStore";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const randomColor = () => {
  const colors = [
    "bg-red-700/50",
    "bg-blue-700/50",
    "bg-green-700/50",
    "bg-yellow-700/50",
    "bg-purple-700/50",
  ];

  const random = Math.floor(Math.random() * colors.length);
  
  return colors[random];
};

const Calendar = () => {
  const [upcomingRenewals, setUpcomingRenewals] = useState<
    Subscription[] | null
  >([]);
  const [dateSubs, setDateSubs] = useState<Subscription[] | null>([]);
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  const { user, loading, fetchUser } = useAuthStore();
  const router = useRouter();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // parsing to set the format to 1st
  // to get the maximum number of days from the end of the month (+1 the next month but still the current (0))
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // will return 28/29/30/31 in date format

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "default",
    { month: "long" },
  );

  const totalCostThisMonth = dateSubs?.reduce(
    (sum, sub) => sum + +sub.price,
    0,
  );

  const getPaymentsForDay = (day: number) => {
    if (!dateSubs) return [];

    return (
      dateSubs?.filter(
        (subscription) => new Date(subscription.renewalDate).getDate() === day,
      ) || []
    );
  };

  // to be displayed in the calendar component
  const calendarDays = [];
  // set content to null to show empty space decoration for previous month days
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Fetch subscriptions by date filter
  useEffect(() => {
    if (!user) return;

    const fetchSubsDate = async () => {
      const params = new URLSearchParams();

      const from = new Date(currentYear, currentMonth, 1);
      params.set("from", from.toString());

      const to = new Date(currentYear, currentMonth, daysInMonth);
      params.set("to", to.toString());

      let query = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/subscriptions/user/${user._id}?${params.toString()}`;

      const res = await fetch(query, {
        credentials: "include",
      });

      const result = await res.json();

      if (!result.success) return;

      setDateSubs(
        result?.data?.filter((sub: Subscription) => sub.status === "active"),
      );
    };

    fetchSubsDate();
  }, [currentYear, currentMonth]);

  useEffect(() => {
    const fetchUpcomingRenewals = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/subscriptions/upcoming-renewals`,
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
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user && !loading) router.push("/login");
  }, [user, loading]);

  const handleNextMonth = () => {
    if (currentMonth == 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handlePreviousMonth = () => {
    if (currentMonth == 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

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
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {monthName} - {currentYear}
          </h2>
          <p className="text-muted-foreground font-semibold">
            ${totalCostThisMonth?.toFixed(2)} in payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex items-center justify-center rounded-2xl w-24 px-4 py-3 bg-secondary font-semibold">
            {monthName}
          </div>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-border">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-muted-foreground font-medium text-sm"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {
              calendarDays.map((day, index) => {
                const payments = day ? getPaymentsForDay(day) : [];
                const isToday = day === currentDate.getDate();
                const isPast =
                  day !== null &&
                  day < new Date().getDate() &&
                  currentMonth <= new Date().getMonth();

                return (
                  <div
                    key={index}
                    className={`min-h-24 border-b border-r border-border p-2 transition-colors
                   last:border-r-0 hover:bg-secondary/30 ${day === null ? "bg-secondary/10" : ""}
                    ${isToday ? "bg-accent/10" : ""}
                     ${isPast ? "opacity-40" : ""}`}
                  >
                    {day && (
                      <>
                        <div
                          className={`mb-1 text-sm ${
                            isToday
                              ? "flex size-7 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {day}
                        </div>
                        <div className="space-y-1">
                          {payments?.map((payment, index) => (
                            <div
                              key={index}
                              className={`flex items-center
                               gap-1 rounded px-1.5 py-0.5 text-xs text-white ${randomColor()}`}
                            >
                              <span className="truncate font-bold">
                                {payment.name}
                              </span>
                            </div>
                          ))}
                          {/* more than 4 won't shown in cards */}
                          {payments.length > 4 && (
                            <div className="text-xs text-muted-foreground">
                              +{payments!.length - 4} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              }) as any
            }
          </div>
        </CardContent>
      </Card>

      {/* Upcoming list */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>This week</CardTitle>
            <CardDescription>Upcoming subscriptions this week</CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto">
            <div className="space-y-3">
              {
                getSubsByInterval(upcomingRenewals!, "currentWeek").map(
                  (subscription, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between
                    border-border border p-3 rounded-lg ${randomColor()}`}
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{subscription.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.renewalDate.toString().split("T")[0]}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold">
                        {parseCurrency(subscription.currency)}{" "}
                        {+subscription.price.toFixed(2)}
                      </div>
                    </div>
                  ),
                ) as any
              }
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Later this month</CardTitle>
            <CardDescription>Later payments this month</CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto">
            <div className="space-y-3">
              {
                getSubsByInterval(upcomingRenewals!, "currentMonth").map(
                  (subscription, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between rounded-lg border border-border p-3 ${randomColor()}`}
                    >
                      <div className="flex items-center gap3">
                        <div>
                          <div className="font-medium">{subscription.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.renewalDate.toString().split("T")[0]}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold">
                        {parseCurrency(subscription.currency)}{" "}
                        {+subscription.price.toFixed(2)}
                      </div>
                    </div>
                  ),
                ) as any
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
