import { db } from './index.js';
import {
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  inArray,
  notInArray,
  and,
  or,
  like,
  ilike,
  isNull,
  isNotNull,
  sql,
  desc,
  asc,
  SQL,
  count,
  sum,
} from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { generateObjectId } from './schema.js';

type AnyObj = Record<string, any>;

function isTimestampColumn(col: any): boolean {
  if (!col) return false;
  const colType = (col as any).columnType;
  if (colType === 'PgTimestamp' || colType === 'PgTimestampString') return true;
  const dataType = (col as any).dataType;
  if (dataType === 'date') return true;
  const sqlName = (col as any).getSQLType?.();
  if (typeof sqlName === 'string' && sqlName.startsWith('timestamp')) return true;
  return false;
}

function coerceToDate(value: any): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  if (typeof value === 'number') {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function applyProjection(doc: AnyObj, selectStr: string): AnyObj {
  const fields = selectStr.trim().split(/\s+/);
  const excludeMode = fields.some((f) => f.startsWith('-'));

  if (excludeMode) {
    const excludeSet = new Set(fields.filter((f) => f.startsWith('-')).map((f) => f.slice(1)));
    const result: AnyObj = {};
    for (const [key, val] of Object.entries(doc)) {
      if (!excludeSet.has(key)) result[key] = val;
    }
    return result;
  }

  const includeSet = new Set(fields);
  includeSet.add('_id');
  const result: AnyObj = {};
  for (const [key, val] of Object.entries(doc)) {
    if (includeSet.has(key)) result[key] = val;
  }
  return result;
}

const COLUMN_MAP: Record<string, Record<string, string>> = {};

function getColumnMap(table: PgTable): Record<string, string> {
  const tableName = (table as any)[Symbol.for('drizzle:Name')];
  if (COLUMN_MAP[tableName]) return COLUMN_MAP[tableName];

  const map: Record<string, string> = {};
  const columns = (table as any)[Symbol.for('drizzle:Columns')] || {};
  for (const [jsName, col] of Object.entries(columns)) {
    map[jsName] = (col as any).name;
  }
  COLUMN_MAP[tableName] = map;
  return map;
}

function getColumn(table: PgTable, fieldName: string): any {
  const columns = (table as any)[Symbol.for('drizzle:Columns')] || {};

  if (fieldName === '_id' || fieldName === 'id') {
    return columns['_id'] || columns['id'];
  }

  if (columns[fieldName]) return columns[fieldName];

  const camelCase = fieldName.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  if (columns[camelCase]) return columns[camelCase];

  for (const [key, col] of Object.entries(columns)) {
    if ((col as any).name === fieldName) return col;
  }

  return null;
}

function translateFilter(table: PgTable, filter: AnyObj): SQL | undefined {
  if (!filter || Object.keys(filter).length === 0) return undefined;

  const conditions: SQL[] = [];

  for (const [key, value] of Object.entries(filter)) {
    if (key === '$or') {
      const orConditions = (value as AnyObj[]).map((subFilter) => translateFilter(table, subFilter));
      const validOr = orConditions.filter((c): c is SQL => c !== undefined);
      if (validOr.length > 0) conditions.push(or(...validOr)!);
      continue;
    }

    if (key === '$and') {
      const andConditions = (value as AnyObj[]).map((subFilter) => translateFilter(table, subFilter));
      const validAnd = andConditions.filter((c): c is SQL => c !== undefined);
      if (validAnd.length > 0) conditions.push(and(...validAnd)!);
      continue;
    }

    const col = getColumn(table, key);
    if (!col) {
      const tableName = (table as any)[Symbol.for('drizzle:Name')] || 'unknown';
      console.warn(`[compat] Filter field "${key}" not found in table "${tableName}" - skipping`);
      continue;
    }

    if (value === null || value === undefined) {
      conditions.push(isNull(col));
      continue;
    }

    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && !(value instanceof RegExp)) {
      for (const [op, opValue] of Object.entries(value)) {
        switch (op) {
          case '$eq':
            conditions.push(eq(col, opValue));
            break;
          case '$ne':
            conditions.push(ne(col, opValue));
            break;
          case '$gt': {
            const gtVal = isTimestampColumn(col) ? (coerceToDate(opValue) ?? opValue) : opValue;
            conditions.push(gt(col, gtVal));
            break;
          }
          case '$gte': {
            const gteVal = isTimestampColumn(col) ? (coerceToDate(opValue) ?? opValue) : opValue;
            conditions.push(gte(col, gteVal));
            break;
          }
          case '$lt': {
            const ltVal = isTimestampColumn(col) ? (coerceToDate(opValue) ?? opValue) : opValue;
            conditions.push(lt(col, ltVal));
            break;
          }
          case '$lte': {
            const lteVal = isTimestampColumn(col) ? (coerceToDate(opValue) ?? opValue) : opValue;
            conditions.push(lte(col, lteVal));
            break;
          }
          case '$in':
            if (Array.isArray(opValue) && opValue.length > 0) {
              const vals = opValue.map((v: any) => v?.toString ? v.toString() : v);
              conditions.push(inArray(col, vals));
            }
            break;
          case '$nin':
            if (Array.isArray(opValue) && opValue.length > 0) {
              const vals = opValue.map((v: any) => v?.toString ? v.toString() : v);
              conditions.push(notInArray(col, vals));
            }
            break;
          case '$exists':
            conditions.push(opValue ? isNotNull(col) : isNull(col));
            break;
          case '$regex':
            const regexFlags = value.$options || '';
            const regexPattern = typeof opValue === 'string' ? opValue : (opValue as any).source || opValue.toString();
            if (typeof regexPattern !== 'string') {
              throw new Error('Invalid regex pattern: must be a string');
            }
            if (regexPattern.length > 512) {
              throw new Error('Invalid regex pattern: exceeds maximum allowed length');
            }
            if (/(\(.*\+\).*\+|\(.*\*\).*\+|\(.*\+\).*\*|\(.*\+\).*\?)/.test(regexPattern)) {
              throw new Error('Invalid regex pattern: potentially unsafe nested quantifiers detected');
            }
            if (regexFlags.includes('i')) {
              conditions.push(sql`${col} ~* ${regexPattern}`);
            } else {
              conditions.push(sql`${col} ~ ${regexPattern}`);
            }
            break;
          case '$options':
            break;
          default:
            break;
        }
      }
      continue;
    }

    if (value instanceof RegExp) {
      const pattern = value.source;
      if (pattern.length > 512) {
        throw new Error('Invalid regex pattern: exceeds maximum allowed length');
      }
      if (/(\(.*\+\).*\+|\(.*\*\).*\+|\(.*\+\).*\*|\(.*\+\).*\?)/.test(pattern)) {
        throw new Error('Invalid regex pattern: potentially unsafe nested quantifiers detected');
      }
      if (value.flags.includes('i')) {
        conditions.push(sql`${col} ~* ${pattern}`);
      } else {
        conditions.push(sql`${col} ~ ${pattern}`);
      }
      continue;
    }

    const finalValue = value?.toString ? value.toString() : value;
    conditions.push(eq(col, finalValue));
  }

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return and(...conditions);
}

