"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ScanBarcode, ShoppingCart, Users2Icon } from "lucide-react";

export default function Drawer() {
    const currentPath = usePathname();
    const links = [
        {
            label: "Dashboard",
            href: "/",
            icon: <LayoutDashboard />
        },
        {
            label: "Customers",
            href: "/customers",
            icon: <Users2Icon />
        },
        {
            label: "Orders",
            href: "/orders",
            icon: <ShoppingCart />
        },
        {
            label: "Inventory",
            href: "/inventory",
            icon: <ScanBarcode />
        },
    ];

    const hideMenu = () => {
        const drawer = document.getElementById("my-drawer-3") as HTMLInputElement | null;
        if (drawer) {
            drawer.checked = false;
        }
    }
    return (
        <div className="drawer-side">
            <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
            <ul className="menu bg-base-200 min-h-full w-80 p-4 flex flex-col gap-4">
                <div className="text-lg font-semibold">General Store</div>
                {links.map((link) => (
                    <li key={link.href} onClick={hideMenu}>
                        <Link href={link.href} className={`${currentPath === link.href ? "menu-active" : ""} py-4`}>{link.icon}{link.label}</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}