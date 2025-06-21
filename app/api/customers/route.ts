import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

const createCustomerSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(255, "First name is too long"),
    lastName: z.string().min(1, "Last name is required").max(255, "Last name is too long"),
    email: z.string().min(1, "Email address is requied").max(255, "Email address is too long")
});

export async function POST(request : NextRequest) {
    const body = await request.json();
    const validation = createCustomerSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json(validation.error.errors, { status: 400 })
    }

    const newCustomer = await prisma.customer.create({
        data: { firstName: body.firstName, lastName: body.lastName, email: body.email }
    });

    return NextResponse.json(newCustomer, { status: 201 });
}