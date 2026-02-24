import { emailTemplates } from "./email-template.js";
import dayjs from "dayjs";
import transporter, { senderEmail } from "../config/nodemailer.js";

export const sendReminderEmail = async ({ to, type, subscription }) => {
  // Guard
  if (!to || !type) throw new Error("Missing required parameters!");

  // type = label reminder from the workflow to choose the days template
  const template = emailTemplates.find((t) => t.label === type);
  if (!template) throw new Error("Invalid email type!");

  // Building the email body
  // 1. How the data is sent into the email template
  const mailInfo = {
    userName: subscription.user.name,
    subscriptionName: subscription.name,
    description: subscription.description,
    renewalDate: dayjs(subscription.renewalDate).format("D MMM, YYYY"),
    planName: subscription.name,
    price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
    paymentMethod: subscription.paymentMethod,
    // accountSettingsLink,
    // supportLink,
  };

  // 2. Setting the subject and the message of the email
  const message = template.generateBody(mailInfo);
  const subject = template.generateSubject(mailInfo);

  // 3. Setting the structure of the email
  const mailOptions = {
    from: senderEmail,
    to,
    subject,
    html: message,
  };

  // Send the email with the above options attached
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return console.log(error, "Error sending email");

    console.log("Email sent: " + info.response);
  });
};
