import config from 'config';
import { banksCollection, checksCollection } from '../models/dbCollections.js';
import axios from 'axios';
import { ROUTING_API } from '../constants/index.js';

import {
  uploadToS3,
  getPresignedDownloadUrl,
} from '../utils/s3.util.js';

export const removeSpaces = (str) => str.replace(/\s+/g, '');

export const isSignatureBase64String = (base64String) => {
  if (typeof base64String !== 'string') {
    return false;
  }

  const match = base64String.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    return false;
  }
  return true;
};

export const uploadSignatureToS3 = async ({
  userId,
  base64String,
  organizationId,
  ownerType,
  fileName,
}) => {
  try {
    const match = base64String.match(/^data:(image\/\w+);base64,(.+)$/);
    const contentType = match[1]; // Extract MIME type (e.g., image/png)
    const buffer = Buffer.from(match[2], 'base64'); // Convert Base64 to Buffer

    const s3Key =
      ownerType !== 'user'
        ? `${userId}/checkWriter/organization/${organizationId}/signatures/bank/${fileName}`
        : `${userId}/checkWriter/personal/signatures/bank/${fileName}`;

    await uploadToS3({
      Bucket: config.s3.bucket_name,
      Key: s3Key,
      ContentType: contentType,
      Body: buffer,
    });
    return s3Key;
  } catch (err) {
    throw err;
  }
};

export const getSignatureUrl = async ({
  userId,
  organizationId,
  ownerType,
  fileName,
}) => {
  try {
    const s3Key =
      ownerType !== 'user'
        ? `${userId}/checkWriter/organization/${organizationId}/signatures/bank/${fileName}`
        : `${userId}/checkWriter/personal/signatures/bank/${fileName}`;

    return await getPresignedDownloadUrl({
      Bucket: config.s3.bucket_name,
      Key: s3Key,
    });
  } catch (err) {
    throw err;
  }
};

export async function detectDuplicateBankAccount({
  ownerId,
  accountNumber,
  bankRoutingNumber,
  bankTransitNumber,
  countryCode,
  existingBankId,
}) {
  const query = { ownerId: ownerId.toString() };

  if (countryCode === 'USA') {
    query.accountNumber = accountNumber;
    query.bankRoutingNumber = bankRoutingNumber;
  } else if (countryCode === 'CANADA') {
    query.accountNumber = accountNumber;
    query.bankRoutingNumber = bankRoutingNumber;
    query.bankTransitNumber = bankTransitNumber;
  }

  if (existingBankId) {
    query._id = { $ne: existingBankId.toString() };
  }

  const duplicate = await banksCollection.findOne(query);

  if (duplicate) {
    let reason = `Duplicate bank entry found with values — accountNumber: ${accountNumber}`;
    if (bankRoutingNumber)
      reason += `, bankRoutingNumber: ${bankRoutingNumber}`;
    if (bankTransitNumber && countryCode === 'CANADA') {
      reason += `, bankTransitNumber: ${bankTransitNumber}`;
    }
    const error = new Error(reason);
    error.code = 'DUPLICATE_BANK';
    error.duplicateBankId = duplicate._id; // Add the ID to the error object
    throw error;
  }

  return false;
}
// Helper to extract key-value pairs from error message
export function extractDuplicateFieldsFromMessage(message) {
  const fieldRegex = /(\w+):\s([\w\d]+)/g;
  const fields = {};
  let match;

  while ((match = fieldRegex.exec(message)) !== null) {
    const [_, key, value] = match;
    fields[key] = value;
  }

  return fields;
}

export const getNextAvailableCheckNumber = async ({
  ownerType,
  ownerId,
  bankId,
}) => {
  try {
    const bank = await banksCollection.findOne({
      ownerId,
      _id: bankId,
      ownerType,
    });

    if (!bank) {
      throw new Error('No bank found');
    }

    const latestCheck = await checksCollection
      .findOne({
        ownerId,
        ownerType,
        bankId,
      })
      .sort({ checkNumber: -1 })
      .lean();

    const isAutoGeneration = bank.bankPreferences?.checkNoGeneration === 'auto';

    const defaultStartNumber = bank?.bankPreferences?.defaultCheckStartNumber;

    let nextAvailableCheckNumber;

    if (!latestCheck) {
      nextAvailableCheckNumber = isAutoGeneration ? +defaultStartNumber : 1;
    } else {
      if (isAutoGeneration) {
        nextAvailableCheckNumber =
          Math.max(+defaultStartNumber, latestCheck.checkNumber) + 1;
      } else {
        nextAvailableCheckNumber = latestCheck.checkNumber + 1;
      }
    }
    return nextAvailableCheckNumber;
  } catch (error) {
    throw error;
  }
};

