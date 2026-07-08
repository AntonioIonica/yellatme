"use client";

import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { SubmitEventHandler, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useSubscriptionStore } from "@/store/useSubscriptionsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

const AddSubscriptionDialog = () => {
  const addSubscription = useSubscriptionStore(
    (state) => state.addSubscription,
  );

  const { user, fetchUser } = useAuthStore();

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });
  const [formSelectObj, setFormSelectObj] = useState({
    currency: "EURO",
    frequency: "weekly",
    category: "technology",
    status: "active",
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSubmitForm: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const formObject = Object.fromEntries(formData.entries());

    const { subName, subDescription, price, paymentMethod } = formObject;

    const dataObject = {
      name: subName,
      description: subDescription,
      price,
      currency: formSelectObj.currency,
      frequency: formSelectObj.frequency,
      category: formSelectObj.category,
      paymentMethod,
      status: formSelectObj.status,
      startDate: date?.from,
      renewalDate: date?.to,
      user: user?._id,
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/subscriptions`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataObject),
      },
    );

    const result = await res.json();
    
    if (result.success) {
      toast.success(
        `Subscription ${result?.data?.subscription?.name} was added to your collection!`,
        {
          position: "top-center",
          style: { fontWeight: 600 },
          closeButton: true,
        },
      );
      // Add the subscription to the UI and refresh the number of them
      addSubscription(result?.data?.subscription);

      setDialogOpen(false);
    }

    toast.error(result.error, {
      position: "top-center",
      style: { fontWeight: 600 },
      closeButton: true,
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="default" className="gap-3">
          <Plus className="size-4" />
          <span>Add subscription</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm h-[80vh] w-full">
        <form
          onSubmit={handleSubmitForm}
          className="h-full flex flex-col overflow-auto"
        >
          <DialogHeader>
            <DialogTitle>Add new subscription</DialogTitle>
            <DialogDescription>
              Renewal date is optional as it is calculated from frequency. Click
              save when done.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="overflow-scroll px-1 py-3 flex-1">
            {/* Name */}
            <Field>
              <Label htmlFor="subName">Subscription name:* </Label>
              <Input id="subName" name="subName" defaultValue="Netflix" />
            </Field>

            {/* Description */}
            <Field>
              <Label htmlFor="subDescription">Subscription description: </Label>
              <Input
                id="subDescription"
                name="subDescription"
                defaultValue="Family Netflix description..."
              />
            </Field>

            {/* Currency */}
            <Field>
              <FieldLabel>Currency: </FieldLabel>
              <Select
                value={formSelectObj.currency}
                onValueChange={(value) =>
                  setFormSelectObj((prev) => ({ ...prev, currency: value }))
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
              <Input id="price" name="price" type="number" />
            </Field>

            {/* Frequency */}
            <Field>
              <FieldLabel>Frequency: </FieldLabel>
              <Select
                value={formSelectObj.frequency}
                onValueChange={(value) =>
                  setFormSelectObj((prev) => ({ ...prev, frequency: value }))
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
              <FieldDescription>How often the payment occurs</FieldDescription>
            </Field>

            {/* Category */}
            <Field>
              <FieldLabel>Category: </FieldLabel>
              <Select
                value={formSelectObj.category}
                onValueChange={(value) =>
                  setFormSelectObj((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="technology" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
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
              <Label htmlFor="paymentMethod">Payment method:* </Label>
              <Input
                id="paymentMethod"
                name="paymentMethod"
                type="text"
                defaultValue="Credit card"
              />
            </Field>

            {/* Status */}
            <Field>
              <FieldLabel>Status: </FieldLabel>
              <Select
                value={formSelectObj.status}
                onValueChange={(value) =>
                  setFormSelectObj((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="active" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
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
            <Button type="submit">Add subscription</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubscriptionDialog;
