/**
 * @swagger
 * components:
 *  schemas:
 *      Payee:
 *          type: object
 *          required:
 *              - name
 *          properties:
 *              _id:
 *                  type: string
 *                  description: The auto-generated ID of the payee.
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
 *              ownerId:
 *                  type: string
 *                  description: Reference to the user or organization that created this payee.
 *              ownerType:
 *                  type: string
 *                  enum: ['User', 'Organization']
 *                  description: Indicates whether this payee belongs to a user or organization.
 *              createdAt:
 *                  type: string
 *                  format: date-time
 *                  description: The timestamp when the payee was created.
 *              updatedAt:
 *                  type: string
 *                  format: date-time
 *                  description: The timestamp when the payee was last updated.
 */
