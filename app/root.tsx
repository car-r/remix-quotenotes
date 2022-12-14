import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";
// import AppLayout from "./components/Layouts/AppLayout";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Notes",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  const data = useLoaderData()
  console.log('root ->', data)

  return (
    <html lang="en" className="bg-stone-900 flex flex-col min-h-screen mx-auto">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
      {/* {!data.user ? 
          <Outlet />
          :
          <AppLayout>
            <Outlet />
          </AppLayout>
        } */}
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
