import { AUDIT_ACTIONS, AuditAction } from '../enums/auditLog.enum';
import { auditLogsCollection } from '../models/dbCollections';
import _ from 'lodash';

type Obj = Record<string, any>;

const DEFAULT_EXCLUDE_KEYS = ['_id', '__v', 'createdAt', 'createdAtUnix'];

export interface LogAuditParams {
  entityType: string;
  entityId: string;
  ownerId: string;
  ownerType: string;
  action: AuditAction;
  userId: string;
  oldData?: Obj | null;
  newData?: Obj | null;
}

function isPlainObject(val: any) {
  return Object.prototype.toString.call(val) === '[object Object]';
}

export const stripMeta = (
  obj: Obj,
  excludeKeys: string[] = DEFAULT_EXCLUDE_KEYS
): Obj => {
  if (obj == null) return obj;

  if (typeof obj === 'object' && obj.toObject) {
    obj = obj.toObject() as Obj;
  }

  if (typeof obj === 'string') {
    return obj as any;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => stripMeta(item, excludeKeys));
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      if (!excludeKeys.includes(key)) {
        acc[key] = stripMeta(obj[key], excludeKeys);
      }
      return acc;
    }, {});
  }

  return obj;
};

const deepDiff = (
  oldObj: Obj = {},
  newObj: Obj = {}
): { oldDiff: Obj; newDiff: Obj } => {
  const oldDiff: Obj = {};
  const newDiff: Obj = {};

  const keys = new Set([
    ...Object.keys(oldObj || {}),
    ...Object.keys(newObj || {}),
  ]);
  for (const key of keys) {
    const oldVal = oldObj?.[key];
    const newVal = newObj?.[key];

    const bothObjects = isPlainObject(oldVal) && isPlainObject(newVal);
    const bothArrays = Array.isArray(oldVal) && Array.isArray(newVal);

    if (bothObjects) {
      const { oldDiff: childOld, newDiff: childNew } = deepDiff(oldVal, newVal);
      if (Object.keys(childOld).length || Object.keys(childNew).length) {
        oldDiff[key] = childOld;
        newDiff[key] = childNew;
      }
    } else if (bothArrays) {
      const sameLength = oldVal.length === newVal.length;
      const shallowSame =
        sameLength &&
        oldVal.every(
          (v: any, i: number) => JSON.stringify(v) === JSON.stringify(newVal[i])
        );
      if (!shallowSame) {
        oldDiff[key] = oldVal;
        newDiff[key] = newVal;
      }
    } else {
      const same = JSON.stringify(oldVal) === JSON.stringify(newVal);
      if (!same) {
        if (oldVal !== undefined) oldDiff[key] = oldVal;
        if (newVal !== undefined) newDiff[key] = newVal;
      }
    }
  }

  return { oldDiff, newDiff };
};

export class AuditLogService {
  static async logAction({
    entityType,
    entityId,
    ownerId,
    ownerType,
    action,
    userId,
    oldData = null,
    newData = null,
  }: LogAuditParams) {
    try {
      const doc = this.prepareAuditLog({
        entityType,
        entityId,
        ownerId,
        ownerType,
        action,
        userId,
        oldData,
        newData,
      });
      if (doc) {
        await auditLogsCollection.create(doc);
      }
    } catch (err) {
      console.error(err);
    }
  }

  static async logActionMany(actions: LogAuditParams[]) {
    if (!Array.isArray(actions) || !actions.length) {
      return;
    }

    const logDocuments = actions
      .map(this.prepareAuditLog)
      .filter((doc) => doc !== null);

    if (logDocuments.length > 0) {
      try {
        await auditLogsCollection.insertMany(logDocuments);
      } catch (err) {
        console.error('Error inserting audit log documents:', err);
      }
    }
  }

  private static prepareAuditLog(logParams: LogAuditParams): any {
    let {
      entityType,
      entityId,
      ownerId,
      ownerType,
      action,
      userId,
      oldData = null,
      newData = null,
    } = logParams;

    const entityStr = entityId?.toString() || entityId;
    const userStr = userId?.toString() || userId;
    const ownerStr = ownerId?.toString() || ownerId;

    if (oldData && typeof oldData === 'object' && oldData.toObject) {
      oldData = oldData.toObject();
    }

    if (newData && typeof newData === 'object' && newData.toObject) {
      newData = newData.toObject();
    }

    let toStoreOld: Obj | null = null;
    let toStoreNew: Obj | null = null;

    if (action === AUDIT_ACTIONS.Created) {
      toStoreOld = null;
      toStoreNew = stripMeta(newData, DEFAULT_EXCLUDE_KEYS);
    } else if (action === AUDIT_ACTIONS.Deleted) {
      toStoreOld = stripMeta(oldData, ['__v']);
      toStoreNew = null;
    } else if (action === AUDIT_ACTIONS.Updated) {
      const cleanOld = stripMeta(oldData, DEFAULT_EXCLUDE_KEYS);
      const cleanNew = stripMeta(newData, DEFAULT_EXCLUDE_KEYS);

      const { oldDiff, newDiff } = deepDiff(cleanOld, cleanNew);
      toStoreOld = Object.keys(oldDiff).length ? oldDiff : null;
      toStoreNew = Object.keys(newDiff).length ? newDiff : null;

      if (!toStoreOld && !toStoreNew) return;
    }

    return {
      entityType,
      entityId: entityStr,
      ownerId: ownerStr,
      ownerType: ownerType,
      action,
      userId: userStr,
      oldData: toStoreOld,
      newData: toStoreNew,
    };
  }
}
