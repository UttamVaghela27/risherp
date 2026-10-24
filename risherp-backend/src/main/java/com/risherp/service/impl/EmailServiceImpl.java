package com.risherp.service.impl;

import com.risherp.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Email Service Implementation
 * Uses JavaMailSender to deliver HTML OTP emails.
 * SMTP credentials are sourced entirely from environment variables — never hardcoded.
 * OTPs are NEVER logged.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.otp.from-email:noreply@risherp.com}")
    private String fromEmail;

    @Override
    public void sendEmailVerificationOtp(String toEmail, String name, String otp) {
        String subject = "RISHERP – Verify Your Email Address";
        String html = buildEmailVerificationHtml(name, otp);
        sendHtmlEmail(toEmail, subject, html);
        log.info("Email verification OTP sent to: {}", toEmail);
    }

    @Override
    public void sendPasswordResetOtp(String toEmail, String name, String otp) {
        String subject = "RISHERP – Password Reset Code";
        String html = buildPasswordResetHtml(name, otp);
        sendHtmlEmail(toEmail, subject, html);
        log.info("Password reset OTP sent to: {}", toEmail);
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private void sendHtmlEmail(String toEmail, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException | MailException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Email delivery failed. Please try again later.");
        }
    }

    private String buildEmailVerificationHtml(String name, String otp) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Verify Your Email – RISHERP</title>
                </head>
                <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
                    <tr><td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
                        <!-- Header -->
                        <tr>
                          <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px 40px;text-align:center;">
                            <div style="display:inline-flex;align-items:center;gap:12px;">
                              <div style="width:44px;height:44px;background:rgba(255,255,255,0.15);border-radius:10px;display:inline-block;line-height:44px;text-align:center;font-size:22px;">&#127981;</div>
                              <span style="color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">RISHERP</span>
                            </div>
                            <p style="color:#bfdbfe;font-size:13px;margin:8px 0 0;">Enterprise Resource Planning & Invoicing</p>
                          </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                          <td style="padding:40px;">
                            <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 8px;">Verify Your Email Address</h2>
                            <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 24px;">
                              Hi <strong style="color:#e2e8f0;">%s</strong>,<br><br>
                              You recently registered with RISHERP. To activate your account, please use the verification code below.
                            </p>
                            <!-- OTP Box -->
                            <div style="background:#0f172a;border:2px solid #2563eb;border-radius:12px;padding:28px;text-align:center;margin:0 0 24px;">
                              <p style="color:#94a3b8;font-size:13px;margin:0 0 10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Your Verification Code</p>
                              <div style="font-size:42px;font-weight:800;letter-spacing:12px;color:#60a5fa;font-family:'Courier New',monospace;">%s</div>
                              <p style="color:#64748b;font-size:12px;margin:12px 0 0;">This code expires in <strong style="color:#f59e0b;">10 minutes</strong></p>
                            </div>
                            <!-- Instructions -->
                            <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 20px;">
                              Enter this code on the email verification page in your browser to complete your registration.
                            </p>
                            <!-- Warning -->
                            <div style="background:#1e3a2f;border:1px solid #166534;border-radius:10px;padding:16px 20px;">
                              <p style="color:#4ade80;font-size:13px;margin:0;line-height:1.6;">
                                <strong>&#128274; Security Notice:</strong> RISHERP will never ask for this code via phone or chat.
                                Do not share this code with anyone.
                              </p>
                            </div>
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td style="background:#0f172a;padding:24px 40px;border-top:1px solid #1e293b;text-align:center;">
                            <p style="color:#475569;font-size:12px;margin:0;line-height:1.6;">
                              This is an automated message from RISHERP. If you did not register, please ignore this email.<br>
                              &copy; 2024 RISHERP. All rights reserved.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(escapeHtml(name), otp);
    }

    private String buildPasswordResetHtml(String name, String otp) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Password Reset – RISHERP</title>
                </head>
                <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
                    <tr><td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
                        <!-- Header -->
                        <tr>
                          <td style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px 40px;text-align:center;">
                            <div style="display:inline-flex;align-items:center;gap:12px;">
                              <div style="width:44px;height:44px;background:rgba(255,255,255,0.15);border-radius:10px;display:inline-block;line-height:44px;text-align:center;font-size:22px;">&#128274;</div>
                              <span style="color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">RISHERP</span>
                            </div>
                            <p style="color:#ddd6fe;font-size:13px;margin:8px 0 0;">Password Reset Request</p>
                          </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                          <td style="padding:40px;">
                            <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 8px;">Reset Your Password</h2>
                            <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 24px;">
                              Hi <strong style="color:#e2e8f0;">%s</strong>,<br><br>
                              We received a request to reset your RISHERP password. Use the code below to proceed.
                            </p>
                            <!-- OTP Box -->
                            <div style="background:#0f172a;border:2px solid #7c3aed;border-radius:12px;padding:28px;text-align:center;margin:0 0 24px;">
                              <p style="color:#94a3b8;font-size:13px;margin:0 0 10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Your Reset Code</p>
                              <div style="font-size:42px;font-weight:800;letter-spacing:12px;color:#a78bfa;font-family:'Courier New',monospace;">%s</div>
                              <p style="color:#64748b;font-size:12px;margin:12px 0 0;">This code expires in <strong style="color:#f59e0b;">10 minutes</strong></p>
                            </div>
                            <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 20px;">
                              If you did not request a password reset, you can safely ignore this email. Your password will not be changed.
                            </p>
                            <!-- Warning -->
                            <div style="background:#2d1e1e;border:1px solid #7f1d1d;border-radius:10px;padding:16px 20px;">
                              <p style="color:#fca5a5;font-size:13px;margin:0;line-height:1.6;">
                                <strong>&#9888; Security Warning:</strong> RISHERP will never ask for this code via phone or chat.
                                Do not share this code with anyone. It is valid for one-time use only.
                              </p>
                            </div>
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td style="background:#0f172a;padding:24px 40px;border-top:1px solid #1e293b;text-align:center;">
                            <p style="color:#475569;font-size:12px;margin:0;line-height:1.6;">
                              This is an automated message from RISHERP. If you did not request this, please secure your account.<br>
                              &copy; 2024 RISHERP. All rights reserved.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(escapeHtml(name), otp);
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;");
    }
}
