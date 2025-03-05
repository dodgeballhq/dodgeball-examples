"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, quantity: number) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  const handleAddToCartClick = () => {
    onAddToCart(product.id, quantity);
    setIsAnimating(true);
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  return (
    <Card className="w-full max-w-md flex flex-col h-full">
      <CardHeader>
        {product.picture && (
          <div className="w-full aspect-square mb-4 relative">
            <Image
              src={product.picture}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover rounded-lg"
            />
          </div>
        )}
        <CardTitle>
          <span>{product.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-col h-full">
          <div className="flex gap-2 items-center">
            <p className="text-primary text-xl font-semibold">${product.price}</p>
            {!product.isDigital && <p className="text-sm text-muted-foreground">+ shipping</p>}
            {product.isRecurring && <p className="text-sm text-muted-foreground">/ month</p>}
          </div>
          <div className="flex-1 space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">{product.description}</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 bg-accent rounded-full">Brand: {product.brand}</span>
              <span className="text-xs px-2 py-1 bg-accent rounded-full">Material: {product.material}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-8">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleQuantityChange(quantity - 1)}>
                -
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button variant="outline" size="sm" onClick={() => handleQuantityChange(quantity + 1)}>
                +
              </Button>
            </div>
            <Button
              onClick={handleAddToCartClick}
              className={`flex-1 transition-all duration-300 ${
                isAnimating
                  ? "bg-muted hover:!bg-muted active:!bg-muted"
                  : "bg-primary hover:bg-primary/90 active:bg-primary/80"
              }`}
            >
              {isAnimating ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
