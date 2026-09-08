import {
  checksCollection,
  payeesCollection,
  banksCollection,
} from '../models/dbCollections';

export class ImportCacheService {
  private checkNumberCache = new Map<string, boolean>();
  private payeeCache = new Map<string, string | undefined>();
  private bankCache = new Map<string, any>();

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  private getCheckNumberKey(
    ownerId: string,
    ownerType: string,
    bankId: string,
    checkNumber: string
  ): string {
    return `check:${ownerType}:${ownerId}:${bankId}:${this.normalize(
      checkNumber
    )}`;
  }

  private getPayeeKey(
    ownerId: string,
    ownerType: string,
    identifier: string
  ): string {
    const normalized = /^[a-fA-F0-9]{24}$/.test(identifier)
      ? identifier
      : this.normalize(identifier);
    return `payee:${ownerType}:${ownerId}:${normalized}`;
  }

  private getBankKey(
    ownerId: string,
    ownerType: string,
    bankId: string
  ): string {
    return `bank:${ownerType}:${ownerId}:${bankId}`;
  }

  // Check Number Methods
  public async loadCheckNumbers({
    ownerId,
    ownerType,
    bankId,
    checkNumbers,
  }: {
    ownerId: string;
    ownerType: string;
    bankId: string;
    checkNumbers: Array<number | string>;
  }): Promise<void> {
    if (checkNumbers.length === 0) return;

    const results = await checksCollection.aggregate([
      {
        $match: {
          ownerId,
          ownerType,
          bankId,
          checkNumber: { $in: checkNumbers },
        },
      },
      { $group: { _id: '$checkNumber', count: { $sum: 1 } } },
      {
        $project: {
          _id: 0,
          checkNumber: '$_id',
          count: 1,
        },
      },
    ]);

    checkNumbers.forEach((checkNumber) => {
      const key = this.getCheckNumberKey(
        ownerId,
        ownerType,
        bankId,
        String(checkNumber)
      );
      const exists =
        results.find((i) => i.checkNumber === checkNumber)?.count || 0;
      this.checkNumberCache.set(key, exists > 0);
    });
  }

  public async checkNumberExists({
    ownerId,
    ownerType,
    bankId,
    checkNumber,
  }: {
    ownerId: string;
    ownerType: string;
    bankId: string;
    checkNumber: number | string;
  }): Promise<boolean> {
    const key = this.getCheckNumberKey(
      ownerId,
      ownerType,
      bankId,
      String(checkNumber)
    );

    // Check cache first
    if (this.checkNumberCache.has(key)) {
      return this.checkNumberCache.get(key)!;
    }

    // If not in cache, check DB
    const count = await checksCollection.countDocuments({
      ownerId,
      ownerType,
      bankId,
      checkNumber: String(checkNumber),
    });

    const exists = count > 0;
    this.checkNumberCache.set(key, exists);
    return exists;
  }

