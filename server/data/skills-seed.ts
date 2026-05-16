/**
 * Personnel skills registry seed. 40 skills total: 24 job (8 per position) + 8 general + 8 personal.
 * Source: docs/personnel-profile-feature.md §3.
 * Stable `key` field — rename `label` does not lose history.
 */

import type { PrismaClient } from '@prisma/client';

export interface SeedSkill {
  group: 'JOB' | 'GENERAL' | 'PERSONAL';
  position: 'MARKETING' | 'MEDIA' | 'ACCOUNT' | null;
  key: string;
  label: string;
  order: number;
}

export const SKILLS_SEED: SeedSkill[] = [
  // Marketing — Job
  { group: 'JOB', position: 'MARKETING', order: 1, key: 'digital_advertising', label: 'Digital Advertising' },
  { group: 'JOB', position: 'MARKETING', order: 2, key: 'content_strategy', label: 'Content Strategy & Planning' },
  { group: 'JOB', position: 'MARKETING', order: 3, key: 'analytics_interpretation', label: 'Analytics & Data Interpretation' },
  { group: 'JOB', position: 'MARKETING', order: 4, key: 'seo_sem', label: 'SEO / SEM Knowledge' },
  { group: 'JOB', position: 'MARKETING', order: 5, key: 'campaign_execution', label: 'Campaign Management & Execution' },
  { group: 'JOB', position: 'MARKETING', order: 6, key: 'market_research', label: 'Market Research & Audience Insight' },
  { group: 'JOB', position: 'MARKETING', order: 7, key: 'cro', label: 'Conversion Optimization (CRO)' },
  { group: 'JOB', position: 'MARKETING', order: 8, key: 'ai_marketing', label: 'AI-Powered Marketing Execution' },

  // Media — Job
  { group: 'JOB', position: 'MEDIA', order: 1, key: 'graphic_design', label: 'Graphic Design Proficiency' },
  { group: 'JOB', position: 'MEDIA', order: 2, key: 'video_production', label: 'Video Production & Editing' },
  { group: 'JOB', position: 'MEDIA', order: 3, key: 'visual_storytelling', label: 'Visual Storytelling' },
  { group: 'JOB', position: 'MEDIA', order: 4, key: 'motion_graphics', label: 'Motion Graphics / Animation' },
  { group: 'JOB', position: 'MEDIA', order: 5, key: 'photography', label: 'Photography & Image Retouching' },
  { group: 'JOB', position: 'MEDIA', order: 6, key: 'brand_identity_app', label: 'Brand Identity Application' },
  { group: 'JOB', position: 'MEDIA', order: 7, key: 'brief_execution_speed', label: 'Creative Brief Execution Speed' },
  { group: 'JOB', position: 'MEDIA', order: 8, key: 'ai_creative_tools', label: 'AI Creative Tools Proficiency' },

  // Account — Job
  { group: 'JOB', position: 'ACCOUNT', order: 1, key: 'client_relationship', label: 'Client Relationship Management' },
  { group: 'JOB', position: 'ACCOUNT', order: 2, key: 'prospecting_pipeline', label: 'Sales Prospecting & Pipeline Building' },
  { group: 'JOB', position: 'ACCOUNT', order: 3, key: 'negotiation_closing', label: 'Negotiation & Deal Closing' },
  { group: 'JOB', position: 'ACCOUNT', order: 4, key: 'needs_analysis', label: 'Customer Needs Analysis' },
  { group: 'JOB', position: 'ACCOUNT', order: 5, key: 'upsell_cross_sell', label: 'Upselling & Cross-selling' },
  { group: 'JOB', position: 'ACCOUNT', order: 6, key: 'complaint_handling', label: 'Complaint Handling & Resolution' },
  { group: 'JOB', position: 'ACCOUNT', order: 7, key: 'revenue_target', label: 'Revenue Target Achievement' },
  { group: 'JOB', position: 'ACCOUNT', order: 8, key: 'ai_sales_intelligence', label: 'AI Sales Intelligence' },

  // General (all positions)
  { group: 'GENERAL', position: null, order: 1, key: 'communication', label: 'Communication' },
  { group: 'GENERAL', position: null, order: 2, key: 'time_management', label: 'Time Management & Prioritization' },
  { group: 'GENERAL', position: null, order: 3, key: 'problem_solving', label: 'Problem Solving & Critical Thinking' },
  { group: 'GENERAL', position: null, order: 4, key: 'teamwork', label: 'Teamwork & Collaboration' },
  { group: 'GENERAL', position: null, order: 5, key: 'adaptability', label: 'Adaptability & Flexibility' },
  { group: 'GENERAL', position: null, order: 6, key: 'accountability', label: 'Accountability & Ownership' },
  { group: 'GENERAL', position: null, order: 7, key: 'ai_tool_literacy', label: 'AI Tool Literacy' },
  { group: 'GENERAL', position: null, order: 8, key: 'ai_decision_making', label: 'AI-Assisted Decision Making' },

  // Personal
  { group: 'PERSONAL', position: null, order: 1, key: 'foreign_language', label: 'Ngoại ngữ' },
  { group: 'PERSONAL', position: null, order: 2, key: 'personal_finance', label: 'Quản lý tài chính cá nhân' },
  { group: 'PERSONAL', position: null, order: 3, key: 'physical_health', label: 'Sức khỏe thể chất' },
  { group: 'PERSONAL', position: null, order: 4, key: 'mental_health', label: 'Sức khỏe tinh thần' },
  { group: 'PERSONAL', position: null, order: 5, key: 'public_speaking', label: 'Public Speaking' },
  { group: 'PERSONAL', position: null, order: 6, key: 'personal_network', label: 'Mạng lưới quan hệ cá nhân' },
  { group: 'PERSONAL', position: null, order: 7, key: 'personal_goals', label: 'Tự quản lý mục tiêu cá nhân' },
  { group: 'PERSONAL', position: null, order: 8, key: 'ai_self_development', label: 'AI Self-Development' },
];

export async function seedSkills(prisma: PrismaClient): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;
  for (const s of SKILLS_SEED) {
    const existing = await prisma.skill.findFirst({
      where: { group: s.group, position: s.position, key: s.key },
    });
    if (existing) {
      await prisma.skill.update({
        where: { id: existing.id },
        data: { label: s.label, order: s.order, active: true },
      });
      updated++;
    } else {
      await prisma.skill.create({
        data: { group: s.group, position: s.position, key: s.key, label: s.label, order: s.order },
      });
      created++;
    }
  }
  return { created, updated };
}