function translateUpdate(table: PgTable, update: AnyObj): AnyObj {
  const result: AnyObj = {};

  let data = update;
  if (update.$set) {
    data = { ...update.$set };
  }
  if (update.$unset) {
    for (const key of Object.keys(update.$unset)) {
      data[key] = null;
    }
  }
  if (update.$inc) {
    for (const [key, val] of Object.entries(update.$inc)) {
      const col = getColumn(table, key);
      if (col) {
        result[key] = sql`${col} + ${val}`;
      }
    }
  }
  if (update.$push) {
    for (const [key, val] of Object.entries(update.$push)) {
      const col = getColumn(table, key);
      if (col) {
        if ((val as any)?.$each) {
          result[key] = sql`COALESCE(${col}, '[]'::jsonb) || ${JSON.stringify((val as any).$each)}::jsonb`;
        } else {
          result[key] = sql`COALESCE(${col}, '[]'::jsonb) || ${JSON.stringify([val])}::jsonb`;
        }
      }
    }
  }

  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('$')) continue;
    const col = getColumn(table, key);
    if (col) {
      if (value !== null && value !== undefined && isTimestampColumn(col)) {
        result[key] = coerceToDate(value) ?? value;
      } else {
        result[key] = value;
      }
    }
  }

  result.updatedAt = new Date();
  return result;
}

