import React, { useState } from "react";
import { Calendar, Save, Edit, Eye } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import MarkdownPreview from "@uiw/react-markdown-preview";

const EntryForm = ({
  currentDate,
  setCurrentDate,
  currentEntry,
  setCurrentEntry,
  onSave,
  isEditing = false,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState("markdown");
  return (
    <div className="add-entry-section">
      <div className="entry-form">
        <div className="form-group">
          <label htmlFor="date">
            <Calendar size={16} />
            Date
          </label>
          <input
            id="date"
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="date-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="mainEntry">
            {isEditing ? "Edit Entry" : "Main Entry"}
          </label>
          <div className="markdown-editor-container">
            <div className="editor-tabs">
              <button
                className={`tab-button ${
                  activeTab === "markdown" ? "active" : ""
                }`}
                onClick={() => setActiveTab("markdown")}
              >
                <Edit size={14} />
                MARKDOWN
              </button>
              <button
                className={`tab-button ${
                  activeTab === "preview" ? "active" : ""
                }`}
                onClick={() => setActiveTab("preview")}
              >
                <Eye size={14} />
                PREVIEW
              </button>
            </div>

            <div className="editor-content">
              {activeTab === "markdown" ? (
                <MDEditor
                  value={currentEntry}
                  onChange={setCurrentEntry}
                  preview="edit"
                  hideToolbar={false}
                  height={500}
                  data-color-mode="light"
                  placeholder="Describe what you worked on today..."
                  visibleDragBar={false}
                />
              ) : (
                <div className="preview-container">
                  <MarkdownPreview
                    source={currentEntry || "Nothing to preview..."}
                    data-color-mode="light"
                    style={{
                      backgroundColor: "white",
                      padding: "20px",
                      minHeight: "500px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0 0 8px 8px",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            onClick={onSave}
            className="save-button"
            disabled={!currentEntry || !currentEntry.trim()}
          >
            <Save size={16} />
            {isEditing ? "Update Entry" : "Save Entry"}
          </button>
          {isEditing && onCancel && (
            <button onClick={onCancel} className="cancel-button">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntryForm;
