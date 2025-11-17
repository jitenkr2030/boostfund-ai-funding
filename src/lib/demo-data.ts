import { db } from '@/db';
import {
  fundingOpportunities,
  investors,
  events,
  userSavedOpportunities,
  applications,
  applicationDocuments,
  applicationHistory,
  complianceItems,
  userOutreach,
  startupProfiles,
  analytics,
} from '@/db/schema';
import { nanoid } from 'nanoid';

// Demo user ID
const DEMO_USER_ID = 'demo_user_001';

// Funding opportunities data
const fundingOpportunitiesData = [
  {
    id: 'opp_001',
    title: 'Green Innovators Grant 2025',
    type: 'grant',
    industry: 'Climate',
    location: 'Global',
    amountMin: 50000,
    amountMax: 150000,
    currency: 'USD',
    deadline: new Date('2025-12-15'),
    eligibility: 'Early-stage startups working on carbon reduction technologies.',
    description: 'Support for startups developing scalable solutions that reduce greenhouse gas emissions. Includes mentorship, non-dilutive funding, and access to pilot partners.',
    requirements: [
      'Incorporated entity under 5 years old',
      'MVP or validated prototype',
      'Impact measurement framework',
    ],
    process: [
      'Online application (10 pages max)',
      'Initial screening call',
      'Panel review with domain experts',
      'Final decision and terms',
    ],
    url: 'https://greeninnovators.org/apply',
    score: 92,
  },
  {
    id: 'opp_002',
    title: 'Helix Ventures Seed Program',
    type: 'vc',
    industry: 'AI/ML',
    location: 'United States',
    amountMin: 250000,
    amountMax: 2000000,
    currency: 'USD',
    deadline: new Date('2026-01-15'),
    eligibility: 'Technical founding teams with defensible AI moats.',
    description: 'Pre-seed and seed checks with hands-on GTM help. Focus on applied AI in healthcare and enterprise automation.',
    requirements: [
      '2-3 founders',
      'Early traction or pilots',
      'Defensible IP or data advantage',
    ],
    process: [
      'Warm intro preferred',
      'Partner meeting',
      'Technical diligence',
      'Term sheet',
    ],
    url: 'https://helix.vc/seed-program',
    score: 78,
  },
  {
    id: 'opp_003',
    title: 'Women in Fintech Angel Collective',
    type: 'angel',
    industry: 'Fintech',
    location: 'Europe',
    amountMin: 100000,
    amountMax: 500000,
    currency: 'EUR',
    deadline: new Date('2025-12-01'),
    eligibility: 'Women-led fintech startups at MVP to early traction stage.',
    description: 'Collective of operators and angels investing in inclusive financial innovation across Europe.',
    requirements: [
      'Female founder/CEO',
      'Operating in EEA/UK',
      'Product in market or pilot-ready',
    ],
    process: [
      'Submit deck',
      'Screening committee',
      'Pitch to collective',
      'Syndication & close',
    ],
    url: 'https://womenfintech.angels/apply',
    score: 84,
  },
  {
    id: 'opp_004',
    title: 'Founders Growth Loan',
    type: 'loan',
    industry: 'Enterprise',
    location: 'United States',
    amountMin: 150000,
    amountMax: 1000000,
    currency: 'USD',
    deadline: new Date('2026-02-15'),
    eligibility: 'Post-revenue SaaS with >$25k MRR.',
    description: 'Non-dilutive growth capital with flexible covenants for B2B SaaS. Rapid underwriting and founder-friendly terms.',
    requirements: [
      '$25k+ MRR',
      '12+ months runway post-fund',
      'US entity',
    ],
    process: [
      'Submit financials',
      'Underwriting',
      'Offer',
      'Funds wired',
    ],
    url: 'https://foundersgrowth.com/apply',
    score: 70,
  },
  {
    id: 'opp_005',
    title: 'NSF Small Business Innovation Research',
    type: 'grant',
    industry: 'AI/ML',
    location: 'United States',
    amountMin: 275000,
    amountMax: 1750000,
    currency: 'USD',
    deadline: new Date('2026-03-15'),
    eligibility: 'US-owned small businesses developing innovative technologies.',
    description: 'NSF SBIR supports research and development of innovative technologies with commercial potential.',
    requirements: [
      'US-owned small business',
      'Innovative R&D project',
      'Commercial potential',
    ],
    process: [
      'Phase I: Feasibility (6 months)',
      'Phase II: R&D (2 years)',
      'Phase III: Commercialization',
    ],
    url: 'https://seedfund.nsf.gov/',
    score: 88,
  },
  {
    id: 'opp_006',
    title: 'ClimateTech Accelerator Fund',
    type: 'grant',
    industry: 'Climate',
    location: 'Global',
    amountMin: 100000,
    amountMax: 500000,
    currency: 'USD',
    deadline: new Date('2025-12-30'),
    eligibility: 'Climate technology startups with proven early traction.',
    description: 'Acceleration program with funding for climate tech startups focused on mitigation and adaptation.',
    requirements: [
      'Climate impact focus',
      'Early traction proven',
      'Scalable technology',
    ],
    process: [
      'Online application',
      'Technical assessment',
      'Pitch day',
      'Program selection',
    ],
    url: 'https://climatetech.accelerator/fund',
    score: 90,
  },
];

