import React from "react";
import { Calendar, Plus, List, FileText, Download, Upload } from "lucide-react";

const Header = ({ view, onSetView, onImportJSON, onExportJSON, importing }) => {
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
            onClick={onImportJSON}
            disabled={importing}
          >
            <Upload size={16} />
            {importing ? "Importing..." : "Import"}
          </button>
          <button className="nav-button export-button" onClick={onExportJSON}>
            <Download size={16} />
            Export
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
