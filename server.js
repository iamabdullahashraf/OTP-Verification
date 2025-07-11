const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail', // ya aapka SMTP provider
  auth: {
    user: 'officialafarid@gmail.com', // <-- yahan apna Gmail address dalein
    pass: 'lkpolytqiiypmuya'               // <-- yahan app password (spaces hata dein)
  }
});

app.post('/send-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    await transporter.sendMail({
      from: '"OTP Verification" <your-email@gmail.com>',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3001, () => console.log('OTP Email server running on port 3001')); 