function translateSort(table: PgTable, sortSpec: AnyObj | string): any[] {
  const orderBy: any[] = [];
  if (!sortSpec) return orderBy;

  if (typeof sortSpec === 'string') {
    const parts = sortSpec.split(/\s+/);
    for (const part of parts) {
      if (part.startsWith('-')) {
        const col = getColumn(table, part.slice(1));
        if (col) orderBy.push(desc(col));
      } else {
        const col = getColumn(table, part);
        if (col) orderBy.push(asc(col));
      }
    }
    return orderBy;
  }

  for (const [key, direction] of Object.entries(sortSpec)) {
    const col = getColumn(table, key);
    if (col) {
      orderBy.push(direction === -1 || direction === 'desc' ? desc(col) : asc(col));
    }
  }
  return orderBy;
}

function docWithId(row: AnyObj | null): any {
  if (!row) return null;
  const result = { ...row };
  if (result._id) {
    result.id = result._id;
  }
  return result;
}

function buildSetObject(table: PgTable, data: AnyObj): AnyObj {
  const setObj: AnyObj = {};
  const columns = (table as any)[Symbol.for('drizzle:Columns')] || {};
  const nestedUpdates: Record<string, Record<string, unknown>> = {};

  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('$')) continue;

    if (key.includes('.')) {
      const [parentField, ...rest] = key.split('.');
      const nestedKey = rest.join('.');
      const parentCol = columns[parentField];
      if (parentCol) {
        if (!nestedUpdates[parentField]) nestedUpdates[parentField] = {};
        nestedUpdates[parentField][nestedKey] = value;
      }
      continue;
    }

    const resolvedKey = columns[key] ? key : key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    const col = columns[resolvedKey];
    if (col) {
      if (value !== null && value !== undefined && isTimestampColumn(col)) {
        const dateVal = coerceToDate(value);
        setObj[resolvedKey] = dateVal !== null ? dateVal : value;
      } else {
        setObj[resolvedKey] = value;
      }
    }
  }

  for (const [parentField, updates] of Object.entries(nestedUpdates)) {
    if (setObj[parentField] && typeof setObj[parentField] === 'object') {
      Object.assign(setObj[parentField], updates);
    } else {
      setObj[parentField] = sql`COALESCE(${columns[parentField]}, '{}'::jsonb) || ${JSON.stringify(updates)}::jsonb`;
    }
  }

  if (columns['updatedAt']) {
    setObj['updatedAt'] = new Date();
  }

  return setObj;
}

class QueryBuilder {
  private table: PgTable;
  private _filter: AnyObj;
  private _sort: any;
  private _skip: number | null = null;
  private _limit: number | null = null;
  private _select: string | null = null;
  private _populateFields: Array<{ path: string; select?: string; populate?: any[] }> = [];
  private _isLean = false;
  private _isFindOne = false;

  constructor(table: PgTable, filter: AnyObj, isFindOne = false) {
    this.table = table;
    this._filter = filter;
    this._isFindOne = isFindOne;
  }

  sort(sortSpec: any): QueryBuilder {
    this._sort = sortSpec;
    return this;
  }

  skip(n: number): QueryBuilder {
    this._skip = n;
    return this;
  }

  limit(n: number): QueryBuilder {
    this._limit = n;
    return this;
  }

  select(fields: string | AnyObj): QueryBuilder {
    this._select = typeof fields === 'string' ? fields : null;
    return this;
  }

  populate(fieldOrObj: string | AnyObj, selectFields?: string): QueryBuilder {
    if (typeof fieldOrObj === 'string') {
      const paths = fieldOrObj.split(/\s+/);
      for (const path of paths) {
        this._populateFields.push({ path, select: selectFields });
      }
    } else if (fieldOrObj && typeof fieldOrObj === 'object') {
      this._populateFields.push(fieldOrObj as any);
    }
    return this;
  }

  lean(): QueryBuilder {
    this._isLean = true;
    return this;
  }

  session(_session: any): QueryBuilder {
    return this;
  }

  async count(): Promise<number> {
    const where = translateFilter(this.table, this._filter);
    let query: any = db.select({ count: count() }).from(this.table);
    if (where) query = query.where(where);
    const [result] = await query;
    return result?.count || 0;
  }

  async then(resolve: (value: any) => void, reject?: (reason: any) => void): Promise<void> {
    try {
      const result = await this.exec();
      resolve(result);
    } catch (err) {
      if (reject) reject(err);
      else throw err;
    }
  }

