const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue != null && String(defaultValue).trim() !== "") {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

/** When no URL is in env/query/storage, use this app host (SmartQueue on Base44). Override with VITE_BASE44_APP_BASE_URL. */
const DEFAULT_BASE44_SERVER_URL = "https://smartqueue.base44.app";

const getAppParams = () => {
	// Docs: VITE_BASE44_APP_BASE_URL; older exports used VITE_BASE44_BACKEND_URL
	const defaultServerUrl =
		import.meta.env.VITE_BASE44_APP_BASE_URL || import.meta.env.VITE_BASE44_BACKEND_URL;
	const rawServerUrl = getAppParamValue("server_url", { defaultValue: defaultServerUrl });
	const serverUrl =
		rawServerUrl != null && String(rawServerUrl).trim() !== ""
			? String(rawServerUrl).trim().replace(/\/+$/, "")
			: DEFAULT_BASE44_SERVER_URL;

	return {
		appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
		serverUrl,
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version"),
	}
}


export const appParams = {
	...getAppParams()
}
