import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {api} from "@/trpc/server";
import AdminCreateProject from "./components/create-project";

export default async function AdminDashboardPage() {
    const session = await auth();
    
    if (!session?.user || !session.user.) {
        redirect("/"); 
    }

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome {session.user.name}</p>
            <AdminCreateProject />
        </div>
    );
}