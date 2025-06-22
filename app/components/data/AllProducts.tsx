"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import DataLoading from "./DataLoading";
import { DollarSign, Edit2, Search, X } from "lucide-react";
import { z } from "zod";
import { createProductSchema } from "@/app/ValidationSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorMessage from "../ErrorMessage";
import ErrorAlert from "../ErrorAlert";

interface ProductData {
    id: string;
    name: string;
    description: string;
    quantityInStock: string;
    price: string;
}

type EditProductForm = z.infer<typeof createProductSchema>;

export default function AllProducts() {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<ProductData[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentProductId, setCurrentProductId] = useState("");
    const [refreshTable, setRefreshTable] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<EditProductForm>({
        resolver: zodResolver(createProductSchema)
    })

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/products`, {
                    params: {
                        page,
                        search: debouncedSearch
                    }
                });
                setProducts(response.data.data);
                setPage(response.data.meta.page);
                setTotalPages(response.data.meta.totalPages);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [page, debouncedSearch, refreshTable]);

    const previousPage = () => {
        setPage(page - 1);
    }

    const nextPage = () => {
        setPage(page + 1);
    }

    const handleEdit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        setError("");
        const targetElem = e.target as HTMLElement;
        const productId = targetElem.closest("tr")?.getAttribute("data-row-id");
        if (!productId) {
            return;
        }

        setCurrentProductId(productId);

        try {
            const res = await axios.get(`/api/products/${productId}`);
            const product = res.data;

            reset({
                name: product.name,
                description: product.description,
                quantityInStock: product.quantityInStock,
                price: product.price
            });

            const modal = document.getElementById("product_edit_modal") as HTMLDialogElement | null;
            if (modal) {
                modal.showModal();
            }
        } catch (error) {
            console.error(error);
        }
    }
    const [error, setError] = useState("");
    return (
        <div className="flex flex-col gap-4 ">
            <div>
                <label className="input">
                    <Search />
                    <input type="search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
                </label>
            </div>
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Product name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Quantity In Stock</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={5}><DataLoading /></td></tr>}
                        {!loading && products.map((product) => (
                            <tr className="hover:bg-base-200" data-row-id={product.id} key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.description}</td>
                                <td>${product.price}</td>
                                <td>{product.quantityInStock}</td>
                                <td><button className="btn btn-square btn-sm" onClick={handleEdit}><Edit2 /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center mb-4">
                <div className="join">
                    <button className={`join-item btn ${page == 1 ? "btn-disabled" : ""}`} onClick={previousPage}>«</button>
                    <button className={`join-item btn`}>{`Page ${page}`}</button>
                    <button className={`join-item btn ${page >= totalPages ? "btn-disabled" : ""}`} onClick={nextPage}>»</button>
                </div>
            </div>
            <dialog id="product_edit_modal" className="modal">
                <div className="modal-box">
                    <div className="flex justify-between items-center mb-4">
                        <div className="font-bold text-lg">Edit product</div>
                        <div>
                            <form method="dialog">
                                <button className="btn btn-sm btn-circle"><X /></button>
                            </form>
                        </div>
                    </div>
                    {error && <ErrorAlert>{error}</ErrorAlert>}
                    <form className="flex flex-col gap-2 justify-center items-center" onSubmit={handleSubmit(async (data) => {
                        try {
                            await axios.patch(`/api/products/${currentProductId}`, data);
                            const modal = document.getElementById("product_edit_modal") as HTMLDialogElement | null;
                            if (modal) modal.close();
                            setRefreshTable(!refreshTable);
                        } catch (error) {
                            if (axios.isAxiosError(error)) {
                                if (typeof error.response?.data?.error === "string") {
                                    setError(error.response?.data?.error);
                                } else {
                                    setError("An unexpected error occured.");
                                }
                            } else {
                                setError("An unexpected error occured.");
                            }
                        }
                    })}>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Product name:</legend>
                            <input disabled type="text" className="input w-84 lg:w-96" placeholder="Awesome Product 5000" {...register("name")} />
                            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Product description:</legend>
                            <input type="text" className="input w-84 lg:w-96" placeholder="Enter product description here..." {...register("description")} />
                            {errors.description && <ErrorMessage>{errors.description.message}</ErrorMessage>}
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Price:</legend>
                            <label className="input w-84 lg:w-96"><DollarSign /><input defaultValue={"0.00"} type="number" min="0.00" max="5000.00" step="0.01" placeholder="e.g. 49.99" {...register("price", { valueAsNumber: true })} /></label>
                            {errors.price && <ErrorMessage>{errors.price.message}</ErrorMessage>}
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Quantity in stock:</legend>
                            <label className="input w-84 lg:w-96"><input type="number" defaultValue={"0"} min="0" max="100" step="1" placeholder="e.g. 50" {...register("quantityInStock", { valueAsNumber: true })} /></label>
                            {errors.quantityInStock && <ErrorMessage>{errors.quantityInStock.message}</ErrorMessage>}
                        </fieldset>
                        <button className={`btn btn-primary mt-4 ${isSubmitting ? "loading" : ""}`}>Save</button>
                    </form>
                </div>
            </dialog>
        </div>
    )
}