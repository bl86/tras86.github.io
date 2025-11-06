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
  console.log('🏢 Creating 10 companies...');

  const companies = await Promise.all([
    prisma.company.upsert({
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
    }),
    prisma.company.upsert({
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
    }),
    prisma.company.upsert({
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
    }),
    prisma.company.upsert({
      where: { taxNumber: '4400000000002' },
      update: {},
      create: {
        name: 'Delta Commerce d.o.o. Prijedor',
        taxNumber: '4400000000002',
        vatNumber: '440000000002',
        registrationNumber: '2345678901',
        address: 'Svetosavska 45',
        city: 'Prijedor',
        postalCode: '79101',
        country: 'BiH',
        legalEntity: 'RS',
        bankName: 'Nova Banka d.d.',
        bankAccount: 'BA395552345678901234',
        swift: 'NOVABA22',
        fiscalYearStart: 1,
        fiscalYearEnd: 12,
        baseCurrency: 'BAM',
        isActive: true,
      },
    }),
    prisma.company.upsert({
      where: { taxNumber: '4200000000002' },
      update: {},
      create: {
        name: 'Gamma Consulting d.o.o. Tuzla',
        taxNumber: '4200000000002',
        vatNumber: '420000000002',
        registrationNumber: '3456789012',
        address: 'Turalibegova 15',
        city: 'Tuzla',
        postalCode: '75000',
        country: 'BiH',
        legalEntity: 'FBIH',
        bankName: 'Sparkasse Bank d.d.',
        bankAccount: 'BA393343456789012345',
        swift: 'SPARBABA',
        fiscalYearStart: 1,
        fiscalYearEnd: 12,
        baseCurrency: 'BAM',
        isActive: true,
      },
    }),
    prisma.company.upsert({
      where: { taxNumber: '4400000000003' },
      update: {},
      create: {
        name: 'Epsilon Industries d.o.o. Doboj',
        taxNumber: '4400000000003',
        vatNumber: '440000000003',
        registrationNumber: '4567890123',
        address: 'Kneza Lazara 22',
        city: 'Doboj',
        postalCode: '74000',
        country: 'BiH',
        legalEntity: 'RS',
        bankName: 'Hypo Alpe Adria Bank d.d.',
        bankAccount: 'BA395554567890123456',
        swift: 'HAABBA22',
        fiscalYearStart: 1,
        fiscalYearEnd: 12,
        baseCurrency: 'BAM',
        isActive: true,
      },
    }),
    prisma.company.upsert({
      where: { taxNumber: '4200000000003' },
      update: {},
      create: {
        name: 'Zeta Logistics d.o.o. Mostar',
        taxNumber: '4200000000003',
        vatNumber: '420000000003',
        registrationNumber: '5678901234',
        address: 'Bulevar Narodne revolucije 100',
        city: 'Mostar',
        postalCode: '88000',
        country: 'BiH',
        legalEntity: 'FBIH',
        bankName: 'UniCredit Bank d.d.',
        bankAccount: 'BA393345678901234567',
        swift: 'UNCRBA22',
        fiscalYearStart: 1,
        fiscalYearEnd: 12,
        baseCurrency: 'BAM',
        isActive: true,
      },
    }),
    prisma.company.upsert({
      where: { taxNumber: '4400000000004' },
      update: {},
      create: {
        name: 'Theta Manufacturing d.o.o. Bijeljina',
        taxNumber: '4400000000004',
        vatNumber: '440000000004',
        registrationNumber: '6789012345',
        address: 'Karađorđeva 88',
        city: 'Bijeljina',
        postalCode: '76300',
        country: 'BiH',
        legalEntity: 'RS',
        bankName: 'NLB Banka d.d.',
        bankAccount: 'BA395556789012345678',
        swift: 'NLBABA22',
        fiscalYearStart: 1,
        fiscalYearEnd: 12,
        baseCurrency: 'BAM',
        isActive: true,
      },
    }),
    prisma.company.upsert({
      where: { taxNumber: '4200000000004' },
      update: {},
      create: {
        name: 'Iota Retail d.o.o. Zenica',
        taxNumber: '4200000000004',
        vatNumber: '420000000004',
        registrationNumber: '7890123456',
        address: 'Maršala Tita 33',
        city: 'Zenica',
        postalCode: '72000',
        country: 'BiH',
        legalEntity: 'FBIH',
        bankName: 'ProCredit Bank d.d.',
        bankAccount: 'BA393347890123456789',
        swift: 'MFTCBA22',
        fiscalYearStart: 1,
        fiscalYearEnd: 12,
        baseCurrency: 'BAM',
        isActive: true,
      },
    }),
    prisma.company.upsert({
      where: { taxNumber: '4400000000005' },
      update: {},
      create: {
        name: 'Kappa IT Solutions d.o.o. Trebinje',
        taxNumber: '4400000000005',
        vatNumber: '440000000005',
        registrationNumber: '8901234567',
        address: 'Jovan Dučić 12',
        city: 'Trebinje',
        postalCode: '89101',
        country: 'BiH',
        legalEntity: 'RS',
        bankName: 'Addiko Bank d.d.',
        bankAccount: 'BA395558901234567890',
        swift: 'HAABBA2S',
        fiscalYearStart: 1,
        fiscalYearEnd: 12,
        baseCurrency: 'BAM',
        isActive: true,
      },
    }),
  ]);

  const [companyRS, companyFBIH, companyBD] = companies;

  companies.forEach((company, index) => {
    console.log(`  ✅ Company ${index + 1} created: ${company.name}`);
  });

  // Grant BOTH superAdmin AND accountant access to ALL companies
  const accessData: { userId: string; companyId: string }[] = [];
  companies.forEach((company) => {
    accessData.push({ userId: superAdmin.id, companyId: company.id });
    accessData.push({ userId: accountant.id, companyId: company.id });
  });

  await prisma.userCompanyAccess.createMany({
    data: accessData,
    skipDuplicates: true,
  });
  console.log('  ✅ Company access granted to superAdmin and accountant for all 10 companies');

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

  for (const company of companies) {
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
  console.log(`  ✅ Created ${accounts.length} accounts for all ${companies.length} companies`);

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
  for (const company of companies) {
    await prisma.partner.createMany({
      data: partners.map(p => ({
        ...p,
        companyId: company.id,
        isActive: true,
      })),
      skipDuplicates: true,
    });
  }
  console.log(`  ✅ Created ${partners.length} partners for all ${companies.length} companies`);

  // ==================== EMPLOYEES ====================
  console.log('');
  console.log('👤 Creating employees with detailed payroll data...');

  // Republika Srpska Employees (3 employees with varying salaries)
  const employeesRS = [
    {
      personalNumber: 'RS-001',
      firstName: 'Petar',
      lastName: 'Petrović',
      jmbg: '0101990123456',
      taxNumber: 'RS-TAX-001',
      address: 'Trg srpskih vladara 1',
      city: 'Banja Luka',
      email: 'petar.petrovic@abc-trade.ba',
      phone: '+387 65 111 222',
      entity: 'RS' as any,
      position: 'Direktor',
      department: 'Uprava',
      grossSalary: 3500, // Higher salary for manager
      employmentDate: new Date('2020-01-01'),
      companyId: companyRS.id,
    },
    {
      personalNumber: 'RS-002',
      firstName: 'Milica',
      lastName: 'Milić',
      jmbg: '1505985654321',
      taxNumber: 'RS-TAX-002',
      address: 'Kralja Petra 15',
      city: 'Banja Luka',
      email: 'milica.milic@abc-trade.ba',
      phone: '+387 65 222 333',
      entity: 'RS' as any,
      position: 'Glavni računovođa',
      department: 'Računovodstvo',
      grossSalary: 2200, // Mid-level salary
      employmentDate: new Date('2020-03-15'),
      companyId: companyRS.id,
    },
    {
      personalNumber: 'RS-003',
      firstName: 'Nikola',
      lastName: 'Nikolić',
      jmbg: '2010995789012',
      taxNumber: 'RS-TAX-003',
      address: 'Srpska 7',
      city: 'Banja Luka',
      email: 'nikola.nikolic@abc-trade.ba',
      phone: '+387 65 333 444',
      entity: 'RS' as any,
      position: 'Prodavac',
      department: 'Prodaja',
      grossSalary: 1500, // Entry-level salary
      employmentDate: new Date('2021-06-01'),
      companyId: companyRS.id,
    },
  ];

  // Federacija BiH Employees (3 employees with varying salaries)
  const employeesFBIH = [
    {
      personalNumber: 'FBIH-001',
      firstName: 'Amina',
      lastName: 'Alagić',
      jmbg: '0505992111222',
      taxNumber: 'FBIH-TAX-001',
      address: 'Zmaja od Bosne 8',
      city: 'Sarajevo',
      email: 'amina.alagic@xyz-solutions.ba',
      phone: '+387 62 111 222',
      entity: 'FBIH' as any,
      position: 'IT Menadžer',
      department: 'IT',
      grossSalary: 4000, // High salary for IT manager
      employmentDate: new Date('2020-02-01'),
      companyId: companyFBIH.id,
    },
    {
      personalNumber: 'FBIH-002',
      firstName: 'Emir',
      lastName: 'Eminović',
      jmbg: '1212988333444',
      taxNumber: 'FBIH-TAX-002',
      address: 'Ferhadija 22',
      city: 'Sarajevo',
      email: 'emir.eminovic@xyz-solutions.ba',
      phone: '+387 62 222 333',
      entity: 'FBIH' as any,
      position: 'Senior Developer',
      department: 'IT',
      grossSalary: 2800, // Good salary for senior dev
      employmentDate: new Date('2021-01-15'),
      companyId: companyFBIH.id,
    },
    {
      personalNumber: 'FBIH-003',
      firstName: 'Lejla',
      lastName: 'Lemeš',
      jmbg: '0303997112233',
      taxNumber: 'FBIH-TAX-003',
      address: 'Titova 45',
      city: 'Sarajevo',
      email: 'lejla.lemes@xyz-solutions.ba',
      phone: '+387 62 444 555',
      entity: 'FBIH' as any,
      position: 'Junior Developer',
      department: 'IT',
      grossSalary: 1800, // Entry-level developer salary
      employmentDate: new Date('2023-03-01'),
      companyId: companyFBIH.id,
    },
  ];

  // Brčko Distrikt Employees (2 employees)
  const employeesBD = [
    {
      personalNumber: 'BD-001',
      firstName: 'Stefan',
      lastName: 'Stefanović',
      jmbg: '2503994555666',
      taxNumber: 'BD-TAX-001',
      address: 'Bulevar Mira 33',
      city: 'Brčko',
      email: 'stefan.stefanovic@tech-services.ba',
      phone: '+387 66 111 222',
      entity: 'BD' as any,
      position: 'Tehnički direktor',
      department: 'Tehnika',
      grossSalary: 3200,
      employmentDate: new Date('2020-05-01'),
      companyId: companyBD.id,
    },
    {
      personalNumber: 'BD-002',
      firstName: 'Jelena',
      lastName: 'Jelenić',
      jmbg: '0808991777888',
      taxNumber: 'BD-TAX-002',
      address: 'Trg mladih 12',
      city: 'Brčko',
      email: 'jelena.jelenic@tech-services.ba',
      phone: '+387 66 222 333',
      entity: 'BD' as any,
      position: 'Tehnički asistent',
      department: 'Tehnika',
      grossSalary: 1900,
      employmentDate: new Date('2021-08-01'),
      companyId: companyBD.id,
    },
  ];

  // Create all employees
  const allEmployees = [...employeesRS, ...employeesFBIH, ...employeesBD];
  for (const employee of allEmployees) {
    await prisma.employee.upsert({
      where: { jmbg: employee.jmbg },
      update: employee,
      create: {
        ...employee,
        isActive: true,
      },
    });
  }
  console.log(`  ✅ Created ${employeesRS.length} employees for RS company (salaries: 1500-3500 KM)`);
  console.log(`  ✅ Created ${employeesFBIH.length} employees for FBIH company (salaries: 1800-4000 KM)`);
  console.log(`  ✅ Created ${employeesBD.length} employees for BD company (salaries: 1900-3200 KM)`);

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

  for (const company of companies) {
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
  console.log(`  ✅ Created ${costCenters.length} cost centers for all ${companies.length} companies`);

  // ==================== PAYROLL RUNS ====================
  console.log('');
  console.log('💰 Creating payroll runs...');

  let totalPayrollRuns = 0;
  for (const company of companies.slice(0, 3)) { // Only RS, FBIH, BD have employees
    const entity = company.legalEntity as any;

    // Create payroll for previous 3 months
    const months = ['2025-01', '2025-02', '2025-03'];
    for (const month of months) {
      try {
        await prisma.payrollRun.create({
          data: {
            period: month,
            entity,
            status: 'APPROVED',
            totalGross: entity === 'RS' ? 6700 : entity === 'FBIH' ? 4100 : 3800,
            totalNet: entity === 'RS' ? 4800 : entity === 'FBIH' ? 2950 : 2730,
            totalTax: entity === 'RS' ? 670 : entity === 'FBIH' ? 410 : 380,
            totalSocialContributions: entity === 'RS' ? 3100 : entity === 'FBIH' ? 1900 : 1760,
            companyId: company.id,
            calculatedById: superAdmin.id,
            approvedById: superAdmin.id,
            approvedAt: new Date(`${month}-15`),
          },
        });
        totalPayrollRuns++;
      } catch (e) {
        // Skip if already exists
      }
    }
  }
  console.log(`  ✅ Created ${totalPayrollRuns} payroll runs for companies with employees`);

  // ==================== JOURNAL ENTRIES ====================
  console.log('');
  console.log('📖 Creating hundreds of journal entries...');

  let totalJournalEntries = 0;

  // Get some accounts for each company to use in journal entries
  for (const company of companies) {
    const companyAccounts = await prisma.account.findMany({
      where: { companyId: company.id },
      take: 20,
    });

    if (companyAccounts.length === 0) continue;

    const cashAccount = companyAccounts.find(a => a.code === '101100') || companyAccounts[0];
    const bankAccount = companyAccounts.find(a => a.code === '101200') || companyAccounts[1];
    const receivablesAccount = companyAccounts.find(a => a.code === '103100') || companyAccounts[2];
    const revenueAccount = companyAccounts.find(a => a.code === '301000') || companyAccounts[3];
    const expenseAccount = companyAccounts.find(a => a.code === '401000') || companyAccounts[4];
    const payablesAccount = companyAccounts.find(a => a.code === '201100') || companyAccounts[5];
    const salaryAccount = companyAccounts.find(a => a.code === '402000') || companyAccounts[6];
    const taxAccount = companyAccounts.find(a => a.code === '201300') || companyAccounts[7];

    // Create 30 journal entries per company (300 total for 10 companies)
    for (let i = 1; i <= 30; i++) {
      const dayOffset = (i - 1) * 3; // Spread entries across 90 days
      const entryDate = new Date('2025-01-01');
      entryDate.setDate(entryDate.getDate() + dayOffset);

      const month = entryDate.getMonth();
      const fiscalPeriods = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL'];
      const fiscalPeriod = fiscalPeriods[month] as any;

      const entryTypes = [
        // Type 1: Sales revenue
        {
          description: `Faktura prodaje ${1000 + i}`,
          documentType: 'INVOICE',
          lines: [
            { accountId: receivablesAccount.id, debit: 10000 + (i * 100), credit: 0, description: 'Potraživanje od kupca' },
            { accountId: revenueAccount.id, debit: 0, credit: 10000 + (i * 100), description: 'Prihod od prodaje' },
          ],
        },
        // Type 2: Purchase expense
        {
          description: `Faktura nabavke ${2000 + i}`,
          documentType: 'INVOICE',
          lines: [
            { accountId: expenseAccount.id, debit: 5000 + (i * 50), credit: 0, description: 'Troškovi materijala' },
            { accountId: payablesAccount.id, debit: 0, credit: 5000 + (i * 50), description: 'Obaveza prema dobavljaču' },
          ],
        },
        // Type 3: Bank payment
        {
          description: `Prenos sa banke u blagajnu ${i}`,
          documentType: 'PAYMENT',
          lines: [
            { accountId: cashAccount.id, debit: 3000, credit: 0, description: 'Uplata u blagajnu' },
            { accountId: bankAccount.id, debit: 0, credit: 3000, description: 'Isplata sa banke' },
          ],
        },
        // Type 4: Salary payment
        {
          description: `Isplata plata ${entryDate.toISOString().slice(0, 7)}`,
          documentType: 'PAYROLL',
          lines: [
            { accountId: salaryAccount.id, debit: 8000, credit: 0, description: 'Obračun plata' },
            { accountId: taxAccount.id, debit: 2000, credit: 0, description: 'Porezi i doprinosi' },
            { accountId: bankAccount.id, debit: 0, credit: 10000, description: 'Isplata plata' },
          ],
        },
      ];

      const entryType = entryTypes[i % entryTypes.length];

      try {
        await prisma.journalEntry.create({
          data: {
            entryNumber: `JE-2025-${String(i).padStart(4, '0')}`,
            entryDate,
            postingDate: entryDate,
            description: entryType.description,
            documentNumber: `DOC-${i}`,
            documentType: entryType.documentType as any,
            status: i % 3 === 0 ? 'DRAFT' : 'POSTED',
            fiscalYear: 2025,
            fiscalPeriod,
            companyId: company.id,
            createdById: superAdmin.id,
            lines: {
              create: entryType.lines.map((line, idx) => ({
                ...line,
                lineNumber: idx + 1,
              })),
            },
          },
        });
        totalJournalEntries++;
      } catch (e) {
        // Skip if entry number already exists
      }
    }
  }
  console.log(`  ✅ Created ${totalJournalEntries} journal entries across all companies`);

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
  console.log(`   ┌─ Companies: ${companies.length} (across RS, FBIH, BD entities)`);
  console.log(`   ├─ Chart of Accounts: ${accounts.length} accounts per company (${accounts.length * companies.length} total)`);
  console.log(`   ├─ Partners: ${partners.length} per company (${partners.length * companies.length} total)`);
  console.log(`   ├─ Employees: ${allEmployees.length} total (3 RS, 2 FBIH, 2 BD)`);
  console.log(`   ├─ Cost Centers: ${costCenters.length} per company (${costCenters.length * companies.length} total)`);
  console.log(`   ├─ Payroll Runs: ${totalPayrollRuns} (3 months for 3 companies with employees)`);
  console.log(`   └─ Journal Entries: ${totalJournalEntries} (balanced double-entry transactions)`);
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
