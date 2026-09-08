/**
 * @swagger
 * components:
 *   schemas:
 *     Email:
 *       type: object
 *       properties:
 *         address:
 *           type: string
 *         verified:
 *           type: boolean
 *         verificationCode:
 *           type: string
 *         label:
 *           type: string
 *     PhoneNumber:
 *       type: object
 *       properties:
 *         phoneNumber:
 *           type: string
 *         verified:
 *           type: boolean
 *         verificationCode:
 *           type: string
 *         label:
 *           type: string
 *         defaultDeliveryMethod:
 *           type: string
 *           enum: [sms, call]
 *     AuthenticatorApp:
 *       type: object
 *       properties:
 *         secret:
 *           type: string
 *         verified:
 *           type: boolean
 *         label:
 *           type: string
 */
