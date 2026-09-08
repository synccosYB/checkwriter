import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {
  usersCollection,
  organizationCollection,
  userToOrganizationCollection,
  banksCollection,
  payeesCollection,
  tagsCollection,
  checksCollection,
  usersSubscriptionCollection,
  authenticationCollection,
} from '../models/dbCollections.js';

const COMPANY_NAMES = [
  'Greenfield Logistics',
  'Apex Consulting Group',
  'Riverstone Holdings',
  'Bluecrest Ventures',
  'Ironwood Manufacturing',
  'Clearwater Solutions',
  'Pinnacle Realty Group',
  'Summit Financial Services',
  'Lakeside Enterprises',
  'Harborview Industries',
  'Redwood Capital Partners',
  'Northstar Tech LLC',
  'Coastal Property Group',
  'Meridian Health Services',
  'Silverline Distribution',
];

const BANK_OPTIONS = [
  { name: 'Chase Business Checking', routingNumber: '021000021', accountType: 'CHECKING' },
  { name: 'Wells Fargo Business Savings', routingNumber: '121042882', accountType: 'SAVINGS' },
  { name: 'Bank of America Business', routingNumber: '026009593', accountType: 'CHECKING' },
  { name: 'Citibank Commercial Checking', routingNumber: '021000089', accountType: 'CHECKING' },
  { name: 'US Bank Business Account', routingNumber: '091000022', accountType: 'SAVINGS' },
  { name: 'TD Bank Business Checking', routingNumber: '036001808', accountType: 'CHECKING' },
  { name: 'PNC Business Savings', routingNumber: '043000096', accountType: 'SAVINGS' },
  { name: 'Fifth Third Business Checking', routingNumber: '042000314', accountType: 'CHECKING' },
  { name: 'KeyBank Commercial Account', routingNumber: '041001039', accountType: 'BUSINESS' },
  { name: 'Regions Business Savings', routingNumber: '062000019', accountType: 'SAVINGS' },
  { name: 'SunTrust Personal Checking', routingNumber: '061000104', accountType: 'CHECKING' },
  { name: 'Citizens Bank Savings', routingNumber: '011500010', accountType: 'SAVINGS' },
];

const PAYEE_POOL = [
  { name: 'John Martinez', companyName: 'Martinez Consulting', city: 'Austin', state: 'TX', addressLine1: '482 Oak Hill Drive', zipCode: 73301 },
  { name: 'Sarah Thompson', companyName: 'Thompson & Associates', city: 'Denver', state: 'CO', addressLine1: '917 Maple Avenue', zipCode: 80201 },
  { name: 'David Kim', companyName: 'Kim Property Management', city: 'Seattle', state: 'WA', addressLine1: '2341 Pine Street', zipCode: 98101 },
  { name: 'Lisa Nguyen', companyName: 'Nguyen Software Solutions', city: 'San Jose', state: 'CA', addressLine1: '765 Tech Blvd', zipCode: 95101 },
  { name: 'Robert Johnson', companyName: 'Johnson Electrical Services', city: 'Phoenix', state: 'AZ', addressLine1: '134 Desert Rose Lane', zipCode: 85001 },
  { name: 'Emily Carter', companyName: 'Carter Office Supplies', city: 'Chicago', state: 'IL', addressLine1: '5520 Lakeview Pkwy', zipCode: 60601 },
  { name: 'Michael Brown', companyName: 'Brown Legal Group', city: 'New York', state: 'NY', addressLine1: '888 Park Avenue', zipCode: 10001 },
  { name: 'Amanda Wilson', companyName: 'Wilson Marketing Agency', city: 'Miami', state: 'FL', addressLine1: '321 Bay Shore Blvd', zipCode: 33101 },
  { name: 'James Rodriguez', companyName: 'Rodriguez Plumbing Co', city: 'Dallas', state: 'TX', addressLine1: '6712 Elm Street', zipCode: 75201 },
  { name: 'Patricia Davis', companyName: 'Davis Accounting Firm', city: 'Boston', state: 'MA', addressLine1: '44 Financial Row', zipCode: 2101 },
  { name: 'Kevin White', companyName: 'White Logistics Inc', city: 'Atlanta', state: 'GA', addressLine1: '199 Commerce Drive', zipCode: 30301 },
  { name: 'Nancy Harris', companyName: 'Harris Insurance Group', city: 'Portland', state: 'OR', addressLine1: '3345 Burnside Ave', zipCode: 97201 },
  { name: 'Steven Clark', companyName: 'Clark HVAC Services', city: 'Minneapolis', state: 'MN', addressLine1: '781 Northern Blvd', zipCode: 55401 },
  { name: 'Jessica Lewis', companyName: 'Lewis Design Studio', city: 'Nashville', state: 'TN', addressLine1: '220 Music Row', zipCode: 37201 },
  { name: 'Daniel Martinez', companyName: 'Martinez Landscaping', city: 'San Antonio', state: 'TX', addressLine1: '560 Garden Path', zipCode: 78201 },
  { name: 'Megan Scott', companyName: 'Scott Tech Repairs', city: 'Las Vegas', state: 'NV', addressLine1: '99 Boulevard Drive', zipCode: 89101 },
  { name: 'Christopher Moore', companyName: 'Moore Security Systems', city: 'Charlotte', state: 'NC', addressLine1: '812 Prospect Street', zipCode: 28201 },
  { name: 'Ashley Taylor', companyName: 'Taylor Medical Supplies', city: 'Philadelphia', state: 'PA', addressLine1: '1400 Health Center Blvd', zipCode: 19101 },
  { name: 'Joshua Anderson', companyName: 'Anderson Construction', city: 'Columbus', state: 'OH', addressLine1: '3300 Builder Ave', zipCode: 43201 },
  { name: 'Rachel Thomas', companyName: 'Thomas Event Planning', city: 'San Diego', state: 'CA', addressLine1: '8 Oceanfront Walk', zipCode: 92101 },
];

