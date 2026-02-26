const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"LUXE FASHION" <noreply@luxefashion.com>',
      to,
      subject,
      html,
      text: text || '',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending error:', error.message);
    throw new Error('Failed to send email');
  }
};

const sendOrderConfirmation = async (order, userEmail) => {
  const itemsHtml = order.items.map((item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.size || '-'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.total.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Poppins', Arial, sans-serif; color: #333;">
      <div style="background: #1A1A2E; padding: 30px; text-align: center;">
        <h1 style="color: #C4A35A; margin: 0; font-family: 'Playfair Display', serif;">LUXE FASHION</h1>
        <p style="color: #E8D5B7; margin: 5px 0 0;">Elegance Redefined</p>
      </div>
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #1A1A2E; font-family: 'Playfair Display', serif;">Order Confirmation</h2>
        <p>Thank you for your order! Your order <strong>#${order.orderNumber}</strong> has been placed successfully.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f8f8f8;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: center;">Size</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="border-top: 2px solid #1A1A2E; padding-top: 15px; margin-top: 10px;">
          <p style="text-align: right;">Subtotal: <strong>$${order.subtotal.toFixed(2)}</strong></p>
          ${order.discount > 0 ? `<p style="text-align: right; color: #E74C3C;">Discount: -<strong>$${order.discount.toFixed(2)}</strong></p>` : ''}
          <p style="text-align: right;">Shipping: <strong>$${order.shippingCost.toFixed(2)}</strong></p>
          <p style="text-align: right; font-size: 18px; color: #1A1A2E;">Total: <strong>$${order.total.toFixed(2)}</strong></p>
        </div>
        <div style="background: #f8f8f8; padding: 15px; margin-top: 20px; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #1A1A2E;">Shipping Address</h3>
          <p style="margin: 5px 0;">${order.shippingAddress.fullName}</p>
          <p style="margin: 5px 0;">${order.shippingAddress.addressLine1}</p>
          ${order.shippingAddress.addressLine2 ? `<p style="margin: 5px 0;">${order.shippingAddress.addressLine2}</p>` : ''}
          <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
          <p style="margin: 5px 0;">Phone: ${order.shippingAddress.phone}</p>
        </div>
      </div>
      <div style="background: #1A1A2E; padding: 20px; text-align: center;">
        <p style="color: #E8D5B7; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} LUXE FASHION. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Order Confirmation - #${order.orderNumber} | LUXE FASHION`,
    html,
  });
};

const sendWelcomeEmail = async (userName, userEmail) => {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Poppins', Arial, sans-serif; color: #333;">
      <div style="background: #1A1A2E; padding: 30px; text-align: center;">
        <h1 style="color: #C4A35A; margin: 0; font-family: 'Playfair Display', serif;">LUXE FASHION</h1>
        <p style="color: #E8D5B7; margin: 5px 0 0;">Elegance Redefined</p>
      </div>
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #1A1A2E; font-family: 'Playfair Display', serif;">Welcome, ${userName}!</h2>
        <p>Thank you for joining LUXE FASHION. We are thrilled to have you as part of our community.</p>
        <p>Explore our curated collections of women's fashion, premium bags, and elegant shoes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/shop" style="background: #C4A35A; color: #1A1A2E; padding: 12px 30px; text-decoration: none; border-radius: 3px; font-weight: 600;">Start Shopping</a>
        </div>
        <p>Use code <strong style="color: #C4A35A;">WELCOME20</strong> for 20% off your first order!</p>
      </div>
      <div style="background: #1A1A2E; padding: 20px; text-align: center;">
        <p style="color: #E8D5B7; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} LUXE FASHION. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Welcome to LUXE FASHION, ${userName}! 🎉`,
    html,
  });
};

module.exports = { sendEmail, sendOrderConfirmation, sendWelcomeEmail };