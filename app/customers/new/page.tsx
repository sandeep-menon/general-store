"use client";
import ErrorAlert from "@/app/components/ErrorAlert";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCustomerSchema } from "@/app/ValidationSchemas";
import { z } from "zod";
import ErrorMessage from "@/app/components/ErrorMessage";

type CustomerForm = z.infer<typeof createCustomerSchema>;

export default function NewCustomerPage() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CustomerForm>({
        resolver: zodResolver(createCustomerSchema)
    });
    const router = useRouter();
    const [error, setError] = useState("");
    return (
        <div className="w-84 md:w-96 lg:w-[1280px] flex flex-col gap-4">
            <div className="text-lg font-semibold">New customer</div>
            <div className="flex flex-col gap-4 items-center">
                {error && <ErrorAlert>{error}</ErrorAlert>}
                <form onSubmit={handleSubmit(async (data) => {
                    try {
                        await axios.post("/api/customers", data);
                        router.push("/customers");
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
                        <legend className="fieldset-legend">First name:</legend>
                        <input type="text" className="input w-84 lg:w-96" placeholder="e.g. John" {...register("firstName")} />
                        {errors.firstName && <ErrorMessage>{errors.firstName.message}</ErrorMessage>}
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Last name:</legend>
                        <input type="text" className="input w-84 lg:w-96" placeholder="e.g. Doe" {...register("lastName")} />
                        {errors.lastName && <ErrorMessage>{errors.lastName.message}</ErrorMessage>}
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Email address:</legend>
                        <input type="text" className="input w-84 lg:w-96" placeholder="e.g. john@doe.com" {...register("email")} />
                        {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                    </fieldset>
                    <button className={`btn btn-primary my-2 ${isSubmitting ? "loading": ""}`}>Save</button>
                </form>
            </div>
        </div>
    )
}