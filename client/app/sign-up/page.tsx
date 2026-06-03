"use client";

import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SubmitEventHandler, useState } from "react";

const SignUp = () => {
  const [message, setMessage] = useState<string>("");

  const handleFormSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const formObject = Object.fromEntries(formData.entries());

    const { name, email, password, confirmPassword } = formObject;

    if (password !== confirmPassword) {
      // Until toast
      console.log("The passwords are not the same!");
      return;
    }

    const userData = {
      name,
      email,
      password,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/sign-up`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        },
      );

      if (!res.ok) {
        throw new Error("Failed request!");
      }

      const result = await res.json();
      setMessage(result.message);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="px-20 h-20 w-full flex items-center justify-between">
        <div>
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <Button asChild>
          <Link href="/login">Do you already have an account?! Login here</Link>
        </Button>
      </div>

      <div className="flex items-center justify-center mt-20">
        <form
          onSubmit={(e) => handleFormSubmit(e)}
          method="POST"
          className="flex flex-col space-y-4 bg-card rounded-xl p-8 w-80"
        >
          <label className="text-xl font-bold" htmlFor="name">
            Name:{" "}
          </label>
          <input
            className="bg-accent text-lg rounded-sm pl-1"
            id="name"
            name="name"
            type="text"
          />

          <label className="text-xl font-bold" htmlFor="email">
            Email:{" "}
          </label>
          <input
            className="bg-accent text-lg rounded-sm pl-1"
            type="email"
            name="email"
            id="email"
          />

          <label className="text-xl font-bold" htmlFor="password">
            Password:{" "}
          </label>
          <input
            className="bg-accent text-lg rounded-sm pl-1"
            type="password"
            name="password"
            id="password"
          />

          <label className="text-xl font-bold" htmlFor="confirmPassword">
            Confirm password:{" "}
          </label>
          <input
            className="bg-accent text-lg rounded-sm pl-1"
            type="password"
            name="confirmPassword"
            id="confirmPassword"
          />

          <Button className="text-xl hover:cursor-pointer" type="submit">
            Submit
          </Button>
        </form>

        <div>{message}</div>
      </div>
    </div>
  );
};

export default SignUp;
