import React from "react";
import { Tabs, Tab } from "@mui/material";

const TabsDynamicLabel = ({ activeTab, handleTabChange, styles, tabs }) => {
  return (
    <Tabs value={activeTab} onChange={handleTabChange} sx={styles}>
      {tabs.map((tab, index) => (
        <Tab
          key={index}
          label={
            <span style={{ color: tab.color }}>
              {tab.label} <span>({tab.count.toString().padStart(2, "0")})</span>
            </span>
          }
        />
      ))}
    </Tabs>
  );
};

export default TabsDynamicLabel;
