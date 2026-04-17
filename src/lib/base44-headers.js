/**
 * Extra headers for @base44/sdk (see Base44 API reference: optional api_key on createClient).
 */
export function getBase44ClientExtraHeaders() {
	const apiKey = import.meta.env.VITE_BASE44_API_KEY;
	if (apiKey != null && String(apiKey).trim() !== "") {
		return { api_key: String(apiKey).trim() };
	}
	return {};
}
