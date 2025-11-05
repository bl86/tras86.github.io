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

  // Create demo partners (customers and suppliers)
  const partners = [
    {
      name: 'Kupac jedan d.o.o.',
      taxId: '4400000000002',
      type: 'CUSTOMER',
      email: 'kupac1@example.com',
      phone: '+387 51 123 456',
      address: 'Trg Krajine 5',
      city: 'Banja Luka',
      country: 'BiH',
    },
    {
      name: 'Kupac dva d.o.o.',
      taxId: '4400000000003',
      type: 'CUSTOMER',
      email: 'kupac2@example.com',
      phone: '+387 51 234 567',
      address: 'Kralja Petra I 10',
      city: 'Banja Luka',
      country: 'BiH',
    },
    {
      name: 'Dobavljač jedan d.o.o.',
      taxId: '4400000000004',
      type: 'SUPPLIER',
      email: 'dobavljac1@example.com',
      phone: '+387 51 345 678',
      address: 'Bulevar vojvode Stepe Stepanovića 20',
      city: 'Banja Luka',
      country: 'BiH',
    },
    {
      name: 'Partner univerzalni d.o.o.',
      taxId: '4400000000005',
      type: 'BOTH',
      email: 'partner@example.com',
      phone: '+387 51 456 789',
      address: 'Ulica Srpskih vladara 15',
      city: 'Banja Luka',
      country: 'BiH',
    },
  ];

  for (const partner of partners) {
    await prisma.partner.upsert({
      where: {
        companyId_taxId: {
          companyId: companyRS.id,
          taxId: partner.taxId,
        },
      },
      update: {},
      create: {
        ...partner,
        companyId: companyRS.id,
        isActive: true,
      },
    });
  }

  console.log('✅ Partners created for RS company');

  // Create demo employees
  const employees = [
    {
      firstName: 'Petar',
      lastName: 'Petrović',
      personalId: '0101990123456',
      baseSalary: 1500,
      position: 'Direktor',
      employmentDate: new Date('2020-01-01'),
    },
    {
      firstName: 'Milica',
      lastName: 'Milić',
      personalId: '1505985654321',
      baseSalary: 1200,
      position: 'Računovođa',
      employmentDate: new Date('2021-03-15'),
    },
    {
      firstName: 'Nikola',
      lastName: 'Nikolić',
      personalId: '2010995789012',
      baseSalary: 1000,
      position: 'Administator',
      employmentDate: new Date('2022-06-01'),
    },
  ];

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: {
        companyId_personalId: {
          companyId: companyRS.id,
          personalId: employee.personalId,
        },
      },
      update: {},
      create: {
        ...employee,
        companyId: companyRS.id,
        isActive: true,
      },
    });
  }

  console.log('✅ Employees created for RS company');

  // Create demo cost centers
  const costCenters = [
    { code: 'CC001', name: 'Uprava' },
    { code: 'CC002', name: 'Računovodstvo' },
    { code: 'CC003', name: 'Prodaja' },
    { code: 'CC004', name: 'Nabavka' },
  ];

  for (const cc of costCenters) {
    await prisma.costCenter.upsert({
      where: {
        companyId_code: {
          companyId: companyRS.id,
          code: cc.code,
        },
      },
      update: {},
      create: {
        ...cc,
        companyId: companyRS.id,
        isActive: true,
      },
    });
  }

  console.log('✅ Cost centers created for RS company');

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📝 Login credentials:');
  console.log('   Super Admin: admin@accounting-bih.com / Admin123!');
  console.log('   Accountant: knjigovodja@example.com / Accountant123!');
  console.log('');
  console.log('📊 Test data created:');
  console.log(`   - 2 Companies (RS & FBiH)`);
  console.log(`   - ${accounts.length} Accounts`);
  console.log(`   - ${partners.length} Partners`);
  console.log(`   - ${employees.length} Employees`);
  console.log(`   - ${costCenters.length} Cost Centers`);
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
