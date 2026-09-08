import moment from 'moment';
import { checksCollection, mailedChecksCollection, usersCollection } from '../models/dbCollections';
import { IMailedCheck, IMailedCheckPopulated } from '../types/models/mail.type';
import { sendUserCheckSubmissionEmailTemplate } from '../utils/emailTemplate/sendUserCheckSubmissionEmailTemplate';
import { sendEmail } from '../utils/send-grid.util';
import config from 'config';
import { sendUserCheckMailedEmailTemplate } from '../utils/emailTemplate/sendUserCheckMailedEmailTemplate';
import { sendAdminNewSubmissionEmailTemplate } from '../utils/emailTemplate/sendAdminNewSubmissionEmailTemplate';
import { sendAdminPendingChecksEmailTemplate } from '../utils/emailTemplate/sendAdminPendingChecksEmailTemplate';
import { OwnerType } from '../enums/user.enum';
import { validateUserOrganization } from '../models/users.model';

const DEFAULT_FROM = 'no-reply@synccos.com';
const {
  admin: { email: adminEmail },
} = config;

export class CheckMailingEmailService {
  private static fromAddress = DEFAULT_FROM;

  private static async dispatch(
    recipients: string | string[],
    subject: string,
    html: string
  ) {
    const list = Array.isArray(recipients) ? recipients : [recipients];
    await Promise.all(
      list.map((to) => sendEmail({ to, from: this.fromAddress, subject, html }))
    );
  }

  static async sendUserCheckSubmissionEmail(
    ownerId: string,
    ownerType: OwnerType,
    requestById: string,
    mailed_checks: string[]
  ) {
    const user = await usersCollection.findOne({ _id: requestById }).lean();
    if (!user) {
      console.warn(`User not found for ownerId ${ownerId}`);
      return null;
    }
    if (!mailed_checks?.length) {
      console.warn('No mailed checks provided to sendUserCheckSubmissionEmail');
      return;
    }

    if (ownerType === OwnerType.ORGANIZATION) {
      const org = await validateUserOrganization(ownerId, requestById);
      if (!org) {
        console.warn(`Organization not found for ownerId ${ownerId}`);
        return null;
      }
    }

    const docs: IMailedCheckPopulated[] = await mailedChecksCollection
      .find({
        _id: { $in: mailed_checks },
        ownerId,
        ownerType,
        requestedBy: requestById,
      })
      .populate({
        path: 'checkId',
        select: 'checkNumber amount payeeId',
        model: 'checks',
        populate: {
          path: 'payeeId',
          select: 'name',
          model: 'payees',
          options: { lean: true },
        },
      })
      .lean();

    const checksData = docs.map((doc) => ({
      checkNumber: doc.checkId.checkNumber,
      amount: doc.checkId.amount,
      payeeName: `${doc.checkId.payeeId.name}`,
    }));

    const template = sendUserCheckSubmissionEmailTemplate(
      `${user.firstName} ${user.lastName}`,
      checksData
    );

    const subject = 'Check Submission Confirmation';

    await this.dispatch(user.email, subject, template);
  }

  static async sendUserCheckMailedEmail(mailed_checks: string[]) {
    console.info('Sending user check mailed email for:', mailed_checks);
    if (!mailed_checks?.length) {
      console.warn('No mailCheckIds provided to sendRequesterMailingSummary');
      return;
    }

    const docs: IMailedCheckPopulated[] = await mailedChecksCollection
      .find({ _id: { $in: mailed_checks } })
      .populate({
        path: 'checkId',
        select: 'checkNumber amount payeeId',
        model: 'checks',
        populate: {
          path: 'payeeId',
          select: 'name',
          model: 'payees',
          options: { lean: true },
        },
      })
      .lean();
    if (!docs.length) {
      console.warn(
        `No mailed checks found for IDs: ${mailed_checks.join(', ')}`
      );
      return;
    }

    const ownerMap = docs.reduce((acc, doc) => {
      const key = `${doc.ownerType}:${doc.ownerId}`;
      acc[key] = acc[key] || [];
      acc[key].push(doc);
      return acc;
    }, {} as Record<string, typeof docs>);
    for (const groupDocs of Object.values(ownerMap)) {
      const reqMap = groupDocs.reduce((acc, doc) => {
        if(!doc.requestedBy) {
          return acc;
        }
        const rid = doc.requestedBy.toString();
        acc[rid] = acc[rid] || [];
        acc[rid].push(doc);
        return acc;
      }, {} as Record<string, typeof docs>);
      for (const [reqId, reqDocs] of Object.entries(reqMap)) {
        const requester = await usersCollection.findOne({ _id: reqId }).lean();
        if (!requester) {
          console.warn(`Requester user not found: ${reqId}`);
          continue;
        }

        const checksData = docs.map((doc) => ({
          checkNumber: doc.checkId.checkNumber,
          amount: doc.checkId.amount,
          payeeName: `${doc.checkId.payeeId.name}`,
          mailedDate: moment().format('YYYY-MM-DD'),
        }));

        console.info(`Checks data:`, checksData);

        const template = sendUserCheckMailedEmailTemplate(
          `${requester.firstName} ${requester.lastName}`,
          checksData
        );

        const subject = 'Your Requested Checks Have Been Mailed';

        await this.dispatch(requester.email, subject, template);
      }
    }
  }

