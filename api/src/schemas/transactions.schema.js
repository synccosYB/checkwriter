/**
 * @swagger
 * components:
 *   schemas:
 *     CheckRegisterTransaction:
 *       type: object
 *       required:
 *         - type
 *         - bankId
 *         - amount
 *         - issue_date
 *         - ownerId
 *         - ownerType
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the transaction
 *         bankId:
 *           type: string
 *           description: The bank ID associated with the transaction
 *         ownerId:
 *           type: string
 *           description: The ID of the owner (user or organization) associated with the transaction
 *         ownerType:
 *           type: string
 *           enum: [user, organization]
 *           description: The type of owner (user or organization)
 *         type:
 *           type: string
 *           enum: [deposit, transaction]
 *           description: The type of transaction
 *         check_no:
 *           type: number
 *           description: The check number
 *         payee_name:
 *           type: string
 *           description: The name of the payee
 *         description:
 *           type: string
 *           description: A description of the transaction
 *         status:
 *           type: string
 *           enum: [paid, open]
 *           description: The status of the transaction
 *           default: open
 *         amount:
 *           type: number
 *           description: The amount of the transaction
 *         balance:
 *           type: number
 *           description: The balance after the transaction
 *         issue_date:
 *           type: string
 *           format: date
 *           description: The date the transaction was issued
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the transaction was created
 *       example:
 *         id: "60f8b6c8c8d4f92568b7b68f"
 *         bankId: "60f8b6c8c8d4f92568b7b68f"
 *         ownerId: "60f8b6c8c8d4f92568b7b68f"
 *         ownerType: "user"
 *         type: deposit
 *         check_no: 123456
 *         payee_name: John Doe
 *         description: Monthly salary
 *         status: open
 *         amount: 5000
 *         balance: 10000
 *         issue_date: 2023-07-09
 *         createdAt: 2023-07-09T12:34:56.789Z
 */