// Investors data
const investorsData = [
  {
    id: 'inv_001',
    name: 'GreenWave Ventures',
    type: 'vc',
    stages: ['seed', 'series-a'],
    industries: ['ClimateTech', 'SaaS'],
    geo: ['na', 'eu'],
    fundingMin: 250000,
    fundingMax: 5000000,
    portfolio: ['EcoGrid', 'TerraFlow', 'Airspan'],
    email: 'partners@greenwave.vc',
    linkedin: 'https://linkedin.com/company/greenwave-ventures',
    website: 'https://greenwave.vc',
    matchScore: 92,
  },
  {
    id: 'inv_002',
    name: 'Nova Angels',
    type: 'angel',
    stages: ['pre-seed', 'seed'],
    industries: ['AI', 'Fintech', 'Developer Tools'],
    geo: ['global'],
    fundingMin: 25000,
    fundingMax: 250000,
    portfolio: ['CodeLift', 'QubitPay', 'SynthAI'],
    email: 'intro@novaangels.com',
    linkedin: 'https://linkedin.com/in/nova-angels',
    matchScore: 84,
  },
  {
    id: 'inv_003',
    name: 'Orion Strategic Capital',
    type: 'strategic',
    stages: ['series-a', 'series-b', 'growth'],
    industries: ['Healthcare', 'BioTech'],
    geo: ['na', 'eu', 'asia'],
    fundingMin: 2000000,
    fundingMax: 20000000,
    portfolio: ['BioPrime', 'CareLoop'],
    email: 'bd@orioncap.com',
    linkedin: 'https://linkedin.com/company/orion-strategic',
    matchScore: 77,
  },
  {
    id: 'inv_004',
    name: 'Latitude Ventures',
    type: 'vc',
    stages: ['seed', 'series-a', 'series-b'],
    industries: ['Fintech', 'SaaS'],
    geo: ['na', 'latam'],
    fundingMin: 500000,
    fundingMax: 10000000,
    portfolio: ['Mintly', 'LedgerIQ', 'PayBeam'],
    email: 'hello@latitude.vc',
    linkedin: 'https://linkedin.com/company/latitude-ventures',
    matchScore: 71,
  },
  {
    id: 'inv_005',
    name: 'TechFounders Collective',
    type: 'angel',
    stages: ['seed', 'series-a'],
    industries: ['AI/ML', 'Developer Tools'],
    geo: ['na'],
    fundingMin: 100000,
    fundingMax: 1000000,
    portfolio: ['DevTools Pro', 'AI Assistant', 'CodeReview AI'],
    email: 'founders@techfounders.co',
    linkedin: 'https://linkedin.com/company/techfounders',
    matchScore: 86,
  },
];

