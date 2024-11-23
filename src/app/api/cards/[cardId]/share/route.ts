import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const shareSchema = z.object({
  email: z.string().email(),
});

export async function POST(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const card = await db.card.findUnique({
      where: { id: params.cardId },
    });

    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    if (card.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { email } = shareSchema.parse(body);

    const userToShare = await db.user.findUnique({
      where: { email },
    });

    if (!userToShare) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (userToShare.id === session.user.id) {
      return NextResponse.json(
        { message: "Cannot share with yourself" },
        { status: 400 }
      );
    }

    const updatedCard = await db.card.update({
      where: { id: params.cardId },
      data: {
        sharedWith: {
          connect: {
            id: userToShare.id,
          },
        },
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid email", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error sharing card:", error);
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 }
    );
  }
}
