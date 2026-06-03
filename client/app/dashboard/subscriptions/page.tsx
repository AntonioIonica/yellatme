"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseCurrency, getSubsByInterval } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Subscription,
  useSubscriptionStore,
} from "@/store/useSubscriptionsStore";
import {
  Activity,
  CalendarIcon,
  ChartColumnStacked,
  ClipboardClock,
  Edit,
  MonitorCheck,
  MoreHorizontal,
  Search,
  SortAscIcon,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { SubmitEventHandler, useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

export type SubscriptionId = Subscription["_id"];

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
  const {
    subscriptions,
    setSubscriptions,
    editSubscription,
    deleteSubscription,
  } = useSubscriptionStore();
  const { user, loading, fetchUser } = useAuthStore();

  const [searchBar, setSearchBar] = useState<string>();
  const [category, setCategory] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [sortDir, setSortDir] = useState<string>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState<Subscription | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: null!,
    to: null!,
  });

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

      let query = `${process.env.SERVER_URL}/api/v1/subscriptions/user/${user._id}?${params.toString()}`;

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

  useEffect(() => {
    if (selectedSub) {
      setFormData(selectedSub);
    }
  }, [selectedSub]);

  useEffect(() => {
    if (formData) {
      setDate({
        from: new Date(formData?.startDate),
        to: new Date(formData?.renewalDate),
      });
    }
  }, [formData]);

  const debouncedSearch = useMemo(() => {
    return debounce((value: string) => setSearchBar(value));
  }, []);

  const handleDeleteSub = async (id: SubscriptionId) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/subscriptions/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    deleteSubscription(id);
  };

  const handleCancelSub = async (id: SubscriptionId) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/subscriptions/${id}/cancel`,
      {
        method: "PATCH",
        credentials: "include",
      },
    );

    const result = await res.json();
    if (result.success) {
      editSubscription(result.data);
    }
  };

  const handleEditSub: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/subscriptions/${formData?._id}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData?.name,
          description: formData?.description,
          price: formData?.price,
          currency: formData?.currency,
          frequency: formData?.frequency,
          category: formData?.category,
          paymentMethod: formData?.paymentMethod,
          renewalDate: formData?.renewalDate,
        }),
      },
    );

    const result = await res.json();
    if (result.success) {
      editSubscription(result.data.subscription);
      setDialogOpen(false);
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
                getSubsByInterval(subscriptions, "currentMonth").filter(
                  (sub) => sub.status == "active",
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
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogContent className="sm:max-w-sm h-[80vh] w-full">
                    <form
                      onSubmit={(e) => handleEditSub(e)}
                      className="h-full flex flex-col overflow-auto"
                    >
                      <DialogHeader>
                        <DialogTitle>Edit subscription</DialogTitle>
                        <DialogDescription>
                          Choose which field to edit
                        </DialogDescription>
                      </DialogHeader>

                      <FieldGroup className="overflow-scroll px-1 py-3 flex-1">
                        {/* Name */}
                        <Field>
                          <Label htmlFor="subName">Subscription name:* </Label>
                          <Input
                            id="subName"
                            name="subName"
                            value={formData?.name as string}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev!,
                                name: e.target.value,
                              }));
                            }}
                          />
                        </Field>

                        {/* Description */}
                        <Field>
                          <Label htmlFor="subDescription">
                            Subscription description:{" "}
                          </Label>
                          <Input
                            id="subDescription"
                            name="subDescription"
                            value={formData?.description}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev!,
                                description: e.target.value,
                              }));
                            }}
                          />
                        </Field>

                        {/* Currency */}
                        <Field>
                          <FieldLabel>Currency: </FieldLabel>
                          <Select
                            value={formData?.currency}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev!,
                                currency: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="EUR" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                                <SelectItem value="LEI">LEI</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>

                        {/* Price */}
                        <Field>
                          <Label htmlFor="price">Price:* </Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            value={formData?.price}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev!,
                                price: +e.target.value,
                              }))
                            }
                          />
                        </Field>

                        {/* Frequency */}
                        <Field>
                          <FieldLabel>Frequency: </FieldLabel>
                          <Select
                            value={formData?.frequency}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev!,
                                frequency: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="weekly" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FieldDescription>
                            How often the payment occurs
                          </FieldDescription>
                        </Field>

                        {/* Category */}
                        <Field>
                          <FieldLabel>Category: </FieldLabel>
                          <Select
                            value={formData?.category}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev!,
                                category: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="technology" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="technology">
                                  Technology
                                </SelectItem>
                                <SelectItem value="auto">Auto</SelectItem>
                                <SelectItem value="lifestyle">
                                  Lifestyle
                                </SelectItem>
                                <SelectItem value="entertainment">
                                  Entertainment
                                </SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="house">House</SelectItem>
                                <SelectItem value="work">Work</SelectItem>
                                <SelectItem value="garden">Garden</SelectItem>
                                <SelectItem value="tools">Tools</SelectItem>
                                <SelectItem value="other">Others</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>

                        {/* Payment method */}
                        <Field>
                          <Label htmlFor="paymentMethod">
                            Payment method:*{" "}
                          </Label>
                          <Input
                            id="paymentMethod"
                            name="paymentMethod"
                            type="text"
                            value={formData?.paymentMethod}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev!,
                                paymentMethod: e.target.value,
                              }))
                            }
                          />
                        </Field>

                        {/* Dates*/}
                        <Field>
                          <FieldLabel htmlFor="date-picker-range">
                            Start date and Renewal date:*
                          </FieldLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                id="date-picker-range"
                                className="justify-start px-3 font-normal w-full"
                              >
                                <CalendarIcon />
                                {date?.from ? (
                                  date.to ? (
                                    <>
                                      {format(date.from, "LLL dd, y")} -{" "}
                                      {format(date.to, "LLL dd, y")}
                                    </>
                                  ) : (
                                    format(date.from, "LLL dd, y")
                                  )
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={date?.to}
                                onSelect={(newTo) => {
                                  setDate((prev) => ({
                                    ...prev!,
                                    to: newTo,
                                  }));
                                }}
                                numberOfMonths={2}
                              />
                            </PopoverContent>
                          </Popover>
                        </Field>
                      </FieldGroup>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Edit subscription</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  {/* align = end means posing the dropdown from the end of the card to the beginning, inside it */}
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedSub(subscription);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="mr-2 size-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={
                        subscription?.status === "expired" ||
                        subscription?.status === "cancelled"
                      }
                      onClick={() => handleCancelSub(subscription?._id)}
                    >
                      {subscription?.status === "active" ? (
                        <>
                          <ClipboardClock className="mr-2 size-4" />
                          Cancel
                        </>
                      ) : subscription?.status === "cancelled" ? (
                        <>
                          <Activity className="mr-2 size-4" />
                          Cancelled
                        </>
                      ) : (
                        <>
                          <Activity className="mr-2 size-4" />
                          Expired
                        </>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        handleDeleteSub(subscription?._id);
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
