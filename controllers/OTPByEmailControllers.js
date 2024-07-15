// controllers/otpController.js

import OtpsByEmail from "../models/OTPS-ByEmail.js";
import randomstring from "randomstring";
import sendEmail from "../utils/sendOTPByEmails.js";

// Generate OTP
function generateOTPByEmail() {
  return randomstring.generate({
    length: 6,
    charset: "numeric",
  });
}

// Send OTP to the provided email
export const sendOTPByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTPByEmail();
    const newOTP = new OtpsByEmail({ email, otp });
    await newOTP.save();

    await sendEmail({
      to: email,
      subject: "Selamat, Pendaftaran Fresh Cart Berhasil!",
      message: `<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        background-color: white;
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }

      table,
      td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }

      .container {
        box-sizing: border-box;
        overflow: hidden !important;
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 600px;
        height: auto;
        max-height: auto;
        margin: 0 auto;
        padding: 0;
        border: 0.08rem solid #ced4da;
        border-radius: 0.5rem;
        gap: 5rem;
      }

      .header {
        box-sizing: border-box;
        background-color: #0aad0a;
        padding: 0.5rem;
        text-align: center;
      }

      .image-content {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 2rem 1rem 1rem 1rem;
      }

      .image-content h5 {
        font-size: 1rem;
        font-weight: 600;
        color: #3d4f58;
        margin: 0;
      }

      .description-content {
        box-sizing: border-box;
        padding: 1rem;
      }

      .description-content h5 {
        font-size: 1rem;
        font-weight: 700;
        color: #3d4f58;
        margin: 0;
      }

      .description-content p {
        font-size: 0.85rem;
        color: #3d4f58;
        margin: 0;
        line-height: 1.5;
      }

      .description-content strong {
        font-weight: 600;
        color: #3d4f58;
      }

      .otp-code {
        box-sizing: border-box;
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        padding: 1rem 1rem 1rem 1rem;
        border-radius: 0.5rem;
      }

      .card-otp-code {
        box-sizing: border-box;
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #f0f3f2;
        border-radius: 1rem;
        padding: 1.5rem;
        text-align: center;
      }

      .card-otp-code h5 {
        font-size: 1.25rem;
        font-weight: 400;
        color: #3d4f58;
        margin: 0;
      }

      .otp-code > h5 > b {
        font-size: 1.25rem;
        font-weight: 600;
        color: #3d4f58;
        margin: 0;
      }

      .footer {
        box-sizing: border-box;
        padding: 1rem 1rem 2rem 1rem;
      }

      .footer h6 {
        font-size: 0.85rem;
        color: #3d4f58;
        font-weight: 700;
        margin: 0;
      }

      .footer h5 {
        font-size: 0.85rem;
        color: #3d4f58;
        line-height: 1.5;
        font-weight: 400;
        margin: 0.5rem 0 0 0;
      }

      @media (min-width: 577px) and (max-width: 768px) {
        .description-content h5 {
          font-size: 1rem !important;
        }

        .card-otp-code h5 {
          font-size: 1rem !important;
        }
        .image-content h5 {
          font-weight: 600 !important;
        }
      }
    </style>
  </head>
  <body>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: white">
      <tr>
        <td align="center">
          <table class="container" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="header"></td>
            </tr>
            <tr>
              <td class="image-content">
                <h5>Fresh Cart Company</h5>
              </td>
            </tr>
            <tr>
              <td class="description-content">
                <h5>Halo, M. FAKHRI ALFI SYAHRIN H.</h5>
                <p>
                  Pendaftaran akun Fresh Cart kamu telah berhasil, sekarang kamu dapat login dengan menggunakan <strong>kode OTP</strong> berikut:
                </p>
              </td>
            </tr>
            <tr>
              <td class="otp-code">
                <div class="card-otp-code">
                  <h5>OTP code is: <b>${otp}</b></h5>
                </div>
              </td>
            </tr>
            <tr>
              <td class="footer">
                <h6>Keamanan Data Kamu, Prioritas Kami</h6>
                <h5>
                  Sekarang kamu bisa menikmati kemudahan transaksi mulai dari topup, bayar tagihan, asuransi, buka rekening & investasi hanya dalam
                  satu genggaman.
                </h5>
                <h5>
                  Jaga selalu kerahasiaan datamu dengan tidak memberitahukan username, password, PIN, OTP, dan M-Token kepada pihak manapun termasuk
                  petugas Fresh Cart.
                </h5>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
    });

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Verify OTP provided by the user
export const verifyOTPByEmail = async (req, res) => {
  try {
    const { email, otp } = req.query;
    const existingOTP = await OtpsByEmail.findOne({ email, otp });

    if (existingOTP) {
      res.status(200).json({ success: true, message: "OTP verification successful" });

      // Tidak perlu lagi menggunakan findOneAndDelete, karena TTL indexes akan mengurus penghapusan otomatis
    } else {
      res.status(400).json({ success: false, error: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// export const verifyOTPByEmail = async (req, res) => {
//   try {
//     const { email, otp } = req.query;
//     const existingOTP = await OtpsByEmail.findOneAndDelete({ email, otp });

//     if (existingOTP) {
//       res.status(200).json({ success: true, message: "OTP verification successful" });
//     } else {
//       res.status(400).json({ success: false, error: "Invalid OTP" });
//     }
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// };
