import { NextResponse } from "next/server";
import productsModel from "@/app/modals/productsModel";
import packageModel from "@/app/modals/packageModel";
import { ConnectDB } from "@/app/config/db";
import { CartItem, SubscriptionCartItem } from "@/app/interfaces/interfaces";

export async function POST(req: Request) {
  await ConnectDB();

  try {
    const body = await req.json();
    const rawItems: CartItem[] = body.items || body.products || [];
    const rawSubscriptions: SubscriptionCartItem[] = body.subscriptionItems || body.subscriptions || [];

    let validatedItems: CartItem[] = [];
    let itemsChanged = false;

    if (Array.isArray(rawItems) && rawItems.length > 0) {
      const productIds = Array.from(new Set(rawItems.map((item) => item.productId).filter(Boolean)));
      const products = await productsModel.find({ _id: { $in: productIds } });
      const productMap = new Map(products.map((p) => [p._id.toString(), p]));

      validatedItems = rawItems
        .map((item) => {
          const product = productMap.get(item.productId);
          if (!product) {
            itemsChanged = true;
            return null; // Product no longer exists
          }

          const variant = product.variations?.find(
            (v: any) => v.name === item.variant?.name
          );
          if (!variant) {
            itemsChanged = true;
            return null;
          }

          const attribute = variant.attributes?.find(
            (a: any) => a.name === item.attributes?.name
          );
          if (!attribute) {
            itemsChanged = true;
            return null;
          }

          let price = product.price?.local ?? item.price;
          if (variant.price !== undefined && variant.price !== null && variant.price > 0) {
            price = variant.price;
          }
          if (attribute.price !== undefined && attribute.price !== null && attribute.price > 0) {
            price = attribute.price;
          }

          if (price !== item.price) {
            itemsChanged = true;
          }

          return {
            ...item,
            price,
            productName: product.title || item.productName,
            imageUrl:
              variant.images && variant.images.length > 0
                ? variant.images[0].url
                : item.imageUrl,
          };
        })
        .filter(Boolean) as CartItem[];
    }

    let validatedSubscriptions: SubscriptionCartItem[] = [];
    let subscriptionsChanged = false;

    if (Array.isArray(rawSubscriptions) && rawSubscriptions.length > 0) {
      const packageIds = Array.from(new Set(rawSubscriptions.map((sub) => sub.packageId).filter(Boolean)));
      const packages = await packageModel.find({ _id: { $in: packageIds } });
      const packageMap = new Map(packages.map((pkg) => [pkg._id.toString(), pkg]));

      validatedSubscriptions = rawSubscriptions
        .map((sub) => {
          const pkg = packageMap.get(sub.packageId);
          if (!pkg) {
            subscriptionsChanged = true;
            return null; // Package no longer exists
          }

          // Check if package has variants matching sub.duration
          let price = pkg.price;
          let discountedFrom = pkg.discountedFrom;
          let saving = pkg.saving;

          if (pkg.variants && Array.isArray(pkg.variants) && pkg.variants.length > 0) {
            const variant = pkg.variants.find((v: any) => Number(v.duration) === Number(sub.duration));
            if (variant && variant.price !== undefined && variant.price !== null) {
              price = variant.price;
              discountedFrom = variant.discountedFrom;
              saving = variant.saving;
            }
          }

          if (price !== sub.price) {
            subscriptionsChanged = true;
          }

          return {
            ...sub,
            price,
            discountedFrom,
            saving,
            packageName: pkg.name || sub.packageName,
            imageUrl: pkg.imgUrl || sub.imageUrl,
          };
        })
        .filter(Boolean) as SubscriptionCartItem[];
    }

    return NextResponse.json({
      items: validatedItems,
      subscriptionItems: validatedSubscriptions,
      hasPriceChanges: itemsChanged || subscriptionsChanged,
    });
  } catch (error) {
    console.error("Error validating cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
