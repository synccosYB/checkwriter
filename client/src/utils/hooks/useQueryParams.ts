import { useLocation, useHistory } from 'react-router-dom'
import { useMemo, useCallback } from 'react'

interface UseQueryParamsResult {
	queryParams: URLSearchParams
	removeAllQueryParams: () => void
}

function useQueryParams(): UseQueryParamsResult {
	const location = useLocation()
	const history = useHistory()

	const params = useMemo(() => {
		return new URLSearchParams(location.search)
	}, [location.search])

	const removeAllQueryParams = useCallback(() => {
		history.replace({
			pathname: location.pathname,
			search: '',
			hash: location.hash
		})
	}, [history, location.pathname, location.hash])

	return { queryParams: params, removeAllQueryParams }
}

export default useQueryParams
