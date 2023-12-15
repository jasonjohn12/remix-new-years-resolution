import { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { Link } from "react-router-dom";
import { authenticator } from "src/auth.server";
import { getXataClient } from "src/xata";
import NewResolution from "~/components/NewResolution";
import Resolution from "~/components/Resolution";

const loader = async ({ request }: LoaderFunctionArgs) => {
  const xata = getXataClient();
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const resolutions = await xata.db.resolutions
    .filter("user.id", user.id)
    .getMany();
  console.log("resolutions", resolutions);
  return { resolutions, user };
};

const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  // get the value from input field
  const action = form.get("action");
  const xata = getXataClient();
  switch (action) {
    case "complete": {
      const id = form.get("id");

      if (typeof id !== "string") {
        return null;
      }

      const isCompleted = !!form.get("isCompleted");
      const resolution = await xata.db.resolutions.update(id, {
        isCompleted,
      });

      return resolution;
    }

    case "add": {
      const year = Number(form.get("year"));
      const isCompleted = false;
      const resolution = String(form.get("resolution"));
      const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
      });
      const resolutions = await xata.db.resolutions.create({
        user,
        year,
        isCompleted,
        resolution,
      });

      return resolutions;
    }

    case "delete": {
      const id = form.get("id");

      if (typeof id !== "string") {
        return null;
      }
      // const user = await authenticator.isAuthenticated(request, {
      //   failureRedirect: "/login",
      // });
      const resolution = await xata.db.resolutions.delete(id);
      return resolution;
    }

    case "logout": {
      return await authenticator.logout(request, { redirectTo: "/login" });
    }

    default:
      return null;
  }
};
const ResolutionsPage = () => {
  const { resolutions, user } = useLoaderData<typeof loader>();
  return (
    <div className="p-10">
      <div className="grid grid-flow-col justify-between mb-16">
        <Link className="inline-block" to="/resolutions">
          <h1 className="text-3xl font-bold">New Year's Resolutions!</h1>
        </Link>
        {user ? (
          <Form method="post">
            <button
              type="submit"
              name="action"
              value="logout"
              className="bg-white text-black border-2 border-black py-1 px-3 rounded-md font-semibold"
            >
              Logout
            </button>
          </Form>
        ) : null}
      </div>
      {/* <div className="grid grid-flow-row gap-y-10">
        <NewResolution />

        <div className="grid grid-cols-[repeat(4,auto)] justify-start items-center gap-x-8 gap-y-4">
          {resolutions.length === 0 ? (
            <p className="text-gray-500 italic">{`You made no resolutions for the year ${year}!`}</p>
          ) : (
            resolutions.map((resolution) => {
              return <Resolution key={resolution.id} resolution={resolution} />;
            })
          )}
        </div>
      </div>{" "} */}
      <div className="grid grid-flow-row gap-y-10">
        <NewResolution />

        <div className="grid grid-cols-[repeat(4,auto)] justify-start items-center gap-x-8 gap-y-4">
          {resolutions.length === 0 ? (
            <p className="text-gray-500 italic">{`You made no resolutions!`}</p>
          ) : (
            resolutions.map((resolution) => {
              return <Resolution key={resolution.id} resolution={resolution} />;
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ResolutionsPage;
export { loader, action };
