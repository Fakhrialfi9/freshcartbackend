// utils/sendEmails.js

import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_SERVICE,
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    secure: false,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_MAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to,
    subject,
    html: message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
