import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./db/custom.db",
});
const db = new PrismaClient({ adapter });

const INITIAL_VIDEOS = [
  { title: "How to Set Up Your E-Sell Store", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "getting-started", featured: true, description: "Step-by-step merchant onboarding guide", sortOrder: 1 },
  { title: "Using the AI Chatbot on E-Sell", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "ai", featured: true, description: "How to interact with the AI assistant", sortOrder: 2 },
  { title: "How to Accept Payments with Paystack", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "payments", featured: true, description: "Payment setup and configuration", sortOrder: 3 },
  { title: "Setting Up MetaMask for Crypto Payments", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "crypto", featured: true, description: "Wallet setup walkthrough", sortOrder: 4 },
  { title: "Securing Your Crypto Wallet", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "crypto", description: "Security best practices for crypto", sortOrder: 5 },
  { title: "Understanding Trust Badges", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "getting-started", description: "How trust levels work and how to level up", sortOrder: 6 },
  { title: "Voice Commands on E-Sell", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "ai", description: "Using Web Speech API for hands-free navigation", sortOrder: 7 },
  { title: "Adding Products and Services", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "storefront", description: "Product/service management tutorial", sortOrder: 8 },
  { title: "Customizing Your Storefront Theme", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "storefront", description: "Theme editor walkthrough", sortOrder: 9 },
  { title: "How to Browse and Shop on E-Sell", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "getting-started", description: "Customer shopping guide", sortOrder: 10 },
  { title: "Understanding BNB and BEP-20 Tokens", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "crypto", description: "Introduction to Binance Smart Chain", sortOrder: 11 },
  { title: "How to Set Up Your Wallet Address", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "crypto", description: "Adding and verifying wallet addresses", sortOrder: 12 },
  { title: "Building Customer Trust", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "storefront", description: "Tips for growing your trust badge", sortOrder: 13 },
  { title: "Multi-Currency Pricing on E-Sell", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "payments", description: "Setting prices in NGN, BNB, and USDT", sortOrder: 14 },
  { title: "Deploying Your Own Token on BSC", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "advanced", description: "Token deployment guide", sortOrder: 15 },
  { title: "Managing Staff on Your Store", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "storefront", description: "Adding and editing team members", sortOrder: 16 },
  { title: "E-Sell Platform Overview 2025", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "getting-started", description: "Complete platform walkthrough", sortOrder: 17 },
];

async function main() {
  console.log("Seeding education videos...");

  const existingCount = await db.educationVideo.count();

  if (existingCount > 0) {
    console.log(`Education videos already exist (${existingCount} found). Skipping seed.`);
    await db.$disconnect();
    return;
  }

  for (const video of INITIAL_VIDEOS) {
    await db.educationVideo.create({
      data: {
        title: video.title,
        youtubeUrl: video.youtubeUrl,
        category: video.category,
        featured: video.featured || false,
        description: video.description || null,
        sortOrder: video.sortOrder,
        isActive: true,
      },
    });
    console.log(`Created video: ${video.title}`);
  }

  console.log("Education video seeding complete!");
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
