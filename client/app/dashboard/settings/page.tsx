"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitEventHandler, useEffect } from "react";

const proPlanFeatures = [
  "Unlimited subscriptions",
  "Multiple days email notifications",
  "Advanced analytics",
  "Calendar integration",
  "Priority support",
];

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

    const res = await fetch(`http://localhost:5500/api/v1/users/${user._id}`, {
      credentials: "include",
      method: "DELETE",
    });

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

    const res = await fetch(`http://localhost:5500/api/v1/users/${user._id}`, {
      credentials: "include",
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, password }),
    });

    const result = await res.json();
    if (result.success) {
      fetchUser();
    }
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
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-accent text-lg text-accent-foreground">
                {`${user?.name.split(" ")[0].toUpperCase().substring(0, 1) || ""}`}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="hover:cursor-pointer hover:bg-accent-foreground hover:text-accent"
              >
                Change your photo
              </Button>
              <p className="text-sm text-muted-foreground">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>
          <Separator />
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
                <span className="font-bold">Pro Plan</span>
                <Badge className="bg-accent text-accent-foreground">
                  Current
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                $9/month, billed monthly
              </p>
            </div>
            <Button variant="outline">Manage plan</Button>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Your plan includes: </h4>
            <ul className="grid grid-cols-2 gap-2 text-sm text-foreground/70">
              {proPlanFeatures.map((feature, index) => (
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
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Payment method</CardTitle>
          <CardDescription>Manage your payment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stripe here */}
          <div>Add stripe implementation here (WIP)</div>
          {/* Stripe here */}
          <Button className="w-full hover:cursor-pointer" variant="outline">
            Add payment method
          </Button>
        </CardContent>
      </Card>

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
