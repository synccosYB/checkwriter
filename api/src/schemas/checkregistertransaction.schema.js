/**
 * @swagger
 * components:
 *   schemas:
 *     CheckRegisterTransaction:
 *       type: object
 *       required:
 *         - type
 *         - bankAccountId
 *         - amount
 *         - issue_date
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the transaction
 *         bankAccountId:
 *           type: string
 *           description: The bank account ID associated with the transaction
 *         userId:
 *           type: string
 *           description: The ID of the user associated with the transaction
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
 *         bankAccountId: "60f8b6c8c8d4f92568b7b68f"
 *         userId: "60f8b6c8c8d4f92568b7b68f"
 *         type: deposit
 *         check_no: 123456
 *         payee_name: John Doe
 *         description: Monthly salary
 *         status: open
 *         amount: 5000
 *         issue_date: 2023-07-09
 *         createdAt: 2023-07-09T12:34:56.789Z
 */
