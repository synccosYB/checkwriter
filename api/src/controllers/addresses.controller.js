import express from 'express';
import { addressesCollection } from '../models/dbCollections.js';

const router = express.Router();
/**
 * @swagger
 * /addresses/getAddresses/{ownerType}:
 *   get:
 *     summary: Retrieve addresses for a user or organization
 *     description: Fetches a list of addresses associated with the specified owner type (user or organization).
 *     tags:
 *       - Addresses
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether to retrieve addresses for a user or an organization.
 *     responses:
 *       200:
 *         description: Successfully retrieved addresses.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "65f123456789abcd01234567"
 *                   ownerId:
 *                     type: string
 *                     example: "65e987654321abcd01234567"
 *                   ownerType:
 *                     type: string
 *                     example: "user"
 *                   street:
 *                     type: string
 *                     example: "123 Main St"
 *                   city:
 *                     type: string
 *                     example: "New York"
 *                   state:
 *                     type: string
 *                     example: "NY"
 *                   zipCode:
 *                     type: string
 *                     example: "10001"
 *                   country:
 *                     type: string
 *                     example: "USA"
 *       400:
 *         description: Invalid request parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid ownerType"
 *       401:
 *         description: Unauthorized access, user not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while retrieving addresses"
 */

router.get('/getAddresses/:ownerType', async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;

    const { ownerType } = req.params;
    const ownerId = ownerType === 'user' ? userId : organizationId;

    const result = await addressesCollection.find({ ownerId, ownerType });

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error });
  }
});

/**
 * @swagger
 * /addresses/{ownerType}:
 *   post:
 *     summary: Add a new address for a user or organization
 *     description: Creates a new address entry associated with the specified owner type (users or organizations).
 *     tags:
 *       - Addresses
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the address belongs to a user or an organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *                 example: "123 Main St"
 *               city:
 *                 type: string
 *                 example: "New York"
 *               state:
 *                 type: string
 *                 example: "NY"
 *               zipCode:
 *                 type: string
 *                 example: "10001"
 *               country:
 *                 type: string
 *                 example: "USA"
 *     responses:
 *       200:
 *         description: Address successfully added.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Address added Successfully"
 *       400:
 *         description: Invalid request body or parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request data"
 *       401:
 *         description: Unauthorized access, user not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while adding the address"
 */
router.post('/:ownerType', async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;

    const body = req.body;

    const { ownerType } = req.params;
    const ownerId = ownerType === 'user' ? userId : organizationId;

    await addressesCollection.create({
      ...body,
      ownerId,
      ownerType,
    });

    res.send({ message: 'Address added Successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

/**
 * @swagger
 * /addresses/{ownerType}/{addressId}:
 *   put:
 *     summary: Update an address for a user or organization
 *     description: Updates an existing address associated with the specified owner type (users or organizations).
 *     tags:
 *       - Addresses
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Specifies whether the address belongs to a user or an organization.
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the address to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *                 example: "456 Elm St"
 *               city:
 *                 type: string
 *                 example: "Los Angeles"
 *               state:
 *                 type: string
 *                 example: "CA"
 *               zipCode:
 *                 type: string
 *                 example: "90001"
 *               country:
 *                 type: string
 *                 example: "USA"
 *     responses:
 *       200:
 *         description: Address successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Address updated Successfully"
 *       400:
 *         description: Invalid request body or parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request data"
 *       401:
 *         description: Unauthorized access, user not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       404:
 *         description: Address not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Address not found"
 *       500:
 *         description: Internal server error while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while updating the address"
 */

router.put('/:ownerType/:addressId', async (req, res) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;

    const body = req.body;

    const { ownerType, addressId } = req.params;
    const ownerId = ownerType === 'user' ? userId : organizationId;

    await addressesCollection.findOneAndUpdate(
      { _id: addressId, ownerId, ownerType },
      { ...body }
    );

    res.send({ message: 'Address updated Successfully' });
  } catch (error) {
    res.status(500).send({ error });
  }
});

export default router;
