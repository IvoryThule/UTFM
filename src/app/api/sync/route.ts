// src/app/api/sync/route.ts
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { restaurants, university } = await req.json();

    if (!restaurants || !Array.isArray(restaurants)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // 1. Find or create university
    let uni = await prisma.university.findFirst({
      where: { name: university.name }
    });
    
    if (!uni) {
      uni = await prisma.university.create({
        data: {
          name: university.name,
          city: university.city || "Unknown",
          latitude: university.location.lat,
          longitude: university.location.lng,
        }
      });
    }

    // 2. Upsert restaurants
    for (const r of restaurants) {
      // Map Amap data to our schema
      const mapped = {
        name: r.name,
        category: r.type,
        subcategory: r.type.split(";")[1] || r.type,
        avgPrice: parseFloat(r.biz_ext?.cost) || 0,
        rating: parseFloat(r.biz_ext?.rating) || 0,
        address: r.address,
        latitude: r.location.lat,
        longitude: r.location.lng,
        amapId: r.id,
        universityId: uni.id
      };

      await prisma.restaurant.upsert({
        where: { amapId: r.id },
        update: mapped,
        create: mapped
      });
    }

    return NextResponse.json({ success: true, count: restaurants.length });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}