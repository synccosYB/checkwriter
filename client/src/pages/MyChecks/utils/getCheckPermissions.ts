import { CHECK_STATUS, ICheck } from "../../../types/check.types";

export const getCheckPermissions = (check: ICheck) => {
    if (!check) {
		return {
			canEdit: false,
			canEmail: false,
            canMail: false,
			canDelete: false,
			canPrint: false,
			canVoid: false,
			canClear: false,
		};
	}
    const isDraft = check?.status === CHECK_STATUS.DRAFT;
	const isBlank = check?.status === CHECK_STATUS.BLANK || check?.isBlankCheck;
	const isVoid = check?.status === CHECK_STATUS.VOID;
	const isCleared = check?.status === CHECK_STATUS.CLEARED;

	return {
		canEdit: isDraft || isBlank,
		canEmail: !isVoid && !isBlank,
        canMail: !isVoid && !isBlank,
		canDelete: isDraft,
		canPrint: !isVoid && !isBlank,
		canVoid: !isVoid && !isDraft,
		canClear: !isCleared && !isVoid && !isDraft,
	};

}
