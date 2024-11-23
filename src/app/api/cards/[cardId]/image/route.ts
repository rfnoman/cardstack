import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    const card = await db.card.findUnique({
      where: { id: params.cardId },
      include: { owner: true },
    });

    if (!card) {
      return new NextResponse("Card not found", { status: 404 });
    }

    if (card.owner.email !== session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedCard = await db.card.update({
      where: { id: params.cardId },
      data: { imageUrl },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("Error updating card image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
