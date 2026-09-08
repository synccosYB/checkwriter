import express from "express";

import { findUserByEmail } from "../services/users.service.js";
import { sendOtpVerificationMail } from "../services/email.service.js";
import {
  upsertVerificationInDb,
  deleteVerificationByEmail,
  getVerificationByEmail,
  updateVerificationByEmail,
} from "../services/verification.service.js";

const router = express.Router();

router.post("/email/verify-otp", async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!(email && otp)) {
      throw new Error(
        JSON.stringify({
          statusCode: 400,
          developerMessage:
            "Validation Failed (email or otp missing in request body parameter)",
        })
      );
    }

    if (Number.isNaN(parseInt(otp, 10))) {
      throw new Error(
        JSON.stringify({
          statusCode: 400,
          developerMessage: "Validation Failed (otp should be a valid number)",
        })
      );
    }

    const isUser = await findUserByEmail(email);
    if (isUser) {
      throw new Error(
        JSON.stringify({
          userMessage: "User is already registered",
          statusCode: 409,
        })
      );
    }

    const resFromDb = await getVerificationByEmail(email);
    if (!(resFromDb && resFromDb.otp)) {
      throw new Error(
        JSON.stringify({
          statusCode: 500,
          userMessage: "Unable to verify the email address",
          developerMessage: "Unable to fetch otp for the above email address",
        })
      );
    }

    if (parseInt(resFromDb.otp, 10) !== parseInt(otp, 10)) {
      throw new Error(
        JSON.stringify({
          userMessage: "Invalid Otp",
          statusCode: 400,
        })
      );
    }
    await updateVerificationByEmail(email, { status: "VERIFIED" });
    return res.status(200).send("Email Verification Successfull");
  } catch (err) {
    next(err);
  }
});

router.post("/email/send-otp", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new Error(
        JSON.stringify({
          statusCode: 400,
          developerMessage:
            "Validation Failed (email missing in request body parameter)",
        })
      );
    }

    const isUser = await findUserByEmail(email);
    if (isUser) {
      throw new Error(
        JSON.stringify({
          userMessage: "User is already registered",
          statusCode: 409,
        })
      );
    }

    // If a verification record already exists => delete it.
    await deleteVerificationByEmail(email);

    const otp = Math.floor(100000 + Math.random() * 900000);
    await sendOtpVerificationMail(email, otp);
    await upsertVerificationInDb(email, otp, "pending");

    return res.status(200).send("OTP Sent Successfully");
  } catch (err) {
    next(err);
  }
});

// check

export default router;
