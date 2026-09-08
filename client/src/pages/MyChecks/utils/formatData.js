import { CHECK_STATUS } from '../../../types/check.types'

export function transformChecks(inputChecks, addressId) {
        const checks = Array.isArray(inputChecks) ? inputChecks : []
        return checks.map((check, index) => {
                return {
                        checkNumber: check.checkNumber,
                        amount: Number(check.amount),
                        issuedDate: new Date(check.issuedDate).toISOString(),
                        memo: check.memo || '',
                        tags: check.tags,
                        isSignatureSelected: check.signature === true,
                        status: CHECK_STATUS.DRAFT,
                        bankId: check.bankId,
                        address: {
                                addressId: addressId
                        },
                        payeeId: check.payeeId,
                        invoiceId: check?.invoiceId
                }
        })
}
