import React from "react";
import Modal from "./Modal";
import { Trash2, AlertTriangle } from "lucide-react";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  entryDate,
  entryPreview,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Journal Entry"
      size="small"
    >
      <div className="delete-modal-content">
        <div className="delete-modal-icon">
          <AlertTriangle size={48} className="warning-icon" />
        </div>

        <div className="delete-modal-message">
          <p className="delete-modal-text">
            Are you sure you want to delete this journal entry?
          </p>

          {entryDate && (
            <div className="delete-modal-entry-info">
              <p className="entry-date">
                <strong>Date:</strong> {entryDate}
              </p>
              {entryPreview && (
                <div className="entry-preview">
                  <strong>Content:</strong>
                  <p className="preview-text">
                    {entryPreview.length > 100
                      ? `${entryPreview.substring(0, 100)}...`
                      : entryPreview}
                  </p>
                </div>
              )}
            </div>
          )}

          <p className="delete-modal-warning">This action cannot be undone.</p>
        </div>

        <div className="delete-modal-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="delete-confirm-button" onClick={handleConfirm}>
            <Trash2 size={16} />
            Delete Entry
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
