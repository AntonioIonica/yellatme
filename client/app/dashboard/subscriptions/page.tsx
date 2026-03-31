"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { upcomingMonth } from "@/lib/utils";
import {
  Subscription,
  useSubscriptionStore,
} from "@/store/useSubscriptionsStore";
import {
  Activity,
  ChartColumnStacked,
  ClipboardClock,
  Edit,
  Filter,
  MonitorCheck,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
import { ChangeEvent, useState } from "react";

const Subscriptions = () => {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const [searchResult, setSearchResult] =
    useState<ChangeEvent<HTMLInputElement, HTMLInputElement>>();

  return (
    <div className="space-y-6">
      {/* Search/Filter section */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 text-muted-foreground -translate-y-1/2" />
          <Input
            placeholder="Search subscriptions..."
            onChange={(e) => setSearchResult(e)}
            className="pl-9 bg-secondary/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="size-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <ChartColumnStacked className="size-4" />
            Category
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <MonitorCheck className="size-4" />
            Status
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total active</div>
            <div className="font-bold text-2xl mt-1">
              {
                subscriptions?.filter(
                  (subscription) => subscription.status == "active",
                ).length as any
              }
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">
              Upcoming renewals
            </div>
            <div className="font-bold text-2xl mt-1">
              {
                subscriptions?.filter((subscription) =>
                  upcomingMonth(new Date(subscription.renewalDate)),
                ).length as any
              }
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">
              Total subscriptions
            </div>
            <div className="font-bold text-2xl mt-1">
              {subscriptions?.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <br />

      {/* Subscriptions grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((subscription, index) => (
          <Card key={index} className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-col items-center justify-between">
                    <CardTitle className="text-bold">
                      {subscription.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {subscription.category.slice(0, 4)}
                    </CardDescription>
                  </div>
                  <div className="text-lg font-semibold mr-6">
                    {subscription.currency}
                    {+subscription.price}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  {/* align = end means posing the dropdown from the end of the card to the beginning, inside it */}
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {subscription.status === "active" ? (
                        <>
                          <ClipboardClock className="mr-2 size-4" />
                          Inactive
                        </>
                      ) : (
                        <>
                          <Activity className="mr-2 size-4" />
                          Active
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Frequency</span>
                <span className="text-sm">{subscription.frequency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Description
                </span>
                <span className="text-sm">
                  {subscription.description.slice(0, 20)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Renewal date
                </span>
                <span className="text-sm">
                  {/* First is parsed to date from db date, then formated for estetics */}
                  {new Date(subscription.renewalDate).toDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Badge
                  variant={
                    subscription.status === "active" ? "default" : "secondary"
                  }
                  className={
                    subscription.status === "active"
                      ? "text-accent-foreground bg-green-300"
                      : ""
                  }
                >
                  {subscription.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Subscriptions;
