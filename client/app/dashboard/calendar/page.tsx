"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { upcomingInterval } from "@/lib/utils";
import { useSubscriptionStore } from "@/store/useSubscriptionsStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Calendar = () => {
  const { subscriptions } = useSubscriptionStore();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // parsing to set the format to 1st
  // to get the maximum number of days from the end of the month (+1 the next month but still the current (0))
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // will return 28/29/30/31 in date format

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "default",
    { month: "long" },
  );

  const totalCostThisMonth = subscriptions.reduce(
    (sum, sub) => sum + +sub.price,
    0,
  );

  const getPaymentsForDay = (day: number) => {
    return subscriptions?.filter(
      (subscription) => new Date(subscription.renewalDate).getDay() === day,
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

  const randomColor = () => {
    const colors = [
      "bg-red-700",
      "bg-blue-700",
      "bg-green-700",
      "bg-yellow-700",
      "bg-purple-700",
    ];

    const random = Math.floor(Math.random() * colors.length);
    return colors[random];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {monthName} - {currentYear}
          </h2>
          <p className="text-muted-foreground font-semibold">
            ${totalCostThisMonth.toFixed(2)} in payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm">
            Today
          </Button>
          <Button variant="outline" size="icon">
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
                const isToday = day === currentDate.getDay();
                const isPast = day !== null && day < currentDate.getDay();

                return (
                  <div
                    key={index}
                    className={`min-h-24 border-b border-r border-border p-2 transition-colors
                   last:border-r-0 hover:bg-secondary/30 ${day === null ? "bg-secondary/10" : ""}
                    ${isToday ? "bg-accent/10" : ""}
                     ${isPast ? "opacity-50" : ""}`}
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
                          {payments.map((payment, index) => (
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
                              +{payments.length - 4} more
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
            <CardDescription>
              Upcoming subscriptions in the next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {
                subscriptions
                  .filter((subscription) =>
                    upcomingInterval(new Date(subscription.renewalDate), 7),
                  )
                  .map((subscription, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between
                   bg-secondary/30 border-border border p-3 rounded-lg"
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
                        {subscription.currency} {+subscription.price.toFixed(2)}
                      </div>
                    </div>
                  )) as any
              }
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Later this month</CardTitle>
            <CardDescription>Payments after this next week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {
                subscriptions
                  .filter(
                    (subscription) =>
                      upcomingInterval(
                        new Date(subscription.renewalDate),
                        30,
                      ) &&
                      new Date(subscription.renewalDate).getDate() + 7 >
                        new Date(subscription.renewalDate).getDate(),
                  )
                  .map((subscription, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-border p-3 bg-secondary/30"
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
                        {subscription.currency} {+subscription.price.toFixed(2)}
                      </div>
                    </div>
                  )) as any
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