// Events data
const eventsData = [
  {
    id: 'evt_001',
    title: 'SaaS Founders Pitch Night',
    date: new Date('2025-12-14'),
    location: 'San Francisco, CA',
    type: 'pitch-competition',
    industries: ['SaaS'],
    aiRecommended: true,
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop',
    description: 'Monthly pitch event for SaaS founders to present to VCs and angels.',
    websiteUrl: 'https://saasfounders.com/pitch-night',
  },
  {
    id: 'evt_002',
    title: 'ClimateTech Investor Meetup',
    date: new Date('2025-12-05'),
    location: 'Berlin, Germany',
    type: 'meetup',
    industries: ['ClimateTech'],
    aiRecommended: true,
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200&auto=format&fit=crop',
    description: 'Networking event for climate tech startups and impact investors.',
    websiteUrl: 'https://climatetech.berlin/meetup',
  },
  {
    id: 'evt_003',
    title: 'AI Innovators Summit',
    date: new Date('2026-01-02'),
    location: 'New York, NY',
    type: 'conference',
    industries: ['AI', 'Developer Tools'],
    aiRecommended: false,
    imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1200&auto=format&fit=crop',
    description: 'Annual conference showcasing the latest in AI innovation.',
    websiteUrl: 'https://aiinnovators.summit',
  },
];

// Applications data
const applicationsData = [
  {
    id: 'app_001',
    userId: DEMO_USER_ID,
    opportunityId: 'opp_001',
    name: 'Clean Energy Pilot - Phase II',
    source: 'DOE Innovation Fund',
    amountRequested: 350000,
    status: 'under_review',
    submissionDate: new Date('2025-06-12'),
    deadline: new Date('2025-06-30'),
    nextAction: 'Respond to reviewer questions',
    insights: 'Strong alignment with funding priorities. Increase clarity on milestone KPIs to boost approval odds.',
  },
  {
    id: 'app_002',
    userId: DEMO_USER_ID,
    opportunityId: 'opp_002',
    name: 'Community Broadband Expansion',
    source: 'NTIA Grants',
    amountRequested: 1200000,
    status: 'submitted',
    submissionDate: new Date('2025-05-20'),
    deadline: new Date('2025-07-01'),
    nextAction: 'Await confirmation',
    insights: 'Competitive category. Consider adding community impact metrics as an addendum if allowed.',
  },
  {
    id: 'app_003',
    userId: DEMO_USER_ID,
    opportunityId: 'opp_003',
    name: 'AgriTech Water Efficiency',
    source: 'USDA Innovation Challenge',
    amountRequested: 220000,
    status: 'draft',
    deadline: new Date('2025-07-15'),
    nextAction: 'Complete budget narrative',
    insights: 'Draft stage. Use template: \'USDA Narrative v2\' to speed up completion by ~45%.',
  },
  {
    id: 'app_004',
    userId: DEMO_USER_ID,
    opportunityId: 'opp_005',
    name: 'AI for Public Safety',
    source: 'NSF - Secure & Trustworthy',
    amountRequested: 600000,
    status: 'rejected',
    submissionDate: new Date('2025-04-02'),
    deadline: new Date('2025-04-01'),
    nextAction: 'Review feedback; plan resubmission',
    insights: 'Main gaps: evaluation plan rigor and ethics review. Add RCT design and IRB pre-approval.',
  },
  {
    id: 'app_005',
    userId: DEMO_USER_ID,
    opportunityId: 'opp_006',
    name: 'Decarbonized Logistics Network',
    source: 'Private Foundation A',
    amountRequested: 900000,
    status: 'approved',
    submissionDate: new Date('2025-03-10'),
    deadline: new Date('2025-03-01'),
    nextAction: 'Post-award onboarding',
    insights: 'Approval won with strong cost-benefit analysis. Use this framework for future applications.',
  },
];

