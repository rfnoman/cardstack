import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const cardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
});

const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    // Convert base64/dataURL to buffer if it's not already a URL
    let imageUrl = body.imageUrl;
    if (imageUrl && imageUrl.startsWith('data:')) {
      const base64Data = imageUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Check file size (1MB limit)
      if (buffer.length > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { message: "Image size too large. Please use a smaller image (max 1MB)." },
          { status: 400 }
        );
      }
    }

    const validatedData = cardSchema.parse(body);

    const card = await db.card.create({
      data: {
        ...validatedData,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid card data", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating card:", error);
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const cards = await db.card.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { sharedWith: { some: { id: session.user.id } } },
        ],
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 }
    );
  }
}
