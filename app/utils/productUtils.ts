import productsModel from "@/app/modals/productsModel";

export async function decreaseStock(cart: any[]) {
  // product(variants)=>variant (attribures)=>attribute
  for (const item of cart) {
    const product = await productsModel.findById(item.productId);
    if (!product) {
      console.log("note");
      console.log(
        `Product not found: ${item.productId}, but continuing execution`
      );
      continue; // Skip this item but continue processing other items
    }
    console.log("productFound");
    // Find the variation with matching color
    const variatiant = product.variations.find(
      (v: any) => v.name === item.variant.name
    );

    if (!variatiant) {
      console.log(
        `Variant not found: ${item.variant.name}, but continuing execution`
      );
      continue; // Skip this item but continue processing other items
    }
    console.log("variantFound");
    const attribute = variatiant.attributes.find(
      (a: any) => a.name === item.attributes.name
    );
    console.log("attributesFound");

    // Check if enough stock is available
    if (attribute?.stock < item.quantity) {
      console.log("stock problem");
      console.log(
        `Insufficient stock for ${item.productId}, but continuing execution`
      );
      continue; // Skip this item but continue processing other items
    }

    // Decrease stock
    attribute.stock -= item.quantity;

    // Save the updated product
    await product.save();
  }
}
