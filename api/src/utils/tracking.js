const nodemailer = require("nodemailer");

const { TK_HOST, TK_PORT, TK_USER, TK_PASS, TK_EMAIL, USERNAME} = process.env;
const sendAlert = async (options) => {
  const transport = nodemailer.createTransport({
    host: TK_HOST,
    port: TK_PORT,
    auth: {
      user: TK_USER,
      pass: TK_PASS,
    },
  });
  const mailOptions = {
    from: "LeStud",
    to: TK_EMAIL,
    subject: "LeStud nodemailer",
    text: `user login at ${new Date()} from ${options.req} as ${USERNAME}`,
  };

  await transport.sendMail(mailOptions);
};

const track = async (req, res, next) => {
  await sendAlert({ req: req.headers["sec-ch-ua-platform"] });
  next();
};
module.exports = track;
