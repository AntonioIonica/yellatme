"use client";

import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEventHandler } from "react";
import { toast } from "sonner";

const SignUp = () => {
  const router = useRouter();

  const handleFormSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const formObject = Object.fromEntries(formData.entries());

    const { name, email, password, confirmPassword } = formObject;

    if (password !== confirmPassword) {
      toast.error("The passwords are not the same!", {
        position: "top-center",
        style: { fontWeight: 600 },
        closeButton: true,
      });
      
      return;
    }

    const userData = {
      name,
      email,
      password,
    };

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

    if (result.success) {
      toast.success(result.message, {
        position: "top-center",
        style: { fontWeight: 600 },
        closeButton: true,
      });

      router.push("/login");
    } else {
       toast.error(result.error, {
          position: "top-center",
          style: { fontWeight: 600 },
          closeButton: true,
    });
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
      </div>
    </div>
  );
};

export default SignUp;
