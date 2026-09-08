import useOrganizations from '../../../API/users/organizations/useOrganizations'

const CompanyLogo = () => {
        const { data: organizations } = useOrganizations()

        const selectedOrganizationId = localStorage.getItem('organization')

        const selectedOrganization = organizations?.find(
                (item) => item?._id === selectedOrganizationId
        )

        return (
                <>
                        {selectedOrganization ? (
                                <div
                                        className="container"
                                        style={{ height: '36px', marginLeft: '20px' }}
                                >
                                        <div className="row">
                                                <div className="col-auto" style={{ width: '36px', height: '36px' }}>
                                                        <img
                                                                src={selectedOrganization?.organizationLogo}
                                                                alt="img-org"
                                                                style={{
                                                                        width: '36px',
                                                                        height: '36px',
                                                                        borderRadius: '18px',
                                                                        position: 'relative',
                                                                        left: '-12px'
                                                                }}
                                                        />
                                                </div>
                                                <div className="col-auto">
                                                        <p
                                                                style={{
                                                                        marginTop: '7px',
                                                                        fontSize: '14px',
                                                                        fontWeight: '500'
                                                                }}
                                                        >
                                                                {selectedOrganization?.organizationName}
                                                        </p>
                                                </div>
                                        </div>
                                </div>
                        ) : null}
                </>
        )
}

export default CompanyLogo
