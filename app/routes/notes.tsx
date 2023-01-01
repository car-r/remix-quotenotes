import type { LoaderFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import AppLayout from "../components/Layouts/AppLayout";

import { getUserById } from "~/models/user.server";
import { requireUserId } from "~/session.server";

export const loader: LoaderFunction = async ({request}) => {
    const userId = await requireUserId(request);
    const user = await getUserById(userId)
    return {user}
}

export default function NotesPage() {

    return (
        <>
            <AppLayout>
                <Outlet />
            </AppLayout>
        </>
    )
}
