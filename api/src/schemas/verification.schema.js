/**
 * @swagger
 * components:
 *  schemas:
 *      Verification:
 *          type: object
 *          properties:
 *              email:
 *                  type: string
 *                  description: The email address associated with the verification.
 *              otp:
 *                  type: number
 *                  description: The one-time password for verification.
 *              status:
 *                  type: string
 *                  enum:
 *                      - PENDING
 *                      - VERIFIED
 *                  description: The status of the verification process.
 *              createdAtUnix:
 *                  type: number
 *                  description: The timestamp (in Unix format) when the verification was created.
 *              updatedAtUnix:
 *                  type: number
 *                  description: The timestamp (in Unix format) when the verification was last updated.
 *
 */
