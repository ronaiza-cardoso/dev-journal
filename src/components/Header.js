import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Plus,
  List,
  FileText,
  Download,
  Upload,
  ChevronDown,
} from "lucide-react";

const Header = ({
  view,
  onSetView,
  onImport,
  onExportMarkdown,
  onExportJSON,
  importing,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target)
      ) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>
          <FileText className="header-icon" />
          Dev Journal
        </h1>
        <nav className="nav-buttons">
          <button
            className={`nav-button ${view === "add" ? "active" : ""}`}
            onClick={() => onSetView("add")}
          >
            <Plus size={16} />
            Add Entry
          </button>
          <button
            className={`nav-button ${view === "list" ? "active" : ""}`}
            onClick={() => onSetView("list")}
          >
            <List size={16} />
            View Entries
          </button>
          <button
            className={`nav-button ${view === "calendar" ? "active" : ""}`}
            onClick={() => onSetView("calendar")}
          >
            <Calendar size={16} />
            Activity
          </button>
          <button
            className="nav-button import-button"
            onClick={onImport}
            disabled={importing}
          >
            <Upload size={16} />
            {importing ? "Importing..." : "Import"}
          </button>
          <div className="export-dropdown" ref={exportDropdownRef}>
            <button
              className="nav-button export-button"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download size={16} />
              Export
              <ChevronDown size={14} />
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <button
                  className="export-option"
                  onClick={() => {
                    onExportMarkdown();
                    setShowExportMenu(false);
                  }}
                >
                  <FileText size={14} />
                  Export as Markdown
                </button>
                <button
                  className="export-option"
                  onClick={() => {
                    onExportJSON();
                    setShowExportMenu(false);
                  }}
                >
                  <Download size={14} />
                  Export as JSON
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
