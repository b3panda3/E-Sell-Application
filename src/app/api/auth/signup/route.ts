import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

function generateEsellCode(): string {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomAlpha = () => alpha[Math.floor(Math.random() * alpha.length)];
  const randomDigit = () => Math.floor(Math.random() * 10);
  return `ES-${randomAlpha()}${randomAlpha()}${randomAlpha()}-${randomDigit()}${randomDigit()}${randomDigit()}`;
}

async function getUniqueEsellCode(): Promise<string> {
  let code = generateEsellCode();
  let exists = await db.user.findUnique({ where: { esellCode: code } });
  while (exists) {
    code = generateEsellCode();
    exists = await db.user.findUnique({ where: { esellCode: code } });
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role, businessCategory, storeName } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (!["MERCHANT", "CUSTOMER"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be MERCHANT or CUSTOMER" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const esellCode = role === "MERCHANT" ? await getUniqueEsellCode() : null;

    const user = await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role,
        esellCode,
        businessCategory: role === "MERCHANT" ? businessCategory || null : null,
      },
    });

    await db.trustProfile.create({
      data: {
        userId: user.id,
      },
    });

    // Create storefront for merchants with storeName
    if (role === "MERCHANT") {
      await db.storefront.create({
        data: {
          userId: user.id,
          storeName: storeName || null,
          isActive: true,
        },
      });
    }

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          esellCode: user.esellCode,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
