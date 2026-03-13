"use client";

import { useRouter } from "next/navigation";
import { SubmitEventHandler } from "react";

const Login = () => {
  const router = useRouter();

  const handleSubmitLogin: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const formObj = Object.fromEntries(formData.entries());
    const { email, password } = formObj;

    const res = await fetch("http://localhost:5500/api/v1/auth/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await res.json();
    localStorage.setItem("token", result.data.token);
    router.push("/dashboard");
  };

  return (
    <div>
      <form
        onSubmit={(e) => handleSubmitLogin(e)}
        method="POST"
        className="flex flex-col space-y-4"
      >
        <label htmlFor="email">Email: </label>
        <input id="email" name="email" type="email" />

        <label htmlFor="password">Password: </label>
        <input type="password" name="password" id="password" />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Login;
