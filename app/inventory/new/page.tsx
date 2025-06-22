"use client";
import ErrorAlert from "@/app/components/ErrorAlert";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema } from "@/app/ValidationSchemas";
import { z } from "zod";
import ErrorMessage from "@/app/components/ErrorMessage";
import Link from "next/link";
import { DollarSign } from "lucide-react";

type ProductForm = z.infer<typeof createProductSchema>;

export default function NewInventoryPage() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductForm>({
        resolver: zodResolver(createProductSchema)
    });
    const router = useRouter();
    const [error, setError] = useState("");
    return (
        <div className="w-84 md:w-96 lg:w-[1280px] flex flex-col gap-4">
            <div className="text-lg font-semibold">New product</div>
            <div className="flex flex-col gap-4 items-center">
                {error && <ErrorAlert>{error}</ErrorAlert>}
                <form onSubmit={handleSubmit(async (data) => {
                    try {
                        await axios.post("/api/products", data);
                        router.push("/inventory");
                    } catch (error) {
                        if (axios.isAxiosError(error)) {
                            if (typeof error.response?.data === "string") {
                                setError(error.response?.data);
                            }
                            else {
                                setError("An unexpected error occured.");
                            }
                        } else {
                            setError("An unexpected error occurred.");
                        }
                    }
                })}>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Product name:</legend>
                        <input type="text" className="input w-84 lg:w-96" placeholder="Awesome Product 2000" {...register("name")} />
                        {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Product description:</legend>
                        <textarea className="textarea w-84 lg:w-96" placeholder="Enter product description here..." {...register("description")}></textarea>
                        {errors.description && <ErrorMessage>{errors.description.message}</ErrorMessage>}
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Price:</legend>
                        <label className="input w-84 lg:w-96"><DollarSign /><input defaultValue={"0.00"} type="number" min="0.00" max="5000.00" step="0.01" placeholder="e.g. 49.99" {...register("price", {valueAsNumber: true})} /></label>
                        {errors.price && <ErrorMessage>{errors.price.message}</ErrorMessage>}
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Quantity in stock:</legend>
                        <label className="input w-84 lg:w-96"><input type="number" defaultValue={"0"} min="0" max="100" step="1" placeholder="e.g. 50" {...register("quantityInStock", {valueAsNumber: true})} /></label>
                        {errors.quantityInStock && <ErrorMessage>{errors.quantityInStock.message}</ErrorMessage>}
                    </fieldset>
                    <div className="flex justify-around items-center">
                        <button className={`btn btn-primary my-2 ${isSubmitting ? "loading" : ""}`}>Save</button>
                        <Link href="/inventory" className={`btn btn-default my-2`}>Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}