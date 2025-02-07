"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  material: string;
  brand: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, quantity: number) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{product.brand}</span>
          <span className="text-primary">${product.price}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 bg-accent rounded-full">
              Material: {product.material}
            </span>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuantityChange(quantity - 1)}
              >
                -
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                +
              </Button>
            </div>
            <Button 
              onClick={() => onAddToCart(product.id, quantity)}
              className="flex-1"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 