  async exec(): Promise<any> {
    try {
      const where = translateFilter(this.table, this._filter);
      let query: any = db.select().from(this.table);

      if (where) {
        query = query.where(where);
      }

      if (this._sort) {
        const orderClauses = translateSort(this.table, this._sort);
        if (orderClauses.length > 0) {
          query = query.orderBy(...orderClauses);
        }
      }

      if (this._skip !== null) {
        query = query.offset(this._skip);
      }

      if (this._limit !== null || this._isFindOne) {
        query = query.limit(this._isFindOne ? 1 : this._limit!);
      }

      const rows = await query;

      if (this._isFindOne) {
        const doc = rows[0] || null;
        if (!doc) return null;
        let result = docWithId(doc);
        if (this._select) result = applyProjection(result, this._select);
        await this.resolvePopulates([result]);
        return this._isLean ? result : addDocMethods(result, this.table);
      }

      let docs = rows.map((r: any) => docWithId(r));
      if (this._select) docs = docs.map((d: any) => applyProjection(d, this._select!));
      await this.resolvePopulates(docs);
      return this._isLean ? docs : docs.map((d: any) => addDocMethods(d, this.table));
    } catch (err: any) {
      const tableName = (this.table as any)[Symbol.for('drizzle:Name')] || 'unknown';
      console.error(`[compat] Query failed on table "${tableName}":`, err?.message || err);
      console.error(`[compat] Filter was:`, JSON.stringify(this._filter));
      throw err;
    }
  }

  private async resolvePopulates(docs: any[]): Promise<void> {
    if (this._populateFields.length === 0 || docs.length === 0) return;

    for (const popConfig of this._populateFields) {
      await resolvePopulate(docs, popConfig);
    }
  }
}

const POPULATE_TABLE_MAP: Record<string, PgTable> = {};

export function registerPopulateTable(refName: string, table: PgTable) {
  POPULATE_TABLE_MAP[refName] = table;
}

async function resolvePopulate(docs: any[], popConfig: { path: string; select?: string; populate?: any[] }): Promise<void> {
  const { path, select, populate: nestedPopulate } = popConfig;
  if (!path) return;

  const refTable = POPULATE_TABLE_MAP[path] || POPULATE_TABLE_MAP[path.replace(/Id$/, '')];
  if (!refTable) return;

  try {
    const ids = [...new Set(docs.map((d) => d[path]).filter(Boolean).map((id: any) => id.toString()))];
    if (ids.length === 0) return;

    const idCol = getColumn(refTable, '_id');
    if (!idCol) return;

    const refDocs = await db.select().from(refTable).where(inArray(idCol, ids));
    const refMap = new Map<string, any>();
    for (const refDoc of refDocs) {
      refMap.set((refDoc as any)._id, docWithId(refDoc as any));
    }

    for (const doc of docs) {
      const refId = doc[path];
      if (refId) {
        const resolved = refMap.get(refId.toString());
        if (resolved) {
          if (select) {
            const fields = select.split(/\s+/).filter(Boolean);
            const filtered: any = { _id: resolved._id, id: resolved._id };
            for (const f of fields) {
              if (resolved[f] !== undefined) filtered[f] = resolved[f];
            }
            doc[path] = filtered;
          } else {
            doc[path] = resolved;
          }

          if (nestedPopulate) {
            for (const nestedPop of nestedPopulate) {
              await resolvePopulate([doc[path]], nestedPop);
            }
          }
        }
      }
    }
  } catch (err: any) {
    const refTableName = (refTable as any)[Symbol.for('drizzle:Name')] || 'unknown';
    console.error(`[compat] resolvePopulate failed for path "${path}" (table "${refTableName}"):`, err?.message || err);
    throw err;
  }
}

function stripMethods(obj: any): any {
  const clean: any = {};
  for (const key of Object.keys(obj)) {
    if (key === '_doc' || typeof obj[key] === 'function') continue;
    clean[key] = obj[key];
  }
  return clean;
}

