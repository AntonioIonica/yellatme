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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitEventHandler, useEffect } from "react";

const planFeatures = {
  free: [
    "3 subscriptions",
    "Multiple days email notifications",
    "Simple analytics",
  ],
  pro: [
    "Unlimited subscriptions",
    "Multiple days email notifications",
    "Advanced analytics",
    "Calendar integration",
    "Priority support",
  ],
};

const SettingsPage = () => {
  const { user, loading, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

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

  const handleDeleteAccount = async () => {
    if (!user) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/users/${user._id}`,
      {
        credentials: "include",
        method: "DELETE",
      },
    );

    const result = await res.json();
    if (result.success) {
      router.push(result.redirect);
    }
    return null;
  };

  const handleUpdateUser: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const { name, password } = Object.fromEntries(formData.entries());

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/users/${user._id}`,
      {
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, password }),
      },
    );

    const result = await res.json();
    if (result.success) {
      fetchUser();
    }
  };

  const handleChangePlan = async () => {
    if (!user) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/users/${user._id}/change-plan`,
      {
        credentials: "include",
      },
    );

    const result = await res.json();
    if (result.success) {
      router.push("/dashboard");
    }
  };

  const handleSubscribe = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/billing/checkout`,
      {
        method: "POST",
        credentials: "include",
      },
    );

    const result = await res.json();

    setTimeout(() => router.push(result.url), 500);
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <Card id="profile" className="border-border bg-card">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="flex flex-col gap-6" onSubmit={handleUpdateUser}>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name: </Label>
                <Input
                  id="name"
                  type="text"
                  defaultValue={user?.name as string}
                  className="bg-secondary/30 w-[30%]"
                  name="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password: </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  className="bg-secondary/30 w-[30%]"
                />
              </div>
            </div>
            <div className="flex justify-start">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Subscription plan */}
      <Card id="payment" className="border-border bg-card">
        <CardHeader>
          <CardTitle>Subscription plan</CardTitle>
          <CardDescription>Manage your type of plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center rounded-lg border border-accent bg-accent/10 p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">
                  {user?.plan.toUpperCase().concat(" plan")}
                </span>
                <Badge className="bg-accent border-border text-accent-foreground">
                  Current
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {user.plan === "pro"
                  ? "$3/month, billed monthly"
                  : +user?.freeTokens + " tokens left"}
              </p>
            </div>
            <div className="flex space-x-2 text-sm font-light items-center justify-between">
              <span
                className={`${user?.subscriptionStatus === "active" ? "text-green-400" : ""} border border-accent font-semibold px-2 py-1.5 rounded-sm uppercase`}
              >
                {user?.subscriptionStatus}
              </span>
              <span>
                {user?.currentSubscriptionEnd?.toString().split("T")[0] ||
                  "Not available"}
              </span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Manage plan</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-normal text-lg">
                    Switch to free plan
                  </DialogTitle>
                  <DialogDescription className="text-foreground font-semibold">
                    Are you sure you want to cancel your subscription to get
                    back to free plan?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-between items-center">
                  <Button
                    onClick={handleChangePlan}
                    variant="default"
                    className="font-bold text-lg"
                  >
                    Confirm change
                  </Button>
                  <DialogClose asChild>
                    <Button type="button">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Your plan includes: </h4>
            <ul className="grid grid-cols-2 gap-2 text-sm text-foreground/70">
              {planFeatures[user.plan].map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-accent" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Payments methods */}
      {user?.subscriptionStatus === "expired" ? (
        ""
      ) : (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Payment method</CardTitle>
            <CardDescription>Pay to upgrade to PAID version</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stripe */}
            <Button
              className="w-full hover:cursor-pointer"
              variant="outline"
              onClick={handleSubscribe}
            >
              Upgrade
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Danger zone */}
      <Card className="border-destructive/50 bg-card">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Irreversible actions for your account!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">Delete account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all of your data
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="size-4" /> Delete account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-destructive/70 font-semibold text-lg">
                    Delete your account
                  </DialogTitle>
                  <DialogDescription className="text-foreground font-semibold">
                    Are you sure you want to delete your account?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-between items-center">
                  <Button
                    onClick={handleDeleteAccount}
                    variant="destructive"
                    className="font-bold text-lg"
                  >
                    Delete account
                  </Button>
                  <DialogClose asChild>
                    <Button type="button">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
