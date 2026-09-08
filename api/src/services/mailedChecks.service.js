/**
 * Server-side sort support for the admin "All Mail" (mailed checks) list.
 *
 * Mirrors the pattern in services/checks.service.js: declare an allow-list of
 * sortable column-ids (some plain, some joined), parse {sortBy, sortOrder}
 * against it, and resolve a sorted page of mailed-check _ids via a SQL query
 * that can ORDER BY columns on joined tables (checks, payees, organizations,
 * users, mail_batches). Callers then load the full rows with the existing
 * populate pipeline so behaviour is otherwise unchanged.
 *
 * A stable `mailed_checks._id DESC` tiebreaker is always appended so paginated
 * pages don't repeat or skip rows when the primary sort key has duplicates.
 */
import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

export const MAILED_CHECKS_SORTABLE_FIELDS = {
  // Plain columns on mailed_checks — handled by the existing Mongoose-backed
  // `.find().sort()` path in the controller.
  status: { kind: 'column', fields: ['status'] },
  issuedDate: { kind: 'column', fields: ['requestedAt'] },
  mailedDate: { kind: 'column', fields: ['mailedAt'] },
  // Joined columns — resolved through the SQL path below.
  no: { kind: 'joined', join: 'check', column: 'check_number' },
  payeeName: { kind: 'joined', join: 'payee', column: 'name' },
  account: { kind: 'joined', join: 'account' },
  org: { kind: 'joined', join: 'org', column: 'organization_name' },
  batchNumber: { kind: 'joined', join: 'batch', column: 'batch_number' },
};

export function parseMailedChecksSort(query = {}) {
  const { sortBy, sortOrder } = query;
  if (!sortBy || typeof sortBy !== 'string') return null;
  const spec = MAILED_CHECKS_SORTABLE_FIELDS[sortBy];
  if (!spec) return null;
  if (sortOrder !== 'asc' && sortOrder !== 'desc') return null;
  return { sortBy, sortOrder, spec };
}

// Build a SQL ORDER BY clause body (without the ORDER BY keyword and without
// the trailing tiebreaker) for the chosen sort, including direction and a
// NULLS LAST hint so missing joined values consistently sink to the bottom.
function buildOrderClause(spec, dirSql) {
  switch (spec.join) {
    case 'check':
      return sql`c.check_number ${dirSql} NULLS LAST`;
    case 'payee':
      return sql`p.name ${dirSql} NULLS LAST`;
    case 'org':
      return sql`o.organization_name ${dirSql} NULLS LAST`;
    case 'batch':
      return sql`b.batch_number ${dirSql} NULLS LAST`;
    case 'account':
      // Display value in the UI is firstName + ' ' + lastName, with the
      // account being the owning user (for user-owned mail) or the primary
      // user link of the owning organization (for org-owned mail). Match
      // that by coalescing the two join paths.
      return sql`COALESCE(u_user.first_name, u_org.first_name) ${dirSql} NULLS LAST, COALESCE(u_user.last_name, u_org.last_name) ${dirSql} NULLS LAST`;
    default:
      return null;
  }
}

/**
 * Resolve the ordered _ids for one page of mailed checks using the supplied
 * sort spec, applying the same {status, ownerId} filter the list endpoint uses.
 */
export async function getSortedMailedCheckIdsPage({ filter = {}, sort, skip = 0, limit }) {
  const dirSql = sort.sortOrder === 'asc' ? sql`ASC` : sql`DESC`;
  const orderClause = buildOrderClause(sort.spec, dirSql);
  if (!orderClause) throw new Error(`Unsupported mailed checks sort: ${sort.sortBy}`);

  const conds = [];
  if (filter.status) conds.push(sql`mc.status = ${filter.status}`);
  if (filter.ownerId) conds.push(sql`mc.owner_id = ${filter.ownerId}`);
  const whereSql = conds.length
    ? sql`WHERE ${sql.join(conds, sql` AND `)}`
    : sql``;

  // Build only the joins we need for the chosen sort. `account` needs both
  // the user-owner join and the org-primary-user lateral; `payee` needs the
  // checks join too because payeeId lives on checks.
  const joinCheck = sql`LEFT JOIN checks c ON c._id = mc.check_id`;
  const joinPayee = sql`LEFT JOIN payees p ON p._id = c.payee_id`;
  const joinOrg = sql`LEFT JOIN organizations o ON o._id = mc.owner_id AND mc.owner_type = 'organization'`;
  const joinBatch = sql`LEFT JOIN mail_batches b ON b._id = mc.batch_id`;
  const joinUserOwner = sql`LEFT JOIN users u_user ON u_user._id = mc.owner_id AND mc.owner_type = 'user'`;
  const joinOrgUser = sql`LEFT JOIN LATERAL (
    SELECT u.first_name, u.last_name
    FROM user_to_organizations uto
    JOIN users u ON u._id = uto.user_id
    WHERE uto.organization_id = mc.owner_id
    ORDER BY uto._id ASC
    LIMIT 1
  ) u_org ON mc.owner_type = 'organization'`;

  const joins = [];
  switch (sort.spec.join) {
    case 'check':
      joins.push(joinCheck);
      break;
    case 'payee':
      joins.push(joinCheck, joinPayee);
      break;
    case 'org':
      joins.push(joinOrg);
      break;
    case 'batch':
      joins.push(joinBatch);
      break;
    case 'account':
      joins.push(joinUserOwner, joinOrgUser);
      break;
    default:
      break;
  }
  const joinsSql = joins.length ? sql.join(joins, sql` `) : sql``;

  const query = sql`
    SELECT mc._id AS _id
    FROM mailed_checks mc
    ${joinsSql}
    ${whereSql}
    ORDER BY ${orderClause}, mc._id DESC
    OFFSET ${skip}
    LIMIT ${limit}
  `;

  const result = await db.execute(query);
  const rows = result.rows ?? result;
  return rows.map((r) => r._id);
}
