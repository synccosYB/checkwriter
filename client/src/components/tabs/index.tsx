import React from "react";
import { Tabs, Tab, SxProps, Theme } from "@mui/material";

interface TabInfo {
  label: string;
}

interface CustomTabsProps {
  activeTab: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  styles?: SxProps<Theme>;
  tabs: TabInfo[];
  tabStyles?: SxProps<Theme>;
}

const CustomTabs: React.FC<CustomTabsProps> = ({
  activeTab,
  handleTabChange,
  styles,
  tabs,
  tabStyles,
}) => {
  return (
    <Tabs value={activeTab} onChange={handleTabChange} sx={styles}>
      {tabs.map((tab) => (
        <Tab key={tab.label} label={tab.label} sx={tabStyles} />
      ))}
    </Tabs>
  );
};

export default CustomTabs;