  // Payee Methods
  public async loadPayees({
    ownerId,
    ownerType,
    payees,
  }: {
    ownerId: string;
    ownerType: string;
    payees: Array<{ name: string; payeeId?: string }>;
  }): Promise<void> {
    if (payees.length === 0) return;

    const idsToQuery: Set<string> = new Set();
    const namesToQuery: Set<string> = new Set();

    for (const { name, payeeId } of payees) {
      if (payeeId) {
        const idKey = this.getPayeeKey(ownerId, ownerType, payeeId.toString());
        if (!this.payeeCache.has(idKey)) {
          idsToQuery.add(payeeId.toString());
        }
      } else {
        const nameKey = this.getPayeeKey(ownerId, ownerType, name);
        if (!this.payeeCache.has(nameKey)) {
          namesToQuery.add(name);
        }
      }
    }

    const queries: any[] = [];
    if (idsToQuery.size > 0) {
      queries.push({
        _id: {
          $in: Array.from(idsToQuery),
        },
      });
    }
    if (namesToQuery.size > 0) {
      queries.push({
        name: {
          $in: Array.from(namesToQuery).map(
            (name) => new RegExp(`^${name}$`, 'i')
          ),
        },
      });
    }

    if (queries.length === 0) return;

    const results = await payeesCollection
      .find({
        ownerId,
        ownerType,
        $or: queries,
      })
      .select('_id name')
      .lean();

    for (const payee of results) {
      const nameKey = this.getPayeeKey(ownerId, ownerType, payee.name);
      const idKey = this.getPayeeKey(ownerId, ownerType, payee._id.toString());

      this.payeeCache.set(nameKey, payee._id);
      this.payeeCache.set(idKey, payee._id);
    }

    // Cache as undefined if not found
    for (const name of namesToQuery) {
      const key = this.getPayeeKey(ownerId, ownerType, name);
      if (!this.payeeCache.has(key)) {
        this.payeeCache.set(key, undefined);
      }
    }

    for (const id of idsToQuery) {
      const key = this.getPayeeKey(ownerId, ownerType, id);
      if (!this.payeeCache.has(key)) {
        this.payeeCache.set(key, undefined);
      }
    }
  }

  public async getPayeeId({
    ownerId,
    ownerType,
    name,
    payeeId,
  }: {
    ownerId: string;
    ownerType: string;
    name?: string;
    payeeId?: string;
  }): Promise<string | undefined> {
    if (!name && !payeeId) return undefined;

    // 1. Handle lookup by ID
    if (payeeId) {
      const idStr = payeeId.toString();
      const keyById = this.getPayeeKey(ownerId, ownerType, idStr);

      if (this.payeeCache.has(keyById)) {
        return this.payeeCache.get(keyById);
      }

      const payee = await payeesCollection
        .findOne({ ownerId, ownerType, _id: payeeId })
        .select('_id name')
        .lean();

      if (payee) {
        // Cache both ID and name forms
        const keyByName = this.getPayeeKey(ownerId, ownerType, payee.name);
        this.payeeCache.set(keyById, payee._id);
        this.payeeCache.set(keyByName, payee._id);
        return payee._id;
      }

      return undefined;
    }

    // 2. Handle lookup by name
    const key = this.getPayeeKey(ownerId, ownerType, name!);

    if (this.payeeCache.has(key)) {
      return this.payeeCache.get(key);
    }

    const payee = await payeesCollection
      .findOne({
        ownerId,
        ownerType,
        name: { $regex: new RegExp(`^${name}$`, 'i') },
      })
      .select('_id')
      .lean();

    const id = payee?._id;
    this.payeeCache.set(key, id);
    return id;
  }

  // Bank Methods
  public async loadBanks({
    ownerId,
    ownerType,
    bankIds,
  }: {
    ownerId: string;
    ownerType: string;
    bankIds: string[];
  }): Promise<void> {
    if (bankIds.length === 0) return;

    const banks = await banksCollection
      .find({
        ownerId,
        ownerType,
        _id: { $in: bankIds },
      })
      .lean();

    banks.forEach((bank) => {
      const key = this.getBankKey(ownerId, ownerType, bank._id.toString());
      this.bankCache.set(key, bank);
    });
  }

  public async getBank({
    ownerId,
    ownerType,
    bankId,
  }: {
    ownerId: string;
    ownerType: string;
    bankId: string;
  }): Promise<any> {
    const key = this.getBankKey(ownerId, ownerType, bankId);

    // Check cache first
    if (this.bankCache.has(key)) {
      return this.bankCache.get(key);
    }

    // If not in cache, check DB
    const bank = await banksCollection
      .findOne({
        ownerId,
        ownerType,
        _id: bankId,
      })
      .lean();

    if (!bank) {
      throw new Error(`Bank not found: ${bankId}`);
    }

    this.bankCache.set(key, bank);
    return bank;
  }

  // Clear all caches (for testing or between requests)
  public clear(): void {
    this.checkNumberCache.clear();
    this.payeeCache.clear();
    this.bankCache.clear();
  }
}
