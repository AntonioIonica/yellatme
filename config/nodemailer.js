import nodemailer from "nodemailer";
import { EMAIL_NAME, EMAIL_PASSWORD } from "./env.js";

export const senderEmail = EMAIL_NAME;

// Transporter to send the emails through our personal gmail account
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_NAME,
    pass: EMAIL_PASSWORD,
  },
  // logger: true, 
  // debug: true,
});

export default transporter;