const TAG_POOL = [
  { name: 'Rent', color: '#4CAF50' },
  { name: 'Utilities', color: '#2196F3' },
  { name: 'Payroll', color: '#9C27B0' },
  { name: 'Office Supplies', color: '#FF9800' },
  { name: 'Insurance', color: '#F44336' },
  { name: 'Marketing', color: '#00BCD4' },
  { name: 'Travel', color: '#795548' },
  { name: 'Legal', color: '#607D8B' },
  { name: 'Maintenance', color: '#FF5722' },
  { name: 'Equipment', color: '#3F51B5' },
  { name: 'Consulting', color: '#009688' },
  { name: 'Software', color: '#673AB7' },
];

const MEMO_POOL = [
  'Monthly Rent Payment',
  'Invoice #1042',
  'Software License Renewal',
  'Consulting Fee - Q4',
  'Office Supplies Order',
  'Security Deposit',
  'Maintenance Contract',
  'Marketing Campaign',
  'Annual Insurance Premium',
  'Legal Retainer Fee',
  'Equipment Lease Payment',
  'Payroll - Bi-weekly',
  'Utility Bill - Electricity',
  'Internet & Phone Services',
  'Professional Development',
  'Event Sponsorship',
  'Vendor Payment - Net 30',
  'Service Agreement Fee',
  'Quarterly Tax Payment',
  'Staff Training Materials',
];

const CHECK_STATUSES = ['CLEARED', 'CLEARED', 'CLEARED', 'PRINTED', 'PRINTED', 'DRAFT', 'DRAFT', 'VOID'];

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return count === undefined ? shuffled[0] : shuffled.slice(0, count);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomAmount() {
  const dollars = randomInt(150, 12000);
  const cents = randomInt(0, 99);
  return parseFloat(`${dollars}.${cents.toString().padStart(2, '0')}`);
}

