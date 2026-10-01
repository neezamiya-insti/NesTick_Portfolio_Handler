import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// ⚠️ Direct credentials
const EMAIL_USER = "tauheeddeveloper13@gmail.com";
const EMAIL_PASS = "ramoreivjlsyogsg"; // Gmail App Password (spaces ke bina)

// Emails jahan message jayega
const RECIPIENTS = ["info@bk.com.sa", "tauheeddeveloper13@gmail.com"];

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // ⚠️ Production mein apna domain daalo
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// OPTIONS handler — preflight request ke liye
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// POST handler
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      subject,
      message,
      // 👇 Naye fields (free consultation form se)
      position,
      company,
      service,
      // 👇 Form type batane ke liye (optional)
      formType,
    } = body;

    // Validation — sirf zaroori fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    // Form type detect karo
    const isConsultationForm = Boolean(position || company || service);
    const formLabel = isConsultationForm
      ? "Free Consultation Request"
      : "Contact Form Submission";

    // Email HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: #2C7046; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="color: #fff; margin: 0;">${formLabel}</h2>
          <p style="color: #F5B301; margin: 5px 0 0 0;">Boyut Al-Kawthar Website</p>
        </div>
        
        <div style="background: #fff; padding: 25px; border-radius: 0 0 10px 10px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #2C7046; width: 130px;">Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${name}</td>
            </tr>
            ${
              position
                ? `<tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #2C7046;">Position:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${position}</td>
                  </tr>`
                : ""
            }
            ${
              company
                ? `<tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #2C7046;">Company:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${company}</td>
                  </tr>`
                : ""
            }
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #2C7046;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">
                <a href="mailto:${email}" style="color: #2C7046;">${email}</a>
              </td>
            </tr>
            ${
              phone
                ? `<tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #2C7046;">Phone:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${phone}</td>
                  </tr>`
                : ""
            }
            ${
              service
                ? `<tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #2C7046;">Service:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">
                      <span style="background: #F5B301; color: #2C7046; padding: 3px 10px; border-radius: 12px; font-size: 13px; font-weight: bold;">${service}</span>
                    </td>
                  </tr>`
                : ""
            }
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #2C7046;">Subject:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${subject}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px;">
            <p style="font-weight: bold; color: #2C7046; margin-bottom: 8px;">Message:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          </div>
          
          <p style="margin-top: 25px; font-size: 12px; color: #999; text-align: center;">
            Sent from Boyut Al-Kawthar website — ${formLabel}
          </p>
        </div>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: `"Boyut Al-Kawthar Website" <${EMAIL_USER}>`,
      to: RECIPIENTS.join(", "),
      replyTo: email,
      subject: `🔔 ${formLabel}: ${subject}`,
      html: htmlContent,
    });

    return NextResponse.json(
      { ok: true, message: "Email sent successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to send email" },
      { status: 500, headers: corsHeaders }
    );
  }
}