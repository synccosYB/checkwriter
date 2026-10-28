# Subscription sync recovery

This change reconciles the application's subscription record from Stripe. Admin refresh only reads Stripe; it does not charge, cancel, or create subscriptions.

## After deployment

1. In User Management, find the affected account and choose **Refresh Subscription** from its row menu. The bulk refresh also includes users without a local subscription record.
2. Verify the underlying status is Active and the Stripe subscription ID matches the paid plan. A successful HTTP request no longer implies that every user synced; failed lookups are reported.
3. If Manual Full Access was enabled as a workaround, choose **Disable Manual Access**, record that subscription sync is repaired, and verify the row still shows Active. Refresh deliberately preserves explicit admin overrides.
4. Verify the customer can use the application while signed into the affected account.

Subscription updates, checkout completion, paid invoices, and failed invoices reconcile the current table used for access. Processing failures return HTTP 500 so delivery can be retried. Expired paid periods do not continue granting access indefinitely. Delayed events retrieve current Stripe state, and cancellation of an older plan cannot overwrite a newer active plan.

Accounts without a current customer mapping, subscription metadata user ID, or legacy customer mapping require the admin refresh to establish the user link. Ambiguous matches and customers linked to another user are rejected for review, rather than guessed.

## Validation

Run `cd api && npm test`. Tests use dummy test configuration and mocked services; they do not require Stripe credentials or a database. The test suite covers missing records, old subscriptions, pagination, ambiguous matches, user ownership, Stripe item-level periods, failed renewals, expired access, delayed events, and manual overrides.

The patch is not a production data migration. Deploy it before running recovery. Production webhook delivery and the specific customer's database record must still be verified in the deployed environment.