function randomPastDate(maxDaysAgo = 90) {
  const daysAgo = randomInt(1, maxDaysAgo);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function generateAccountNumber() {
  return randomInt(10000000, 9999999999).toString();
}

async function seedProfileData(ownerType, ownerId, checkStartNumber = 1001) {
  const bankOptions = pickRandom(BANK_OPTIONS, 2);
  const createdBanks = [];
  for (const bankOpt of bankOptions) {
    const bank = await banksCollection.create({
      bankName: bankOpt.name,
      accountType: bankOpt.accountType,
      accountNickName: bankOpt.name,
      accountNumber: parseInt(generateAccountNumber()),
      bankRoutingNumber: bankOpt.routingNumber,
      country: 'US',
      ownerId,
      ownerType,
      status: 'active',
      bankPreferences: {
        checkNoGeneration: 'manual',
        defaultCheckNumberLength: 4,
        defaultCheckStartNumber: checkStartNumber,
        lastUsedCheckNumber: randomInt(checkStartNumber, checkStartNumber + 50),
        signatureEnabled: false,
      },
      balance: randomInt(5000, 80000),
    });
    createdBanks.push(bank);
  }

  const payeeOptions = pickRandom(PAYEE_POOL, randomInt(4, 5));
  const createdPayees = [];
  for (const payeeOpt of payeeOptions) {
    const payee = await payeesCollection.create({
      name: payeeOpt.name,
      companyName: payeeOpt.companyName,
      address: {
        name: payeeOpt.name,
        companyName: payeeOpt.companyName,
        addressLine1: payeeOpt.addressLine1,
        city: payeeOpt.city,
        state: payeeOpt.state,
        country: 'US',
        zipCode: payeeOpt.zipCode,
      },
      ownerId,
      ownerType,
      status: 'active',
    });
    createdPayees.push(payee);
  }

  const tagOptions = pickRandom(TAG_POOL, randomInt(4, 5));
  const createdTags = [];
  for (const tagOpt of tagOptions) {
    const tag = await tagsCollection.create({
      name: tagOpt.name,
      color: tagOpt.color,
      ownerId,
      ownerType,
    });
    createdTags.push(tag);
  }

  const checkCount = randomInt(8, 10);
  for (let i = 0; i < checkCount; i++) {
    const bank = pickRandom(createdBanks);
    const payee = pickRandom(createdPayees);
    const tag = pickRandom(createdTags);
    const status = pickRandom(CHECK_STATUSES);
    const issuedDate = randomPastDate(90);

    await checksCollection.create({
      ownerId,
      ownerType,
      checkNumber: checkStartNumber + i,
      amount: randomAmount(),
      status,
      issuedDate,
      createdDate: issuedDate,
      payeeId: payee._id,
      bankId: bank._id,
      tags: [tag._id],
      memo: pickRandom(MEMO_POOL),
      createdAtUnix: Math.floor(issuedDate.getTime() / 1000),
      updatedAtUnix: Math.floor(issuedDate.getTime() / 1000),
    });
  }
}

export async function createDemoAccount() {
  const uuid = uuidv4();
  const email = `demo-${uuid}@synccos-demo.com`;
  const password = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  const companyName = pickRandom(COMPANY_NAMES);

  const user = await usersCollection.create({
    firstName: 'Demo',
    lastName: 'User',
    email,
    isDemo: true,
    demoCreatedAt: new Date(),
    welcomeSeen: true,
  });

  const userId = user._id;

  await authenticationCollection.create({
    userId,
    password: hashedPassword,
    mode: 'standard',
  });

  const organization = await organizationCollection.create({
    organizationName: companyName,
    entityType: 'LLC',
  });

  const orgId = organization._id;

  await userToOrganizationCollection.create({
    userId,
    organizationId: orgId,
  });

  await usersSubscriptionCollection.create({
    userId,
    isSubscribed: true,
    isActive: true,
    isTrialing: false,
    mode: 'paid',
    status: 'active',
    subscriptionPrice: { price: 29, currency: 'usd' },
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
  });

  await seedProfileData('user', userId, 1001);
  await seedProfileData('organization', orgId, 2001);

  return { user, organization };
}

export async function cleanUpOldDemoAccounts() {
  const cutoff = new Date(Date.now() - 60 * 60 * 1000);

  // Pull only the _id for matching demo users (uses the is_demo index).
  // Then issue bulk $in deletes per collection rather than N per-user passes.
  const oldDemoUsers = await usersCollection
    .find({ isDemo: true, demoCreatedAt: { $lt: cutoff } })
    .select('_id')
    .lean();

  if (oldDemoUsers.length === 0) {
    console.info('Demo cleanup: no old demo accounts to remove');
    return;
  }

  const userIds = oldDemoUsers.map((u) => u._id);

  const userOrgLinks = await userToOrganizationCollection
    .find({ userId: { $in: userIds } })
    .select('organizationId')
    .lean();
  const orgIds = userOrgLinks.map((r) => r.organizationId).filter(Boolean);

  if (orgIds.length > 0) {
    await Promise.all([
      checksCollection.deleteMany({ ownerId: { $in: orgIds }, ownerType: 'organization' }),
      banksCollection.deleteMany({ ownerId: { $in: orgIds }, ownerType: 'organization' }),
      payeesCollection.deleteMany({ ownerId: { $in: orgIds }, ownerType: 'organization' }),
      tagsCollection.deleteMany({ ownerId: { $in: orgIds }, ownerType: 'organization' }),
      organizationCollection.deleteMany({ _id: { $in: orgIds } }),
    ]);
  }

  await Promise.all([
    checksCollection.deleteMany({ ownerId: { $in: userIds }, ownerType: 'user' }),
    banksCollection.deleteMany({ ownerId: { $in: userIds }, ownerType: 'user' }),
    payeesCollection.deleteMany({ ownerId: { $in: userIds }, ownerType: 'user' }),
    tagsCollection.deleteMany({ ownerId: { $in: userIds }, ownerType: 'user' }),
    userToOrganizationCollection.deleteMany({ userId: { $in: userIds } }),
    usersSubscriptionCollection.deleteMany({ userId: { $in: userIds } }),
    authenticationCollection.deleteMany({ userId: { $in: userIds } }),
  ]);

  await usersCollection.deleteMany({ _id: { $in: userIds } });

  console.info(`Demo cleanup: removed ${oldDemoUsers.length} old demo accounts`);
}
