import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {

  console.log("EMAIL FUNCTION HIT");
  console.log("SENDING TO:", to);

  const result = await resend.emails.send({
   from: "siyap2474@gmail.com",
    to,
    subject,
    html,
  });

  console.log("RESEND RESULT:", result);
};