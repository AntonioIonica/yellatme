"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen text-foreground">
      {/* Navigation */}
      <header
        className="fixed top-0 left-0 right-0 z-20 bg-background/30
       border-b border-border backdrop-blur-sm rounded-lg mx-4 mb-4"
      >
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            Logo
          </Link>

          <div className="md:flex items-center gap-10 hidden">
            <Link href="#features">Features</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#demo">Demo</Link>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/sign-up">Sign up</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Get started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero section */}
      <section
        className="relative flex min-h-screen items-start
       justify-center px-6 pt-30"
      >
        <div className="relative text-center z-10 mx-auto max-w-4xl">
          <div
            className="inline-flex items-center mb-6 rounded-full
           text-muted-foreground bg-secondary/40 text-[17px] font-semibold px-4 py-2"
          >
            <span>
              Never miss a payment again. Cancel your subscriptions at time.
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl tracking-tight text-balance font-bold">
            Take control of upcoming Payments.
          </h1>
          <p className="mt-6 mx-auto text-pretty max-w-2xl text-xl md:text-2xl text-muted-foreground">
            Track all your subscriptions in one place. Get annoying emails
            before billing dates to save money and time.
          </p>
          <div className="flex flex-col mt-8 items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="px-8">
              <Link href="/sign-up">Start Free Trial</Link>
            </Button>
            <Button size="lg" asChild>
              <Link href="#demo">Watch demo</Link>
            </Button>
          </div>
          <div className="mt-12 flex items-center justify-center text-muted-foreground text-lg gap-8">
            <div className="flex items-center gap-2">
              <Check className="size-4 text-accent" />
              <span>Try 3 events for free</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="size-4 text-accent" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="size-4 text-accent" />
              <span>No credit card required to start</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section
        id="features"
        className="py-24 border-border border-t bg-background"
      >
        <div className="max-w-7xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              System which will help you to organize your subscriptions
            </p>
          </div>
          <div className="grid gap-4 grid-cols-3">
            <Card className="border-border bg-card/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Email reminders</h3>
                <p className="text-muted-foreground">
                  Get notified via email. Starting 7 days before so you won't
                  have excuses.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  Spending analytics
                </h3>
                <p className="text-muted-foreground">
                  Vizualize your spendings through charts and recommendation
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  Categorize your subscriptions
                </h3>
                <p className="text-muted-foreground">
                  Get disciplined by categorizing them. Importance. Topics.
                  Costs.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  Multiple currency
                </h3>
                <p className="text-muted-foreground">
                  Save your subscriptions renewals in different currencies
                  available
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  AI recommendation
                </h3>
                <p className="text-muted-foreground">
                  Our AI analyze your spendings and helps you with eliminating
                  unnecessary spendings
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  Save your subscriptions in one place. Use them in any.
                </h3>
                <p className="text-muted-foreground">
                  Our application is avaiable for both mobile and web.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="py-24 border-border border-t bg-background"
      >
        <div className="max-w-7xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Simple pricing</h2>
            <p className="text-muted-foreground text-lg mt-4">
              Only one plan. No headaches. Full transparency.
            </p>
          </div>
          <div className="mx-auto flex gap-10 max-w-5xl justify-center">
            {/* Free plan */}
            <Card className="border-border bg-secondary/30">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Free tier</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Perfect to try it
                  </p>
                </div>
                <div className="mb-6">
                  <span className="font-bold text-3xl">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="text-black size-4" />
                    <span className="text-muted-foreground">
                      Up to 2 subscriptions
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="text-black size-4" />
                    <span className="text-muted-foreground">
                      Up to monthly reminders
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="text-black size-4" />
                    <span className="text-muted-foreground">
                      Simple analytics
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground line-through">
                      AI analyzer for recommendations
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground line-through">
                      Calendar integration
                    </span>
                  </li>
                </ul>

                <Button asChild className="w-full" variant="outline">
                  <Link href="/sign-up">Get started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Paid plan */}
            <Card className="border-accent bg-secondary/30">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Pro</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    For power users
                  </p>
                </div>
                <div className="mb-6">
                  <span className="font-bold text-3xl">$4</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="text-black size-4" />
                    <span className="text-muted-foreground">
                      Unlimited subscriptions
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="text-black size-4" />
                    <span className="text-muted-foreground">
                      Daily/weekly/monthly/yearly frequency
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="text-black size-4" />
                    <span className="text-muted-foreground">
                      Advanced analytics
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="text-black size-4" />
                    <span className="text-muted-foreground">
                      AI analyzer for recommendations
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="text-black size-4" />
                    <span className="text-muted-foreground">
                      Calendar integration
                    </span>
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/sign-up">Get started now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section
        id="demo"
        className="py-24 border-border border-t bg-background
         min-h-screen  flex items-center justify-center"
      >
        <div className="max-w-9xl px-6">Video</div>
      </section>

      {/* CTA */}
      <section className="py-24 border-border border-t bg-background">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="font-bold text-3xl md:text-4xl">
            Ready to take control of your subscriptions?!
          </h2>
          <div className="mt-8">
            <Button asChild size="lg" className="px-8">
              <Link href="/sign-up">Try it for free</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-6 border-border border-t">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center">
              <span className="font-semibold text-xl">YellAtMe</span>
            </div>
            <div className="flex gap-4 items-center text-sm text-muted-foreground">
              <Link
                href="/privacy"
                className="transition-colors hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                href="/email"
                className="transition-colors hover:text-foreground"
              >
                Contact
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2026 YellAtMe. All rights reserved. By AntonioII
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
