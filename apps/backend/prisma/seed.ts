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
    { code: '113100', name: 'Softver i licence', type: 'ASSET', category: 'FIXED_ASSETS' },

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
    { code: '220000', name: 'KAPITAL', type: 'LIABILITY', category: 'EQUITY' },
    { code: '221000', name: 'Osnovni kapital', type: 'LIABILITY', category: 'EQUITY' },
    { code: '222000', name: 'Rezerve', type: 'LIABILITY', category: 'EQUITY' },
    { code: '223000', name: 'Neraspoređena dobit', type: 'LIABILITY', category: 'EQUITY' },
    { code: '224000', name: 'Dobit tekuće godine', type: 'LIABILITY', category: 'EQUITY' },

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
      taxNumber: '4400111111111',
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
      taxNumber: '4200222222222',
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
      taxNumber: '4200333333333',
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
      taxNumber: '4400444444444',
      type: 'SUPPLIER',
      email: 'info@dobavljac-sistem.ba',
      phone: '+387 51 888 999',
      address: 'Studentska 10',
      city: 'Banja Luka',
      postalCode: '78000',
      country: 'BiH',
    },
    {
      name: 'VeleTrade d.o.o.',
      taxNumber: '4400555555555',
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
      taxNumber: '4200666666666',
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
      taxNumber: '4400777777777',
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
      taxNumber: '4200888888888',
      type: 'BOTH',
      email: 'kontakt@komercijala-plus.ba',
      phone: '+387 33 777 888',
      address: 'Alipašina 41',
      city: 'Sarajevo',
      postalCode: '71000',
      country: 'BiH',
    },
  ];

  // Create partners for each company using createMany (more efficient)
  for (const company of [companyRS, companyFBIH, companyBD]) {
    await prisma.partner.createMany({
      data: partners.map(p => ({
        ...p,
        companyId: company.id,
        isActive: true,
      })),
      skipDuplicates: true,
    });
  }
  console.log(`  ✅ Created ${partners.length} partners for each company`);

  // ==================== EMPLOYEES ====================
  console.log('');
  console.log('👤 Creating employees...');

  // Create separate employees for each company (personalId must be globally unique)
  const employeesRS = [
    {
      firstName: 'Petar',
      lastName: 'Petrović',
      personalId: '0101990123456', // RS employee 1
      email: 'petar.petrovic@abc-trade.ba',
      phone: '+387 65 111 222',
      baseSalary: 2500,
      employmentDate: new Date('2020-01-01'),
      companyId: companyRS.id,
    },
    {
      firstName: 'Milica',
      lastName: 'Milić',
      personalId: '1505985654321', // RS employee 2
      email: 'milica.milic@abc-trade.ba',
      phone: '+387 65 222 333',
      baseSalary: 1800,
      employmentDate: new Date('2020-03-15'),
      companyId: companyRS.id,
    },
    {
      firstName: 'Nikola',
      lastName: 'Nikolić',
      personalId: '2010995789012', // RS employee 3
      email: 'nikola.nikolic@abc-trade.ba',
      phone: '+387 65 333 444',
      baseSalary: 1400,
      employmentDate: new Date('2021-06-01'),
      companyId: companyRS.id,
    },
  ];

  const employeesFBIH = [
    {
      firstName: 'Amina',
      lastName: 'Alagić',
      personalId: '0505992111222', // FBIH employee 1
      email: 'amina.alagic@xyz-solutions.ba',
      phone: '+387 62 111 222',
      baseSalary: 2400,
      employmentDate: new Date('2020-02-01'),
      companyId: companyFBIH.id,
    },
    {
      firstName: 'Emir',
      lastName: 'Eminović',
      personalId: '1212988333444', // FBIH employee 2
      email: 'emir.eminovic@xyz-solutions.ba',
      phone: '+387 62 222 333',
      baseSalary: 1700,
      employmentDate: new Date('2021-01-15'),
      companyId: companyFBIH.id,
    },
  ];

  const employeesBD = [
    {
      firstName: 'Stefan',
      lastName: 'Stefanović',
      personalId: '2503994555666', // BD employee 1
      email: 'stefan.stefanovic@tech-services.ba',
      phone: '+387 66 111 222',
      baseSalary: 2200,
      employmentDate: new Date('2020-05-01'),
      companyId: companyBD.id,
    },
    {
      firstName: 'Jelena',
      lastName: 'Jelenić',
      personalId: '0808991777888', // BD employee 2
      email: 'jelena.jelenic@tech-services.ba',
      phone: '+387 66 222 333',
      baseSalary: 1600,
      employmentDate: new Date('2021-08-01'),
      companyId: companyBD.id,
    },
  ];

  // Create all employees
  const allEmployees = [...employeesRS, ...employeesFBIH, ...employeesBD];
  for (const employee of allEmployees) {
    await prisma.employee.upsert({
      where: { personalId: employee.personalId },
      update: {},
      create: {
        ...employee,
        isActive: true,
      },
    });
  }
  console.log(`  ✅ Created ${employeesRS.length} employees for RS company`);
  console.log(`  ✅ Created ${employeesFBIH.length} employees for FBIH company`);
  console.log(`  ✅ Created ${employeesBD.length} employees for BD company`);

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
  console.log(`   ├─ Employees: ${allEmployees.length} total (3 RS, 2 FBIH, 2 BD)`);
  console.log(`   └─ Cost Centers: ${costCenters.length} per company`);
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