  static async sendAdminNewSubmissionEmail(
    ownerId: string,
    ownerType: OwnerType,
    requestById: string,
    mailed_checks: string[]
  ) {
    const user = await usersCollection.findOne({ _id: requestById }).lean();
    if (!user) {
      console.warn(`User not found for ownerId ${ownerId}`);
      return null;
    }
    if (!mailed_checks?.length) {
      console.warn('No mailed checks provided to sendAdminNewSubmissionEmail');
      return;
    }
    if (ownerType === OwnerType.ORGANIZATION) {
      const org = await validateUserOrganization(ownerId, requestById);
      if (!org) {
        console.warn(`Organization not found for ownerId ${ownerId}`);
        return null;
      }
    }

    const docs: IMailedCheckPopulated[] = await mailedChecksCollection
      .find({ _id: { $in: mailed_checks }, ownerId, ownerType, requestedBy: requestById })
      .populate({
        path: 'checkId',
        select: 'checkNumber amount payeeId',
        model: 'checks',
        populate: {
          path: 'payeeId',
          select: 'name',
          model: 'payees',
          options: { lean: true },
        },
      })
      .lean();

    const checksData = docs.map((doc) => ({
      checkNumber: doc.checkId.checkNumber,
      amount: doc.checkId.amount,
      payeeName: `${doc.checkId.payeeId.name}`,
    }));

    const subject = 'New Check Submission Alert';

    for (const email of adminEmail) {
      const template = sendAdminNewSubmissionEmailTemplate(
        email,
        `${user.firstName} ${user.lastName}`,
        user.email,
        moment().format('YYYY-MM-DD'),
        checksData
      );
      await this.dispatch(email, subject, template);
    }
  }

  static async sendAdminProcessingDelayAlert() {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const delayedChecks = await mailedChecksCollection
      .find({ status: 'Processing', processedAt: { $lt: twoHoursAgo } })
      .lean();

    if (!delayedChecks.length) {
      console.info('No delayed processing checks found');
      return;
    }

    const subject = 'Processing Delay Alert';
    const html = `The following checks have been processing for over 2 hours: ${delayedChecks
      .map((c) => c._id)
      .join(', ')}.`;

    for (const email of adminEmail) {
      await this.dispatch(email, subject, html);
    }
  }

  static async sendAdminScheduledJobStaleAlert(
    staleJobs: Array<{
      jobName: string;
      lastSuccessAt: Date | null;
      ageMs: number | null;
      thresholdMs: number;
    }>
  ) {
    if (!staleJobs.length) {
      console.info('[scheduled-job-watchdog] No stale jobs to alert about');
      return;
    }

    const subject = `Scheduled Job Watchdog Alert: ${staleJobs.length} job(s) overdue`;
    const rows = staleJobs
      .map((j) => {
        const last = j.lastSuccessAt
          ? j.lastSuccessAt.toISOString()
          : 'never recorded';
        const age =
          j.ageMs == null
            ? 'unknown'
            : `${Math.round(j.ageMs / 60000)} minutes`;
        const threshold = `${Math.round(j.thresholdMs / 60000)} minutes`;
        return `<li><strong>${j.jobName}</strong> — last success: ${last} (age: ${age}, threshold: ${threshold})</li>`;
      })
      .join('');
    const html = `
      <p>The scheduled-job watchdog detected jobs whose most recent successful run is older than the configured safety threshold. The external scheduler may be paused, misconfigured, or otherwise unable to reach the API.</p>
      <ul>${rows}</ul>
      <p>Please verify the scheduler (GitHub Actions workflow, deployment cron, etc.) and the SCHEDULED_JOB_SECRET configuration.</p>
    `;

    for (const email of adminEmail) {
      await this.dispatch(email, subject, html);
    }
  }

  static async sendAdminPendingChecksEmail() {
    const submittedChecks: IMailedCheckPopulated[] =
      await mailedChecksCollection
        .find({ status: 'Submitted' })
        .populate({
          path: 'checkId',
          select: 'checkNumber amount payeeId',
          model: 'checks',
          populate: {
            path: 'payeeId',
            select: 'name',
            model: 'payees',
            options: { lean: true },
          },
        })
        .lean();

    if (!submittedChecks.length) {
      console.info('No pending checks found');
      return;
    }

    const checksData = [];

    for (const check of submittedChecks) {
      const submittedBy = await usersCollection
        .findOne({ _id: check.requestedBy })
        .lean();
      if (!submittedBy) {
        console.warn(`User not found for requestedBy ${check.requestedBy}`);
        continue;
      }
      checksData.push({
        checkNumber: check.checkId.checkNumber,
        amount: check.checkId.amount,
        submittedBy: `${submittedBy.firstName} ${submittedBy.lastName}`,
        mailedData: moment(check.mailedAt).format('YYYY-MM-DD'),
      });
    }

    const subject = 'Processing Delay Alert';

    for (const email of adminEmail) {
      const template = sendAdminPendingChecksEmailTemplate(email, checksData);
      await this.dispatch(email, subject, template);
    }
  }
}
