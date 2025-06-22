import Link from "next/link";
import { Plus } from "lucide-react";
import AllProducts from "../components/data/AllProducts";

function InventoryPage() {
    return (
        <div className="w-84 md:w-96 lg:w-[1280px] flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">Inventory</div>
                <div>
                    <Link className="btn btn-primary btn-outline" href="/inventory/new"><Plus />New Product</Link>
                </div>
            </div>
            <AllProducts />
        </div>
    )
}

export default InventoryPage;