import { NextResponse } from "next/server";
import productsModel from "@/app/modals/productsModel";
import { ConnectDB } from "@/app/config/db";
import { CartItem } from "@/app/interfaces/interfaces";

const loadDB = async () => {
  await ConnectDB();
};

loadDB();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body as { items: CartItem[] };

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const productIds = Array.from(new Set(items.map((item) => item.productId)));

    // Fetch fresh product data
    const products = await productsModel.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const validatedItems = items
      .map((item) => {
        const product = productMap.get(item.productId);

        if (!product) {
          // Product no longer exists
          return null;
        }

        // Find matching variant
        const variant = product.variations.find(
          (v: any) => v.name === item.variant.name
        );

        if (!variant) {
          // Variant no longer exists, might fallback to default or remove
          // For now, let's remove it or mark as invalid
          return null;
        }

        // Find matching attribute
        const attribute = variant.attributes.find(
          (a: any) => a.name === item.attributes.name
        );

        if (!attribute) {
          // Attribute no longer exists
          return null;
        }

        // Calculate price based on priority: attribute > variant > product
        // Note: In schema, attribute.price and variant.price are optional numbers.
        // product.price is { local: number, global: number }

        let price = product.price.local;
        if (
          variant.price !== undefined &&
          variant.price !== null &&
          variant.price > 0
        ) {
          price = variant.price;
        }
        if (
          attribute.price !== undefined &&
          attribute.price !== null &&
          attribute.price > 0
        ) {
          price = attribute.price;
        }

        // Return updated item
        return {
          ...item,
          price: price,
          productName: product.title, // Update name just in case
          imageUrl:
            variant.images && variant.images.length > 0
              ? variant.images[0].url
              : item.imageUrl,
        };
      })
      .filter(Boolean); // Remove nulls

    return NextResponse.json({ items: validatedItems });
  } catch (error) {
    console.error("Error validating cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
