import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { order: "asc" } },
        sizes: true,
        category: true,
        _count: { select: { orderItems: true } },
      },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, price, salePrice, categoryId, sizes, images } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (price === undefined || price === "" || isNaN(parseFloat(price))) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    let slug = slugify(name);
    if (!slug) slug = `product-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || "",
        price: parseFloat(price),
        salePrice: salePrice === "" || salePrice === null || salePrice === undefined ? null : parseFloat(salePrice),
        categoryId,
        featured: false,
        inStock: true,
        sizes: {
          create: (sizes || []).map((s: { size: string; stock: number }) => ({
            size: s.size,
            stock: s.stock,
          })),
        },
        images: {
          create: (images || []).map((url: string, index: number) => ({
            url,
            alt: name,
            order: index,
          })),
        },
      },
      include: {
        images: { orderBy: { order: "asc" } },
        sizes: true,
        category: true,
        _count: { select: { orderItems: true } },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.product.update({
      where: { id },
      data: { inStock: false, featured: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, price, salePrice, name, description, categoryId, inStock, images, sizes } = body;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const data: any = {};
    if (price !== undefined) {
      const parsed = parseFloat(price);
      if (isNaN(parsed)) return NextResponse.json({ error: "Invalid price" }, { status: 400 });
      data.price = parsed;
    }
    if (salePrice !== undefined) data.salePrice = salePrice === "" || salePrice === null ? null : parseFloat(salePrice);
    if (name !== undefined) {
      data.name = name;
      const newSlug = slugify(name);
      if (newSlug) data.slug = newSlug;
    }
    if (description !== undefined) data.description = description;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (inStock !== undefined) data.inStock = inStock;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(images?.length > 0 ? {
          images: {
            deleteMany: {},
            create: images.map((url: string, index: number) => ({ url, alt: name || "", order: index })),
          },
        } : {}),
        ...(sizes?.length > 0 ? {
          sizes: {
            deleteMany: {},
            create: sizes.filter((s: any) => s.stock > 0).map((s: any) => ({ size: s.size, stock: s.stock })),
          },
        } : {}),
      },
      include: { images: { orderBy: { order: "asc" } }, sizes: true, category: true },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
