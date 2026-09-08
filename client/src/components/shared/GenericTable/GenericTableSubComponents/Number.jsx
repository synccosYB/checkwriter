import { Form, Formik } from 'formik'

import FormComponents from '../../forms'
import ButtonComponent from '../../ButtonComponent'
import * as Yup from 'yup'

const Number = ({ data, _key, sendFilter, filterMap, clear }) => {
	const validationSchema = Yup.object().shape({
		min: Yup.number()
			.min(0, 'Min value should be greater than or equal to 0')
			.max(Yup.ref('max'), 'Min value should be less than Max value')
			.typeError('Min should not be empty')
			.required('Min should not be empty'),
		max: Yup.number()
			.min(Yup.ref('min'), 'Max value should be greater than Min value')
			.test(
				'positive',
				'Max value should be greater than 0',
				(value) => value > 0
			)
			.typeError('Min should not be empty')
			.required('Min should not be empty')
	})

	const clearFilter = () => {
		clear(_key)
	}

	return (
		<div className="container p-2 pt-2">
			<Formik
				initialValues={{
					min: filterMap.has(_key) ? filterMap.get(_key)?.filter.min : null,
					max: filterMap.has(_key) ? filterMap.get(_key)?.filter.max : null
				}}
				onSubmit={(value) => {
					sendFilter(value, _key, 'number')
				}}
				validationSchema={validationSchema}
			>
				{({ handleSubmit, values, resetForm, isValid, dirty, touched }) => {
					return (
						<Form className="px-2 pt-2 pb-2">
							<h6 className="preference-head mb-3">Select Range: </h6>
							<FormComponents
								type="number"
								name="min"
								label="Min. Value"
								control="input"
								formfieldclassName="mb-4"
							/>
							<FormComponents
								type="number"
								name="max"
								label="Max. Value"
								control="input"
								formfieldclassName="mb-4"
							/>
							<div className="row flex-row-reverse justify-content-between">
								<div className="col-auto">
									<ButtonComponent
										type="submit"
										text="Apply"
										variant="dark"
										disabled={!isValid}
									>
										Submit
									</ButtonComponent>
								</div>
								{filterMap.get(_key) && (
									<div className="col-auto">
										<p
											className="text-danger btn clearFilter"
											style={{
												marginTop: '0px',
												marginLeft: '8px',
												fontSize: '12px',
												marginBottom: '0px'
											}}
											onClick={() => {
												clearFilter()
												resetForm({
													values: {
														min: NaN,
														max: NaN
													}
												})
											}}
										>
											Clear Filter
										</p>
									</div>
								)}
							</div>
						</Form>
					)
				}}
			</Formik>
		</div>
	)
}

export default Number
