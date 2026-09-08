import React from 'react'
import PageHeader from '../../components/shared/PageHeader'
import IntegrationsRoutes from '../../routes/IntegrationsRoutes'

const Integrations = () => {
	return (
		<div className="container">
			<PageHeader
				text="Integrations / Payments"
				info="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
			/>
			<IntegrationsRoutes />
		</div>
	)
}

export default Integrations
