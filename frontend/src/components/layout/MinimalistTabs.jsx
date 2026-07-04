// =============================================================
//  components/layout/MinimalistTabs.jsx — WAI-ARIA Tabs
// =============================================================

import React, { useRef } from "react";
import "./MinimalistTabs.css";

/**
 * MinimalistTabs
 * A highly accessible, pure CSS border-driven tabbed control.
 * 
 * Props:
 *   - tabs: Array<{ id: string, label: string }>
 *   - activeTab: string
 *   - onChange: (tabId: string) => void
 */
export default function MinimalistTabs({ tabs, activeTab, onChange }) {
  const tabRefs = useRef([]);

  const handleKeyDown = (e, index) => {
    let targetIndex = -1;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        targetIndex = (index + 1) % tabs.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        targetIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        targetIndex = 0;
        break;
      case "End":
        targetIndex = tabs.length - 1;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onChange(tabs[index].id);
        break;
      default:
        return;
    }

    if (targetIndex !== -1) {
      e.preventDefault();
      // Shifting focus
      tabRefs.current[targetIndex]?.focus();
      // Opt-in automatic activation pattern
      onChange(tabs[targetIndex].id);
    }
  };

  return (
    <div className="tabs-wrapper">
      <div 
        role="tablist" 
        aria-label="Application sections" 
        className="tabs-list"
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-control-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tab-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              ref={(el) => (tabRefs.current[idx] = el)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onClick={() => onChange(tab.id)}
              className={`tab-item ${isActive ? "active" : ""}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
