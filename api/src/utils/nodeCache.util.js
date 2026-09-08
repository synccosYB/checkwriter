import NodeCache from "node-cache";

const options = {
  stdTTL: 3600, // * in seconds -> currently 1 hour
  checkPeriod: 60,
  useClones: false,
  deleteOnExpire: true,
  maxKeys: 1000,
};

export const appCache = new NodeCache(options);

// ! Saving structure in cache ->
// ! User-${userId}
// ! Check-${checkId}
// ! Organization-${organizationId}
// ! User-${userId}/allChecks
// ! Organization-${organizationId}/allChecks
