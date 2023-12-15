import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { authenticator } from "src/auth.server";

const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    successRedirect: "/resolutions",
  });

  return user;
};

const action: ActionFunction = async ({ request }) => {
  await authenticator.authenticate("form", request, {
    successRedirect: "/resolutions",
    failureRedirect: "/login",
  });
};

const LoginPage = () => {
  return (
    <Form method="post" className="p-10 text-center">
      <h1 className="font-bold text-xl">Welcome! Please login.</h1>

      <p className="mb-6">
        Need to create an account?{" "}
        <Link to="/signup" className="text-blue-500">
          Sign Up
        </Link>
      </p>

      <label className="font-semibold mr-2" htmlFor="email">
        Email
      </label>
      <input
        className="border-2 rounded-md mr-8 border-gray-600 px-3 py-1"
        type="email"
        name="email"
        id="email"
      />

      <label className="font-semibold mr-2" htmlFor="password">
        Password
      </label>
      <input
        className="border-2 rounded-md mr-8 border-gray-600 px-3 py-1"
        type="password"
        name="password"
        id="password"
      />

      <button
        type="submit"
        className="bg-blue-500 text-white py-1 px-3 rounded-md font-semibold"
      >
        Login
      </button>
    </Form>
  );
};

export default LoginPage;
export { action, loader };