function addDocMethods(doc: any, table: PgTable): any {
  if (!doc) return doc;

  doc.toObject = () => stripMethods(doc);
  doc.toJSON = () => stripMethods(doc);
  doc._doc = doc;

  doc.save = async () => {
    const id = doc._id;
    const setObj = buildSetObject(table, doc);
    delete setObj['_id'];
    const where = translateFilter(table, { _id: id });
    await db.update(table).set(setObj).where(where!);
    return doc;
  };

  doc.deleteOne = async () => {
    const id = doc._id;
    const where = translateFilter(table, { _id: id });
    await db.delete(table).where(where!);
  };

  return doc;
}

export function createModel(table: PgTable) {
  const model: any = function ModelConstructor(data: AnyObj = {}) {
    const doc: AnyObj = {
      _id: data._id || generateObjectId(),
      ...data,
    };
    doc.id = doc._id;

    doc.toObject = () => stripMethods(doc);
    doc.toJSON = () => stripMethods(doc);
    doc._doc = doc;

    doc.save = async () => {
      const insertData = buildSetObject(table, doc);
      insertData['_id'] = doc._id;
      if (!insertData['createdAt']) insertData['createdAt'] = new Date();
      if (!insertData['updatedAt']) insertData['updatedAt'] = new Date();
      const [inserted] = await db.insert(table).values(insertData).returning();
      Object.assign(doc, inserted);
      return doc;
    };

    doc.deleteOne = async () => {
      const where = translateFilter(table, { _id: doc._id });
      await db.delete(table).where(where!);
    };

    return doc;
  };

  model.find = (filter: AnyObj = {}) => new QueryBuilder(table, filter);

  model.findOne = (filter: AnyObj = {}, projection?: any) => new QueryBuilder(table, filter, true);

  model.findById = (id: any) => {
    const strId = id?.toString ? id.toString() : id;
    return new QueryBuilder(table, { _id: strId }, true);
  };

  model.create = async (data: AnyObj | AnyObj[]) => {
    if (Array.isArray(data)) {
      const docs = data.map((d) => {
        const insertData = buildSetObject(table, d);
        insertData['_id'] = d._id || generateObjectId();
        if (!insertData['createdAt']) insertData['createdAt'] = new Date();
        if (!insertData['updatedAt']) insertData['updatedAt'] = new Date();
        return insertData;
      });
      const results = await db.insert(table).values(docs).returning();
      return results.map((r: any) => addDocMethods(docWithId(r), table));
    }

    const insertData = buildSetObject(table, data);
    insertData['_id'] = data._id || generateObjectId();
    if (!insertData['createdAt']) insertData['createdAt'] = new Date();
    if (!insertData['updatedAt']) insertData['updatedAt'] = new Date();
    const [inserted] = await db.insert(table).values(insertData).returning();
    return addDocMethods(docWithId(inserted), table);
  };

  model.insertMany = async (docs: AnyObj[]) => {
    if (!docs || docs.length === 0) return [];
    const insertDocs = docs.map((d) => {
      const insertData = buildSetObject(table, d);
      insertData['_id'] = d._id || generateObjectId();
      if (!insertData['createdAt']) insertData['createdAt'] = new Date();
      if (!insertData['updatedAt']) insertData['updatedAt'] = new Date();
      return insertData;
    });
    const results = await db.insert(table).values(insertDocs).returning();
    return results.map((r: any) => addDocMethods(docWithId(r), table));
  };

  model.findOneAndUpdate = async (filter: AnyObj, update: AnyObj, options: AnyObj = {}) => {
    const where = translateFilter(table, filter);
    const setObj = translateUpdate(table, update);
    const builtSet = buildSetObject(table, setObj);

    if (options.upsert) {
      const existing = where ? await db.select().from(table).where(where).limit(1) : [];
      if (existing.length === 0) {
        const insertData = { ...buildSetObject(table, filter), ...builtSet };
        insertData['_id'] = filter._id || generateObjectId();
        if (!insertData['createdAt']) insertData['createdAt'] = new Date();
        const [inserted] = await db.insert(table).values(insertData).returning();
        return addDocMethods(docWithId(inserted), table);
      }
    }

    if (!where) return null;

    const [updated] = await db.update(table).set(builtSet).where(where).returning();
    if (!updated) return null;
    return addDocMethods(docWithId(updated), table);
  };

  model.findByIdAndUpdate = async (id: any, update: AnyObj, options: AnyObj = {}) => {
    const strId = id?.toString ? id.toString() : id;
    return model.findOneAndUpdate({ _id: strId }, update, options);
  };

  model.findOneAndDelete = async (filter: AnyObj) => {
    const where = translateFilter(table, filter);
    if (!where) return null;
    const [deleted] = await db.delete(table).where(where).returning();
    if (!deleted) return null;
    return addDocMethods(docWithId(deleted), table);
  };

  model.findByIdAndDelete = async (id: any) => {
    const strId = id?.toString ? id.toString() : id;
    return model.findOneAndDelete({ _id: strId });
  };

  model.deleteOne = async (filter: AnyObj) => {
    const where = translateFilter(table, filter);
    if (!where) return { deletedCount: 0 };
    const result = await db.delete(table).where(where).returning();
    return { deletedCount: result.length > 0 ? 1 : 0 };
  };

  model.deleteMany = async (filter: AnyObj = {}) => {
    const where = translateFilter(table, filter);
    let result;
    if (where) {
      result = await db.delete(table).where(where).returning();
    } else {
      result = await db.delete(table).returning();
    }
    return { deletedCount: result.length };
  };

  model.updateOne = async (filter: AnyObj, update: AnyObj, _options?: AnyObj) => {
    const where = translateFilter(table, filter);
    if (!where) return { modifiedCount: 0 };
    const setObj = buildSetObject(table, translateUpdate(table, update));
    const result = await db.update(table).set(setObj).where(where).returning();
    return { modifiedCount: result.length > 0 ? 1 : 0 };
  };

  model.updateMany = async (filter: AnyObj, update: AnyObj, _options?: AnyObj) => {
    const where = translateFilter(table, filter);
    const setObj = buildSetObject(table, translateUpdate(table, update));
    let result;
    if (where) {
      result = await db.update(table).set(setObj).where(where).returning();
    } else {
      result = await db.update(table).set(setObj).returning();
    }
    return { modifiedCount: result.length };
  };

  model.countDocuments = async (filter: AnyObj = {}) => {
    try {
      const where = translateFilter(table, filter);
      let query: any = db.select({ count: count() }).from(table);
      if (where) query = query.where(where);
      const [result] = await query;
      return result?.count || 0;
    } catch (err: any) {
      const tableName = (table as any)[Symbol.for('drizzle:Name')] || 'unknown';
      console.error(`[compat] countDocuments failed on table "${tableName}":`, err?.message || err);
      console.error(`[compat] Filter was:`, JSON.stringify(filter));
      throw err;
    }
  };

  model.distinct = async (field: string, filter: AnyObj = {}) => {
    const col = getColumn(table, field);
    if (!col) return [];
    const where = translateFilter(table, filter);
    let query: any = db.selectDistinct({ value: col }).from(table);
    if (where) query = query.where(where);
    const results = await query;
    return results.map((r: any) => r.value).filter(Boolean);
  };

  model.aggregate = async (pipeline: AnyObj[]) => {
    return executeAggregate(table, pipeline);
  };

  model.bulkWrite = async (operations: AnyObj[]) => {
    let modifiedCount = 0;
    for (const op of operations) {
      if (op.updateOne) {
        const { filter: f, update: u } = op.updateOne;
        const where = translateFilter(table, f);
        if (where) {
          const setObj = buildSetObject(table, translateUpdate(table, u));
          await db.update(table).set(setObj).where(where);
          modifiedCount++;
        }
      } else if (op.insertOne) {
        const insertData = buildSetObject(table, op.insertOne.document);
        insertData['_id'] = op.insertOne.document._id || generateObjectId();
        if (!insertData['createdAt']) insertData['createdAt'] = new Date();
        if (!insertData['updatedAt']) insertData['updatedAt'] = new Date();
        await db.insert(table).values(insertData);
        modifiedCount++;
      } else if (op.deleteOne) {
        const where = translateFilter(table, op.deleteOne.filter);
        if (where) {
          await db.delete(table).where(where);
          modifiedCount++;
        }
      }
    }
    return { modifiedCount };
  };

  model.exists = async (filter: AnyObj = {}) => {
    const where = translateFilter(table, filter);
    let query: any = db.select({ _id: getColumn(table, '_id') }).from(table);
    if (where) query = query.where(where);
    query = query.limit(1);
    const rows = await query;
    return rows.length > 0 ? { _id: (rows[0] as any)._id } : null;
  };

  model.collection = {
    name: (table as any)[Symbol.for('drizzle:Name')],
  };

  model.modelName = (table as any)[Symbol.for('drizzle:Name')];
  model.schema = { obj: {} };

  return model;
}

