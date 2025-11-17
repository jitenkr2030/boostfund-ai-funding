import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { startupProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');

    if (!userId && !id) {
      return NextResponse.json(
        { error: 'userId or id is required' },
        { status: 400 }
      );
    }

    let profile;
    if (id) {
      const result = await db
        .select()
        .from(startupProfiles)
        .where(eq(startupProfiles.id, id));
      profile = result[0];
    } else {
      const result = await db
        .select()
        .from(startupProfiles)
        .where(eq(startupProfiles.userId, userId!));
      profile = result[0];
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      tagline,
      stage,
      industry,
      region,
      fundingNeed,
      summary,
      website,
      isPublic = false,
    } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'userId and name are required' },
        { status: 400 }
      );
    }

    // Check if profile already exists for user
    const existingProfile = await db
      .select()
      .from(startupProfiles)
      .where(eq(startupProfiles.userId, userId));

    if (existingProfile.length > 0) {
      // Update existing profile
      const result = await db
        .update(startupProfiles)
        .set({
          name,
          tagline,
          stage,
          industry,
          region,
          fundingNeed,
          summary,
          website,
          isPublic,
          updatedAt: new Date(),
        })
        .where(eq(startupProfiles.userId, userId))
        .returning();

      return NextResponse.json(result[0]);
    } else {
      // Create new profile
      const newProfile = {
        id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        name,
        tagline,
        stage,
        industry,
        region,
        fundingNeed,
        summary,
        website,
        isPublic,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db
        .insert(startupProfiles)
        .values(newProfile)
        .returning();

      return NextResponse.json(result[0], { status: 201 });
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      userId,
      name,
      tagline,
      stage,
      industry,
      region,
      fundingNeed,
      summary,
      website,
      isPublic,
    } = body;

    if (!id && !userId) {
      return NextResponse.json(
        { error: 'id or userId is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (stage !== undefined) updateData.stage = stage;
    if (industry !== undefined) updateData.industry = industry;
    if (region !== undefined) updateData.region = region;
    if (fundingNeed !== undefined) updateData.fundingNeed = fundingNeed;
    if (summary !== undefined) updateData.summary = summary;
    if (website !== undefined) updateData.website = website;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    let result;
    if (id) {
      result = await db
        .update(startupProfiles)
        .set(updateData)
        .where(eq(startupProfiles.id, id))
        .returning();
    } else {
      result = await db
        .update(startupProfiles)
        .set(updateData)
        .where(eq(startupProfiles.userId, userId))
        .returning();
    }

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}