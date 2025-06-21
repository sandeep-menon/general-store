import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { createCustomerSchema } from "../../ValidationSchemas";

const prisma = new PrismaClient();

export async function POST(request : NextRequest) {
    const body = await request.json();
    const validation = createCustomerSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json(validation.error.format(), { status: 400 })
    }

    const existingCustomer = await prisma.customer.findFirst({
        where: {
            email: body.email
        }
    })

    if (existingCustomer) {
        return NextResponse.json("A customer with this email address already exists!", { status: 400 });
    }

    const newCustomer = await prisma.customer.create({
        data: { firstName: body.firstName, lastName: body.lastName, email: body.email }
    });

    return NextResponse.json(newCustomer, { status: 201 });
}