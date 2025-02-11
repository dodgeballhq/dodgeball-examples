const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await Promise.all(
    [
      {
        id: "1",
        name: "Emergency Marshmallow Toasting Kit",
        price: "39.99",
        description: "24-hour survival kit for spontaneous campfire moments (includes 10 telescoping stainless steel skewers)",
        material: "Stainless steel/cotton",
        brand: "FlameReady",
        isDigital: false,
        picture: "/images/products/kit.webp",
        isRecurring: false
      },
      {
        id: "2",
        name: "Dragon's Breath Chili Pepper Sampler",
        price: "19.95",
        description: "5 world's hottest peppers packed in smoke-infused packaging",
        material: "Organic produce",
        brand: "Inferno Foods",
        isDigital: false,
        picture: "/images/products/chili.webp",
        isRecurring: false
      },
      {
        id: "3",
        name: "Fireproof S'mores Maker (Indoor Safe)",
        price: "79.99",
        description: "Electric s'mores grill with realistic flame animation",
        material: "Ceramic/Stainless steel",
        brand: "CozyBlaze",
        isDigital: false,
        picture: "/images/products/smores.webp",
        isRecurring: false
      },
      {
        id: "4",
        name: "Campfire Scented Beard Oil",
        price: "24.99",
        description: "Woodsmoke-infused grooming oil for rugged aromatherapy",
        material: "Essential oils",
        brand: "Lumberjack Labs",
        isDigital: false,
        picture: "/images/products/beard.webp",
        isRecurring: false
      },
      {
        id: "5",
        name: "Fire Department Approved Birthday Candles",
        price: "14.99",
        description: "Auto-extinguishing candles (set of 30) - now with 50% less firefighter embarrassment!",
        material: "Non-toxic wax",
        brand: "SafetyFun",
        isDigital: false,
        picture: "/images/products/candles.webp",
        isRecurring: false
      },
      {
        id: "6",
        name: "SmartFire AI-Powered Outdoor Fire Pit",
        price: "1499.99",
        description: "WiFi-enabled fire pit with voice control and automatic weather adaptation (includes marshmallow doneness sensor)",
        material: "Aerospace-grade stainless steel",
        brand: "LuxeFlame",
        isDigital: false,
        picture: "/images/products/firepit.webp",
        isRecurring: false
      },
      {
        id: "7",
        name: "Digital Fire Safety Certification Course",
        price: "49.99",
        description: "Online course with virtual flame simulator (downloadable PDF certificate)",
        material: "Digital",
        brand: "Sparky Academy",
        isDigital: true,
        picture: "/images/products/digital.webp",
        isRecurring: false
      },
      {
        id: "8",
        name: "Monthly Fire Extinguisher Refill Club",
        price: "29.99",
        description: "Subscription service for eco-friendly fire extinguisher recharge (free shipping every month)",
        material: "Chemical compounds",
        brand: "SafetyFun",
        isDigital: false,
        picture: "/images/products/refill.webp",
        isRecurring: true
      }
    ].map(async (product) => {
      await prisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product
      });
    })
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 