const nodemailer = require("nodemailer");
exports.sendMail = function (email, token, type) {
  return new Promise(async (resolve, reject) => {


    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'socialtabz5@gmail.com',
        pass: 'HoMeBoYz2021*',
      },
    });
    let subject = type === 'activation' ? `Account Activation Link` : `Password Recovery`;
    let html = type === 'activation' ? `<a href="http://143.110.254.65/activate?activationToken=${token}&email=${email}">Activate Now</a>` : `<h1>Your Password reset token is ${token} </h1>`;
    let info = await transporter.sendMail({
      from: '"Social tabz 👻" <socialtabz5@gmail.com>',
      to: `${email}`,
      subject,
      text: "",
      html
    });
    resolve(info);
  })

}

