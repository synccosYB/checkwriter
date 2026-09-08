/**
 * @swagger
 * components:
 *  schemas:
 *      BankAutoFill:
 *          type: object
 *          properties:
 *              routingNumber:
 *                  type: number
 *                  description: The routing number of the bank.
 *              paymentType:
 *                  type: string
 *                  description: The type of payment associated with the bank.
 *              name:
 *                  type: string
 *                  description: The name of the bank.
 *              addressFull:
 *                  type: string
 *                  description: The full address of the bank.
 *              street:
 *                  type: string
 *                  description: The street address of the bank.
 *              city:
 *                  type: string
 *                  description: The city where the bank is located.
 *              state:
 *                  type: string
 *                  description: The state where the bank is located.
 *              zip:
 *                  type: number
 *                  description: The ZIP code associated with the bank.
 *              phone:
 *                  type: string
 *                  description: The phone number of the bank.
 *              active:
 *                  type: string
 *                  description: The status of the bank (active or inactive).
 *              lastUpdated:
 *                  type: string
 *                  description: The date and time when the bank information was last updated.
 *
 *      RegionByPin:
 *          type: object
 *          properties:
 *              country:
 *                  type: string
 *                  description: The country associated with the region.
 *              state:
 *                  type: string
 *                  description: The state or province associated with the region.
 *              city:
 *                  type: string
 *                  description: The city associated with the region.
 *              zipcode:
 *                  type: number
 *                  description: The ZIP code of the region.
 */
