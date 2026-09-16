// =================================================================
// Social AI — Single Source of Truth Mock Data
// Answers all 5 SIH questions:
// 1. What are people talking about? (Topics)
// 2. What is becoming popular? (Trends)
// 3. How do people feel about it? (Sentiment + 6 nuanced emotions)
// 4. Who are the people discussing it? (Audience Demographics + Confidence)
// 5. Who is influencing the discussion? (Network & Information Spread)
// =================================================================

export const MOCK_DATA = {
  // --- Dashboard / Overview ---
  overview: {
    stats: [
      { id: 'posts', label: 'Total Posts Analyzed', value: '1,248,390', change: '+14.2%', trend: 'up', note: 'vs. previous period' },
      { id: 'users', label: 'Active Participants', value: '248,120', change: '+8.6%', trend: 'up', note: 'across 6 networks' },
      { id: 'trends', label: 'Rising Narratives', value: '128', change: '+12', trend: 'up', note: '14 viral breakout' },
      { id: 'sentiment', label: 'Dominant Sentiment', value: '73.4%', change: '+3.1%', trend: 'up', note: 'Positive lean' },
    ],
    timeline: [
      { timestamp: '00:00', volume: 42100, positive: 65, negative: 18, neutral: 17 },
      { timestamp: '03:00', volume: 28400, positive: 68, negative: 16, neutral: 16 },
      { timestamp: '06:00', volume: 68200, positive: 71, negative: 15, neutral: 14 },
      { timestamp: '09:00', volume: 142000, positive: 76, negative: 12, neutral: 12 },
      { timestamp: '12:00', volume: 198500, positive: 72, negative: 16, neutral: 12 },
      { timestamp: '15:00', volume: 174200, positive: 69, negative: 19, neutral: 12 },
      { timestamp: '18:00', volume: 231000, positive: 74, negative: 15, neutral: 11 },
      { timestamp: '21:00', volume: 184500, positive: 73, negative: 14, neutral: 13 },
    ],
    platformBreakdown: [
      { platform: 'X (Twitter)', count: 524300, share: 42, color: '#22d3ee' },
      { platform: 'Telegram', count: 349500, share: 28, color: '#818cf8' },
      { platform: 'Instagram', count: 212200, share: 17, color: '#f43f5e' },
      { platform: 'Reddit', count: 99800, share: 8, color: '#fb923c' },
      { platform: 'Facebook', count: 37500, share: 3, color: '#3b82f6' },
      { platform: 'YouTube', count: 25090, share: 2, color: '#ef4444' },
    ],
    topNarratives: [
      { id: 1, topic: '#AIRevolution', volume: '142.8K', growth: '+34.2%', sentiment: 'Positive (84%)', platform: 'x' },
      { id: 2, topic: '#ClimateActionNow', volume: '98.5K', growth: '+28.0%', sentiment: 'Supportive (78%)', platform: 'x' },
      { id: 3, topic: 'Budget Policy 2025', volume: '84.1K', growth: '+15.6%', sentiment: 'Critical (52%)', platform: 'telegram' },
      { id: 4, topic: '#StartupEcosystem', volume: '62.4K', growth: '+19.3%', sentiment: 'Excited (91%)', platform: 'instagram' },
      { id: 5, topic: '#SemiconductorHub', volume: '48.9K', growth: '+41.8%', sentiment: 'Positive (88%)', platform: 'reddit' },
    ],
  },

  // --- Trends ---
  trends: {
    velocityTimeline: [
      { time: '06:00', aiRevolution: 120, climateAction: 80, budget: 190, startup: 60, chips: 40 },
      { time: '09:00', aiRevolution: 340, climateAction: 180, budget: 420, startup: 150, chips: 110 },
      { time: '12:00', aiRevolution: 580, climateAction: 420, budget: 360, startup: 290, chips: 220 },
      { time: '15:00', aiRevolution: 720, climateAction: 560, budget: 310, startup: 380, chips: 330 },
      { time: '18:00', aiRevolution: 890, climateAction: 650, budget: 280, startup: 490, chips: 460 },
      { time: '21:00', aiRevolution: 760, climateAction: 580, budget: 220, startup: 420, chips: 390 },
      { time: '24:00', aiRevolution: 480, climateAction: 340, budget: 160, startup: 290, chips: 280 },
    ],
    trendList: [
      { rank: 1, topic: '#AIRevolution', volume: 142800, velocity: 890, growth: 34.2, sentiment: 'Positive', platform: 'x', category: 'Technology', status: 'Viral Breakout' },
      { rank: 2, topic: '#ClimateActionNow', volume: 98500, velocity: 650, growth: 28.0, sentiment: 'Supportive', platform: 'x', category: 'Environment', status: 'Rising' },
      { rank: 3, topic: 'Budget Policy 2025', volume: 84100, velocity: 420, growth: -4.8, sentiment: 'Critical', platform: 'telegram', category: 'Governance', status: 'Sustained' },
      { rank: 4, topic: '#StartupEcosystem', volume: 62400, velocity: 490, growth: 19.3, sentiment: 'Excited', platform: 'instagram', category: 'Business', status: 'Rising' },
      { rank: 5, topic: '#SemiconductorHub', volume: 48900, velocity: 460, growth: 41.8, sentiment: 'Positive', platform: 'reddit', category: 'Tech/Industry', status: 'Surging' },
      { rank: 6, topic: '#DigitalHealth2025', volume: 38200, velocity: 310, growth: 14.5, sentiment: 'Supportive', platform: 'x', category: 'Healthcare', status: 'Rising' },
      { rank: 7, topic: '#RenewableGrid', volume: 31400, velocity: 270, growth: 22.1, sentiment: 'Positive', platform: 'telegram', category: 'Energy', status: 'Emerging' },
      { rank: 8, topic: '#EdTechFuture', volume: 27600, velocity: 210, growth: 8.4, sentiment: 'Neutral', platform: 'youtube', category: 'Education', status: 'Stable' },
    ],
    keywords: [
      { text: 'Artificial Intelligence', weight: 95, sentiment: 'positive' },
      { text: 'Generative Models', weight: 82, sentiment: 'positive' },
      { text: 'Green Transition', weight: 78, sentiment: 'supportive' },
      { text: 'Fiscal Deficit', weight: 68, sentiment: 'critical' },
      { text: 'Foundry Subsidies', weight: 64, sentiment: 'positive' },
      { text: 'Tax Reform', weight: 60, sentiment: 'critical' },
      { text: 'Unicorns', weight: 58, sentiment: 'positive' },
      { text: 'Net Zero 2070', weight: 52, sentiment: 'supportive' },
      { text: 'Sarcasm Alert', weight: 46, sentiment: 'mixed' },
      { text: 'Clean Energy', weight: 42, sentiment: 'positive' },
    ],
  },

  // --- Sentiment & NLP Nuance ---
  sentiment: {
    overall: { positive: 73.4, negative: 14.8, neutral: 11.8 },
    // Six Nuanced Emotions specified in prompt:
    emotions: [
      { name: 'Joy & Excitement', score: 74, color: '#34d399', description: 'Celebration of innovation and positive milestones' },
      { name: 'Supportive', score: 68, color: '#22d3ee', description: 'Endorsements of public policy, initiatives, and startups' },
      { name: 'Sarcasm / Irony', score: 38, color: '#f59e0b', description: 'Irony detected that flips traditional positive polarity to negative' },
      { name: 'Anxiety & Concern', score: 32, color: '#a78bfa', description: 'Worries regarding economic inflation and job security' },
      { name: 'Critical / Anger', score: 26, color: '#fb7185', description: 'Direct disagreement with announced tax brackets' },
      { name: 'Neutral / Informational', score: 45, color: '#94a3b8', description: 'Fact-sharing, news articles, and automated reports' },
    ],
    timeline: [
      { date: 'Mon', positive: 68, negative: 18, neutral: 14, sarcasm: 32 },
      { date: 'Tue', positive: 72, negative: 15, neutral: 13, sarcasm: 28 },
      { date: 'Wed', positive: 65, negative: 22, neutral: 13, sarcasm: 44 }, // Wednesday sarcasm spike
      { date: 'Thu', positive: 78, negative: 12, neutral: 10, sarcasm: 24 },
      { date: 'Fri', positive: 74, negative: 16, neutral: 10, sarcasm: 30 },
      { date: 'Sat', positive: 80, negative: 10, neutral: 10, sarcasm: 20 },
      { date: 'Sun', positive: 73, negative: 15, neutral: 12, sarcasm: 26 },
    ],
    platformSplit: [
      { platform: 'X (Twitter)', positive: 66, negative: 21, neutral: 13 },
      { platform: 'Telegram', positive: 58, negative: 26, neutral: 16 },
      { platform: 'Instagram', positive: 82, negative: 8, neutral: 10 },
      { platform: 'Reddit', positive: 48, negative: 32, neutral: 20 },
      { platform: 'Facebook', positive: 64, negative: 20, neutral: 16 },
      { platform: 'YouTube', positive: 70, negative: 18, neutral: 12 },
    ],
    classifiedPosts: [
      {
        id: 'p1',
        user: '@TechPioneer_in',
        avatar: '🤖',
        platform: 'x',
        timestamp: '12m ago',
        text: 'The newly inaugurated semiconductor fabrication center is exactly what the hardware industry needed. Massive win for indigenous tech! 🇮🇳🚀',
        sentiment: 'Positive',
        emotion: 'Joy & Excitement',
        confidence: '97.8%',
        score: +0.92,
      },
      {
        id: 'p2',
        user: '@CitizenWatchdog',
        avatar: '🧐',
        platform: 'x',
        timestamp: '28m ago',
        text: 'Oh wonderful, another "groundbreaking" budget where tech founders get tax breaks while middle-class commuters pay higher tolls. Pure genius. 👏',
        sentiment: 'Negative',
        emotion: 'Sarcasm / Irony',
        confidence: '94.2%',
        score: -0.78,
        note: 'Sarcasm detector flipped surface positive phrasing to negative intent',
      },
      {
        id: 'p3',
        user: '@EcoVoice_Global',
        avatar: '🌱',
        platform: 'telegram',
        timestamp: '1h ago',
        text: 'Clean energy transition subsidies increased by 22% in state gazette. We must hold municipalities accountable for implementation timelines.',
        sentiment: 'Supportive',
        emotion: 'Supportive',
        confidence: '91.5%',
        score: +0.64,
      },
      {
        id: 'p4',
        user: '@CodeCrafter_99',
        avatar: '💻',
        platform: 'reddit',
        timestamp: '2h ago',
        text: 'Seeing third consecutive wave of engineering layoffs this quarter across startups. It makes you feel very uneasy about career stability.',
        sentiment: 'Negative',
        emotion: 'Anxiety & Concern',
        confidence: '95.1%',
        score: -0.82,
      },
    ],
  },

  // --- Audience Demographics & Confidence ---
  audience: {
    modelMeta: {
      inferredUsers: '248,120',
      sampleConfidence: '92.4%',
      privacyNotice: 'Demographics are inferred strictly in aggregate from public profile text, bio keywords, language, and behavioral posting rhythms. No private or PII data is ingested.',
    },
    age: [
      { bracket: '13–17', share: 6, count: '14.8K', confidence: '84%' },
      { bracket: '18–24', share: 34, count: '84.3K', confidence: '96%' },
      { bracket: '25–34', share: 38, count: '94.2K', confidence: '95%' },
      { bracket: '35–44', share: 14, count: '34.7K', confidence: '89%' },
      { bracket: '45–54', share: 6, count: '14.8K', confidence: '82%' },
      { bracket: '55+', share: 2, count: '5.0K', confidence: '78%' },
    ],
    geography: [
      { country: 'India', flag: '🇮🇳', share: 44, users: '109.1K', confidence: '97%' },
      { country: 'United States', flag: '🇺🇸', share: 21, users: '52.1K', confidence: '94%' },
      { country: 'United Kingdom', flag: '🇬🇧', share: 11, users: '27.2K', confidence: '91%' },
      { country: 'Germany', flag: '🇩🇪', share: 8, users: '19.8K', confidence: '88%' },
      { country: 'Canada', flag: '🇨🇦', share: 6, users: '14.8K', confidence: '89%' },
      { country: 'Other Hubs', flag: '🌐', share: 10, users: '24.8K', confidence: '82%' },
    ],
    languages: [
      { language: 'English', share: 56, color: '#22d3ee' },
      { language: 'Hindi', share: 24, color: '#818cf8' },
      { language: 'Spanish', share: 8, color: '#34d399' },
      { language: 'German', share: 5, color: '#fbbf24' },
      { language: 'Regional Indic', share: 4, color: '#f43f5e' },
      { language: 'Others', share: 3, color: '#94a3b8' },
    ],
    interests: [
      { category: 'Software & AI Engineering', share: 36, confidence: '96%' },
      { category: 'Venture Capital & Startups', share: 24, confidence: '92%' },
      { category: 'Public Policy & Economics', share: 18, confidence: '88%' },
      { category: 'Renewable Tech & Climate', share: 12, confidence: '86%' },
      { category: 'Higher Education & Research', share: 10, confidence: '84%' },
    ],
  },

  // --- Network Topology & Influence Flows ---
  network: {
    summary: {
      influencersDetected: 10,
      networkDensity: '68.4%',
      communitiesMapped: 4,
      flowVelocity: '4.2x faster than organic baseline',
    },
    clusters: [
      { id: 'tech', name: 'Core AI & Tech Founders', color: '#22d3ee', members: 92400, nodeIds: [1, 4, 7] },
      { id: 'policy', name: 'Policy Analysts & Journalists', color: '#818cf8', members: 68100, nodeIds: [2, 3, 8] },
      { id: 'climate', name: 'Climate Advocates & NGOs', color: '#34d399', members: 48900, nodeIds: [5, 9] },
      { id: 'finance', name: 'Fintech & Angel Investors', color: '#f59e0b', members: 38700, nodeIds: [6, 10] },
    ],
    nodes: [
      { id: 1, name: 'Dr. Vikram Rao', handle: '@vikram_ai', cluster: 'tech', followers: '420K', influence: 96, avatar: '👨‍🔬', platform: 'x', category: 'AI Research', connections: 284 },
      { id: 2, name: 'Priya Sundaram', handle: '@priya_policy', cluster: 'policy', followers: '285K', influence: 91, avatar: '👩‍💼', platform: 'x', category: 'Governance', connections: 212 },
      { id: 3, name: 'GovInsight Dispatch', handle: '@govinsight', cluster: 'policy', followers: '340K', influence: 88, avatar: '🏛️', platform: 'telegram', category: 'Public Policy', connections: 198 },
      { id: 4, name: 'Ananya Sharma', handle: '@ananya_vc', cluster: 'tech', followers: '190K', influence: 85, avatar: '🚀', platform: 'x', category: 'Early Stage Tech', connections: 176 },
      { id: 5, name: 'RenewablePulse', handle: '@renew_pulse', cluster: 'climate', followers: '240K', influence: 82, avatar: '🌱', platform: 'x', category: 'CleanTech', connections: 164 },
      { id: 6, name: 'FintechObserver', handle: '@finobserver', cluster: 'finance', followers: '180K', influence: 79, avatar: '📈', platform: 'telegram', category: 'Venture Capital', connections: 142 },
      { id: 7, name: 'Arjun Mehta', handle: '@mehta_dev', cluster: 'tech', followers: '155K', influence: 77, avatar: '💻', platform: 'reddit', category: 'Open Source', connections: 138 },
      { id: 8, name: 'National Wire', handle: '@natwire', cluster: 'policy', followers: '410K', influence: 76, avatar: '📰', platform: 'telegram', category: 'News Bureau', connections: 129 },
      { id: 9, name: 'GreenFuture Forum', handle: '@green_future', cluster: 'climate', followers: '125K', influence: 73, avatar: '🌍', platform: 'instagram', category: 'Sustainability', connections: 115 },
      { id: 10, name: 'AngelCircle IN', handle: '@angel_in', cluster: 'finance', followers: '110K', influence: 70, avatar: '🤝', platform: 'x', category: 'Syndicates', connections: 98 },
    ],
    edges: [
      { source: 1, target: 2, weight: 85, narrative: 'AI Policy Debate' },
      { source: 1, target: 4, weight: 92, narrative: 'Venture Co-investment' },
      { source: 1, target: 7, weight: 78, narrative: 'Code Repositories' },
      { source: 2, target: 3, weight: 90, narrative: 'Policy Drafting' },
      { source: 2, target: 8, weight: 84, narrative: 'Media Quotation' },
      { source: 4, target: 6, weight: 76, narrative: 'Cap Table Sharing' },
      { source: 5, target: 2, weight: 68, narrative: 'Emission Standards' },
      { source: 5, target: 9, weight: 82, narrative: 'Grassroots Campaigns' },
      { source: 6, target: 10, weight: 88, narrative: 'Deal Syndication' },
      { source: 7, target: 10, weight: 58, narrative: 'Tech Advisory' },
      { source: 8, target: 3, weight: 89, narrative: 'Telegram Broadcast' },
    ],
    // 8-hour information cascade showing how narrative spread from Tech -> Policy -> Climate -> Finance
    cascadeTimeline: [
      { hour: '0h (T0)', techCluster: 100, policyCluster: 0, climateCluster: 0, financeCluster: 0 },
      { hour: '2h', techCluster: 84, policyCluster: 48, climateCluster: 12, financeCluster: 8 },
      { hour: '4h', techCluster: 71, policyCluster: 86, climateCluster: 42, financeCluster: 29 },
      { hour: '6h', techCluster: 59, policyCluster: 78, climateCluster: 74, financeCluster: 62 },
      { hour: '8h (Full Reach)', techCluster: 48, policyCluster: 65, climateCluster: 82, financeCluster: 89 },
    ],
  },

  // --- Insights & AI Decision Intelligence ---
  insights: {
    meta: {
      generatedAt: 'Live (Updated 5m ago)',
      confidence: '95.4%',
      actionableCount: 6,
    },
    findings: [
      {
        id: 'f1',
        severity: 'critical',
        category: 'Integrity',
        title: 'Coordinated Sarcasm Amplification in Budget Discussions',
        summary: 'Detected a 44% spike in sarcastic commentary around Wednesday 14:00 originating from a sub-cluster of 14 Telegram channels. The messaging coordinated keyword-exact phrases across 3,400 X retweets within 18 minutes.',
        evidence: '+44% Sarcasm Index, 18m velocity window',
        recommendation: 'Flag coordinated accounts to platform safety and monitor counter-narrative factual clarity regarding corporate vs individual tax brackets.',
        badge: 'Priority 1',
      },
      {
        id: 'f2',
        severity: 'high',
        category: 'Trend & Influence',
        title: 'Semiconductor Narrative Moving 4.2x Faster than Baseline',
        summary: 'Initiated by Dr. Vikram Rao (@vikram_ai), the #SemiconductorHub conversation crossed from Tech research into Government Policy within 2 hours, reaching angel syndicates within 8 hours. Sentiment is 88% positive.',
        evidence: '4.2x Cascade Velocity, 142K impressions',
        recommendation: 'Engage top 3 opinion leaders early with official data packages to anchor factual policy details during this viral adoption window.',
        badge: 'Growth Signal',
      },
      {
        id: 'f3',
        severity: 'medium',
        category: 'Audience Shift',
        title: 'Youth Demographic (18–24) Adoption Surging in Tech Sector',
        summary: 'Younger adult participation in engineering and AI posts grew by +28% over the past 30 days. Most active during 18:00–21:00 IST on Instagram and Reddit, expressing strong positive affinity for open-source tooling.',
        evidence: '+28% MoM in 18–24 cohort',
        recommendation: 'Re-align content formats toward bite-sized visual explainers on Instagram Reels and technical GitHub link threads on Reddit.',
        badge: 'Audience Insight',
      },
      {
        id: 'f4',
        severity: 'low',
        category: 'Platform Optimization',
        title: 'Telegram-to-X Cross-Posting Arbitrage Identified',
        summary: 'News articles first shared on Telegram policy channels achieve 2.4x higher organic re-sharing when republished on X within a 30-minute latency window.',
        evidence: '2.4x Engagement Multiplier',
        recommendation: 'Synchronize media press releases between Telegram news broadcasts and official Twitter threads to maximize multi-network resonance.',
        badge: 'Operational Tip',
      },
    ],
  },
};
