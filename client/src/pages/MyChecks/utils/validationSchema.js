import * as Yup from 'yup'

export const checkCreateValidationSchema = Yup.object().shape({
	bankId: Yup.string().required('Bank Account is required'),
	payeeId: Yup.string().required('Payee Name is required'),
	issuedDate: Yup.string().required('Issued Date is required'),
	amount: Yup.number()
		.required('Amount is required')
		.min(0.01, 'Minimum amount is $0.01'),
	signature: Yup.boolean().required('Signature is required'),
	checkNumber: Yup.string().required('Check Number is required')
})

export const blankCheckValidationSchema = Yup.object().shape({
	bankId: Yup.string().required('Bank Account is required'),
	payeeId: Yup.string(),
	issuedDate: Yup.string(),
	amount: Yup.number()
		.min(0.01, 'Minimum amount is $0.01'),
	signature: Yup.boolean().required('Signature is required'),
	checkNumber: Yup.string().required('Check Number is required')
})
