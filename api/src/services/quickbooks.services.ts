import OAuthClient from 'intuit-oauth';
import config from 'config';
import QuickBooks from 'node-quickbooks';
import {
  qbChecksCollection,
  quickBooksAccountDetailsCollection,
} from '../models/dbCollections';
import { IQuickbook } from '../types/models/quickbook.type';
import { OwnerType } from '../enums/user.enum';
import { QUICKBOOKS_ENTITY_TYPE } from '../enums/quickboos.enum';
import { QuickbooksMappingService } from './quickbooksMapping.service';

const oauthClient = new OAuthClient({
  clientId: config.qbo.client_id,
  clientSecret: config.qbo.client_secret,
  environment: config.qbo.environment || 'sandbox',
  redirectUri: config.qbo.redirect_uri,
});

export interface IResponse {
  isActive: boolean;
}

type QboEntity = {
  id: string;
  name: string;
  operation: string;
  lastUpdated: Date;
  realmId: string;
};

export interface QboTokenJson {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  realmId: string;
  x_refresh_token_expires_in: number;
  token_type: number;
  [key: string]: any;
}

export class QuickbooksService {
  static getAuthorizeUri(): string {
    return oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting],
      state: 'intuit',
    });
  }

  /**
   * Exchange the callback URL for tokens
   * and upsert them into Mongo.
   */
  static async createOrUpdateToken(
    fullUrl: string,
    userId: string,
    organizationId?: string
  ): Promise<IResponse> {
    const authResponse = await oauthClient.createToken(fullUrl);
    const json = authResponse.getJson() as QboTokenJson;
    json.realmId = oauthClient.getToken().realmId;

    const accessTokenExpiresAt = new Date(Date.now() + json.expires_in * 1_000);
    const refreshTokenExpiresAt = new Date(
      Date.now() + (json.x_refresh_token_expires_in ?? 0) * 1_000
    );

    const ownerId = organizationId ? organizationId : userId;
    const ownerType = organizationId ? OwnerType.ORGANIZATION : OwnerType.USER;

    const response = await quickBooksAccountDetailsCollection.findOneAndUpdate(
      { ownerId, ownerType },
      {
        $set: {
          ownerId,
          ownerType,
          isActive: true,
          accessToken: json.access_token,
          refreshToken: json.refresh_token,
          realmId: json.realmId,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
          updatedAt: new Date(),
          x_refresh_token_expires_in: json.x_refresh_token_expires_in,
          expires_in: json.expires_in,
          token_type: json.token_type,
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return { isActive: response?.isActive || false };
  }

  static async getUserQuickbooksDetail(
    userId: string,
    ownerType: OwnerType
  ): Promise<IResponse> {
    const token = await this.loadTokens(userId, ownerType);

    return { isActive: token?.isActive || false };
  }

  static async removeUserQuickbooksDetail(
    ownerId: string,
    ownerType: OwnerType
  ): Promise<boolean> {
    const record = await quickBooksAccountDetailsCollection.findOne({
      ownerId,
      ownerType,
    });
    if (!record) return false;

    const sameRelmAccounts =
      await quickBooksAccountDetailsCollection.countDocuments({
        realmId: record.realmId,
        isActive: true,
      });

    if (sameRelmAccounts <= 1) {
      try {
        await oauthClient.revoke({
          token: record.refreshToken,
          tokenTypeHint: 'refresh_token',
        });
      } catch (revokeErr) {}
    }

    const result = await quickBooksAccountDetailsCollection.findOneAndUpdate(
      { ownerId, ownerType },
      {
        $set: { isActive: false, updatedAt: new Date() },
      },
      { new: true }
    );
    return !!result;
  }

  static getLatestQboEvents(payload: any): QboEntity[] {
    const notifications = Array.isArray(payload.eventNotifications)
      ? payload.eventNotifications
      : [];

    // flatten relevant entities
    const allEntities: QboEntity[] = [];
    for (const n of notifications) {
      const realmId = n.realmId;
      const entities = n.dataChangeEvent?.entities || [];
      for (const ent of entities) {
        if (
          (ent.name === 'Purchase' || ent.name === 'Check') &&
          (ent.operation === 'Create' || ent.operation === 'Update')
        ) {
          allEntities.push({
            id: ent.id,
            name: ent.name,
            operation: ent.operation,
            lastUpdated: new Date(ent.lastUpdated),
            realmId,
          });
        }
      }
    }

    // dedupe by key, keeping latest timestamp
    const map: Record<string, QboEntity> = {};
    for (const evt of allEntities) {
      const key = `${evt.name}_${evt.id}`;
      const existing = map[key];
      if (!existing || existing.lastUpdated < evt.lastUpdated) {
        map[key] = evt;
      }
    }
    return Object.values(map);
  }

  static async insertLatestEvents(qboEvents: QboEntity[]): Promise<boolean> {
    for (const evnt of qboEvents) {
      const accounts = await quickBooksAccountDetailsCollection.find({
        realmId: evnt.realmId,
        isActive: true,
      });

      for (const acc of accounts) {
        const validAcc = await this.loadTokens(
          acc.ownerId as string,
          acc.ownerType
        );
        if (!validAcc) {
          // connection is inactive or tokens couldn’t refresh
          continue;
        }

        const qb = new QuickBooks(
          config.qbo.client_id,
          config.qbo.client_secret,
          acc.accessToken,
          false, // no legacy token
          acc.realmId,
          config.qbo.environment === 'sandbox', //useSandbox
          true, //debug
          null, // minorversion
          '2.0', // oauth version
          acc.refreshToken
        );
        const record: any = await new Promise((resolve, reject) => {
          const cb = (err: any, data: any) =>
            err ? reject(err) : resolve(data);
          if (evnt.name === 'Purchase') {
            qb.getPurchase(evnt.id, cb);
          } else {
            return reject(new Error(`Unsupported entity ${evnt.name}`));
          }
        });

        if (!record.DocNumber) {
          const vendorDetails = await new Promise((resolve, reject) => {
            qb.getVendor(record.EntityRef.value, (err: any, data: any) =>
              err ? reject(err) : resolve(data)
            );
          });

          const bankDetails = await new Promise((resolve, reject) => {
            qb.getAccount(record.AccountRef.value, (err: any, data: any) =>
              err ? reject(err) : resolve(data)
            );
          });

          const mappedPayee =
            await QuickbooksMappingService.insertQuickbookMappedProfile(
              acc.ownerType,
              acc.ownerId as string,
              QUICKBOOKS_ENTITY_TYPE.PAYEE,
              record.EntityRef.value,
              record.EntityRef.name,
              acc._id,
              vendorDetails
            );

          const mappedBank =
            await QuickbooksMappingService.insertQuickbookMappedProfile(
              acc.ownerType,
              acc.ownerId as string,
              QUICKBOOKS_ENTITY_TYPE.BANK,
              record.AccountRef.value,
              record.AccountRef.name,
              acc._id,
              bankDetails
            );

          const qbCheck = await qbChecksCollection
            .findOneAndUpdate(
              {
                quickbooksId: record.Id,
                ownerId: acc.ownerId,
                ownerType: acc.ownerType,
              },
              {
                $set: {
                  ownerType: acc.ownerType,
                  ownerId: acc.ownerId,
                  realmId: acc.realmId,
                  payeeQuickBooksId: record.EntityRef.value,
                  bankQuickBooksId: record.AccountRef.value,
                  amount: record.TotalAmt,
                  memo: '',
                  txnDate: new Date(record.TxnDate),
                  status:
                    !mappedBank.internalId || mappedPayee.internalId
                      ? 'pending'
                      : 'ready',
                  rawData: record,
                },
              },
              { upsert: true, new: true }
            )
            .lean();

          if (mappedBank.internalId && mappedPayee.internalId)
            await QuickbooksMappingService.updateCreateInternalCheck(qbCheck);
        }
      }
    }
    return false;
  }

  static async updateQbCheckId(
    ownerId: string,
    ownerType: string,
    realmId: string,
    checkId: string,
    internalCheckId: string | number
  ) {
    const acc = await quickBooksAccountDetailsCollection
      .findOne({
        realmId: realmId,
        isActive: true,
        ownerId: ownerId,
        ownerType: ownerType,
      })
      .lean();

    if (acc) {
      const qbo = new QuickBooks(
        config.qbo.client_id,
        config.qbo.client_secret,
        acc.accessToken,
        false, // no legacy token
        acc.realmId,
        config.qbo.environment === 'sandbox', //useSandbox
        true, //debug
        null, // minorversion
        '2.0', // oauth version
        acc.refreshToken
      );
      qbo.getPurchase(checkId, (err, check) => {
        if (err) return console.error(err);

        check.DocNumber = internalCheckId;

        qbo.updatePurchase(check, (err, updatedCheck) => {
          if (err) return console.error(err);
        });
      });
    }
  }

  /** Internal helper: load one token doc */
  private static async loadTokens(
    ownerId: string,
    ownerType?: OwnerType
  ): Promise<IQuickbook | null> {
    const record = await quickBooksAccountDetailsCollection.findOne({
      ownerId,
      ownerType: ownerType,
    });
    if (!record) {
      return null;
    }

    if (!record.isActive) return record.toJSON();

    const now = new Date();

    if (record.refreshTokenExpiresAt && record.refreshTokenExpiresAt < now) {
      const result = await quickBooksAccountDetailsCollection.findOneAndUpdate(
        { ownerId, ownerType },
        { $set: { isActive: false, updatedAt: now } },
        { upsert: true, new: true, rawResult: true }
      );
      return result.value.toJSON();
    }

    if (record.accessTokenExpiresAt && record.accessTokenExpiresAt < now) {
      oauthClient.setToken({
        token_type: record.token_type,
        access_token: record.accessToken,
        refresh_token: record.refreshToken,
        realmId: record.realmId,
        x_refresh_token_expires_in: record.x_refresh_token_expires_in,
        expires_in: record.expires_in,
      });

      const refreshed = await oauthClient.refresh();
      const rjson = refreshed.getJson() as QboTokenJson;
      rjson.realmId = oauthClient.getToken().realmId;

      const newAccessExpiry = new Date(Date.now() + rjson.expires_in * 1_000);
      const newRefreshExpiry = new Date(
        Date.now() + (rjson.x_refresh_token_expires_in ?? 0) * 1_000
      );

      await quickBooksAccountDetailsCollection.updateOne(
        { ownerId, ownerType },
        {
          $set: {
            accessToken: rjson.access_token,
            refreshToken: rjson.refresh_token,
            accessTokenExpiresAt: newAccessExpiry,
            refreshTokenExpiresAt: newRefreshExpiry,
            updatedAt: now,
            x_refresh_token_expires_in: rjson.x_refresh_token_expires_in,
            expires_in: rjson.expires_in,
            token_type: rjson.token_type,
          },
        }
      );

      return await quickBooksAccountDetailsCollection.findOne({
        ownerId,
        ownerType,
      });
    }

    return record.toJSON();
  }
}
