/**
 * Comprehensive Database Seed Script
 * Seeds the database with realistic test data for Accounting System BiH
 */

import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../src/modules/auth/infrastructure/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');
  console.log('');

  // ==================== USERS ====================
  console.log('👤 Creating users...');

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
      permissions: [],
    },
  });
  console.log('  ✅ Super Admin created:', superAdmin.email);

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
  console.log('  ✅ Accountant created:', accountant.email);

  // ==================== COMPANIES ====================
  console.log('');
  console.log('🏢 Creating companies...');

  const companyRS = await prisma.company.upsert({
    where: { taxNumber: '4400000000001' },
    update: {},
    create: {
      name: 'ABC Trade d.o.o. Banja Luka',
      taxNumber: '4400000000001',
      vatNumber: '440000000001',
      registrationNumber: '1234567890',
      address: 'Kralja Petra I Karađorđevića 100',
      city: 'Banja Luka',
      postalCode: '78000',
      country: 'BiH',
      legalEntity: 'RS',
      bankName: 'UniCredit Bank d.d.',
      bankAccount: 'BA395551234567890123',
      swift: 'UNCRBA22',
      fiscalYearStart: 1,
      fiscalYearEnd: 12,
      baseCurrency: 'BAM',
      isActive: true,
    },
  });
  console.log('  ✅ Company (RS) created:', companyRS.name);

  const companyFBIH = await prisma.company.upsert({
    where: { taxNumber: '4200000000001' },
    update: {},
    create: {
      name: 'XYZ Solutions d.o.o. Sarajevo',
      taxNumber: '4200000000001',
      vatNumber: '420000000001',
      registrationNumber: '9876543210',
      address: 'Zmaja od Bosne 8',
      city: 'Sarajevo',
      postalCode: '71000',
      country: 'BiH',
      legalEntity: 'FBIH',
      bankName: 'Raiffeisen Bank d.d. BiH',
      bankAccount: 'BA393331234567890123',
      swift: 'RZBABA2S',
      fiscalYearStart: 1,
      fiscalYearEnd: 12,
      baseCurrency: 'BAM',
      isActive: true,
    },
  });
  console.log('  ✅ Company (FBIH) created:', companyFBIH.name);

  const companyBD = await prisma.company.upsert({
    where: { taxNumber: '4900000000001' },
    update: {},
    create: {
      name: 'Tech Services d.o.o. Brčko',
      taxNumber: '4900000000001',
      vatNumber: '490000000001',
      registrationNumber: '5555555555',
      address: 'Bulevar Mira 77',
      city: 'Brčko',
      postalCode: '76100',
      country: 'BiH',
      legalEntity: 'BD',
      bankName: 'Intesa Sanpaolo Bank',
      bankAccount: 'BA392221234567890123',
      swift: 'INTABA22',
      fiscalYearStart: 1,
      fiscalYearEnd: 12,
      baseCurrency: 'BAM',
      isActive: true,
    },
  });
  console.log('  ✅ Company (BD) created:', companyBD.name);

  // Grant accountant access to all companies
  await prisma.userCompanyAccess.createMany({
    data: [
      { userId: accountant.id, companyId: companyRS.id },
      { userId: accountant.id, companyId: companyFBIH.id },
      { userId: accountant.id, companyId: companyBD.id },
    ],
    skipDuplicates: true,
  });
  console.log('  ✅ Company access granted to accountant');

  // ==================== CHART OF ACCOUNTS ====================
  console.log('');
  console.log('📚 Creating comprehensive chart of accounts...');

  const accounts = [
    // AKTIVA - Current Assets
    { code: '100000', name: 'AKTIVA', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '101000', name: 'Gotovina i gotovinski ekvivalenti', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '101100', name: 'Gotovina u blagajni', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '101200', name: 'Gotovina na tekućem računu', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '101300', name: 'Gotovina na deviznom računu', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '102000', name: 'Kratkoročna finansijska ulaganja', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '103000', name: 'Potraživanja', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '103100', name: 'Potraživanja od kupaca', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '103200', name: 'Potraživanja od zaposlenih', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '103300', name: 'Ostala potraživanja', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '104000', name: 'Zalihe', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '104100', name: 'Zalihe materijala', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '104200', name: 'Zalihe robe', type: 'ASSET', category: 'CURRENT_ASSETS' },
    { code: '104300', name: 'Zalihe gotovih proizvoda', type: 'ASSET', category: 'CURRENT_ASSETS' },

    // AKTIVA - Fixed Assets
    { code: '110000', name: 'Dugotrajna imovina', type: 'ASSET', category: 'FIXED_ASSETS' },
    { code: '111000', name: 'Nekretnine', type: 'ASSET', category: 'FIXED_ASSETS' },
    { code: '111100', name: 'Zemljište', type: 'ASSET', category: 'FIXED_ASSETS' },
    { code: '111200', name: 'Građevinski objekti', type: 'ASSET', category: 'FIXED_ASSETS' },
    { code: '112000', name: 'Postrojenja i oprema', type: 'ASSET', category: 'FIXED_ASSETS' },
    { code: '112100', name: 'Računari i IT oprema', type: 'ASSET', category: 'FIXED_ASSETS' },
    { code: '112200', name: 'Uredska oprema', type: 'ASSET', category: 'FIXED_ASSETS' },
    { code: '112300', name: 'Vozila', type: 'ASSET', category: 'FIXED_ASSETS' },
    { code: '113000', name: 'Nematerijalna imovina', type: 'ASSET', category: 'FIXED_ASSETS' },
    { code: '113100', name: 'Softver i licencse', type: 'ASSET', category: 'FIXED_ASSETS' },

    // PASIVA - Liabilities
    { code: '200000', name: 'PASIVA', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
    { code: '201000', name: 'Kratkoročne obaveze', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
    { code: '201100', name: 'Obaveze prema dobavljačima', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
    { code: '201200', name: 'Obaveze po osnovu plata', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
    { code: '201300', name: 'Obaveze za poreze i doprinose', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
    { code: '201400', name: 'Kratkoročni krediti', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
    { code: '210000', name: 'Dugoročne obaveze', type: 'LIABILITY', category: 'LONG_TERM_LIABILITIES' },
    { code: '210100', name: 'Dugoročni krediti', type: 'LIABILITY', category: 'LONG_TERM_LIABILITIES' },
    { code: '210200', name: 'Obaveze po osnovu lizinga', type: 'LIABILITY', category: 'LONG_TERM_LIABILITIES' },

    // KAPITAL - Equity
    { code: '220000', name: 'KAPITAL', type: 'EQUITY', category: 'EQUITY' },
    { code: '221000', name: 'Osnovni kapital', type: 'EQUITY', category: 'EQUITY' },
    { code: '222000', name: 'Rezerve', type: 'EQUITY', category: 'EQUITY' },
    { code: '223000', name: 'Neraspoređena dobit', type: 'EQUITY', category: 'EQUITY' },
    { code: '224000', name: 'Dobit tekuće godine', type: 'EQUITY', category: 'EQUITY' },

    // PRIHODI - Revenue
    { code: '300000', name: 'PRIHODI', type: 'REVENUE', category: 'OPERATING_REVENUE' },
    { code: '301000', name: 'Prihodi od prodaje robe', type: 'REVENUE', category: 'OPERATING_REVENUE' },
    { code: '302000', name: 'Prihodi od prodaje usluga', type: 'REVENUE', category: 'OPERATING_REVENUE' },
    { code: '303000', name: 'Prihodi od prodaje proizvoda', type: 'REVENUE', category: 'OPERATING_REVENUE' },
    { code: '310000', name: 'Finansijski prihodi', type: 'REVENUE', category: 'FINANCIAL_REVENUE' },
    { code: '311000', name: 'Prihodi od kamata', type: 'REVENUE', category: 'FINANCIAL_REVENUE' },
    { code: '312000', name: 'Kursne razlike - prihodi', type: 'REVENUE', category: 'FINANCIAL_REVENUE' },

    // RASHODI - Expenses
    { code: '400000', name: 'RASHODI', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '401000', name: 'Troškovi materijala', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '402000', name: 'Troškovi plata', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '402100', name: 'Bruto plate', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '402200', name: 'Doprinosi na plate', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '403000', name: 'Troškovi amortizacije', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '404000', name: 'Troškovi usluga', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '404100', name: 'Troškovi zakupa', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '404200', name: 'Troškovi energenata', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '404300', name: 'Troškovi održavanja', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '404400', name: 'Troškovi osiguranja', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '405000', name: 'Troškovi administrativnih usluga', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '405100', name: 'Računovodstvene usluge', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '405200', name: 'Pravne usluge', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
    { code: '410000', name: 'Finansijski rashodi', type: 'EXPENSE', category: 'FINANCIAL_EXPENSES' },
    { code: '411000', name: 'Troškovi kamata', type: 'EXPENSE', category: 'FINANCIAL_EXPENSES' },
    { code: '412000', name: 'Bankarske provizije', type: 'EXPENSE', category: 'FINANCIAL_EXPENSES' },
    { code: '413000', name: 'Kursne razlike - rashodi', type: 'EXPENSE', category: 'FINANCIAL_EXPENSES' },
  ];

  for (const company of [companyRS, companyFBIH, companyBD]) {
    for (const account of accounts) {
      await prisma.account.upsert({
        where: {
          companyId_code: {
            companyId: company.id,
            code: account.code,
          },
        },
        update: {},
        create: {
          ...account,
          companyId: company.id,
          isActive: true,
          nameTranslations: {
            sr: account.name,
            en: account.name,
          },
        },
      });
    }
  }
  console.log(`  ✅ Created ${accounts.length} accounts for each company`);

  // ==================== PARTNERS ====================
  console.log('');
  console.log('👥 Creating business partners...');

  const partners = [
    // Customers
    {
      name: 'Maloprodaja RS d.o.o.',
      taxId: '4400111111111',
      type: 'CUSTOMER',
      email: 'info@maloprodaja-rs.ba',
      phone: '+387 51 222 333',
      address: 'Bulevar Desanke Maksimović 5',
      city: 'Banja Luka',
      postalCode: '78000',
      country: 'BiH',
    },
    {
      name: 'Trgovina Centar d.o.o.',
      taxId: '4200222222222',
      type: 'CUSTOMER',
      email: 'kontakt@trgovina-centar.ba',
      phone: '+387 33 444 555',
      address: 'Titova 15',
      city: 'Sarajevo',
      postalCode: '71000',
      country: 'BiH',
    },
    {
      name: 'Metro Grupa d.o.o.',
      taxId: '4200333333333',
      type: 'CUSTOMER',
      email: 'office@metro-grupa.ba',
      phone: '+387 33 666 777',
      address: 'Džemala Bijedića 185',
      city: 'Sarajevo',
      postalCode: '71000',
      country: 'BiH',
    },

    // Suppliers
    {
      name: 'Dobavljač Sistem d.o.o.',
      taxId: '4400444444444',
      type: 'SUPPLIER',
      email: 'info@dobavljac-sistem.ba',
      phone: '+387 51 888 999',
      address: 'Studentska 10',
      city: 'Banja Luka',
      postalCode: '78000',
      country: 'BiH',
    },
    {
      name: 'VeleVeleTrade d.o.o.',
      taxId: '4400555555555',
      type: 'SUPPLIER',
      email: 'prodaja@veletrade.ba',
      phone: '+387 51 111 222',
      address: 'Sarajevska 50',
      city: 'Banja Luka',
      postalCode: '78000',
      country: 'BiH',
    },
    {
      name: 'Uvoznik Premium d.o.o.',
      taxId: '4200666666666',
      type: 'SUPPLIER',
      email: 'office@uvoznik-premium.ba',
      phone: '+387 33 333 444',
      address: 'Branilaca Sarajeva 28',
      city: 'Sarajevo',
      postalCode: '71000',
      country: 'BiH',
    },

    // Both (Customer and Supplier)
    {
      name: 'Partner Universal d.o.o.',
      taxId: '4400777777777',
      type: 'BOTH',
      email: 'info@partner-universal.ba',
      phone: '+387 51 555 666',
      address: 'Ulica Srpskih vladara 88',
      city: 'Banja Luka',
      postalCode: '78000',
      country: 'BiH',
    },
    {
      name: 'Komercijala Plus d.o.o.',
      taxId: '4200888888888',
      type: 'BOTH',
      email: 'kontakt@komercijala-plus.ba',
      phone: '+387 33 777 888',
      address: 'Alipašina 41',
      city: 'Sarajevo',
      postalCode: '71000',
      country: 'BiH',
    },
  ];

  for (const company of [companyRS, companyFBIH, companyBD]) {
    for (const partner of partners) {
      await prisma.partner.upsert({
        where: {
          companyId_taxId: {
            companyId: company.id,
            taxId: partner.taxId,
          },
        },
        update: {},
        create: {
          ...partner,
          companyId: company.id,
          isActive: true,
        },
      });
    }
  }
  console.log(`  ✅ Created ${partners.length} partners for each company`);

  // ==================== EMPLOYEES ====================
  console.log('');
  console.log('👤 Creating employees...');

  const employees = [
    {
      firstName: 'Petar',
      lastName: 'Petrović',
      personalId: '0101990123456',
      email: 'petar.petrovic@example.com',
      phone: '+387 65 111 222',
      address: 'Kneza Miloša 10',
      city: 'Banja Luka',
      baseSalary: 2500,
      position: 'Generalni direktor',
      employmentDate: new Date('2020-01-01'),
    },
    {
      firstName: 'Milica',
      lastName: 'Milić',
      personalId: '1505985654321',
      email: 'milica.milic@example.com',
      phone: '+387 65 222 333',
      address: 'Njegoševa 25',
      city: 'Banja Luka',
      baseSalary: 1800,
      position: 'Glavni računovođa',
      employmentDate: new Date('2020-03-15'),
    },
    {
      firstName: 'Nikola',
      lastName: 'Nikolić',
      personalId: '2010995789012',
      email: 'nikola.nikolic@example.com',
      phone: '+387 65 333 444',
      address: 'Cara Dušana 7',
      city: 'Banja Luka',
      baseSalary: 1400,
      position: 'Administrativni radnik',
      employmentDate: new Date('2021-06-01'),
    },
    {
      firstName: 'Ana',
      lastName: 'Anić',
      personalId: '2505992345678',
      email: 'ana.anic@example.com',
      phone: '+387 65 444 555',
      address: 'Vuka Karadžića 15',
      city: 'Banja Luka',
      baseSalary: 1600,
      position: 'Računovođa',
      employmentDate: new Date('2021-09-01'),
    },
    {
      firstName: 'Marko',
      lastName: 'Markovic',
      personalId: '1201988876543',
      email: 'marko.markovic@example.com',
      phone: '+387 65 555 666',
      address: 'Jovana Dučića 22',
      city: 'Banja Luka',
      baseSalary: 1500,
      position: 'Komercijalista',
      employmentDate: new Date('2022-02-01'),
    },
  ];

  for (const company of [companyRS, companyFBIH, companyBD]) {
    for (const employee of employees) {
      await prisma.employee.upsert({
        where: {
          companyId_personalId: {
            companyId: company.id,
            personalId: employee.personalId,
          },
        },
        update: {},
        create: {
          ...employee,
          companyId: company.id,
          isActive: true,
        },
      });
    }
  }
  console.log(`  ✅ Created ${employees.length} employees for each company`);

  // ==================== COST CENTERS ====================
  console.log('');
  console.log('🏷️  Creating cost centers...');

  const costCenters = [
    { code: 'CC-001', name: 'Uprava i direkcija' },
    { code: 'CC-002', name: 'Računovodstvo i finansije' },
    { code: 'CC-003', name: 'Prodaja' },
    { code: 'CC-004', name: 'Nabavka' },
    { code: 'CC-005', name: 'IT i tehnička podrška' },
    { code: 'CC-006', name: 'Administracija' },
  ];

  for (const company of [companyRS, companyFBIH, companyBD]) {
    for (const cc of costCenters) {
      await prisma.costCenter.upsert({
        where: {
          companyId_code: {
            companyId: company.id,
            code: cc.code,
          },
        },
        update: {},
        create: {
          ...cc,
          companyId: company.id,
          isActive: true,
        },
      });
    }
  }
  console.log(`  ✅ Created ${costCenters.length} cost centers for each company`);

  // ==================== FISCAL PERIODS ====================
  console.log('');
  console.log('📅 Creating fiscal periods for 2024 and 2025...');

  for (const company of [companyRS, companyFBIH, companyBD]) {
    // 2024
    for (let month = 1; month <= 12; month++) {
      await prisma.fiscalPeriod.upsert({
        where: {
          companyId_year_month: {
            companyId: company.id,
            year: 2024,
            month,
          },
        },
        update: {},
        create: {
          companyId: company.id,
          year: 2024,
          month,
          isClosed: month < 11, // Close months before November
        },
      });
    }

    // 2025
    for (let month = 1; month <= 12; month++) {
      await prisma.fiscalPeriod.upsert({
        where: {
          companyId_year_month: {
            companyId: company.id,
            year: 2025,
            month,
          },
        },
        update: {},
        create: {
          companyId: company.id,
          year: 2025,
          month,
          isClosed: false,
        },
      });
    }
  }
  console.log('  ✅ Created fiscal periods for 2024 and 2025');

  // ==================== SUMMARY ====================
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('🎉 Comprehensive database seeding completed!');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log('📝 Login Credentials:');
  console.log('   ┌─ Super Admin: admin@accounting-bih.com / Admin123!');
  console.log('   └─ Accountant: knjigovodja@example.com / Accountant123!');
  console.log('');
  console.log('📊 Test Data Created:');
  console.log(`   ┌─ Companies: 3 (RS, FBIH, BD)`);
  console.log(`   ├─ Chart of Accounts: ${accounts.length} accounts per company`);
  console.log(`   ├─ Partners: ${partners.length} per company (customers, suppliers, both)`);
  console.log(`   ├─ Employees: ${employees.length} per company`);
  console.log(`   ├─ Cost Centers: ${costCenters.length} per company`);
  console.log(`   └─ Fiscal Periods: 24 periods (2024-2025) per company`);
  console.log('');
  console.log('✨ All data ready for testing!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    console.error(e.stack);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
