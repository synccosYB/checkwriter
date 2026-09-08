import express from "express";

import { sendWelcomeMail } from "../services/email.service.js";


const router = express.Router();



router.post('/', (req, res) => {
    const body = req.body;
    res.status(200).send('Thank you <' + body.emailId + '> for subscribing');
});

router.post('/coming-soon', async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new Error ('Validation Failed (missing body parameter - email)');
        }
        res.status(200).send('Thank you for subscribing to us. We will keep you posted with latest products launches');
    } catch (err) {
        next (err);
    }
});

/**
 * @swagger
 * /subscribe/newsletter:
 *   post:
 *     summary: Subscribe to newsletter and receive welcome email
 *     description: Subscribe to the newsletter and receive a welcome email with a specified template.
 *     tags:
 *       - Newsletter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               template:
 *                 type: string
 *             required:
 *               - email
 *               - template
 *     responses:
 *       200:
 *         description: Subscription successful
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       400:
 *         description: Bad request - Missing email or template parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.post('/newsletter', async (req, res, next) => {
    try {
 
        const { email, template } = req.body;
        if (!(email && template)) {
            throw new Error ('Validation Failed (missing body parameter - email or template)');
        }
        await sendWelcomeMail(email, template.toString() );
        res.status(200).send('Thank you for subscribing to newsletter. We will keep you posted :-) ');
    } catch (err) {
        next (err);
    }
});

export default router;