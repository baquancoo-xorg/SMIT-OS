import { PrismaClient } from '@prisma/client';
import { SheetData } from '../../../types/sheets-export.types';

export interface ExtractorContext {
  prisma: PrismaClient;
  dateFrom?: string;
  dateTo?: string;
}

export type Extractor = (ctx: ExtractorContext) => Promise<SheetData>;
