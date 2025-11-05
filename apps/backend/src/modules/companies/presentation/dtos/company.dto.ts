/**
 * Company DTOs
 */

import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  taxNumber: z.string().regex(/^\d{13}$/, 'Tax number (JIB) must be 13 digits'),
  vatNumber: z.string().regex(/^\d{12}$/, 'VAT number must be 12 digits').optional(),
  registrationNumber: z.string().min(5, 'Registration number required'),
  address: z.string().min(5, 'Address required'),
  city: z.string().min(2, 'City required'),
  postalCode: z.string().min(5, 'Postal code required'),
  country: z.string().default('BiH'),
  legalEntity: z.enum(['RS', 'FBIH', 'BD']),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  swift: z.string().optional(),
  fiscalYearStart: z.number().int().min(1).max(12).default(1),
  fiscalYearEnd: z.number().int().min(1).max(12).default(12),
  baseCurrency: z.enum(['BAM', 'EUR', 'USD', 'CHF']).default('BAM'),
});

export type CreateCompanyDto = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = createCompanySchema.partial();

export type UpdateCompanyDto = z.infer<typeof updateCompanySchema>;

export const grantAccessSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
});

export type GrantAccessDto = z.infer<typeof grantAccessSchema>;
