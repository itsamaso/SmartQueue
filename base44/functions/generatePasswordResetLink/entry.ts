import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { customer_id } = await req.json();
  if (!customer_id) {
    return Response.json({ error: 'customer_id is required' }, { status: 400 });
  }

  // Generate a secure random token
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  // Expires in 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Invalidate any existing unused tokens for this customer
  const existing = await base44.asServiceRole.entities.PasswordResetToken.filter({ customer_id, used: false });
  for (const t of existing) {
    await base44.asServiceRole.entities.PasswordResetToken.update(t.id, { used: true });
  }

  // Create new token
  await base44.asServiceRole.entities.PasswordResetToken.create({
    customer_id,
    token,
    expires_at: expiresAt,
    used: false
  });

  const appUrl = req.headers.get('origin') || 'https://app.base44.com';
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  return Response.json({ reset_link: resetLink });
});