async function executeAggregate(table: PgTable, pipeline: AnyObj[]): Promise<any[]> {
  let where: SQL | undefined;
  let groupBy: AnyObj | null = null;
  let sortSpec: AnyObj | null = null;
  let limitVal: number | null = null;
  let skipVal: number | null = null;
  let projectSpec: AnyObj | null = null;
  let unwindField: string | null = null;
  const lookups: AnyObj[] = [];

  for (const stage of pipeline) {
    if (stage.$match) {
      where = translateFilter(table, stage.$match);
    } else if (stage.$group) {
      groupBy = stage.$group;
    } else if (stage.$sort) {
      sortSpec = stage.$sort;
    } else if (stage.$limit) {
      limitVal = stage.$limit;
    } else if (stage.$skip) {
      skipVal = stage.$skip;
    } else if (stage.$project) {
      projectSpec = stage.$project;
    } else if (stage.$unwind) {
      unwindField = typeof stage.$unwind === 'string' ? stage.$unwind.replace('$', '') : stage.$unwind.path?.replace('$', '');
    } else if (stage.$lookup) {
      lookups.push(stage.$lookup);
    }
  }

  if (groupBy) {
    return executeGroupAggregate(table, where, groupBy, sortSpec, limitVal);
  }

  let query: any = db.select().from(table);
  if (where) query = query.where(where);
  if (sortSpec) {
    const orderClauses = translateSort(table, sortSpec);
    if (orderClauses.length > 0) query = query.orderBy(...orderClauses);
  }
  if (skipVal) query = query.offset(skipVal);
  if (limitVal) query = query.limit(limitVal);

  let rows = await query;
  rows = rows.map((r: any) => docWithId(r));

  if (lookups.length > 0) {
    for (const lookup of lookups) {
      const { from: fromCollection, localField, foreignField, as: asField } = lookup;
      const lookupTable = POPULATE_TABLE_MAP[fromCollection] || POPULATE_TABLE_MAP[asField];
      if (!lookupTable) continue;

      const localValues = rows.map((r: any) => r[localField]).filter(Boolean);
      if (localValues.length === 0) continue;

      const lookupCol = getColumn(lookupTable, foreignField);
      if (!lookupCol) continue;

      const lookupRows = await db.select().from(lookupTable).where(inArray(lookupCol, localValues));
      const lookupMap: Record<string, any[]> = {};
      for (const lr of lookupRows) {
        const key = (lr as any)[foreignField]?.toString();
        if (key) {
          if (!lookupMap[key]) lookupMap[key] = [];
          lookupMap[key].push(docWithId(lr));
        }
      }

      for (const row of rows) {
        const localVal = row[localField]?.toString();
        row[asField] = localVal && lookupMap[localVal] ? lookupMap[localVal] : [];
      }
    }
  }

  if (unwindField) {
    const unwound: any[] = [];
    for (const row of rows) {
      const arr = row[unwindField];
      if (Array.isArray(arr) && arr.length > 0) {
        for (const item of arr) {
          unwound.push({ ...row, [unwindField]: item });
        }
      } else {
        unwound.push({ ...row, [unwindField]: null });
      }
    }
    rows = unwound;
  }

  if (projectSpec) {
    rows = rows.map((row: any) => {
      const projected: AnyObj = {};
      for (const [key, val] of Object.entries(projectSpec!)) {
        if (val === 1 || val === true) {
          projected[key] = row[key];
        }
      }
      if (Object.keys(projected).length === 0) return row;
      projected._id = row._id;
      return projected;
    });
  }

  return rows;
}

