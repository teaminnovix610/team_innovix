const otpEmailTemplate = (otp) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color: #111;">Password Reset OTP</h2>
    <p style="color: #444; font-size: 14px;">
      Use the OTP below to reset your password. It expires in 10 minutes.
    </p>
    <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; margin: 20px 0; color: #111;">
      ${otp}
    </div>
    <p style="color: #888; font-size: 12px;">
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>
`;

export default otpEmailTemplate;