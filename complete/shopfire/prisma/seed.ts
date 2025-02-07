import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "Premium Cotton T-Shirt",
        price: "29.99",
        description: "Soft 100% cotton crew neck t-shirt",
        material: "Cotton",
        brand: "FashionCo"
      },
      {
        name: "Slim Fit Jeans",
        price: "89.95",
        description: "Stretch denim slim fit jeans",
        material: "Denim",
        brand: "DenimWorks"
      }
    ]
  });
} 