const VALID_DATE_TRUNC_UNITS = new Set([
  'microseconds', 'milliseconds', 'second', 'minute', 'hour',
  'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium',
]);

function translateGroupIdExpression(table: PgTable, groupId: AnyObj): { selectExpr: SQL; groupByCols: any[] } | null {
  if (groupId.$dateTrunc) {
    const { date, unit } = groupId.$dateTrunc;
    if (typeof date === 'string' && date.startsWith('$')) {
      const col = getColumn(table, date.slice(1));
      if (col) {
        const normalizedUnit = typeof unit === 'string' ? unit.toLowerCase() : '';
        if (!VALID_DATE_TRUNC_UNITS.has(normalizedUnit)) {
          throw new Error(`Invalid $dateTrunc unit: '${unit}' is not a valid PostgreSQL date truncation unit`);
        }
        const truncExpr = sql`date_trunc(${normalizedUnit}, ${col})`;
        return { selectExpr: truncExpr, groupByCols: [truncExpr] };
      }
    }
  }

  if (groupId.$dateToString) {
    const { format: mongoFormat, date } = groupId.$dateToString;
    if (typeof date === 'string' && date.startsWith('$')) {
      const col = getColumn(table, date.slice(1));
      if (col) {
        const pgFormat = mongoFormat
          .replace('%Y', 'YYYY')
          .replace('%m', 'MM')
          .replace('%d', 'DD')
          .replace('%H', 'HH24')
          .replace('%M', 'MI')
          .replace('%S', 'SS');
        const toCharExpr = sql`to_char(${col}, ${pgFormat})`;
        return { selectExpr: toCharExpr, groupByCols: [toCharExpr] };
      }
    }
  }

  return null;
}

