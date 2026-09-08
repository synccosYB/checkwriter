import { Link } from "@mui/material"
import { useHistory } from 'react-router'
import appLogoDark from '../../../assets/images/app-logo-dark.png'

const AlternateHeader = () => {
    const history = useHistory()
    return (
        <div className="alt-app-header bg-transparent">
            <div className="app-header-inner d-flex flex-row justify-content-between align-items-center bg-transparent">
                <div className="app-logo">
                    <Link to="/">
                        <img
                            src={appLogoDark}
                            alt=""
                        />
                    </Link>
                </div>
                <button
                    onClick={() => {
                        history.goBack();
                    }}
                    className={`common-btn fs-14 light`}
                >
                    Back
                </button>
            </div>
        </div>
    )
}

export default AlternateHeader 