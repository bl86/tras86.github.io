/**
 * Account DTOs
 */

import { z } from 'zod';

export const createAccountSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Account code must be 6 digits'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['ASSET', 'LIABILITY', 'EXPENSE', 'REVENUE', 'CLOSING']),
  category: z.enum([
    'CURRENT_ASSETS',
    'FIXED_ASSETS',
    'CURRENT_LIABILITIES',
    'LONG_TERM_LIABILITIES',
    'EQUITY',
    'OPERATING_REVENUE',
    'FINANCIAL_REVENUE',
    'OPERATING_EXPENSES',
    'FINANCIAL_EXPENSES',
    'COST_OF_GOODS_SOLD',
  ]),
  parentId: z.string().optional(),
  nameTranslations: z
    .object({
      sr: z.string(),
      hr: z.string().optional(),
      bs: z.string().optional(),
      en: z.string().optional(),
      de: z.string().optional(),
    })
    .optional(),
  requiresCostCenter: z.boolean().optional(),
  requiresPartner: z.boolean().optional(),
  requiresAnalytical: z.boolean().optional(),
});

export type CreateAccountDto = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = createAccountSchema.partial();

export type UpdateAccountDto = z.infer<typeof updateAccountSchema>;

export const accountMappingSchema = z.object({
  standard: z.string().min(2, 'Standard name required (e.g., SKR03, IFRS)'),
  mappedCode: z.string().min(1, 'Mapped code required'),
  mappedName: z.string().min(2, 'Mapped name required'),
});

export type AccountMappingDto = z.infer<typeof accountMappingSchema>;
