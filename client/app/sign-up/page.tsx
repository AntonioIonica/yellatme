"use client";

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
      console.log("The passwords are not the same!");
      return;
    }

    const userData = {
      name,
      email,
      password,
    };

    try {
      const res = await fetch("http://localhost:5500/api/v1/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        throw new Error("Failed request!");
      }

      const result = await res.json();
      console.log(result);
      setMessage(result.message);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Link href="/">Home</Link>
      <div className="w-100 h-100 border-2 p-4 border-amber-200">
        <form
          onSubmit={(e) => handleFormSubmit(e)}
          method="POST"
          className="flex flex-col space-y-4"
        >
          <label htmlFor="name">Name: </label>
          <input id="name" name="name" type="text" />

          <label htmlFor="email">Email: </label>
          <input type="email" name="email" id="email" />

          <label htmlFor="password">Password: </label>
          <input type="password" name="password" id="password" />

          <label htmlFor="confirmPassword">Confirm password: </label>
          <input type="password" name="confirmPassword" id="confirmPassword" />

          <button type="submit">Submit</button>
        </form>

        <div>{message}</div>
      </div>
    </div>
  );
};

export default SignUp;
