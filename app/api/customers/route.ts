import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@/app/generated/prisma";
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

export async function GET(request : NextRequest) {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search")?.trim() || "";
    const skip = (page - 1) * limit;

    const tokens = search
        .split(" ")
        .filter(Boolean)
        .map((token) => token.toLowerCase());

    const where = tokens.length
        ? {
              AND: tokens.map((token) => ({
                  OR: [
                      { firstName: { contains: token, mode: Prisma.QueryMode.insensitive } },
                      { lastName: { contains: token, mode: Prisma.QueryMode.insensitive } },
                      { email: { contains: token, mode: Prisma.QueryMode.insensitive } },
                  ],
              })),
          }
        : {};

    try {
        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created: "desc"}
            }),
            prisma.customer.count({ where })
        ]);

        return NextResponse.json({
            data: customers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total/limit)
            }
        }, { status: 200 })
    } catch (error) {
        console.error(error);
        return NextResponse.json("Failed to get all customers. Please try again later.", { status: 500 });
    }
}