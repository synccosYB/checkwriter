export class MySessionStorage {
	static KEYS = Object.freeze({
		REDIRECT_URL: 'redirect-url'
	})

	static set(key, value) {
		if (!Object.values(MySessionStorage.KEYS).includes(key)) {
			throw new Error(`Invalid sessionStorage key: ${key}`)
		}
		sessionStorage.setItem(key, value)
	}

	static get(key) {
		return sessionStorage.getItem(key) || null
	}

	static remove(key) {
		sessionStorage.removeItem(key)
	}

	static removeAll() {
		Object.values(MySessionStorage.KEYS).forEach((key) =>
			sessionStorage.removeItem(key)
		)
	}
}
