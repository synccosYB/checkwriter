/**
 * @swagger
 * components:
 *  schemas:
 *      CheckNumber:
 *       type: object
 *       properties:
 *         checkNumber:
 *           type: number
 *           description: The check number.
 *
 *      Address:
 *          type: object
 *          properties:
 *              name:
 *                  type: string
 *                  description: The name associated with the address.
 *              companyName:
 *                  type: string
 *                  description: The company name associated with the address.
 *              addressLine1:
 *                  type: string
 *                  description: The first line of the address.
 *              addressLine2:
 *                  type: string
 *                  description: The second line of the address.
 *              city:
 *                  type: string
 *                  description: The city of the address.
 *              state:
 *                  type: string
 *                  description: The state or province of the address.
 *              country:
 *                  type: string
 *                  description: The country of the address.
 *              zipCode:
 *                  type: number
 *                  description: The ZIP or postal code of the address.
 *
 *      Group:
 *          type: object
 *          properties:
 *              name:
 *                  type: string
 *                  description: The name of the group.
 *              color:
 *                  type: string
 *                  description: The color associated with the group.
 *
 *      Bank:
 *          type: object
 *          properties:
 *              bankName:
 *                  type: string
 *                  description: The name of the bank.
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
 *                  type: number
 *                  description: The routing number of the bank.
 *              balance:
 *                  type: number
 *                  description: The balance of the bank.
 *
 *      Preferences:
 *          type: object
 *          properties:
 *              defaultCheckNumberLength:
 *                  type: number
 *                  description: The default length of the check number.
 *              defaultCheckNumberGen:
 *                  type: string
 *                  enum: [MANUAL, AUTOMATIC]
 *                  description: The default check number generation method.
 *              defaultCheckStartNumber:
 *                  type: number
 *                  description: The default starting number for check generation.
 *
 *      Payee:
 *          type: object
 *          properties:
 *              name:
 *                  type: string
 *                  description: The name of the payee.
 *              nickName:
 *                  type: string
 *                  description: The nickname of the payee.
 *              companyName:
 *                  type: string
 *                  description: The company name associated with the payee.
 *              address:
 *                  $ref: '#/components/schemas/Address'
 *                  description: The address of the payee.
 *              phone:
 *                  type: string
 *                  description: The phone number of the payee.
 *              email:
 *                  type: string
 *                  description: The email address of the payee.
 *
 *      Tag:
 *          type: object
 *          properties:
 *              name:
 *                  type: string
 *                  description: The name of the tag.
 *              color:
 *                  type: string
 *                  description: The color associated with the tag.
 *              group:
 *                  type: string
 *                  description: The group ID associated with the tag.
 *
 *      User:
 *          type: object
 *          properties:
 *              id:
 *                  type: string
 *                  description: The ID of the user.
 *              firstName:
 *                  type: string
 *                  description: The first name of the user.
 *              middleName:
 *                  type: string
 *                  description: The middle name of the user.
 *              lastName:
 *                  type: string
 *                  description: The last name of the user.
 *              email:
 *                  type: string
 *                  description: The email address of the user.
 *              phone:
 *                  type: string
 *                  description: The phone number of the user.
 *              dateOfBirth:
 *                  type: string
 *                  format: date
 *                  description: The date of birth of the user.
 *              preferences:
 *                  $ref: '#/components/schemas/Preferences'
 *                  description: The preferences of the user.
 */
