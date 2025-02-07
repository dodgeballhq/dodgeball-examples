"use client";

import { Product, ProductCard } from "@/components/custom/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/lib/cart-store";
import { useQuery } from "@tanstack/react-query";

const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch("/api/products");
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
};

export default function HomePage() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts
  });

  const { addToCart } = useCartStore();

  const handleAddToCart = (productId: string, quantity: number) => {
    // Implement your cart logic here (e.g., using context or API call)
    console.log(`Adding ${quantity} of product ${productId} to cart`);
  };

  if (error) return <div>Error loading products: {error.message}</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-lg" />
          ))
        ) : (
          products?.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))
        )}
      </div>
    </div>
  );
}
