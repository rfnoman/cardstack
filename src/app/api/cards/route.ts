import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { saveBase64Image, deleteImage } from '@/lib/utils/file';
import path from 'path';
import fs from 'fs';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const cards = await db.card.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { message: 'Error fetching cards' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user?.id) {
      console.log('No user ID in session');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, company, email, phone, image } = await req.json();
    console.log('Request data:', { name, company, email, phone, hasImage: !!image });
    console.log('User ID from session:', session.user.id);

    // Save image if provided
    let imageUrl = null;
    if (image) {
      try {
        imageUrl = saveBase64Image(image);
        console.log('Image saved with URL:', imageUrl);
        
        // Verify the file exists
        const filePath = path.join(process.cwd(), 'public', imageUrl);
        if (!fs.existsSync(filePath)) {
          console.error('Image file not found at:', filePath);
          return NextResponse.json(
            { message: 'Error saving image: File not found' },
            { status: 500 }
          );
        }
      } catch (error) {
        console.error('Error saving image:', error);
        return NextResponse.json(
          { message: 'Error saving image' },
          { status: 500 }
        );
      }
    }

    // Verify user exists before creating card
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      console.error('User not found:', session.user.id);
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const card = await db.card.create({
      data: {
        name,
        company,
        email,
        phone,
        image: imageUrl,
        userId: session.user.id,
      },
    });

    console.log('Created card:', card);
    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      { message: 'Error creating card' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Card ID is required' },
        { status: 400 }
      );
    }

    // Get the card to delete its image
    const card = await db.card.findUnique({
      where: { id },
    });

    if (!card) {
      return NextResponse.json(
        { message: 'Card not found' },
        { status: 404 }
      );
    }

    if (card.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete the image file if it exists
    if (card.image) {
      deleteImage(card.image);
    }

    // Delete the card from database
    await db.card.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Card deleted' });
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { message: 'Error deleting card' },
      { status: 500 }
    );
  }
}
