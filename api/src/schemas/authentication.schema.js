/**
 * @swagger
 * components:
 *  schemas:
 *      LoginInput:
 *          type: object
 *          properties:
 *              email:
 *                  type: string
 *                  description: The email address of the user.
 *              password:
 *                  type: string
 *                  description: The password of the user.
 *
 *      SignupInput:
 *          type: object
 *          properties:
 *              firstName:
 *                  type: string
 *                  description: The first name of the user.
 *              lastName:
 *                  type: string
 *                  description: The last name of the user.
 *              email:
 *                  type: string
 *                  description: The email address of the user.
 *              password:
 *                  type: string
 *                  description: The password of the user.
 *
 *      LoginResponse:
 *          type: object
 *          properties:
 *            accessToken:
 *              type: string
 *              description: The access token associated with the user.
 *              example: "<access_token>"
 *            refreshToken:
 *              type: string
 *              description: The refresh token associated with the user.
 *              example: "<refresh_token>"
 *
 *      SignupResponse:
 *          type: object
 *          properties:
 *            accessToken:
 *              type: string
 *              description: The access token associated with the user.
 *              example: "<access_token>"
 *            refreshToken:
 *              type: string
 *              description: The refresh token associated with the user.
 *              example: "<refresh_token>"
 *
 */
