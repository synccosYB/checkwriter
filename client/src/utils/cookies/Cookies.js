import Cookies from 'js-cookie'

const LS_PREFIX = 'sc_'

export class MyCookies {
	static KEYS = Object.freeze({
		ACCESS_TOKEN: 'access-token',
		REFRESH_TOKEN: 'refresh-token',
		USER_STATUS: 'user-status',
		ORGANIZATION: 'organization',
		DIRECT_TOKEN: 'direct-token',
		DIRECT_TOKEN_REF: 'direct-token-ref',
		USER_ROLE: 'user-role',
		OLD_ORGANIZATION: 'oldOrganization',
		CUSTOM_ORGANIZATION: 'customOrganization',
		SUBSCRIPTION: 'subscription',
		ACT_AS_USER: 'actingAsUser',
		MFA_VERIFIED: 'mfa-verified',
		ENABLE_MFA: 'enable-mfa',
		LAST_ACTIVITY: 'lastActivity'
	})

	static set(key, value, options = {}) {
		if (!Object.values(MyCookies.KEYS).includes(key)) {
			throw new Error(`Invalid cookie key: ${key}`)
		}
		Cookies.set(key, value, options)
		try {
			localStorage.setItem(LS_PREFIX + key, String(value))
		} catch (e) {}
	}

	static get(key) {
		const cookieVal = Cookies.get(key)
		if (cookieVal !== undefined && cookieVal !== null) return cookieVal
		try {
			const lsVal = localStorage.getItem(LS_PREFIX + key)
			return lsVal !== null ? lsVal : null
		} catch (e) {
			return null
		}
	}

	static remove(key) {
		Cookies.remove(key)
		try {
			localStorage.removeItem(LS_PREFIX + key)
		} catch (e) {}
	}

	static removeAll() {
		Object.values(MyCookies.KEYS).forEach((key) => {
			Cookies.remove(key)
			try {
				localStorage.removeItem(LS_PREFIX + key)
			} catch (e) {}
		})
	}
}
