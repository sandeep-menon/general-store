"use client";

import axios from "axios";
import { MouseEventHandler, useEffect, useState } from "react";
import DataLoading from "./DataLoading";
import { Edit2, Search, X } from "lucide-react";
import { z } from "zod";
import { createCustomerSchema } from "@/app/ValidationSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorMessage from "../ErrorMessage";
import { useRouter } from "next/navigation";
import ErrorAlert from "../ErrorAlert";

interface CustomerData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

type EditCustomerForm = z.infer<typeof createCustomerSchema>;

export default function AllCustomers() {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<CustomerData[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentCustomerId, setCurrentCustomerId] = useState("");
    const [refreshTable, setRefreshTable] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<EditCustomerForm>({
        resolver: zodResolver(createCustomerSchema)
    })

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/customers`, {
                    params: {
                        page,
                        search: debouncedSearch
                    }
                });
                setCustomers(response.data.data);
                setPage(response.data.meta.page);
                setTotalPages(response.data.meta.totalPages);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
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
        const customerId = targetElem.closest("tr")?.getAttribute("data-row-id");
        if (!customerId) {
            return;
        }

        setCurrentCustomerId(customerId);

        try {
            const res = await axios.get(`/api/customers/${customerId}`);
            const customer = res.data;

            reset({
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email
            });

            const modal = document.getElementById("customer_edit_modal") as HTMLDialogElement | null;
            if (modal) {
                modal.showModal();
            }
        } catch (error) {
            console.error(error);
        }
    }
    const router = useRouter();
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
                            <th>First name</th>
                            <th>Last name</th>
                            <th>Email address</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={4}><DataLoading /></td></tr>}
                        {!loading && customers.map((customer) => (
                            <tr className="hover:bg-base-200" data-row-id={customer.id} key={customer.id}>
                                <td>{customer.firstName}</td>
                                <td>{customer.lastName}</td>
                                <td>{customer.email}</td>
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
                    <button className={`join-item btn ${page == totalPages ? "btn-disabled" : ""}`} onClick={nextPage}>»</button>
                </div>
            </div>
            <dialog id="customer_edit_modal" className="modal">
                <div className="modal-box">
                    <div className="flex justify-between items-center mb-4">
                        <div className="font-bold text-lg">Edit customer</div>
                        <div>
                            <form method="dialog">
                                <button className="btn btn-sm btn-circle"><X /></button>
                            </form>
                        </div>
                    </div>
                    {error && <ErrorAlert>{error}</ErrorAlert>}
                    <form className="flex flex-col gap-2 justify-center items-center" onSubmit={handleSubmit(async (data) => {
                        try {
                            await axios.patch(`/api/customers/${currentCustomerId}`, data);
                            const modal = document.getElementById("customer_edit_modal") as HTMLDialogElement | null;
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
                        <button className={`btn btn-primary mt-4 ${isSubmitting ? "loading" : ""}`}>Save</button>
                    </form>
                </div>
            </dialog>
        </div>
    )
}