import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password, displayName } = await request.json();

    // Validation
    if (!email || !password || !displayName) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.userProfile.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 400 }
      );
    }

    // Create user with proper UUID
    const userProfile = await prisma.userProfile.create({
      data: {
        id: randomUUID(),
        email: email,
        displayName: displayName,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        displayName: userProfile.displayName,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
