import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { applications, applicationDocuments, applicationHistory, complianceItems } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Build where conditions
    const whereConditions = [eq(applications.userId, userId)];

    if (status && status !== 'all') {
      whereConditions.push(eq(applications.status, status));
    }

    let userApplications = await db
      .select()
      .from(applications)
      .where(and(...whereConditions))
      .orderBy(desc(applications.updatedAt))
      .limit(limit);

    // Transform the data to match frontend interface
    const transformedApplications = await Promise.all(
      userApplications.map(async (app) => {
        // Get documents for this application
        const documents = await db
          .select()
          .from(applicationDocuments)
          .where(eq(applicationDocuments.applicationId, app.id));

        // Get history for this application
        const history = await db
          .select()
          .from(applicationHistory)
          .where(eq(applicationHistory.applicationId, app.id))
          .orderBy(desc(applicationHistory.at));

        // Get compliance items for this application
        const compliance = await db
          .select()
          .from(complianceItems)
          .where(eq(complianceItems.applicationId, app.id));

        return {
          id: app.id,
          name: app.name,
          source: app.source,
          amountRequested: app.amountRequested,
          submissionDate: app.submissionDate?.toISOString(),
          status: app.status,
          deadline: app.deadline?.toISOString(),
          nextAction: app.nextAction,
          documents: documents.map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            updatedAt: doc.updatedAt.toISOString(),
          })),
          history: history.map(h => ({
            id: h.id,
            event: h.event,
            at: h.at.toISOString(),
            by: h.by,
          })),
          insights: app.insights,
          compliance: compliance.map(c => ({
            label: c.label,
            done: c.done,
          })),
        };
      })
    );

    return NextResponse.json(transformedApplications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      opportunityId,
      name,
      source,
      amountRequested,
      status = 'draft',
      deadline,
      nextAction,
      insights,
      complianceItems: compliance,
    } = body;

    if (!userId || !name || !source || !amountRequested) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      opportunityId,
      name,
      source,
      amountRequested: parseInt(amountRequested),
      status,
      deadline: deadline ? new Date(deadline) : null,
      nextAction,
      insights,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .insert(applications)
      .values(newApplication)
      .returning();

    const appId = result[0].id;

    // Add initial history entry
    await db.insert(applicationHistory).values({
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      applicationId: appId,
      event: 'Application created',
      at: new Date(),
      by: userId,
    });

    // Add compliance items if provided
    if (compliance && compliance.length > 0) {
      const complianceEntries = compliance.map(item => ({
        id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        applicationId: appId,
        label: item.label,
        done: item.done || false,
      }));

      await db.insert(complianceItems).values(complianceEntries);
    }

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      status,
      nextAction,
      insights,
      submissionDate,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (nextAction !== undefined) updateData.nextAction = nextAction;
    if (insights !== undefined) updateData.insights = insights;
    if (submissionDate) updateData.submissionDate = new Date(submissionDate);

    const result = await db
      .update(applications)
      .set(updateData)
      .where(eq(applications.id, id))
      .returning();

    // Add history entry if status changed
    if (status) {
      await db.insert(applicationHistory).values({
        id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        applicationId: id,
        event: `Status updated to ${status}`,
        at: new Date(),
      });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}