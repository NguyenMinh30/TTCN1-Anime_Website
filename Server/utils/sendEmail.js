const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Lấy từ file .env
        pass: process.env.EMAIL_PASS, // Lấy từ file .env
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: text,
    });

    console.log("--> Đã gửi email thành công tới: " + email);
  } catch (error) {
    console.log("--> Lỗi gửi email:", error);
  }
};

module.exports = sendEmail;