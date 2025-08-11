import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import "./App.css";
import Header from "./components/Header";
import EntryForm from "./components/EntryForm";
import EntryList from "./components/EntryList";
import Notification from "./components/Notification";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import { loadMarkdownFile } from "./markdownParser";
import indexedDBService from "./services/indexedDBService";

function App() {
  const [entries, setEntries] = useState([]);
  const [currentDate, setCurrentDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [currentEntry, setCurrentEntry] = useState("");
  const [view, setView] = useState("add");
  const [importing, setImporting] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [notification, setNotification] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    entryToDelete: null,
  });

  const showNotification = (type, title, message = null, duration = 4000) => {
    setNotification({ type, title, message, duration });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // Load entries from IndexedDB on component mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        // Initialize IndexedDB
        await indexedDBService.init();

        // Try to migrate data from localStorage if it exists
        const migratedCount = await indexedDBService.migrateFromLocalStorage();
        if (migratedCount > 0) {
          // Clear localStorage after successful migration
          localStorage.removeItem("journalEntries");
          console.log(
            `Successfully migrated ${migratedCount} entries from localStorage`
          );
        }

        // Load all entries from IndexedDB
        const savedEntries = await indexedDBService.getAllEntries();
        if (savedEntries) {
          // Sort entries by date (newest first)
          const sortedEntries = savedEntries.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          setEntries(sortedEntries);
        }
      } catch (error) {
        console.error("Error loading entries from IndexedDB:", error);
        // Fallback to localStorage if IndexedDB fails
        const savedEntries = localStorage.getItem("journalEntries");
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries));
        }
      }
    };

    loadEntries();
  }, []);

  const saveEntry = async () => {
    if (!currentEntry || !currentEntry.trim()) return;

    if (editingEntry) {
      // Update existing entry
      const updatedEntry = {
        ...editingEntry,
        date: currentDate,
        mainEntry: currentEntry,
        timestamp: new Date().toISOString(),
      };

      try {
        // Update in IndexedDB
        await indexedDBService.updateEntry(updatedEntry);

        // Update state
        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === editingEntry.id ? updatedEntry : entry
          )
        );

        setEditingEntry(null);
        setView("list");
        showNotification(
          "success",
          "Entry Updated",
          "Your journal entry has been updated successfully."
        );
      } catch (error) {
        console.error("Error updating entry:", error);
        showNotification(
          "error",
          "Update Failed",
          "Unable to update entry. Please try again."
        );
      }
    } else {
      // Create new entry
      const newEntry = {
        id: Date.now(),
        date: currentDate,
        mainEntry: currentEntry,
        timestamp: new Date().toISOString(),
      };

      try {
        // Save to IndexedDB
        await indexedDBService.saveEntry(newEntry);

        // Update state
        setEntries((prev) => [newEntry, ...prev]);

        // Switch to list view to show the new entry
        setView("list");

        showNotification(
          "success",
          "Entry Saved",
          "Your journal entry has been saved successfully."
        );
      } catch (error) {
        console.error("Error saving entry:", error);
        showNotification(
          "error",
          "Save Failed",
          "Unable to save entry. Please try again."
        );
      }
    }

    // Reset form
    setCurrentEntry("");
  };

  const editEntry = (entry) => {
    setEditingEntry(entry);
    setCurrentDate(entry.date);
    setCurrentEntry(entry.mainEntry);
    setView("add");
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setCurrentEntry("");
    setCurrentDate(format(new Date(), "yyyy-MM-dd"));
  };

  const deleteEntry = (id) => {
    const entryToDelete = entries.find((entry) => entry.id === id);
    setDeleteModal({
      isOpen: true,
      entryToDelete: entryToDelete,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.entryToDelete) return;

    try {
      // Delete from IndexedDB
      await indexedDBService.deleteEntry(deleteModal.entryToDelete.id);

      // Update state
      setEntries((prev) =>
        prev.filter((entry) => entry.id !== deleteModal.entryToDelete.id)
      );

      showNotification(
        "success",
        "Entry Deleted",
        "Journal entry has been deleted successfully."
      );
    } catch (error) {
      console.error("Error deleting entry:", error);
      showNotification(
        "error",
        "Delete Failed",
        "Unable to delete entry. Please try again."
      );
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      entryToDelete: null,
    });
  };

  const exportToJSON = () => {
    if (entries.length === 0) {
      showNotification(
        "warning",
        "No Entries",
        "There are no entries to export."
      );
      return;
    }

    // Create export data with metadata
    const exportData = {
      exportDate: new Date().toISOString(),
      totalEntries: entries.length,
      dateRange: {
        earliest: entries.reduce(
          (earliest, entry) => (entry.date < earliest ? entry.date : earliest),
          entries[0].date
        ),
        latest: entries.reduce(
          (latest, entry) => (entry.date > latest ? entry.date : latest),
          entries[0].date
        ),
      },
      entries: entries.sort((a, b) => a.date.localeCompare(b.date)), // Sort chronologically for export
    };

    // Create and download JSON file
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dev-journal-backup-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification(
      "success",
      "Export Complete",
      `Successfully exported ${entries.length} entries to JSON file.`
    );
  };

  const exportToMarkdown = () => {
    const groupedEntries = entries.reduce((acc, entry) => {
      const year = entry.date.split("-")[0];
      if (!acc[year]) acc[year] = [];
      acc[year].push(entry);
      return acc;
    }, {});

    Object.keys(groupedEntries).forEach((year) => {
      let markdown = "";
      const yearEntries = groupedEntries[year].sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      yearEntries.forEach((entry) => {
        markdown += `## ${entry.date}\n\n`;
        markdown += `${entry.mainEntry}\n`;

        entry.subEntries.forEach((sub, index) => {
          markdown += `   ${index + 1}.1 ${sub}\n`;
        });

        markdown += "\n";
      });

      // Create and download file
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${year}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const importMarkdownEntries = async () => {
    setImporting(true);
    try {
      // Load entries from both markdown files
      const entries2024 = await loadMarkdownFile("/2024.md");
      const entries2025 = await loadMarkdownFile("/2025.md");

      // Combine all entries
      const allImportedEntries = [...entries2024, ...entries2025];

      // Get existing entries to avoid duplicates
      const existingEntries = entries;
      const existingDates = new Set(existingEntries.map((entry) => entry.date));

      // Filter out entries that already exist (by date)
      const newEntries = allImportedEntries.filter(
        (entry) => !existingDates.has(entry.date)
      );

      if (newEntries.length > 0) {
        try {
          // Save imported entries to IndexedDB
          await indexedDBService.saveMultipleEntries(newEntries);

          // Add imported entries to existing ones
          const updatedEntries = [...existingEntries, ...newEntries].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          setEntries(updatedEntries);
          showNotification(
            "success",
            "Import Complete",
            `Successfully imported ${newEntries.length} entries from your markdown files.`
          );
        } catch (error) {
          console.error("Error saving imported entries:", error);
          showNotification(
            "error",
            "Import Failed",
            "Error importing entries. Please try again."
          );
        }
      } else {
        showNotification(
          "warning",
          "No New Entries",
          "All entries from your markdown files are already in the system."
        );
      }
    } catch (error) {
      console.error("Error importing markdown entries:", error);
      showNotification(
        "error",
        "Import Error",
        "Error importing markdown files. Please make sure the files are accessible."
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="app">
      <Header
        view={view}
        onSetView={setView}
        onImport={importMarkdownEntries}
        onExportMarkdown={exportToMarkdown}
        onExportJSON={exportToJSON}
        importing={importing}
      />

      <main className="main-content">
        {view === "add" ? (
          <EntryForm
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            currentEntry={currentEntry}
            setCurrentEntry={setCurrentEntry}
            onSave={saveEntry}
            isEditing={!!editingEntry}
            onCancel={cancelEdit}
          />
        ) : (
          <EntryList
            entries={entries}
            onDeleteEntry={deleteEntry}
            onEditEntry={editEntry}
            onSetView={setView}
          />
        )}
      </main>
      <Notification notification={notification} onClose={hideNotification} />
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        entryDate={deleteModal.entryToDelete?.date}
        entryPreview={deleteModal.entryToDelete?.mainEntry}
      />
    </div>
  );
}

export default App;
