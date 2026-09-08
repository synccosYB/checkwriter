interface DisableSuperAdminMFaInput {
	isSuperAdmin: boolean
	mfaEnabledFromdb: boolean
}

const allowSuperAdminDisableMfa = JSON.parse(
	process.env.REACT_APP_ALLOW_SUPER_ADMIN_DISABLE_MFA || 'false'
) as boolean

export const shouldDisableMfaSwitchForSuperAdmin = ({
	isSuperAdmin,
	mfaEnabledFromdb
}: DisableSuperAdminMFaInput): boolean => {
	if (!isSuperAdmin) {
		return false
	}

	if (allowSuperAdminDisableMfa) {
		return false
	}

	return mfaEnabledFromdb
}
