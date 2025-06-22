"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import DataLoading from "./DataLoading";
import { Edit2, Search } from "lucide-react";

interface CustomerData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export default function AllCustomers() {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<CustomerData[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

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
    }, [page, debouncedSearch]);

    const previousPage = () => {
        setPage(page - 1);
    }

    const nextPage = () => {
        setPage(page + 1);
    }
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
                            <tr className="hover:bg-base-200" key={customer.id}>
                                <td>{customer.firstName}</td>
                                <td>{customer.lastName}</td>
                                <td>{customer.email}</td>
                                <td><button className="btn btn-square btn-sm"><Edit2 /></button></td>
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
        </div>
    )
}