/**
 * @swagger
 * components:
 *  schemas:
 *      Bank:
 *          type: object
 *          required:
 *              - bankName
 *              - ownerId
 *              - ownerType
 *          properties:
 *              _id:
 *                  type: string
 *                  description: The auto-generated ID of the bank account.
 *              bankName:
 *                  type: string
 *                  description: The name of the bank.
 *              accountType:
 *                  type: string
 *                  description: The type of account.
 *              accountName:
 *                  type: string
 *                  description: The name associated with the bank account.
 *              accountNickName:
 *                  type: string
 *                  description: The nickname of the bank account.
 *              accountNumber:
 *                  type: number
 *                  description: The account number.
 *              bankRoutingNumber:
 *                  type: string
 *                  description: The routing number of the bank.
 *              bankTransitNumber:
 *                  type: number
 *                  description: The transit number of the bank.
 *              financialInstituteNumber:
 *                  type: number
 *                  description: The financial institute number.
 *              country:
 *                  type: string
 *                  description: The country of the bank.
 *              bankPreferences:
 *                  type: object
 *                  description: Bank-specific preferences like check numbering.
 *              balance:
 *                  type: number
 *                  description: The current balance of the account.
 *              ownerId:
 *                  type: string
 *                  description: Reference to the user or organization that owns this bank account.
 *              ownerType:
 *                  type: string
 *                  enum: ['User', 'Organization']
 *                  description: Indicates whether this bank account belongs to a user or organization.
 *              createdAt:
 *                  type: string
 *                  format: date-time
 *                  description: The timestamp when the bank account was created.
 *              updatedAt:
 *                  type: string
 *                  format: date-time
 *                  description: The timestamp when the bank account was last updated.
 */
