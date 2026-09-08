import {
  checksCollection,
  qbChecksCollection,
  quickbooksmappingsCollection,
  IQuickBooksMapping,
  IQbCheck,
} from '../models/dbCollections';
import { QUICKBOOKS_ENTITY_TYPE } from '../enums/quickboos.enum';
import { getNextAvailableCheckNumber } from './checks.service';
import { QuickbooksService } from './quickbooks.services';

export class QuickbooksMappingService {
  static async insertQuickbookMappedProfile(
    ownerType: string,
    ownerId: string,
    entityType: string,
    quickbooksId: string,
    quickbooksName: string,
    accountId: string,
    rawData: any
  ): Promise<IQuickBooksMapping> {
    return await quickbooksmappingsCollection
      .findOneAndUpdate(
        { ownerType, ownerId, entityType, quickbooksId },
        {
          $setOnInsert: {
            ownerId: ownerId,
            ownerType: ownerType,
            entityType: entityType,
            quickbooksId: quickbooksId,
            quickbooksName: quickbooksName,
            quickbooksAccountId: accountId,
            rawData: rawData,
          },
        },
        { upsert: true, new: true }
      )
      .lean();
  }

  static async setQuickbookProfileMapping(
    ownerType: string,
    ownerId: string,
    entityType: string,
    quickbooksId: string,
    internalId: string
  ): Promise<IQuickBooksMapping> {
    const profile = await quickbooksmappingsCollection
      .findOneAndUpdate(
        { ownerType, ownerId, entityType, quickbooksId },
        {
          $set: {
            internalId: internalId,
          },
        },
        { upsert: true, new: true }
      )
      .lean();

    await this.updateQbCheckMapsMapping(
      profile.ownerType,
      profile.ownerId,
      profile.entityType,
      profile.quickbooksId
    );

    return profile;
  }

  static async updateQbCheckMapsMapping(
    ownerType: string,
    ownerId: string,
    entityType: string,
    quickbooksId: string
  ) {
    const qbQuery: any = {
      ownerType,
      ownerId,
      status: 'pending',
    };
    if (entityType === QUICKBOOKS_ENTITY_TYPE.PAYEE) {
      qbQuery.payeeQuickBooksId = quickbooksId;
    } else {
      qbQuery.bankQuickBooksId = quickbooksId;
    }

    const pendingChecks = await qbChecksCollection.find(qbQuery).lean();
    for (const chk of pendingChecks) {
      const payeeMap = await quickbooksmappingsCollection.findOne({
        ownerType,
        ownerId,
        entityType: QUICKBOOKS_ENTITY_TYPE.PAYEE,
        quickbooksId: chk.payeeQuickBooksId,
        internalId: { $ne: null },
      });
      const bankMap = await quickbooksmappingsCollection.findOne({
        ownerType,
        ownerId,
        entityType: QUICKBOOKS_ENTITY_TYPE.BANK,
        quickbooksId: chk.bankQuickBooksId,
        internalId: { $ne: null },
      });

      if (payeeMap && bankMap) {
        const updatedChk = await qbChecksCollection
          .findOneAndUpdate(
            { _id: chk._id },
            { $set: { status: 'ready', updatedAt: new Date() } },
            { new: true }
          )
          .lean();

        if (updatedChk) {
          await this.updateCreateInternalCheck(updatedChk);
        }
      }
    }
  }

  static async updateCreateInternalCheck(qbCheck: IQbCheck & { _id?: string }) {
    const {
      ownerId,
      ownerType,
      amount,
      memo,
      payeeQuickBooksId,
      bankQuickBooksId,
      realmId,
      rawData,
      _id,
    } = qbCheck;
    const payeeMapping = await quickbooksmappingsCollection
      .findOne({
        ownerType,
        ownerId,
        entityType: QUICKBOOKS_ENTITY_TYPE.PAYEE,
        quickbooksId: payeeQuickBooksId,
      })
      .lean();
    const bankMapping = await quickbooksmappingsCollection
      .findOne({
        ownerType,
        ownerId,
        entityType: QUICKBOOKS_ENTITY_TYPE.BANK,
        quickbooksId: bankQuickBooksId,
      })
      .lean();
    if (payeeMapping && bankMapping) {
      const existingCheck = await checksCollection.findOne({
        ownerId,
        ownerType,
        qbCheckId: _id,
      });

      if (existingCheck) {
        await checksCollection.updateOne(
          { _id: existingCheck._id },
          {
            $set: {
              amount,
              memo,
              bankId: bankMapping.internalId,
              payeeId: payeeMapping.internalId,
              issuedDate: rawData.MetaData.CreateTime,
            },
          }
        );
      } else {
        const checkNumber = await getNextAvailableCheckNumber(
          ownerId,
          ownerType,
          bankMapping.internalId
        );
        const newCheck = await checksCollection.findOneAndUpdate(
          { ownerId, ownerType, qbCheckId: _id },
          {
            $set: {
              amount,
              memo,
              bankId: bankMapping.internalId,
              payeeId: payeeMapping.internalId,
              issuedDate: rawData.MetaData.CreateTime,
              qbCheckId: _id,
              checkNumber,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );

        await qbChecksCollection.findOneAndUpdate(
          { ownerId, ownerType, _id },
          {
            $set: {
              checkId: newCheck._id,
            },
          }
        );

        await QuickbooksService.updateQbCheckId(
          ownerId,
          ownerType,
          realmId,
          rawData.Id,
          checkNumber
        );
      }
    }
  }
}
