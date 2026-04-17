import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { getBase44ClientExtraHeaders } from '@/lib/base44-headers';

const { appId, serverUrl, token, functionsVersion } = appParams;

//Create a client with authentication required
// serverUrl is always a non-empty string from app-params (defaults to https://base44.app).
export const base44 = createClient({
  appId,
  serverUrl,
  token,
  functionsVersion,
  requiresAuth: false,
  headers: getBase44ClientExtraHeaders()
});
