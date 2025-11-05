/**
 * Database Seed Script
 * Seeds the database with initial data
 */

import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../src/modules/auth/infrastructure/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create super admin user
  const superAdminPassword = await hashPassword('Admin123!');
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@accounting-bih.com' },
    update: {},
    create: {
      email: 'admin@accounting-bih.com',
      password: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      language: 'sr',
      permissions: [], // Super admin has all permissions
    },
  });

  console.log('✅ Super Admin created:', superAdmin.email);

  // Create demo accountant user
  const accountantPassword = await hashPassword('Accountant123!');
  const accountant = await prisma.user.upsert({
    where: { email: 'knjigovodja@example.com' },
    update: {},
    create: {
      email: 'knjigovodja@example.com',
      password: accountantPassword,
      firstName: 'Marko',
      lastName: 'Marković',
      role: UserRole.ACCOUNTANT,
      isActive: true,
      language: 'sr',
      permissions: [
        'COMPANY_READ',
        'GL_ENTRY_CREATE',
        'GL_ENTRY_READ',
        'GL_ENTRY_UPDATE',
        'INVOICE_CREATE',
        'INVOICE_READ',
        'INVOICE_UPDATE',
        'PAYROLL_READ',
        'REPORT_VIEW',
        'REPORT_EXPORT',
      ],
    },
  });

  console.log('✅ Accountant created:', accountant.email);

  // Create demo company (Republika Srpska)
  const companyRS = await prisma.company.upsert({
    where: { taxNumber: '4400000000001' },
    update: {},
    create: {
      name: 'Demo d.o.o. Banja Luka',
      taxNumber: '4400000000001', // JIB
      vatNumber: '440000000001', // PDV broj
      registrationNumber: '1234567890', // Matični broj
      address: 'Kralja Petra I Karađorđevića 1',
      city: 'Banja Luka',
      postalCode: '78000',
      country: 'BiH',
      legalEntity: 'RS',
      bankName: 'UniCredit Bank',
      bankAccount: '5551234567890123',
      fiscalYearStart: 1,
      fiscalYearEnd: 12,
      baseCurrency: 'BAM',
      isActive: true,
    },
  });

  console.log('✅ Company (RS) created:', companyRS.name);

  // Create demo company (Federacija BiH)
  const companyFBIH = await prisma.company.upsert({
    where: { taxNumber: '4200000000001' },
    update: {},
    create: {
      name: 'Demo d.o.o. Sarajevo',
      taxNumber: '4200000000001',
      vatNumber: '420000000001',
      registrationNumber: '9876543210',
      address: 'Zmaja od Bosne 1',
      city: 'Sarajevo',
      postalCode: '71000',
      country: 'BiH',
      legalEntity: 'FBIH',
      bankName: 'Raiffeisen Bank',
      bankAccount: '3331234567890123',
      fiscalYearStart: 1,
      fiscalYearEnd: 12,
      baseCurrency: 'BAM',
      isActive: true,
    },
  });

  console.log('✅ Company (FBiH) created:', companyFBIH.name);

  // Grant accountant access to both companies
  await prisma.userCompanyAccess.createMany({
    data: [
      {
        userId: accountant.id,
        companyId: companyRS.id,
      },
      {
        userId: accountant.id,
        companyId: companyFBIH.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Company access granted to accountant');

  // Create basic chart of accounts for RS company
  const accounts = [
    // Aktiva
    { code: '100000', name: 'AKTIVA', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '101000', name: 'Gotovina', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '101100', name: 'Gotovina u blagajni', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '101200', name: 'Gotovina na računu', type: 'ASSET', category: 'CURRENT_ASSETS' },

    // Pasiva
    { code: '200000', name: 'PASIVA', type: 'LIABILITY', category: 'EQUITY' },
    { code: '201000', name: 'Kapital', type: 'LIABILITY', category: 'EQUITY' },
    { code: '201100', name: 'Osnovni kapital', type: 'LIABILITY', category: 'EQUITY' },

    // Prihodi
    { code: '300000', name: 'PRIHODI', type: 'REVENUE', category: 'OPERATING_REVENUE' },
    { code: '301000', name: 'Prihodi od prodaje', type: 'REVENUE', category: 'OPERATING_REVENUE' },

    // Rashodi
    { code: '400000', name: 'RASHODI', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '401000', name: 'Troškovi materijala', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '402000', name: 'Troškovi plata', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: {
        companyId_code: {
          companyId: companyRS.id,
          code: account.code,
        },
      },
      update: {},
      create: {
        ...account,
        companyId: companyRS.id,
        isActive: true,
        nameTranslations: {
          sr: account.name,
          en: account.name, // TODO: Add proper translations
        },
      },
    });
  }

  console.log('✅ Chart of accounts created for RS company');

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📝 Login credentials:');
  console.log('   Super Admin: admin@accounting-bih.com / Admin123!');
  console.log('   Accountant: knjigovodja@example.com / Accountant123!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
