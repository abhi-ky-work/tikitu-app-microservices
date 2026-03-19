import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    
    // Auth route middleware already validates the token, but double checking here guarantees type safety for user
    if (!user || (!user.sub)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cognitoId = user.sub;
    const body = await req.json();
    const { name, companyName, phone, email } = body;

    if (!name || !companyName || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: name, companyName, or phone" },
        { status: 400 }
      );
    }

    // Upsert the partner profile using cognitoId as the unique identifier
    const partnerProfile = await prisma.partner.upsert({
      where: {
        cognitoId,
      },
      update: {
        name,
        companyName,
        phone,
      },
      create: {
        cognitoId,
        email: email || user.email || "no-reply@example.com", // Fallback if no email is provided on first creation
        name,
        companyName,
        phone,
        isVerified: false,
        isActive: true,
      },
    });

    return NextResponse.json(
      { message: "Partner profile saved successfully", data: partnerProfile },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error saving partner profile:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
