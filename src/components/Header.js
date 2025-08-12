import React from "react";
import {
  Plus,
  List,
  FileText,
  Download,
  Upload,
  TrendingUp,
} from "lucide-react";

const Header = ({ view, onSetView, onImportJSON, onExportJSON, importing }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-logo">
          <span className="logo-bracket">{"{"}</span>
          <span className="logo-text">Dev Journal</span>
          <span className="logo-bracket">{"}"}</span>
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
            className={`nav-button ${view === "consistency" ? "active" : ""}`}
            onClick={() => onSetView("consistency")}
          >
            <TrendingUp size={16} />
            Consistency
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
