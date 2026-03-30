"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEventHandler, useState } from "react";

const Login = () => {
  const router = useRouter();

  const handleSubmitLogin: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const formObj = Object.fromEntries(formData.entries());
    const { email, password } = formObj;

    const res = await fetch("http://localhost:5500/api/v1/auth/sign-in", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await res.json();

    if (result.success) router.push("/dashboard");
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="px-20 h-20 w-full flex items-center justify-between">
        <div>
          <Link href="/">Logo</Link>
        </div>
        <Button asChild>
          <Link href="/sign-up">Need an account?! Register here</Link>
        </Button>
      </div>
      <div className="flex items-center justify-center mt-30">
        <form
          onSubmit={(e) => handleSubmitLogin(e)}
          method="POST"
          className="flex flex-col space-y-4 bg-card rounded-xl p-8 w-80"
        >
          <label className="text-xl font-bold" htmlFor="email">
            Email:{" "}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@gmail.com"
            className="text-lg"
          />

          <label className="text-xl font-bold" htmlFor="password">
            Password:{" "}
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className="text-lg"
          />

          <Button className="mt-6 text-xl" type="submit">
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
