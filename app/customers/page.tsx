"use client";
import { Plus } from "lucide-react";
import Link from "next/link";

function CustomersPage() {
    return (
        <div className="w-84 md:w-96 lg:w-[1280px] flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">Customers</div>
                <div>
                    <Link className="btn btn-primary btn-outline" href="/customers/new"><Plus />New Customer</Link>
                </div>
            </div>
        </div>
    )
}

export default CustomersPage;