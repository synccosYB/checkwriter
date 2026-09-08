/**
 * @swagger
 * components:
 *  schemas:
 *      Tag:
 *          type: object
 *          properties:
 *              name:
 *                  type: string
 *                  description: The name of the tag.
 *      CheckInput:
 *          type: object
 *          properties:
 *              checkNumber:
 *                  type: number
 *                  description: The check number.
 *              invoiceId:
 *                  type: string
 *                  description: The ID of the invoice associated with the check.
 *              amount:
 *                  type: number
 *                  description: The amount of the check.
 *              issuedDate:
 *                  type: string
 *                  format: date-time
 *                  description: The date when the check was issued.
 *              payeeId:
 *                  type: string
 *                  description: Reference to the payee ID.
 *              bankId:
 *                  type: string
 *                  description: Reference to the bank ID.
 *              address:
 *                  $ref: '#/components/schemas/Address'
 *                  description: The address details associated with the check.
 *              tags:
 *                  type: array
 *                  items:
 *                      type: string
 *                  description: The tag Id associated with the check.
 *              memo:
 *                  type: string
 *                  description: The memo or additional notes for the check.
 *
 *      Check:
 *          type: object
 *          properties:
 *              status:
 *                  type: string
 *                  enum: [DRAFT, VOID, CLEARED, UNCLEARED]
 *                  default: DRAFT
 *                  description: The status of the check.
 *              ownerId:
 *                  type: string
 *                  description: The ID of the owner (user or organization) associated with the check.
 *              ownerType:
 *                  type: string
 *                  enum: [user, organization]
 *                  description: The type of the owner.
 *              checkNumber:
 *                  type: number
 *                  description: The check number.
 *              invoiceId:
 *                  type: string
 *                  description: The ID of the invoice associated with the check.
 *              amount:
 *                  type: number
 *                  description: The amount of the check.
 *              createdDate:
 *                  type: string
 *                  format: date-time
 *                  description: The date when the check was created.
 *              issuedDate:
 *                  type: string
 *                  format: date-time
 *                  description: The date when the check was issued.
 *              payeeId:
 *                  type: string
 *                  description: Reference to the payee ID.
 *              bankId:
 *                  type: string
 *                  description: Reference to the bank ID.
 *              address:
 *                  $ref: '#/components/schemas/Address'
 *                  description: The address details associated with the check.
 *              tags:
 *                  type: array
 *                  items:
 *                      $ref: '#/components/schemas/Tag'
 *                  description: The tags associated with the check.
 *              memo:
 *                  type: string
 *                  description: The memo or additional notes for the check.
 *              description:
 *                  type: string
 *                  description: The description of the check.
 *              createdAtUnix:
 *                  type: number
 *                  description: The Unix timestamp representing the creation time of the check.
 *              updatedAtUnix:
 *                  type: number
 *                  description: The Unix timestamp representing the last update time of the check.
 *              pdfStored:
 *                  type: boolean
 *                  description: Indicates if the PDF of the check is stored.
 */