const BANK_LOGO_MAP = {
  'jpmorgan chase': 'https://logo.clearbit.com/chase.com',
  'chase': 'https://logo.clearbit.com/chase.com',
  'bank of america': 'https://logo.clearbit.com/bankofamerica.com',
  'wells fargo': 'https://logo.clearbit.com/wellsfargo.com',
  'citibank': 'https://logo.clearbit.com/citibank.com',
  'citi': 'https://logo.clearbit.com/citibank.com',
  'us bank': 'https://logo.clearbit.com/usbank.com',
  'u.s. bank': 'https://logo.clearbit.com/usbank.com',
  'pnc': 'https://logo.clearbit.com/pnc.com',
  'truist': 'https://logo.clearbit.com/truist.com',
  'capital one': 'https://logo.clearbit.com/capitalone.com',
  'td bank': 'https://logo.clearbit.com/td.com',
  'citizens': 'https://logo.clearbit.com/citizensbank.com',
  'fifth third': 'https://logo.clearbit.com/53.com',
  'huntington': 'https://logo.clearbit.com/huntington.com',
  'regions': 'https://logo.clearbit.com/regions.com',
  'key bank': 'https://logo.clearbit.com/key.com',
  'keybank': 'https://logo.clearbit.com/key.com',
  'ally': 'https://logo.clearbit.com/ally.com',
  'hsbc': 'https://logo.clearbit.com/hsbc.com',
  'bmo': 'https://logo.clearbit.com/bmo.com',
  'goldman sachs': 'https://logo.clearbit.com/goldmansachs.com',
  'morgan stanley': 'https://logo.clearbit.com/morganstanley.com',
  'charles schwab': 'https://logo.clearbit.com/schwab.com',
  'federal reserve': 'https://logo.clearbit.com/federalreserve.gov',
  'usaa': 'https://logo.clearbit.com/usaa.com',
  'navy federal': 'https://logo.clearbit.com/navyfederal.org',
  'svb': 'https://logo.clearbit.com/svb.com',
  'silicon valley bank': 'https://logo.clearbit.com/svb.com',
  'first republic': 'https://logo.clearbit.com/firstrepublic.com',
  'comerica': 'https://logo.clearbit.com/comerica.com',
  'zions': 'https://logo.clearbit.com/zionsbank.com',
  'webster': 'https://logo.clearbit.com/websterbank.com',
  'm&t bank': 'https://logo.clearbit.com/mtb.com',
  'synchrony': 'https://logo.clearbit.com/synchrony.com',
  'discover': 'https://logo.clearbit.com/discover.com',
};

const resolveBankLogoUrl = (bankName) => {
  if (!bankName) return null;
  const lower = bankName.toLowerCase();
  for (const [key, url] of Object.entries(BANK_LOGO_MAP)) {
    if (lower.includes(key)) return url;
  }
  return null;
};

const normalizeBankData = (raw) => {
  const bankName = (raw?.customer_name ?? '').toString().trim() || null;
  return {
    bankName,
    routingNumber: (raw?.routing_number ?? '').toString().trim() || null,
    address1: (raw?.address ?? '').toString().trim() || null,
    city: (raw?.city ?? '').toString().trim() || null,
    state: (raw?.state ?? '').toString().trim() || null,
    zip: (raw?.zip ?? raw?.zipcode ?? '').toString().trim() || null,
    phone: (raw?.telephone ?? raw?.phone ?? '').toString().trim() || null,
    logoUrl: resolveBankLogoUrl(bankName),
  };
};