// Documents data
const documentsData = [
  {
    id: 'doc_001',
    applicationId: 'app_001',
    name: 'Project_Proposal.pdf',
    type: 'pdf',
    updatedAt: new Date('2025-06-10'),
  },
  {
    id: 'doc_002',
    applicationId: 'app_001',
    name: 'Budget.xlsx',
    type: 'xls',
    updatedAt: new Date('2025-06-09'),
  },
  {
    id: 'doc_003',
    applicationId: 'app_002',
    name: 'Application_Form.docx',
    type: 'docx',
    updatedAt: new Date('2025-05-19'),
  },
  {
    id: 'doc_004',
    applicationId: 'app_004',
    name: 'Reviewer_Feedback.pdf',
    type: 'pdf',
    updatedAt: new Date('2025-04-10'),
  },
  {
    id: 'doc_005',
    applicationId: 'app_005',
    name: 'Final_Proposal.pdf',
    type: 'pdf',
    updatedAt: new Date('2025-03-05'),
  },
  {
    id: 'doc_006',
    applicationId: 'app_005',
    name: 'Grant_Agreement.pdf',
    type: 'pdf',
    updatedAt: new Date('2025-03-15'),
  },
];

// Application history data
const historyData = [
  {
    id: 'hist_001',
    applicationId: 'app_001',
    event: 'Submitted application',
    at: new Date('2025-06-12T10:15:00Z'),
    by: 'alex@boostfund.ai',
  },
  {
    id: 'hist_002',
    applicationId: 'app_001',
    event: 'Reviewer requested clarifications',
    at: new Date('2025-06-18T14:42:00Z'),
  },
  {
    id: 'hist_003',
    applicationId: 'app_002',
    event: 'Submitted application',
    at: new Date('2025-05-20T09:05:00Z'),
    by: 'alex@boostfund.ai',
  },
  {
    id: 'hist_004',
    applicationId: 'app_004',
    event: 'Submitted application',
    at: new Date('2025-04-02T12:00:00Z'),
    by: 'alex@boostfund.ai',
  },
  {
    id: 'hist_005',
    applicationId: 'app_004',
    event: 'Decision received (Rejected)',
    at: new Date('2025-05-12T08:15:00Z'),
  },
  {
    id: 'hist_006',
    applicationId: 'app_005',
    event: 'Submitted application',
    at: new Date('2025-03-10T09:20:00Z'),
    by: 'alex@boostfund.ai',
  },
  {
    id: 'hist_007',
    applicationId: 'app_005',
    event: 'Decision received (Approved)',
    at: new Date('2025-04-01T16:52:00Z'),
  },
];

// Compliance items data
const complianceData = [
  // For app_001
  {
    id: 'comp_001',
    applicationId: 'app_001',
    label: 'Signed letters of support',
    done: true,
  },
  {
    id: 'comp_002',
    applicationId: 'app_001',
    label: 'Environmental impact statement',
    done: false,
  },
  {
    id: 'comp_003',
    applicationId: 'app_001',
    label: 'Financial audit (last FY)',
    done: true,
  },
  // For app_002
  {
    id: 'comp_004',
    applicationId: 'app_002',
    label: '501(c)(3) verification',
    done: true,
  },
  {
    id: 'comp_005',
    applicationId: 'app_002',
    label: 'Digital equity plan',
    done: true,
  },
  // For app_003
  {
    id: 'comp_006',
    applicationId: 'app_003',
    label: 'SAM.gov registration',
    done: false,
  },
  // For app_004
  {
    id: 'comp_007',
    applicationId: 'app_004',
    label: 'Ethics compliance checklist',
    done: false,
  },
  // For app_005
  {
    id: 'comp_008',
    applicationId: 'app_005',
    label: 'Bank details submitted',
    done: true,
  },
  {
    id: 'comp_009',
    applicationId: 'app_005',
    label: 'Post-award reporting schedule',
    done: false,
  },
];

