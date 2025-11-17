import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { fundingOpportunities, userSavedOpportunities } from '@/db/schema';
import { eq, and, or, ilike, gte, lte, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const industry = searchParams.get('industry');
    const location = searchParams.get('location');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const deadlineBefore = searchParams.get('deadlineBefore');
    const query = searchParams.get('q');
    const saved = searchParams.get('saved');
    const userId = searchParams.get('userId');

    // Build where conditions
    const whereConditions = [eq(fundingOpportunities.isActive, true)];

    if (type && type !== 'all') {
      whereConditions.push(eq(fundingOpportunities.type, type));
    }

    if (industry && industry !== 'all') {
      whereConditions.push(eq(fundingOpportunities.industry, industry));
    }

    if (location && location !== 'all') {
      whereConditions.push(eq(fundingOpportunities.location, location));
    }

    if (minAmount) {
      whereConditions.push(gte(fundingOpportunities.amountMax, parseInt(minAmount)));
    }

    if (maxAmount) {
      whereConditions.push(lte(fundingOpportunities.amountMin, parseInt(maxAmount)));
    }

    if (deadlineBefore) {
      whereConditions.push(lte(fundingOpportunities.deadline, new Date(deadlineBefore)));
    }

    if (query) {
      whereConditions.push(
        or(
          ilike(fundingOpportunities.title, `%${query}%`),
          ilike(fundingOpportunities.industry, `%${query}%`),
          ilike(fundingOpportunities.location, `%${query}%`),
          ilike(fundingOpportunities.eligibility, `%${query}%`),
          ilike(fundingOpportunities.description, `%${query}%`)
        )
      );
    }

    let opportunities = await db
      .select()
      .from(fundingOpportunities)
      .where(and(...whereConditions))
      .orderBy(desc(fundingOpportunities.score))
      .limit(limit);

    // If user wants saved opportunities, we need to join with saved opportunities
    if (saved === 'true' && userId) {
      const savedOpps = await db
        .select({
          opportunityId: userSavedOpportunities.opportunityId
        })
        .from(userSavedOpportunities)
        .where(eq(userSavedOpportunities.userId, userId));

      const savedIds = savedOpps.map(op => op.opportunityId);
      opportunities = opportunities.filter(op => savedIds.includes(op.id));
    }

    // Transform the data to match frontend interface
    const transformedOpportunities = opportunities.map(opp => ({
      id: opp.id,
      title: opp.title,
      type: opp.type,
      industry: opp.industry,
      location: opp.location,
      amountMin: opp.amountMin,
      amountMax: opp.amountMax,
      currency: opp.currency,
      deadline: opp.deadline.toISOString(),
      eligibility: opp.eligibility,
      score: opp.score,
      description: opp.description,
      requirements: opp.requirements || [],
      process: opp.process || [],
      url: opp.url || undefined,
    }));

    return NextResponse.json(transformedOpportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      type,
      industry,
      location,
      amountMin,
      amountMax,
      currency = 'USD',
      deadline,
      eligibility,
      description,
      requirements = [],
      process = [],
      url,
      score = 0,
    } = body;

    if (!title || !type || !industry || !location || !amountMin || !amountMax || !deadline || !eligibility || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newOpportunity = {
      id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      type,
      industry,
      location,
      amountMin: parseInt(amountMin),
      amountMax: parseInt(amountMax),
      currency,
      deadline: new Date(deadline),
      eligibility,
      description,
      requirements,
      process,
      url,
      score: parseInt(score),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .insert(fundingOpportunities)
      .values(newOpportunity)
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    );
  }
}