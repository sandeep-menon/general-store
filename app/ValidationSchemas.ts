import { z } from "zod";

export const createCustomerSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(255, "First name is too long"),
    lastName: z.string().min(1, "Last name is required").max(255, "Last name is too long"),
    email: z.string().min(1, "Email address is requied").max(255, "Email address is too long")
});

export const createProductSchema = z.object({
    name: z.string().min(1, "Product name is required").max(127, "Product name is too long"),
    description: z.string().min(1, "Product description is required").max(255, "Product description is too long"),
    quantityInStock: z.number().int().lte(100, "Quantity in stock cannot be more than 100").gte(0, "Quantity in stock cannot be negative"),
    price: z.number().lte(5000.00, "Price must be less than $5000.00")
});