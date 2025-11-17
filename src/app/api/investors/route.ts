import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { investors, userOutreach } from '@/db/schema';
import { eq, and, ilike, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const stage = searchParams.get('stage');
    const geo = searchParams.get('geo');
    const industry = searchParams.get('industry');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where conditions
    const whereConditions = [eq(investors.isActive, true)];

    if (type) {
      whereConditions.push(eq(investors.type, type));
    }

    if (query) {
      whereConditions.push(
        or(
          ilike(investors.name, `%${query}%`),
          ilike(investors.email, `%${query}%`)
        )
      );
    }

    // Note: For stages, industries, and geo arrays, we'll filter after fetching
    // as Drizzle's SQLite integration has limitations with JSON array filtering

    let allInvestors = await db
      .select()
      .from(investors)
      .where(and(...whereConditions))
      .orderBy(desc(investors.matchScore))
      .limit(limit * 2); // Fetch more to allow for filtering

    // Apply array filters
    let filteredInvestors = allInvestors;

    if (stage) {
      filteredInvestors = filteredInvestors.filter(inv => 
        inv.stages && inv.stages.includes(stage)
      );
    }

    if (geo) {
      filteredInvestors = filteredInvestors.filter(inv => 
        inv.geo && inv.geo.includes(geo)
      );
    }

    if (industry) {
      filteredInvestors = filteredInvestors.filter(inv => 
        inv.industries && inv.industries.some(ind => 
          ind.toLowerCase().includes(industry.toLowerCase())
        )
      );
    }

    // Limit the final result
    filteredInvestors = filteredInvestors.slice(0, limit);

    // Get outreach data if userId provided
    let outreachData = [];
    if (userId) {
      outreachData = await db
        .select()
        .from(userOutreach)
        .where(eq(userOutreach.userId, userId));
    }

    // Transform the data to match frontend interface
    const transformedInvestors = filteredInvestors.map(inv => {
      const userOutreachForInv = outreachData.filter(o => o.investorId === inv.id);
      
      return {
        id: inv.id,
        name: inv.name,
        type: inv.type,
        stages: inv.stages || [],
        industries: inv.industries || [],
        geo: inv.geo || [],
        fundingMin: inv.fundingMin,
        fundingMax: inv.fundingMax,
        portfolio: inv.portfolio || [],
        email: inv.email || undefined,
        linkedin: inv.linkedin || undefined,
        matchScore: inv.matchScore,
        // Add computed fields
        lastOutreach: userOutreachForInv.length > 0 ? 
          Math.max(...userOutreachForInv.map(o => o.createdAt.getTime())) : null,
        outreachCount: userOutreachForInv.length,
        pendingOutreach: userOutreachForInv.filter(o => o.status === 'pending').length,
      };
    });

    return NextResponse.json(transformedInvestors);
  } catch (error) {
    console.error('Error fetching investors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      stages = [],
      industries = [],
      geo = [],
      fundingMin,
      fundingMax,
      portfolio = [],
      email,
      linkedin,
      website,
      matchScore = 0,
    } = body;

    if (!name || !type || !fundingMin || !fundingMax) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newInvestor = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      stages,
      industries,
      geo,
      fundingMin: parseInt(fundingMin),
      fundingMax: parseInt(fundingMax),
      portfolio,
      email,
      linkedin,
      website,
      matchScore: parseInt(matchScore),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .insert(investors)
      .values(newInvestor)
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating investor:', error);
    return NextResponse.json(
      { error: 'Failed to create investor' },
      { status: 500 }
    );
  }
}