const US_BANK_DATA = [
  { routing_number: '021000021', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1 CHASE MANHATTAN PLAZA', city: 'NEW YORK', state: 'NY', zip: '10005', telephone: '212-270-6000' },
  { routing_number: '021000089', customer_name: 'CITIBANK N.A.', address: '111 WALL STREET', city: 'NEW YORK', state: 'NY', zip: '10043', telephone: '800-374-9700' },
  { routing_number: '021001088', customer_name: 'BANK OF AMERICA, N.A.', address: '100 N TRYON ST', city: 'CHARLOTTE', state: 'NC', zip: '28255', telephone: '800-446-0135' },
  { routing_number: '026009593', customer_name: 'BANK OF AMERICA, N.A.', address: '100 N TRYON ST', city: 'CHARLOTTE', state: 'NC', zip: '28255', telephone: '800-446-0135' },
  { routing_number: '011401533', customer_name: 'TD BANK N.A.', address: '2035 LIMESTONE RD', city: 'WILMINGTON', state: 'DE', zip: '19808', telephone: '856-751-9000' },
  { routing_number: '021200339', customer_name: 'HSBC BANK USA, N.A.', address: '1 HSBC CENTER', city: 'BUFFALO', state: 'NY', zip: '14203', telephone: '716-841-2424' },
  { routing_number: '021272655', customer_name: 'CAPITAL ONE, N.A.', address: '275 BROADHOLLOW RD', city: 'MELVILLE', state: 'NY', zip: '11747', telephone: '631-844-1013' },
  { routing_number: '021300077', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '021502011', customer_name: 'CITIZENS BANK N.A.', address: '1 CITIZENS PLAZA', city: 'PROVIDENCE', state: 'RI', zip: '02903', telephone: '401-456-7000' },
  { routing_number: '021202337', customer_name: 'PNC BANK, N.A.', address: '500 FIRST AVE', city: 'PITTSBURGH', state: 'PA', zip: '15219', telephone: '877-824-5001' },
  { routing_number: '011000015', customer_name: 'FEDERAL RESERVE BANK', address: '25 ELM ST', city: 'BOSTON', state: 'MA', zip: '02106', telephone: '' },
  { routing_number: '011000028', customer_name: 'STATE STREET BANK AND TRUST COMPANY', address: '225 FRANKLIN ST', city: 'BOSTON', state: 'MA', zip: '02110', telephone: '617-786-3000' },
  { routing_number: '011100106', customer_name: 'BANK OF AMERICA, N.A.', address: '100 N TRYON ST', city: 'CHARLOTTE', state: 'NC', zip: '28255', telephone: '800-446-0135' },
  { routing_number: '011900254', customer_name: 'CITIBANK N.A.', address: '1 PENNS WAY', city: 'NEW CASTLE', state: 'DE', zip: '19720', telephone: '302-323-4260' },
  { routing_number: '021000018', customer_name: 'BANK OF NEW YORK MELLON', address: '225 LIBERTY ST', city: 'NEW YORK', state: 'NY', zip: '10286', telephone: '212-495-1784' },
  { routing_number: '021001318', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '4 NEW YORK PLAZA', city: 'NEW YORK', state: 'NY', zip: '10004', telephone: '212-270-6000' },
  { routing_number: '021033205', customer_name: 'DISCOVER BANK', address: '502 E MARKET ST', city: 'GREENWOOD', state: 'DE', zip: '19950', telephone: '302-414-7300' },
  { routing_number: '021040078', customer_name: 'ALLY BANK', address: '1100 VIRGINIA DR', city: 'FORT WASHINGTON', state: 'PA', zip: '19034', telephone: '855-256-2559' },
  { routing_number: '022000046', customer_name: 'MANUFACTURERS AND TRADERS TRUST CO.', address: 'ONE M & T PLAZA', city: 'BUFFALO', state: 'NY', zip: '14203', telephone: '716-842-5445' },
  { routing_number: '031100209', customer_name: 'WELLS FARGO BANK, N.A.', address: '420 MONTGOMERY ST', city: 'SAN FRANCISCO', state: 'CA', zip: '94104', telephone: '800-869-3557' },
  { routing_number: '031176110', customer_name: 'PNC BANK, N.A.', address: '500 FIRST AVE', city: 'PITTSBURGH', state: 'PA', zip: '15219', telephone: '877-824-5001' },
  { routing_number: '031201360', customer_name: 'BANK OF AMERICA, N.A.', address: '100 N TRYON ST', city: 'CHARLOTTE', state: 'NC', zip: '28255', telephone: '800-446-0135' },
  { routing_number: '036076150', customer_name: 'NAVY FEDERAL CREDIT UNION', address: '820 FOLLIN LN', city: 'VIENNA', state: 'VA', zip: '22180', telephone: '888-842-6328' },
  { routing_number: '041000014', customer_name: 'PNC BANK, N.A.', address: '500 FIRST AVE', city: 'PITTSBURGH', state: 'PA', zip: '15219', telephone: '877-824-5001' },
  { routing_number: '041000124', customer_name: 'KEYBANK NATIONAL ASSOCIATION', address: '4900 TIEDEMAN RD', city: 'BROOKLYN', state: 'OH', zip: '44144', telephone: '216-689-3000' },
  { routing_number: '041215032', customer_name: 'HUNTINGTON NATIONAL BANK', address: '41 S HIGH ST', city: 'COLUMBUS', state: 'OH', zip: '43287', telephone: '614-480-2001' },
  { routing_number: '042000013', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '042000314', customer_name: 'U.S. BANK N.A.', address: '425 WALNUT ST', city: 'CINCINNATI', state: 'OH', zip: '45202', telephone: '800-872-2657' },
  { routing_number: '042100175', customer_name: 'FIFTH THIRD BANK', address: '38 FOUNTAIN SQUARE PLZ', city: 'CINCINNATI', state: 'OH', zip: '45263', telephone: '513-579-5300' },
  { routing_number: '043000096', customer_name: 'PNC BANK, N.A.', address: '500 FIRST AVE', city: 'PITTSBURGH', state: 'PA', zip: '15219', telephone: '877-824-5001' },
  { routing_number: '044000037', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '051000017', customer_name: 'BANK OF AMERICA, N.A.', address: '100 N TRYON ST', city: 'CHARLOTTE', state: 'NC', zip: '28255', telephone: '800-446-0135' },
  { routing_number: '051400549', customer_name: 'TRUIST BANK', address: '214 N TRYON ST', city: 'CHARLOTTE', state: 'NC', zip: '28202', telephone: '800-226-5228' },
  { routing_number: '053000196', customer_name: 'TRUIST BANK', address: '214 N TRYON ST', city: 'CHARLOTTE', state: 'NC', zip: '28202', telephone: '800-226-5228' },
  { routing_number: '053000219', customer_name: 'REGIONS BANK', address: '1900 5TH AVE N', city: 'BIRMINGHAM', state: 'AL', zip: '35203', telephone: '800-734-4667' },
  { routing_number: '053100300', customer_name: 'WELLS FARGO BANK, N.A.', address: '420 MONTGOMERY ST', city: 'SAN FRANCISCO', state: 'CA', zip: '94104', telephone: '800-869-3557' },
  { routing_number: '055003201', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '061000052', customer_name: 'BANK OF AMERICA, N.A.', address: '100 N TRYON ST', city: 'CHARLOTTE', state: 'NC', zip: '28255', telephone: '800-446-0135' },
  { routing_number: '061000227', customer_name: 'REGIONS BANK', address: '1900 5TH AVE N', city: 'BIRMINGHAM', state: 'AL', zip: '35203', telephone: '800-734-4667' },
  { routing_number: '061092387', customer_name: 'WELLS FARGO BANK, N.A.', address: '420 MONTGOMERY ST', city: 'SAN FRANCISCO', state: 'CA', zip: '94104', telephone: '800-869-3557' },
  { routing_number: '062000019', customer_name: 'REGIONS BANK', address: '1900 5TH AVE N', city: 'BIRMINGHAM', state: 'AL', zip: '35203', telephone: '800-734-4667' },
  { routing_number: '063000047', customer_name: 'BANK OF AMERICA, N.A.', address: '100 N TRYON ST', city: 'CHARLOTTE', state: 'NC', zip: '28255', telephone: '800-446-0135' },
  { routing_number: '063100277', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '064000017', customer_name: 'REGIONS BANK', address: '1900 5TH AVE N', city: 'BIRMINGHAM', state: 'AL', zip: '35203', telephone: '800-734-4667' },
  { routing_number: '065000090', customer_name: 'REGIONS BANK', address: '1900 5TH AVE N', city: 'BIRMINGHAM', state: 'AL', zip: '35203', telephone: '800-734-4667' },
  { routing_number: '067011140', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '071000013', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '071025661', customer_name: 'BMO HARRIS BANK N.A.', address: '111 W MONROE ST', city: 'CHICAGO', state: 'IL', zip: '60603', telephone: '888-340-2265' },
  { routing_number: '071000505', customer_name: 'NORTHERN TRUST COMPANY', address: '50 S LASALLE ST', city: 'CHICAGO', state: 'IL', zip: '60675', telephone: '312-630-6000' },
  { routing_number: '072000326', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '073000545', customer_name: 'WELLS FARGO BANK, N.A.', address: '420 MONTGOMERY ST', city: 'SAN FRANCISCO', state: 'CA', zip: '94104', telephone: '800-869-3557' },
  { routing_number: '074000010', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '075000019', customer_name: 'BMO HARRIS BANK N.A.', address: '111 W MONROE ST', city: 'CHICAGO', state: 'IL', zip: '60603', telephone: '888-340-2265' },
  { routing_number: '081000045', customer_name: 'U.S. BANK N.A.', address: '425 WALNUT ST', city: 'CINCINNATI', state: 'OH', zip: '45202', telephone: '800-872-2657' },
  { routing_number: '082000073', customer_name: 'BANK OF AMERICA, N.A.', address: '100 N TRYON ST', city: 'CHARLOTTE', state: 'NC', zip: '28255', telephone: '800-446-0135' },
  { routing_number: '083000137', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '091000019', customer_name: 'WELLS FARGO BANK, N.A.', address: '420 MONTGOMERY ST', city: 'SAN FRANCISCO', state: 'CA', zip: '94104', telephone: '800-869-3557' },
  { routing_number: '091300023', customer_name: 'U.S. BANK N.A.', address: '425 WALNUT ST', city: 'CINCINNATI', state: 'OH', zip: '45202', telephone: '800-872-2657' },
  { routing_number: '101000019', customer_name: 'COMMERCE BANK', address: '1000 WALNUT ST', city: 'KANSAS CITY', state: 'MO', zip: '64106', telephone: '816-234-2000' },
  { routing_number: '101000695', customer_name: 'U.S. BANK N.A.', address: '425 WALNUT ST', city: 'CINCINNATI', state: 'OH', zip: '45202', telephone: '800-872-2657' },
  { routing_number: '103000648', customer_name: 'BANK OF OKLAHOMA, N.A.', address: '1 WILLIAMS CENTER', city: 'TULSA', state: 'OK', zip: '74172', telephone: '918-588-6000' },
  { routing_number: '107005047', customer_name: 'COMERICA BANK', address: '411 W LAFAYETTE BLVD', city: 'DETROIT', state: 'MI', zip: '48226', telephone: '800-925-2160' },
  { routing_number: '111000025', customer_name: 'BANK OF AMERICA, N.A.', address: '100 N TRYON ST', city: 'CHARLOTTE', state: 'NC', zip: '28255', telephone: '800-446-0135' },
  { routing_number: '111900659', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '112000066', customer_name: 'WELLS FARGO BANK, N.A.', address: '420 MONTGOMERY ST', city: 'SAN FRANCISCO', state: 'CA', zip: '94104', telephone: '800-869-3557' },
  { routing_number: '113000023', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '113024588', customer_name: 'USAA FEDERAL SAVINGS BANK', address: '10750 MCDERMOTT FWY', city: 'SAN ANTONIO', state: 'TX', zip: '78288', telephone: '800-531-8722' },
  { routing_number: '114000093', customer_name: 'BANK OF AMERICA, N.A.', address: '100 N TRYON ST', city: 'CHARLOTTE', state: 'NC', zip: '28255', telephone: '800-446-0135' },
  { routing_number: '114924742', customer_name: 'WELLS FARGO BANK, N.A.', address: '420 MONTGOMERY ST', city: 'SAN FRANCISCO', state: 'CA', zip: '94104', telephone: '800-869-3557' },
  { routing_number: '121000248', customer_name: 'WELLS FARGO BANK, N.A.', address: '420 MONTGOMERY ST', city: 'SAN FRANCISCO', state: 'CA', zip: '94104', telephone: '800-869-3557' },
  { routing_number: '121000358', customer_name: 'BANK OF AMERICA, N.A.', address: '100 N TRYON ST', city: 'CHARLOTTE', state: 'NC', zip: '28255', telephone: '800-446-0135' },
  { routing_number: '121042882', customer_name: 'WELLS FARGO BANK, N.A.', address: '420 MONTGOMERY ST', city: 'SAN FRANCISCO', state: 'CA', zip: '94104', telephone: '800-869-3557' },
  { routing_number: '121100782', customer_name: 'SYNCHRONY BANK', address: '170 W ELECTION RD', city: 'DRAPER', state: 'UT', zip: '84020', telephone: '866-419-4096' },
  { routing_number: '121140218', customer_name: 'U.S. BANK N.A.', address: '425 WALNUT ST', city: 'CINCINNATI', state: 'OH', zip: '45202', telephone: '800-872-2657' },
  { routing_number: '121202211', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '122000247', customer_name: 'WELLS FARGO BANK, N.A.', address: '420 MONTGOMERY ST', city: 'SAN FRANCISCO', state: 'CA', zip: '94104', telephone: '800-869-3557' },
  { routing_number: '122000661', customer_name: 'BANK OF THE WEST', address: '180 MONTGOMERY ST', city: 'SAN FRANCISCO', state: 'CA', zip: '94104', telephone: '800-488-2265' },
  { routing_number: '122100024', customer_name: 'BANK OF AMERICA, N.A.', address: '100 N TRYON ST', city: 'CHARLOTTE', state: 'NC', zip: '28255', telephone: '800-446-0135' },
  { routing_number: '122105155', customer_name: 'CHARLES SCHWAB BANK', address: '211 MAIN ST', city: 'SAN FRANCISCO', state: 'CA', zip: '94105', telephone: '800-435-4000' },
  { routing_number: '122235821', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '122242597', customer_name: 'WEBSTER BANK, N.A.', address: '145 BANK STREET', city: 'WATERBURY', state: 'CT', zip: '06702', telephone: '888-932-7837' },
  { routing_number: '122400724', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '123002011', customer_name: 'WELLS FARGO BANK, N.A.', address: '420 MONTGOMERY ST', city: 'SAN FRANCISCO', state: 'CA', zip: '94104', telephone: '800-869-3557' },
  { routing_number: '124003116', customer_name: 'ZIONS BANCORPORATION N.A.', address: 'ONE SOUTH MAIN ST', city: 'SALT LAKE CITY', state: 'UT', zip: '84133', telephone: '801-974-8800' },
  { routing_number: '125000024', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '253177049', customer_name: 'NAVY FEDERAL CREDIT UNION', address: '820 FOLLIN LN', city: 'VIENNA', state: 'VA', zip: '22180', telephone: '888-842-6328' },
  { routing_number: '256074974', customer_name: 'NAVY FEDERAL CREDIT UNION', address: '820 FOLLIN LN', city: 'VIENNA', state: 'VA', zip: '22180', telephone: '888-842-6328' },
  { routing_number: '267084131', customer_name: 'NAVY FEDERAL CREDIT UNION', address: '820 FOLLIN LN', city: 'VIENNA', state: 'VA', zip: '22180', telephone: '888-842-6328' },
  { routing_number: '271972572', customer_name: 'GOLDMAN SACHS BANK USA', address: '200 WEST STREET', city: 'NEW YORK', state: 'NY', zip: '10282', telephone: '212-902-1000' },
  { routing_number: '322271627', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
  { routing_number: '325070760', customer_name: 'JPMORGAN CHASE BANK, N.A.', address: '1111 POLARIS PKWY', city: 'COLUMBUS', state: 'OH', zip: '43240', telephone: '614-248-3675' },
];

export const getBankNameByRoutingNumber = async (routingNumber) => {
  try {
    const local = US_BANK_DATA.find(b => b.routing_number === routingNumber);
    if (local) return { bankName: local.customer_name };

    const res = await axios.get(ROUTING_API, {
      params: { rn: routingNumber },
      timeout: 4000,
    });
    const bankName = (res?.data?.customer_name ?? '').toString().trim();
    if (!bankName) return { bankName: null };

    return { bankName };
  } catch (error) {
    console.error(error?.message);
    return { bankName: null };
  }
};

export const getBankDetailsByRoutingNumber = async (routingNumber) => {
  const local = US_BANK_DATA.find(b => b.routing_number === routingNumber);
  if (local) return normalizeBankData(local);

  try {
    const res = await axios.get(ROUTING_API, {
      params: { rn: routingNumber },
      timeout: 4000,
    });
    const data = res?.data;
    const bankName = (data?.customer_name ?? '').toString().trim();
    if (!bankName) return null;

    return normalizeBankData(data);
  } catch (error) {
    console.error('getBankDetailsByRoutingNumber error:', error?.message);
    return null;
  }
};

export const searchBanksByName = async (name) => {
  const lower = name.toLowerCase();
  const seen = new Set();
  const results = US_BANK_DATA.filter(b => {
    if (!b.customer_name.toLowerCase().includes(lower)) return false;
    const key = `${b.customer_name}|${b.routing_number}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return results.slice(0, 10).map(normalizeBankData);
};