async function executeGroupAggregate(table: PgTable, where: SQL | undefined, groupBy: AnyObj, sortSpec: AnyObj | null, limitVal: number | null): Promise<any[]> {
  const groupId = groupBy._id;

  const selectFields: AnyObj = {};
  const groupByCols: any[] = [];

  if (groupId === null) {
    // group all
  } else if (typeof groupId === 'string' && groupId.startsWith('$')) {
    const fieldName = groupId.slice(1);
    const col = getColumn(table, fieldName);
    if (col) {
      selectFields['_id'] = col;
      groupByCols.push(col);
    }
  } else if (typeof groupId === 'object') {
    const groupExpr = translateGroupIdExpression(table, groupId);
    if (groupExpr) {
      selectFields['_id'] = groupExpr.selectExpr;
      groupByCols.push(...groupExpr.groupByCols);
    } else {
      for (const [key, val] of Object.entries(groupId)) {
        if (typeof val === 'string' && (val as string).startsWith('$')) {
          const fieldName = (val as string).slice(1);
          const col = getColumn(table, fieldName);
          if (col) {
            groupByCols.push(col);
          }
        }
      }
      if (groupByCols.length > 0) {
        selectFields['_id'] = sql`json_build_object(${sql.join(
          Object.entries(groupId).flatMap(([key, val]) => {
            const fieldName = (val as string).slice(1);
            const col = getColumn(table, fieldName);
            return col ? [sql`${key}`, col] : [];
          }),
          sql`, `
        )})`;
      }
    }
  }

  for (const [alias, expr] of Object.entries(groupBy)) {
    if (alias === '_id') continue;

    if (typeof expr === 'object') {
      if (expr.$sum !== undefined) {
        if (typeof expr.$sum === 'string' && expr.$sum.startsWith('$')) {
          const col = getColumn(table, expr.$sum.slice(1));
          if (col) selectFields[alias] = sum(col);
        } else if (expr.$sum === 1) {
          selectFields[alias] = count();
        } else {
          selectFields[alias] = sql`${expr.$sum}`;
        }
      } else if (expr.$count !== undefined) {
        selectFields[alias] = count();
      } else if (expr.$first !== undefined) {
        if (typeof expr.$first === 'string' && expr.$first.startsWith('$')) {
          const col = getColumn(table, expr.$first.slice(1));
          if (col) selectFields[alias] = sql`MIN(${col})`;
        }
      }
    }
  }

  if (Object.keys(selectFields).length === 0) {
    selectFields['_id'] = sql`null`;
    selectFields['count'] = count();
  }

  let query: any = db.select(selectFields).from(table);
  if (where) query = query.where(where);
  if (groupByCols.length > 0) query = query.groupBy(...groupByCols);

  if (sortSpec) {
    const orderClauses: any[] = [];
    for (const [key, direction] of Object.entries(sortSpec)) {
      if (selectFields[key]) {
        orderClauses.push(direction === -1 ? desc(selectFields[key]) : asc(selectFields[key]));
      }
    }
    if (orderClauses.length > 0) query = query.orderBy(...orderClauses);
  }

  if (limitVal) query = query.limit(limitVal);

  const rows = await query;
  return rows;
}
