import { z } from "zod";

export const createCustomerSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(255, "First name is too long"),
    lastName: z.string().min(1, "Last name is required").max(255, "Last name is too long"),
    email: z.string().min(1, "Email address is requied").max(255, "Email address is too long")
});