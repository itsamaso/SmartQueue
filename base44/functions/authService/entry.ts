import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import bcrypt from 'npm:bcryptjs@2.4.3';

const ADMIN_SECRET_CODE = Deno.env.get("ADMIN_SECRET_CODE");
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { action } = body;

  // ── REGISTER CUSTOMER ──────────────────────────────────────────
  if (action === 'register_customer') {
    const { full_name, phone, password, gender } = body;

    if (!full_name || !phone || !password || !gender) {
      return Response.json({ error: 'חסרים שדות חובה' }, { status: 400 });
    }
    if (!phone.match(/^05\d{8}$/)) {
      return Response.json({ error: 'מספר הטלפון אינו תקין' }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: 'הסיסמה חייבת להכיל לפחות 6 תווים' }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.Customer.filter({ phone });
    if (existing.length > 0) {
      return Response.json({ error: 'מספר הטלפון כבר רשום במערכת' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const newCustomer = await base44.asServiceRole.entities.Customer.create({
      full_name,
      phone,
      password: hashed,
      gender
    });

    return Response.json({
      id: newCustomer.id,
      full_name: newCustomer.full_name,
      phone: newCustomer.phone,
      gender: newCustomer.gender
    });
  }

  // ── LOGIN CUSTOMER ──────────────────────────────────────────────
  if (action === 'login_customer') {
    const { phone, password } = body;

    if (!phone || !password) {
      return Response.json({ error: 'חסרים שדות חובה' }, { status: 400 });
    }

    // Check admin first
    const admins = await base44.asServiceRole.entities.Admin.filter({ phone });
    if (admins.length > 0) {
      const admin = admins[0];
      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) {
        return Response.json({ error: 'סיסמה שגויה' }, { status: 401 });
      }
      return Response.json({
        type: 'admin',
        id: admin.id,
        full_name: admin.full_name,
        phone: admin.phone,
        logged_in_at: Date.now()
      });
    }

    const customers = await base44.asServiceRole.entities.Customer.filter({ phone });
    if (customers.length === 0) {
      return Response.json({ error: 'מספר הטלפון אינו רשום' }, { status: 404 });
    }

    const customer = customers[0];
    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) {
      return Response.json({ error: 'סיסמה שגויה' }, { status: 401 });
    }

    return Response.json({
      type: 'customer',
      id: customer.id,
      full_name: customer.full_name,
      phone: customer.phone,
      gender: customer.gender,
      logged_in_at: Date.now()
    });
  }

  // ── REGISTER ADMIN ──────────────────────────────────────────────
  if (action === 'register_admin') {
    const { full_name, phone, password, secret_code } = body;

    if (!full_name || !phone || !password || !secret_code) {
      return Response.json({ error: 'חסרים שדות חובה' }, { status: 400 });
    }
    if (!phone.match(/^05\d{8}$/)) {
      return Response.json({ error: 'מספר הטלפון אינו תקין' }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: 'הסיסמה חייבת להכיל לפחות 6 תווים' }, { status: 400 });
    }
    if (secret_code !== ADMIN_SECRET_CODE) {
      return Response.json({ error: 'קוד הסודי שגוי' }, { status: 403 });
    }

    const existing = await base44.asServiceRole.entities.Admin.filter({ phone });
    if (existing.length > 0) {
      return Response.json({ error: 'מספר הטלפון כבר רשום כמנהל' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const newAdmin = await base44.asServiceRole.entities.Admin.create({
      full_name,
      phone,
      password: hashed
    });

    return Response.json({
      id: newAdmin.id,
      full_name: newAdmin.full_name,
      phone: newAdmin.phone
    });
  }

  // ── LOGIN ADMIN ─────────────────────────────────────────────────
  if (action === 'login_admin') {
    const { phone, password } = body;

    if (!phone || !password) {
      return Response.json({ error: 'חסרים שדות חובה' }, { status: 400 });
    }

    const admins = await base44.asServiceRole.entities.Admin.filter({ phone });
    if (admins.length === 0) {
      return Response.json({ error: 'מספר הטלפון אינו רשום כמנהל' }, { status: 404 });
    }

    const admin = admins[0];
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return Response.json({ error: 'סיסמה שגויה' }, { status: 401 });
    }

    return Response.json({
      id: admin.id,
      full_name: admin.full_name,
      phone: admin.phone,
      logged_in_at: Date.now()
    });
  }

  // ── REHASH PASSWORDS (admin-only migration) ─────────────────────
  if (action === 'rehash_passwords') {
    const { secret_code } = body;
    if (secret_code !== ADMIN_SECRET_CODE) {
      return Response.json({ error: 'קוד סודי שגוי' }, { status: 403 });
    }

    const BCRYPT_PREFIX = '$2';
    let customersUpdated = 0, adminsUpdated = 0;

    const customers = await base44.asServiceRole.entities.Customer.filter({});
    for (const c of customers) {
      if (c.password && !c.password.startsWith(BCRYPT_PREFIX)) {
        const hashed = await bcrypt.hash(c.password, 12);
        await base44.asServiceRole.entities.Customer.update(c.id, { password: hashed });
        customersUpdated++;
      }
    }

    const admins = await base44.asServiceRole.entities.Admin.filter({});
    for (const a of admins) {
      if (a.password && !a.password.startsWith(BCRYPT_PREFIX)) {
        const hashed = await bcrypt.hash(a.password, 12);
        await base44.asServiceRole.entities.Admin.update(a.id, { password: hashed });
        adminsUpdated++;
      }
    }

    return Response.json({ customersUpdated, adminsUpdated });
  }

  return Response.json({ error: 'פעולה לא מוכרת' }, { status: 400 });
});