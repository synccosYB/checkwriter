
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';


const SubscriptionFailure = () => {
	const history = useHistory();

    useEffect(() => {
        const redirectTimer = setTimeout(() => {
            history.push('/auth/login'); 
        }, 10000); 

        return () => clearTimeout(redirectTimer); 
    }, [history]);
    return (

        <div className="">
				<div className="integration-grid1 d-flex justify-content-center">
                    
					<div className="row m-0 p-0 mt-5 integration-div1">
						<div className="col-12 col-md-4 col-lg-12">
							<div
								className=" position-relative d-flex align-items-center justify-content-center flex-column"
								sx={{
									'&.MuiButtonBase-root': {
										'&:hover': {
											backgroundColor: 'rgba(0, 128, 0, 0.04)'
										},
										color: '#1a1a2e'
									}
								}}
							>
                            <h3 className="logo">Your Payment Failed</h3>
                            {/* <h3 className="logo">Please Try After Some tome</h3> */}
                            
							</div>
						</div>
					</div>
				</div>
			{/* )} */}
		</div>
    );
}

export default SubscriptionFailure;