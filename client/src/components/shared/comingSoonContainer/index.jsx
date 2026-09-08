import React from 'react'

function ComingSoonContainer({ enable, children }) {
	if(enable) return <div>{children}</div>
	return (
		<div className="coming-soon-container position-relative">
			<div style={{ pointerEvents: 'none' }}>{children}</div>
			<div className="coming-soon-overlay d-flex align-items-center justify-content-center">
				<button className="btn coming-soon-btn" disabled>
					Coming Soon
				</button>
			</div>
		</div>
	)
}

export default ComingSoonContainer
