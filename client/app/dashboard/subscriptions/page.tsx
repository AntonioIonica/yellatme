"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { parseCurrency, upcomingInterval } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Subscription,
  useSubscriptionStore,
} from "@/store/useSubscriptionsStore";
import {
  Activity,
  ChartColumnStacked,
  ClipboardClock,
  Edit,
  MonitorCheck,
  MoreHorizontal,
  Search,
  SortAscIcon,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type SubscriptionId = Subscription["id"];

function debounce(func: any) {
  let timer: NodeJS.Timeout;

  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, 500);
  };
}

const Subscriptions = () => {
  const { subscriptions, setSubscriptions, deleteSubscription } =
    useSubscriptionStore();
  const { user, loading, fetchUser } = useAuthStore();

  const [searchBar, setSearchBar] = useState<string>();
  const [category, setCategory] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [sortDir, setSortDir] = useState<string>();

  const router = useRouter();

  // Fetch subscriptions
  useEffect(() => {
    if (!user) return;

    const fetchUserSubs = async () => {
      const params = new URLSearchParams();

      if (searchBar) {
        params.append("search", searchBar);
      }

      if (category) {
        params.append("category", category);
      }

      if (status) {
        params.append("status", status);
      }

      if (sortDir) {
        params.append("sortDir", sortDir);
      }

      let query = `http://localhost:5500/api/v1/subscriptions/user/${user._id}?${params.toString()}`;

      const res = await fetch(query, {
        credentials: "include",
      });

      const result = await res.json();

      if (!result.success) return;

      setSubscriptions(result.data);
    };

    fetchUserSubs();
  }, [sortDir, status, searchBar, category, user, loading]);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user && !loading) router.push("/login");
  }, [user, loading]);

  const debouncedSearch = useMemo(() => {
    return debounce((value: string) => setSearchBar(value));
  }, []);

  const handleDeleteSub = async (id: SubscriptionId) => {
    const res = await fetch(
      `http://localhost:5500/api/v1/subscriptions/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    deleteSubscription(id);
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
      {/* Search/Filter section */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-98">
          <Search className="absolute left-3 top-1/2 size-4 text-muted-foreground -translate-y-1/2" />
          <Input
            placeholder="Search subscriptions..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="pl-9 bg-secondary/30"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Category */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ChartColumnStacked className="size-4" />
                Category
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setCategory("technology")}>
                Technology
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setCategory("auto")}>
                Auto
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setCategory("lifestyle")}>
                Lifestyle
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setCategory("entertainment")}>
                Entertainment
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setCategory("finance")}>
                Finance
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setCategory("house")}>
                House
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setCategory("work")}>
                Work
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setCategory("garden")}>
                Garden
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setCategory("tools")}>
                Tools
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setCategory("other")}>
                Others
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <MonitorCheck className="size-4" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setStatus("active")}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setStatus("expired")}>
                Expired
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setStatus("cancelled")}>
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SortAscIcon className="size-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setSortDir("asc")}>
                Asc
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSortDir("desc")}>
                Desc
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                  (subscription) => subscription?.status === "active",
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
                  upcomingInterval(
                    new Date(subscription?.renewalDate),
                    30,
                    "more",
                  ),
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
                    <CardTitle className="text-bold text-lg">
                      {subscription?.name}
                    </CardTitle>
                  </div>
                  <div className="text-lg font-semibold mr-6 flex items-center justify-between space-x-16">
                    <span className="text-xs uppercase">
                      {subscription?.category.slice(0, 4)}
                    </span>
                    <span className="text-muted-foreground">
                      {parseCurrency(subscription?.currency)}
                      {+subscription?.price}
                    </span>
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

                    <DropdownMenuItem
                      
                      disabled={subscription.status === "expired"}
                    >
                      {subscription?.status === "active" ? (
                        <>
                          <ClipboardClock className="mr-2 size-4" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Activity className="mr-2 size-4" />
                          Active
                        </>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        handleDeleteSub(subscription?.id);
                      }}
                    >
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
                <span className="text-sm">{subscription?.frequency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Description
                </span>
                <span className="text-sm">
                  {subscription?.description.slice(0, 20)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Renewal date
                </span>
                <span className="text-sm">
                  {/* First is parsed to date from db date, then formated for estetics */}
                  {new Date(subscription?.renewalDate).toDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Badge
                  variant={
                    subscription?.status === "active" ? "default" : "secondary"
                  }
                  className={
                    subscription?.status === "active"
                      ? "text-accent-foreground bg-green-300"
                      : ""
                  }
                >
                  {subscription?.status}
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
