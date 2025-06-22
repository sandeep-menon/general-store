import { PrismaClient } from "@/app/generated/prisma";
import { createProductSchema } from "@/app/ValidationSchemas";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest) {
    const url = new URL(request.url);
    const productId = url.pathname.split("/").pop();

    if (!productId) {
        return NextResponse.json({ error: "Missing Product ID in request"}, { status: 400 });
    }

    const body = await request.json();

    const validation = createProductSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json(validation.error.format(), { status: 400 });
    }

    try {
        const existing = await prisma.product.findUnique({ where: { id: productId }});

        if (!existing) {
            return NextResponse.json({ error: "Product not found!"}, { status: 404 });
        }

        if (body.name && body.name !== existing.name) {
            return NextResponse.json({ error: "Product name cannot be changed"}, { status: 400 });
        }

        const updated = await prisma.product.update({
            where: { id: productId },
            data: body
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error"}, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const productId = url.pathname.split("/").pop();

    if (!productId) {
        return NextResponse.json({ error: "Missing Product ID in request"}, { status: 400 });
    }

    try {
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found"}, { status: 404 })
        }

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error"}, { status: 500 });
    }
}