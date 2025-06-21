"use client";
import { Menu, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Navbar() {
    const currentPath = usePathname();
    const links = [
        {
            label: "Dashboard",
            href: "/"
        },
        {
            label: "Customers",
            href: "/customers"
        },
        {
            label: "Orders",
            href: "/orders"
        },
        {
            label: "Inventory",
            href: "/inventory"
        },
    ];
    const hideMenu = () => {
        const drawer = document.getElementById("my-drawer") as HTMLInputElement | null;
        if (drawer) {
            drawer.checked = false;
        }
    }
    return (
        <div className="navbar bg-base-100 shadow-sm sticky top-0">
            <div className="navbar-start">
                <div className="drawer">
                    <input id="my-drawer" type="checkbox" className="drawer-toggle" />
                    <div className="drawer-content">
                        {/* Page content here */}
                        <label htmlFor="my-drawer" className="btn btn-ghost drawer-button">
                            <Menu />
                        </label>
                    </div>
                    <div className="drawer-side">
                        <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
                            {links.map((link) => (
                                <li key={link.href} onClick={hideMenu}>
                                    <Link href={link.href} className={`${currentPath === link.href ? "menu-active" : ""}`}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="navbar-center">
                <Link href="/" className="btn btn-ghost text-xl">General Store</Link>
            </div>
            <div className="navbar-end">
                {currentPath == "/" && <button className="btn btn-primary btn-outline"><Plus />New Order</button>}
            </div>
        </div>
    )
}

export default Navbar;