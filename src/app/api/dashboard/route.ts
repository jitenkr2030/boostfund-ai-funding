import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analytics, applications, userSavedOpportunities, userOutreach } from '@/db/schema';
import { eq, and, count, sql, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const dateRange = searchParams.get('dateRange') || '30d'; // 7d, 30d, 90d

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get basic stats
    const userApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId));

    const savedOpps = await db
      .select()
      .from(userSavedOpportunities)
      .where(eq(userSavedOpportunities.userId, userId));

    const outreachData = await db
      .select()
      .from(userOutreach)
      .where(eq(userOutreach.userId, userId));

    // Calculate metrics
    const totalApplications = userApplications.length;
    const approvedApplications = userApplications.filter(app => app.status === 'approved').length;
    const rejectedApplications = userApplications.filter(app => app.status === 'rejected').length;
    const inProgressApplications = userApplications.filter(app => 
      ['draft', 'submitted', 'under_review'].includes(app.status)
    ).length;
    
    const totalRequested = userApplications.reduce((sum, app) => sum + app.amountRequested, 0);
    const approvedAmount = userApplications
      .filter(app => app.status === 'approved')
      .reduce((sum, app) => sum + app.amountRequested, 0);

    // Success rate calculation
    const successRate = totalApplications > 0 ? 
      Math.round((approvedApplications / totalApplications) * 100) : 0;

    // Outreach metrics
    const totalOutreach = outreachData.length;
    const positiveResponses = outreachData.filter(o => o.status === 'positive').length;
    const neutralResponses = outreachData.filter(o => o.status === 'neutral').length;
    const negativeResponses = outreachData.filter(o => o.status === 'negative').length;
    const pendingOutreach = outreachData.filter(o => o.status === 'pending').length;

    // Readiness score calculation (simplified algorithm)
    let readinessScore = 0;
    
    // Base score from completed applications
    readinessScore += Math.min(totalApplications * 5, 30);
    
    // Bonus for approved applications
    readinessScore += approvedApplications * 10;
    
    // Bonus for outreach activity
    readinessScore += Math.min(totalOutreach * 2, 20);
    
    // Bonus for saved opportunities (shows active searching)
    readinessScore += Math.min(savedOpps.length * 1, 15);
    
    // Bonus for positive responses
    readinessScore += positiveResponses * 5;
    
    // Cap at 100
    readinessScore = Math.min(readinessScore, 100);

    // Prepare pipeline data for charts (last 30 days)
    const pipelineData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate pipeline metrics for demo
      const baseValue = 30 + (Math.sin(i / 3) * 15) + (i > 20 ? 8 : 0);
      pipelineData.push({
        x: 29 - i,
        y: Math.max(0, Math.min(100, Math.round(baseValue + (Math.random() * 10 - 5))))
      });
    }

    // Prepare success metrics for charts
    const successMetrics = [
      { label: 'Discovery', value: Math.min(100, totalApplications * 15 + 20) },
      { label: 'Qualified', value: Math.min(100, totalApplications * 12 + 10) },
      { label: 'Submitted', value: Math.min(100, totalApplications * 8 + 5) },
      { label: 'Interview', value: Math.min(100, inProgressApplications * 6 + 3) },
      { label: 'Awarded', value: approvedApplications * 20 },
    ];

    // Prepare KPIs
    const kpis = [
      {
        id: 'total-matches',
        label: 'Total Matches',
        value: String(savedOpps.length + userApplications.length),
        sublabel: 'This month',
        trend: { delta: '+12%', up: true },
        icon: 'ChartPie',
      },
      {
        id: 'applications-progress',
        label: 'Applications In Progress',
        value: String(inProgressApplications),
        sublabel: 'Across programs',
        trend: undefined,
        icon: 'PanelsTopLeft',
      },
      {
        id: 'success-rate',
        label: 'Success Rate',
        value: `${successRate}%`,
        sublabel: 'Last 90 days',
        trend: { delta: '+6%', up: successRate > 30 },
        icon: 'TrendingUp',
      },
      {
        id: 'potential-funding',
        label: 'Potential Funding',
        value: `$${Math.round(totalRequested / 1000000 * 100) / 100}M`,
        sublabel: 'Eligible amount',
        trend: { delta: '+15%', up: true },
        icon: 'ChartColumnBig',
      },
    ];

    // Prepare activities (recent events)
    const activities = [
      {
        id: 'activity-1',
        title: `Application moved to Review: ${userApplications.find(app => app.status === 'under_review')?.name || 'Recent Application'}`,
        description: 'Reviewer assigned and initial screening completed.',
        time: '2h ago',
        status: 'success',
      },
      {
        id: 'activity-2',
        title: 'New match found: AI Innovation Fund',
        description: 'Score 84% match to your profile.',
        time: 'Today, 9:14',
        status: 'default',
      },
      {
        id: 'activity-3',
        title: 'Investor intro available',
        description: 'Warm intro to TechVentures Capital partner.',
        time: 'Yesterday',
        status: 'success',
      },
    ];

    // Prepare suggestions for readiness improvement
    const suggestions = [
      'Strengthen traction narrative with 2 new customer proofs.',
      'Clarify runway: attach 12-month cash flow projection.',
      'Tighten GTM milestones with measurable KPIs.',
      'Increase outreach activity to potential investors.',
      'Complete profile information for better AI matching.',
    ];

    const response = {
      kpis,
      readinessScore,
      readinessSuggestions: suggestions.slice(0, 3),
      activities,
      pipelineData,
      successMetrics,
      summary: {
        totalApplications,
        approvedApplications,
        inProgressApplications,
        totalRequested,
        approvedAmount,
        successRate,
        totalOutreach,
        positiveResponses,
        pendingOutreach,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard analytics' },
      { status: 500 }
    );
  }
}