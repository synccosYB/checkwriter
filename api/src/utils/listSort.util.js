/**
 * Helpers to validate and apply server-side sort parameters against an
 * allow-list, with a stable tiebreaker, for Mongoose-backed list endpoints.
 *
 * Mirrors the sortBy / sortOrder contract used by the Drizzle-backed
 * `/checks` endpoint (see services/checks.service.js: parseChecksSort,
 * CHECKS_SORTABLE_FIELDS, getSortedCheckIdsPage) so all list endpoints
 * accept the same query-parameter shape.
 */

/**
 * Validate { sortBy, sortOrder } against an allow-list.
 *
 * @param {object} query  Express req.query (or any object with sortBy/sortOrder).
 * @param {Record<string, string[]>} allowedFields Map of column-id -> Mongo
 *   field paths to sort on. Multiple paths produce a compound sort.
 * @returns {null | { sortBy: string, sortOrder: 'asc'|'desc', fields: string[] }}
 *   Null when the request omits sort or fails validation.
 */
export function parseListSort(query, allowedFields) {
  if (!query) return null;
  const { sortBy, sortOrder } = query;
  if (!sortBy || typeof sortBy !== 'string') return null;
  const fields = allowedFields[sortBy];
  if (!fields) return null;
  if (sortOrder !== 'asc' && sortOrder !== 'desc') return null;
  return { sortBy, sortOrder, fields };
}

/**
 * Build a Mongoose sort spec for a parsed sort, always appending a stable
 * `_id desc` tiebreaker (matches the MyChecks ordering convention).
 *
 * @param {ReturnType<typeof parseListSort>} parsed
 * @param {object} [fallback] Sort spec to use when `parsed` is null.
 * @returns {object} Mongoose sort spec.
 */
export function buildMongoSort(parsed, fallback = { _id: -1 }) {
  if (!parsed) return fallback;
  const dir = parsed.sortOrder === 'asc' ? 1 : -1;
  const sort = {};
  for (const field of parsed.fields) {
    sort[field] = dir;
  }
  if (sort._id === undefined) sort._id = -1;
  return sort;
}
