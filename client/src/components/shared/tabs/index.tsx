import React, { useState, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { SyntheticEvent } from 'react'
import { styles } from './styles'

interface TabData {
        title: string
        titleNode?: React.ReactNode
        component: React.ReactNode
}

interface TabsProps {
        tabsData: TabData[]
        tabsPanelProps?: Record<string, any>
        useQueryParam?: boolean
        tabContentHeight?: string
}

export default function Tabs({
        tabsData,
        tabsPanelProps = {},
        useQueryParam = true,
        tabContentHeight = 'auto'
}: TabsProps) {
        const location = useLocation()
        const history = useHistory()

        const searchParams = new URLSearchParams(location.search)
        const initialTab = useQueryParam
                ? searchParams.get('tab') || tabsData[0]?.title
                : tabsData[0]?.title

        const [activeTab, setActiveTab] = useState<string>(initialTab)

        useEffect(() => {
                if (useQueryParam && searchParams.get('tab') !== activeTab) {
                        searchParams.set('tab', activeTab)
                        history.replace({
                                search: searchParams.toString(),
                                state: location.state // preserve state
                        })
                }
        }, [activeTab, useQueryParam, searchParams, history, location.state])

        const handleChange = (_: SyntheticEvent, newValue: string) => {
                setActiveTab(newValue)
        }

        // Helper function to safely get color from titleNode
        const getIndicatorColor = () => {
                const activeTabData = tabsData.find((t) => t.title === activeTab)
                if (
                        activeTabData?.titleNode &&
                        React.isValidElement(activeTabData.titleNode)
                ) {
                        return (activeTabData.titleNode.props as any)?.color || '#1e3a5f'
                }
                return '#1e3a5f'
        }

        return (
                <Box
                        sx={{ width: '100%', typography: 'body1', minHeight: tabContentHeight }}
                >
                        <TabContext value={activeTab}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                        <TabList
                                                onChange={handleChange}
                                                aria-label="lab API tabs example"
                                                sx={{
                                                        ...styles.tabList,
                                                        '.MuiTabs-indicator': {
                                                                backgroundColor: getIndicatorColor()
                                                        }
                                                }}
                                        >
                                                {tabsData.map((tab, index) => (
                                                        <Tab
                                                                className="fs-6 fw-semibold m-0"
                                                                sx={{
                                                                        color: '#1a1a2e',
                                                                        textTransform: 'none'
                                                                }}
                                                                key={index}
                                                                label={tab.titleNode || tab.title}
                                                                value={tab.title}
                                                        />
                                                ))}
                                        </TabList>
                                </Box>
                                {tabsData.map((tab, index) => (
                                        <TabPanel
                                                sx={styles.tabcontent}
                                                key={index}
                                                value={tab.title}
                                                {...tabsPanelProps}
                                        >
                                                {tab.component}
                                        </TabPanel>
                                ))}
                        </TabContext>
                </Box>
        )
}
