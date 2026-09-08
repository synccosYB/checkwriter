import { useFormikContext } from "formik"
import { useBankLookup, useSearchBanks } from "../../../../API/banks/useBankName"
import { useEffect, useState, useCallback, useRef, createContext, useContext } from "react"

const AutoFillCtx = createContext({
        searchResults: [],
        isSearching: false,
        isLookingUp: false,
        notFound: false,
        lookupError: false,
        searchError: false,
        searchTerm: '',
        setSearchTerm: () => {},
        handleSelectBank: () => {},
        bankLogoUrl: null,
})

export const useAutoFillContext = () => useContext(AutoFillCtx)

export const BankAutoFillContext = ({ children }) => {
        const { values, setFieldValue } = useFormikContext()
        const [searchTerm, setSearchTerm] = useState('')
        const [debouncedSearch, setDebouncedSearch] = useState('')
        const [notFound, setNotFound] = useState(false)
        const [bankLogoUrl, setBankLogoUrl] = useState(null)
        const lastLookupRn = useRef('')

        const rn = (values?.bankRoutingNumber || '').replace(/\D/g, '').slice(0, 9)

        const { data: lookupResult, isFetching: isLookingUp, isError: lookupError } = useBankLookup(rn)
        const { data: searchResults = [], isFetching: isSearching, isError: searchError } = useSearchBanks(debouncedSearch)

        useEffect(() => {
                const timer = setTimeout(() => {
                        setDebouncedSearch(searchTerm)
                }, 300)
                return () => clearTimeout(timer)
        }, [searchTerm])

        const fillBankFields = useCallback((bank) => {
                if (!bank) return
                setFieldValue('bankName', bank.bankName || '')
                setFieldValue('bankAddress1', bank.address1 || '')
                setFieldValue('bankCity', bank.city || '')
                setFieldValue('bankState', bank.state || '')
                setFieldValue('bankZip', bank.zip || '')
                setFieldValue('bankPhone', bank.phone || '')
                setBankLogoUrl(bank.logoUrl || null)
        }, [setFieldValue])

        const clearBankFields = useCallback(() => {
                setFieldValue('bankName', '')
                setFieldValue('bankAddress1', '')
                setFieldValue('bankCity', '')
                setFieldValue('bankState', '')
                setFieldValue('bankZip', '')
                setFieldValue('bankPhone', '')
                setBankLogoUrl(null)
        }, [setFieldValue])

        useEffect(() => {
                if (rn.length === 9 && rn !== lastLookupRn.current && !isLookingUp) {
                        if (lookupResult) {
                                lastLookupRn.current = rn
                                fillBankFields(lookupResult)
                                setNotFound(false)
                        } else if (lookupResult === null) {
                                lastLookupRn.current = rn
                                clearBankFields()
                                setNotFound(true)
                        }
                }
                if (rn.length < 9) {
                        setNotFound(false)
                }
        }, [lookupResult, rn, isLookingUp, fillBankFields, clearBankFields])

        const handleSelectBank = useCallback((bank) => {
                if (!bank) return
                fillBankFields(bank)
                if (bank.routingNumber) {
                        setFieldValue('bankRoutingNumber', bank.routingNumber)
                        setFieldValue('confirmRoutingNumber', bank.routingNumber)
                        lastLookupRn.current = bank.routingNumber
                }
                setSearchTerm('')
                setDebouncedSearch('')
                setNotFound(false)
        }, [fillBankFields, setFieldValue])

        return (
                <AutoFillCtx.Provider value={{
                        searchResults,
                        isSearching,
                        isLookingUp,
                        notFound,
                        lookupError,
                        searchError,
                        searchTerm,
                        setSearchTerm,
                        handleSelectBank,
                        bankLogoUrl,
                }}>
                        {children}
                </AutoFillCtx.Provider>
        )
}
