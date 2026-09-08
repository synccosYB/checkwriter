import path from 'path';
import fs from 'fs/promises';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import { sendEmail } from '../send-grid.util.js';
import numberToWords from 'number-to-words';
import axios from 'axios';
import { execSync } from 'child_process';

const getChromiumPath = () => {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }
  try {
    const resolvedPath = execSync('which chromium', { encoding: 'utf-8' }).trim();
    if (resolvedPath) return resolvedPath;
  } catch {}
  try {
    const resolvedPath = execSync('which chromium-browser', { encoding: 'utf-8' }).trim();
    if (resolvedPath) return resolvedPath;
  } catch {}
  return undefined;
};
import {
  organizationCollection,
  usersCollection,
} from '../../models/dbCollections.js';
import { checkLockIcon } from '../../constants/index.js';
import { removeSpaces } from '../../services/banks.service.js';
import { getBankSignatureUrl, getSignatureBase64 } from '../signature.util.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

handlebars.registerHelper('formatAmount', function (amount) {
  if (typeof amount !== 'number') return ''; // Handle non-numeric amounts
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
});

handlebars.registerHelper('formatAmountInWords', function (amount) {
  if (typeof amount !== 'number') return '';

  const wholeNumber = Math.floor(amount);
  const decimalPart = Math.round((amount - wholeNumber) * 100);

  const words = numberToWords.toWords(wholeNumber).replaceAll('-', ' ');
  const decimalWords = numberToWords.toWords(decimalPart).replaceAll('-', ' ');

  const capitalizeWords = (str) =>
    str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return `${capitalizeWords(words)} and ${capitalizeWords(decimalWords)} Cents`;
});

handlebars.registerHelper('formatDate', function (date) {
  if (!date) return '';
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
});

handlebars.registerHelper('formatDateLong', function (date) {
  if (!date) return '';
  const d = new Date(date);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return d.toLocaleDateString('en-US', options).replace(',', ' ,');
});

const loadTemplate = async (templateName) => {
  const templatePath = path.join(
    __dirname,
    '..',
    '..',
    'templates',
    'checkEmail',
    `${templateName}.hbs`
  );
  try {
    return await fs.readFile(templatePath, 'utf8');
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    throw new Error(`Template file ${templateName} not found`);
  }
};

export const compileWrapperTemplate = async (content) => {
  try {
    const wrapperTemplateContent = await loadTemplate('checkWrapper.template');
    const wrapperTemplate = handlebars.compile(wrapperTemplateContent);
    return wrapperTemplate({ content });
  } catch (err) {
    console.error('ERROR IN WRAPPER', err);
    throw err;
  }
};

export const compileTemplate = async (check) => {
  try {
    const templateContent = await loadTemplate('checkNew.template');
    const template = handlebars.compile(templateContent);

    // Ensure all necessary properties are present in the 'check' object
    const populatedCheck = {
      logo: check.organization?.organizationLogo,
      address: check.payee.address || {},
      payee: check.payee || {},
      bank:
        {
          ...check.bank,
          bankRoutingNumber: check?.bank?.bankRoutingNumber
            ? check?.bank?.bankRoutingNumber
            : check?.bank?.bankTransitNumber,
        } || {},
      amount: check.amount || 0,
      memo: check.memo || '',
      issuedDate: check.issuedDate || new Date(),
      checkNumber:
        generateCheckNumber({
          bankInfo: check?.bank?.bankPreferences,
          checkNumber: check?.checkNumber,
        }) || '',
      userData: check.userData || {},
      isSignatureSelected: check.isSignatureSelected || false,
      signImagestr: check.signImagestr || '',
      checkLockIcon: checkLockIcon || '', // Ensure checkLockIcon exists
      signatureUrl: await getBankSignatureUrl({
        bankId: check.bankId,
        bankPreferences: check?.bank?.bankPreferences,
        ownerType: check.ownerType,
        ownerId: check.ownerType === 'user' ? check.userId : check.ownerId,
        defaultOwnerId:
          check.ownerType === 'user' ? check.userId : check.ownerId,
      }),
    };
    return template(populatedCheck);
  } catch (error) {
    console.error('Error compiling template:', error);
    throw error;
  }
};

export const compileBlankTemplate = async (check) => {
  try {
    const templateContent = await loadTemplate('checkNew.template');
    const template = handlebars.compile(templateContent);

    const populatedCheck = {
      logo: check.organization?.organizationLogo,
      address: {},
      payee: {},
      bank:
        {
          ...check.bank,
          bankRoutingNumber: check?.bank?.bankRoutingNumber
            ? check?.bank?.bankRoutingNumber
            : check?.bank?.bankTransitNumber,
        } || {},
      amount: '',
      memo: '',
      issuedDate: '',
      checkNumber:
        generateCheckNumber({
          bankInfo: check?.bank?.bankPreferences,
          checkNumber: check?.checkNumber,
        }) || '',
      userData: check.userData || {},
      isSignatureSelected: check.isSignatureSelected || false,
      signImagestr: check.signImagestr || '',
      checkLockIcon: checkLockIcon || '',
      signatureUrl: await getBankSignatureUrl({
        bankId: check.bankId,
        bankPreferences: check?.bank?.bankPreferences,
        ownerType: check.ownerType,
        ownerId: check.ownerType === 'user' ? check.userId : check.ownerId,
        defaultOwnerId:
          check.ownerType === 'user' ? check.userId : check.ownerId,
      }),
    };

    return template(populatedCheck);
  } catch (error) {
    console.error('Error compiling template:', error);
    throw error;
  }
};

export const generatePDFBuffer = async (htmlContent) => {
  try {
    const { chromium } = await import('playwright');
    const executablePath = getChromiumPath();
    const browser = await chromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: 'networkidle' });

    await page.waitForTimeout(1000);

    const pdfData = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
      },
    });

    await browser.close();
    return Buffer.from(pdfData);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const emailPdf = async ({ email, attachments, content, subject }) => {
  try {
    const payload = {
      to: `${email}`,
      from: 'no-reply@synccos.com',
      subject: subject || 'Synccos Check Writer Check',
      html: content || `<p></p>`,
      attachments,
    };

    return await sendEmail(payload);
  } catch (error) {
    console.error('error in email pdf', error);
    throw new Error(error);
  }
};

export const getBase64StringFromSignatureUrl = async ({
  ownerId,
  ownerType,
}) => {
  try {
    // Get the owner's signature attachment ID
    const owner =
      ownerType === 'user'
        ? await usersCollection
            .findById(ownerId, { signatureAttachmentId: 1 })
            .lean()
        : await organizationCollection
            .findById(ownerId, { signatureAttachmentId: 1 })
            .lean();

    if (!owner?.signatureAttachmentId) {
      return '';
    }

    return await getSignatureBase64({
      signatureAttachmentId: owner.signatureAttachmentId,
      ownerType,
      ownerId,
    });
  } catch (err) {
    console.error('Error fetching signature image:', err);
    return '';
  }
};

const generateCheckNumber = ({ bankInfo, checkNumber }) => {
  return checkNumber
    .toString()
    .padStart(bankInfo?.defaultCheckNumberLength ?? 6, '0');
};
