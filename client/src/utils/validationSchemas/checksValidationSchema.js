import * as Yup from 'yup'

const checkFormValidationSchema = Yup.object().shape({
	forms: Yup.array()
		.of(
			Yup.object().shape({
				bankId: Yup.string()
					.required('Bank account is required')
					.min(1, 'Please select a bank account'),

				payeeId: Yup.string()
					.required('Payee is required')
					.min(1, 'Please select a payee'),

				amount: Yup.number()
					.transform((value) => (isNaN(value) ? undefined : value))
					.required('Amount is required')
					.positive('Amount must be greater than 0')
					.max(999999999.99, 'Amount cannot exceed 999,999,999.99'),

				checkNumber: Yup.string(),

				issuedDate: Yup.date(),

				invoiceId: Yup.string()
					.nullable()
					.matches(
						/^[a-zA-Z0-9-_]*$/,
						'Invoice ID can only contain letters, numbers, hyphens, and underscores'
					),

				memo: Yup.string()
					.nullable()
					.max(100, 'Memo cannot exceed 100 characters'),

				tags: Yup.array().of(Yup.string()).nullable(),

				status: Yup.string().oneOf(
					['DRAFT', 'VOID', 'BLANK'],
					'Invalid status'
				),

				isSignatureSelected: Yup.boolean(),

				quantity: Yup.number().when('status', {
					is: 'BLANK',
					then: (schema) =>
						schema
							.required('Quantity is required for blank checks')
							.positive('Quantity must be greater than 0')
							.integer('Quantity must be a whole number')
							.max(100, 'Quantity cannot exceed 100'),
					otherwise: (schema) => schema.nullable()
				})
			})
		)
		.min(1, 'At least one check form is required')
})

export default checkFormValidationSchema
