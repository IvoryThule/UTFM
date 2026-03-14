import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check existing
    const existing = await prisma.user.findUnique({
      where: { username }
    });

    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    // Create User (DEMO: Storing Plain Text Password for simplicity without deps)
    // In production, use bcrypt/argon2
    const user = await prisma.user.create({
      data: {
        username,
        password, // TODO: Hash this
        level: 1,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        level: user.level,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}