import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import bcrypt from 'npm:bcryptjs@2.4.3';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { token, new_password } = await req.json();

  if (!token || !new_password) {
    return Response.json({ error: 'token and new_password are required' }, { status: 400 });
  }

  if (new_password.length < 6) {
    return Response.json({ error: 'הסיסמה חייבת להכיל לפחות 6 תווים' }, { status: 400 });
  }

  // Find the token
  const tokens = await base44.asServiceRole.entities.PasswordResetToken.filter({ token, used: false });
  if (!tokens || tokens.length === 0) {
    return Response.json({ error: 'הקישור אינו תקין או כבר נוצל' }, { status: 400 });
  }

  const resetToken = tokens[0];

  // Check expiry
  if (new Date(resetToken.expires_at) < new Date()) {
    return Response.json({ error: 'הקישור פג תוקף. בקש קישור חדש מהמנהל' }, { status: 400 });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(new_password, 10);

  // Update the customer's password
  await base44.asServiceRole.entities.Customer.update(resetToken.customer_id, {
    password: hashedPassword
  });

  // Mark token as used
  await base44.asServiceRole.entities.PasswordResetToken.update(resetToken.id, { used: true });

  return Response.json({ success: true, message: 'הסיסמה עודכנה בהצלחה' });
});