const axios = require('axios');
const nodemailer = require('nodemailer');
const { NotificationLog } = require('../models');

// ─── WhatsApp Cloud API ──────────────────────────────────────────────────────
const WA_BASE = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

const waHeaders = {
  Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
  'Content-Type': 'application/json'
};

const sendWhatsApp = async (to, templateName, components = [], text = null) => {
  try {
    const phone = to.replace(/\D/g, '');
    const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;

    let body;
    if (text) {
      body = { messaging_product: 'whatsapp', to: fullPhone, type: 'text', text: { body: text } };
    } else {
      body = {
        messaging_product: 'whatsapp', to: fullPhone, type: 'template',
        template: { name: templateName, language: { code: 'en' }, components }
      };
    }

    const res = await axios.post(WA_BASE, body, { headers: waHeaders });

    await NotificationLog.create({ type: 'whatsapp', recipient: fullPhone, message: text || templateName, status: 'sent', sentAt: new Date() });
    return res.data;
  } catch (err) {
    console.error('WhatsApp error:', err.response?.data || err.message);
    await NotificationLog.create({ type: 'whatsapp', recipient: to, message: templateName, status: 'failed', error: err.message });
    return null;
  }
};

exports.sendOrderConfirmation = async (phone, order) => {
  const msg = `✅ *Order Confirmed!*\n\nOrder #${order.orderNumber}\nItems: ${order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}\nTotal: ₹${order.total}\nEstimated time: 30-45 mins\n\nTrack your order at: ${process.env.CLIENT_URL}/track/${order._id}\n\n_Thank you for choosing Spice & Soul!_ 🍽️`;
  return sendWhatsApp(phone, null, [], msg);
};

exports.sendOrderStatusUpdate = async (phone, order) => {
  const statusEmojis = { preparing: '👨‍🍳', ready: '✅', 'out-for-delivery': '🛵', delivered: '🎉' };
  const emoji = statusEmojis[order.status] || '📋';
  const msg = `${emoji} *Order Update*\n\nYour order #${order.orderNumber} is now *${order.status.toUpperCase()}*\n\n${order.status === 'delivered' ? 'Enjoy your meal! ❤️' : 'We will keep you updated.'}`;
  return sendWhatsApp(phone, null, [], msg);
};

exports.sendReservationConfirmation = async (phone, reservation) => {
  const msg = `🍽️ *Reservation Confirmed!*\n\nReservation #${reservation.reservationNumber}\nDate: ${new Date(reservation.date).toLocaleDateString('en-IN')}\nTime: ${reservation.time}\nGuests: ${reservation.guests}\nTable: ${reservation.tableNumber || 'TBD'}\n\nSee you soon at Spice & Soul! 🌟`;
  return sendWhatsApp(phone, null, [], msg);
};

exports.sendOfferBlast = async (phone, offer) => {
  const msg = `🎉 *Special Offer for You!*\n\n*${offer.title}*\n${offer.description}\n\nUse code: *${offer.code}*\n${offer.type === 'percentage' ? `Get ${offer.value}% off` : `Get ₹${offer.value} off`}\nValid till: ${new Date(offer.validTo).toLocaleDateString('en-IN')}\n\nOrder now: ${process.env.CLIENT_URL}/menu`;
  return sendWhatsApp(phone, null, [], msg);
};

exports.sendCustomNotification = async (phone, message) => {
  return sendWhatsApp(phone, null, [], message);
};

// ─── Email (Nodemailer) ──────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const emailTemplate = (title, content) => `
<!DOCTYPE html><html><body style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fafaf8">
<div style="background:#1a1208;padding:24px;text-align:center">
  <h1 style="color:#D4AF37;margin:0;font-size:24px;letter-spacing:2px">SPICE & SOUL</h1>
  <p style="color:#a89060;margin:4px 0 0;font-size:12px;letter-spacing:1px">FINE INDIAN CUISINE</p>
</div>
<div style="padding:32px;background:#fff">
  <h2 style="color:#1a1208;border-bottom:2px solid #D4AF37;padding-bottom:12px">${title}</h2>
  ${content}
</div>
<div style="background:#1a1208;padding:16px;text-align:center;color:#a89060;font-size:12px">
  <p>Spice & Soul Restaurant | 123 Main Street | Phone: +91 98765 43210</p>
</div></body></html>`;

exports.sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER) return;
    await transporter.sendMail({ from: process.env.EMAIL_FROM || 'Spice & Soul <noreply@spiceandsoul.com>', to, subject, html });
    await NotificationLog.create({ type: 'email', recipient: to, subject, message: html, status: 'sent', sentAt: new Date() });
  } catch (err) {
    console.error('Email error:', err.message);
    await NotificationLog.create({ type: 'email', recipient: to, subject, status: 'failed', error: err.message });
  }
};

exports.sendOrderEmail = async (email, order) => {
  const itemsHtml = order.items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.price * i.quantity}</td></tr>`).join('');
  const content = `
    <p>Dear ${order.customerInfo.name},</p>
    <p>Thank you for your order! Here are your order details:</p>
    <p><strong>Order Number:</strong> #${order.orderNumber}</p>
    <table style="width:100%;border-collapse:collapse">
      <tr style="background:#f5f0e8"><th>Item</th><th>Qty</th><th>Amount</th></tr>
      ${itemsHtml}
    </table>
    <p><strong>Total: ₹${order.total}</strong></p>
    <p>Track your order: <a href="${process.env.CLIENT_URL}/track/${order._id}">Click here</a></p>`;
  await exports.sendEmail(email, `Order Confirmed #${order.orderNumber} - Spice & Soul`, emailTemplate('Order Confirmed!', content));
};
