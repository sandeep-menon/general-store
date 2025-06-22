import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { createCustomerSchema } from "@/app/ValidationSchemas";

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest) {
    const url = new URL(request.url);
    const customerId = url.pathname.split("/").pop();
    if (!customerId) {
        return NextResponse.json({ error: "Missing Customer ID in request" }, { status: 400 });
    }
    const body = await request.json();

    const validation = createCustomerSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json(validation.error.format(), { status: 400 });
    }

    try {
        const existing = await prisma.customer.findUnique({ where : { id: parseInt(customerId) }})

        if (!existing) {
            return NextResponse.json({ error: "Customer not found!" }, { status: 404 });
        }

        if (body.email && body.email !== existing.email) {
            const emailExists = await prisma.customer.findFirst({
                where : {
                    email: body.email,
                    NOT: { id: parseInt(customerId) }
                }
            });
           
            if (emailExists) {
                return NextResponse.json(
                    { error: "Another customer with the same email address exists!" },
                    { status: 400 }
                )
            }
        }

        const updated = await prisma.customer.update({
            where: { id: parseInt(customerId) },
            data: body
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const customerId = url.pathname.split("/").pop();
    
    if (!customerId) {
        return NextResponse.json(
            { error: "Missing Customer ID in request" },
            { status: 400 }
        )
    }

    try {
        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(customerId) }
        });

        if (!customer) {
            return NextResponse.json(
                { error: "Customer not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(customer, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}