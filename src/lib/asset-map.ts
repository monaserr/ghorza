import cargoImg from "@/assets/product-cargo.jpg";
import teeImg from "@/assets/product-tee.jpg";
import hoodieImg from "@/assets/product-hoodie.jpg";
import sneakerImg from "@/assets/product-sneaker.jpg";
import jeansImg from "@/assets/product-jeans.jpg";
import jacketImg from "@/assets/product-jacket.jpg";
import jacket2Img from "@/assets/product-jacket.jpg";
import placeholder from "@/assets/product-fabric.jpg";

const MAP: Record<string, string> = {
  "product-cargo.jpg": cargoImg,
  "product-tee.jpg": teeImg,
  "product-hoodie.jpg": hoodieImg,
  "product-sneaker.jpg": sneakerImg,
  "product-jeans.jpg": jeansImg,
  "product-jacket.jpg": jacketImg,
  "product-jacket-2.jpg": jacket2Img,
};

/**
 * Resolve a stored image_url into a usable src.
 * - Full URLs (http/https or //) are returned as-is (uploaded to storage).
 * - Known seed basenames are mapped to bundled assets.
 * - Anything else falls back to a placeholder.
 */
export function resolveImage(imageUrl?: string | null): string {
  if (!imageUrl) return placeholder;
  if (/^(https?:)?\/\//i.test(imageUrl) || imageUrl.startsWith("/")) return imageUrl;
  return MAP[imageUrl] ?? placeholder;
}
