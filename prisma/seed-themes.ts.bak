import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const THEMES = [
  {
    name: "MarketHub",
    category: "general",
    description: "A versatile marketplace theme perfect for general goods and multi-category stores. Clean layout with prominent product grids.",
    previewImageUrl: "/themes/markethub.png",
    layoutConfig: JSON.stringify({
      headerStyle: "centered",
      heroSection: true,
      productGridCols: 3,
      showCategoryBar: true,
      footerStyle: "detailed",
      sidebarPosition: "none",
    }),
    defaultColors: JSON.stringify({
      primary: "#006633",
      secondary: "#00875A",
      accent: "#FFB800",
      background: "#FFFFFF",
      surface: "#F8FAF9",
      text: "#1A1A1A",
      textLight: "#6B7280",
    }),
    isActive: true,
  },
  {
    name: "ProServe",
    category: "services",
    description: "A professional service-oriented theme with emphasis on expertise, team profiles, and service descriptions. Ideal for consultants and agencies.",
    previewImageUrl: "/themes/proserve.png",
    layoutConfig: JSON.stringify({
      headerStyle: "split",
      heroSection: true,
      productGridCols: 2,
      showCategoryBar: false,
      footerStyle: "minimal",
      sidebarPosition: "right",
      showStaffSection: true,
    }),
    defaultColors: JSON.stringify({
      primary: "#1E40AF",
      secondary: "#3B82F6",
      accent: "#F59E0B",
      background: "#FFFFFF",
      surface: "#F0F4FF",
      text: "#1A1A1A",
      textLight: "#6B7280",
    }),
    isActive: true,
  },
  {
    name: "CreativeStudio",
    category: "creative",
    description: "A bold, artistic theme for creative professionals. Features large image showcases, gallery layouts, and vibrant color options.",
    previewImageUrl: "/themes/creativestudio.png",
    layoutConfig: JSON.stringify({
      headerStyle: "overlay",
      heroSection: true,
      productGridCols: 2,
      showCategoryBar: false,
      footerStyle: "creative",
      sidebarPosition: "none",
      masonryLayout: true,
    }),
    defaultColors: JSON.stringify({
      primary: "#7C3AED",
      secondary: "#A855F7",
      accent: "#EC4899",
      background: "#FFFFFF",
      surface: "#FAF5FF",
      text: "#1A1A1A",
      textLight: "#6B7280",
    }),
    isActive: true,
  },
  {
    name: "TechStore",
    category: "technology",
    description: "A sleek, modern theme designed for electronics and tech products. Features dark mode by default and product comparison layouts.",
    previewImageUrl: "/themes/techstore.png",
    layoutConfig: JSON.stringify({
      headerStyle: "fixed",
      heroSection: true,
      productGridCols: 4,
      showCategoryBar: true,
      footerStyle: "detailed",
      sidebarPosition: "left",
      darkModeDefault: true,
    }),
    defaultColors: JSON.stringify({
      primary: "#0F766E",
      secondary: "#14B8A6",
      accent: "#06B6D4",
      background: "#0F172A",
      surface: "#1E293B",
      text: "#F1F5F9",
      textLight: "#94A3B8",
    }),
    isActive: true,
  },
  {
    name: "FoodMarket",
    category: "food",
    description: "A warm, inviting theme for food vendors and restaurants. Features appetizing color palettes and menu-style product displays.",
    previewImageUrl: "/themes/foodmarket.png",
    layoutConfig: JSON.stringify({
      headerStyle: "banner",
      heroSection: true,
      productGridCols: 3,
      showCategoryBar: true,
      footerStyle: "warm",
      sidebarPosition: "none",
      menuStyle: true,
    }),
    defaultColors: JSON.stringify({
      primary: "#DC2626",
      secondary: "#F97316",
      accent: "#FBBF24",
      background: "#FFFBEB",
      surface: "#FEF3C7",
      text: "#1A1A1A",
      textLight: "#92400E",
    }),
    isActive: true,
  },
];

async function main() {
  console.log("Seeding themes...");

  for (const theme of THEMES) {
    const existing = await db.theme.findFirst({ where: { name: theme.name } });
    if (!existing) {
      await db.theme.create({ data: theme });
      console.log(`Created theme: ${theme.name}`);
    } else {
      console.log(`Theme already exists: ${theme.name}`);
    }
  }

  console.log("Theme seeding complete!");
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
