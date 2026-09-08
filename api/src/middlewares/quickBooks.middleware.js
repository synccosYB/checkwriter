import moment from "moment";
import {
  getQuickBooksAccountDetails,
  updateQuickBooksAccountDetails,
} from "../models/quickbooks.model.js";
import {
  isValidAccessToken,
  refreshAccessToken,
} from "../services/quickbooks.services.js";

export default async (req, res, next) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    // todo: If user details not in quickBooks db, throw error
    const quickBooksAccountDetails = await getQuickBooksAccountDetails({
      userId: organizationId ? organizationId : userId,
    });
    if (!quickBooksAccountDetails) {
      throw new Error(
        "User/Organization is not integrated with QuickBooks. Please integrate first"
      );
    }
    // todo: If accessToken invalid, generate new access token
    if (isValidAccessToken(quickBooksAccountDetails.updatedTimeUnix)) {
      req.accessToken = quickBooksAccountDetails.accessToken;
      req.realmId = quickBooksAccountDetails.realmId;
    } else {
      const accessTokenDetails = await refreshAccessToken(
        quickBooksAccountDetails.refreshToken,
          quickBooksAccountDetails.clientId,
          quickBooksAccountDetails.clientSecret
      );
      req.accessToken = accessTokenDetails.access_token;
      req.realmId = quickBooksAccountDetails.realmId;
      await updateQuickBooksAccountDetails(
        {
          userId: organizationId ? organizationId : userId,
        },
        {
          accessToken: accessToken,
          updatedTimeUnix: moment.utc().format("X"),
          refreshToken: accessTokenDetails.refresh_token,
        }
      );
    }
    // todo: pass on with access token and realmId
    next();
  } catch (err) {
    next(err);
  }
};
