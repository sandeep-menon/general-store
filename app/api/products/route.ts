import { createProductSchema } from "@/app/ValidationSchemas";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    const body = await request.json();
    const validation = createProductSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json(validation.error.format(), { status: 400 })
    }

    const existingProduct = await prisma.product.findFirst({
        where : {
            name: body.name,
        }
    });

    if (existingProduct) {
        return NextResponse.json("Product with same name already exists!", { status: 400 });
    }

    const newProduct = await prisma.product.create({
        data: { name: body.name, description: body.description, quantityInStock: body.quantityInStock, price: body.price }
    });

    return NextResponse.json(newProduct, { status: 201 });
}

export async function GET(request: NextRequest) {
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
                    { name: { contains: token, mode: Prisma.QueryMode.insensitive }},
                    { description: { contains: token, mode: Prisma.QueryMode.insensitive }}
                ]
            }))
        }
        : {};

    try {
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: "asc" }
            }),
            prisma.product.count({ where })
        ])

        return NextResponse.json({
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total/limit)
            }
        }, { status: 200 })
    } catch (error) {
        console.error(error);
        return NextResponse.json("Failed to get all products. Please try again later", { status: 500 });
    }
}