// User outreach data
const outreachData = [
  {
    id: 'outreach_001',
    userId: DEMO_USER_ID,
    investorId: 'inv_001',
    type: 'message',
    status: 'positive',
    subject: 'Intro: CleanTech Startup - Seed Round',
    message: 'We\'re building innovative carbon reduction technology and would love to share our vision...',
    notes: 'Interested in learning more. Requested metrics on retention and unit economics.',
    createdAt: new Date('2025-08-10T10:30:00Z'),
    updatedAt: new Date('2025-08-10T10:30:00Z'),
  },
  {
    id: 'outreach_002',
    userId: DEMO_USER_ID,
    investorId: 'inv_004',
    type: 'meeting',
    status: 'neutral',
    subject: 'Meeting Request - AI Safety Startup',
    message: 'Would love to schedule a 30-minute intro call to discuss our AI safety platform.',
    notes: 'Stage is a bit early; suggested to reconnect post next milestone.',
    scheduledDate: new Date('2025-08-20T14:00:00Z'),
    createdAt: new Date('2025-08-18T09:15:00Z'),
    updatedAt: new Date('2025-08-18T16:45:00Z'),
  },
  {
    id: 'outreach_003',
    userId: DEMO_USER_ID,
    investorId: 'inv_002',
    type: 'pitch',
    status: 'pending',
    subject: 'Pitch Request - Nova Angels Demo Day',
    message: 'We\'d like to be considered for your upcoming demo day presentation.',
    notes: 'Waiting for response',
    createdAt: new Date('2025-11-15T11:20:00Z'),
    updatedAt: new Date('2025-11-15T11:20:00Z'),
  },
];

// Startup profile data
const profileData = {
  id: 'profile_001',
  userId: DEMO_USER_ID,
  name: 'EcoFlow Technologies',
  tagline: 'AI-powered carbon tracking for sustainable supply chains',
  stage: 'seed',
  industry: 'ClimateTech',
  region: 'na',
  fundingNeed: 'Raising $1.5M seed round to accelerate growth',
  summary: 'EcoFlow uses AI to help enterprises track and reduce their carbon footprint across complex supply chains. We work with Fortune 500 companies to provide real-time carbon analytics and reduction recommendations.',
  website: 'https://ecoflow.tech',
  isPublic: true,
};

// Analytics data
const analyticsData = {
  id: 'analytics_001',
  userId: DEMO_USER_ID,
  date: new Date(),
  totalMatches: 128,
  applicationsInProgress: 9,
  successRate: 38,
  potentialFunding: 1200000,
  outreachCount: 18,
  positiveResponses: 7,
  readinessScore: 72,
};

// Saved opportunities data
const savedOpportunitiesData = [
  {
    id: 'saved_001',
    userId: DEMO_USER_ID,
    opportunityId: 'opp_001',
  },
  {
    id: 'saved_002',
    userId: DEMO_USER_ID,
    opportunityId: 'opp_006',
  },
];

export async function seedDemoData() {
  try {
    console.log('🌱 Starting demo data seeding...');

    // Insert funding opportunities
    console.log('📊 Seeding funding opportunities...');
    await db.insert(fundingOpportunities).values(fundingOpportunitiesData);

    // Insert investors
    console.log('💼 Seeding investors...');
    await db.insert(investors).values(investorsData);

    // Insert events
    console.log('🎯 Seeding events...');
    await db.insert(events).values(eventsData);

    // Insert applications
    console.log('📋 Seeding applications...');
    await db.insert(applications).values(applicationsData);

    // Insert documents
    console.log('📄 Seeding documents...');
    await db.insert(applicationDocuments).values(documentsData);

    // Insert application history
    console.log('📝 Seeding application history...');
    await db.insert(applicationHistory).values(historyData);

    // Insert compliance items
    console.log('✅ Seeding compliance items...');
    await db.insert(complianceItems).values(complianceData);

    // Insert user outreach
    console.log('📡 Seeding user outreach...');
    await db.insert(userOutreach).values(outreachData);

    // Insert startup profile
    console.log('🏢 Seeding startup profile...');
    await db.insert(startupProfiles).values(profileData);

    // Insert analytics
    console.log('📈 Seeding analytics...');
    await db.insert(analytics).values(analyticsData);

    // Insert saved opportunities
    console.log('💾 Seeding saved opportunities...');
    await db.insert(userSavedOpportunities).values(savedOpportunitiesData);

    console.log('✅ Demo data seeding completed successfully!');
    
    return {
      success: true,
      message: 'Demo data seeded successfully',
      data: {
        opportunities: fundingOpportunitiesData.length,
        investors: investorsData.length,
        events: eventsData.length,
        applications: applicationsData.length,
        documents: documentsData.length,
        outreach: outreachData.length,
        profile: 1,
        analytics: 1,
        saved: savedOpportunitiesData.length,
      },
    };
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    return {
      success: false,
      message: 'Failed to seed demo data',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}