import React, { useState, useEffect } from "react";
import { format, startOfWeek, subDays, isAfter, isSameDay } from "date-fns";
import {
  FileText,
  Plus,
  Upload,
  Calendar,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Edit3,
  Filter,
  X,
  Copy,
} from "lucide-react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { parseLocalDate } from "../utils/dateUtils";

const EntryItem = ({ entry, onDelete, onEdit }) => {
  const formatDateForDisplay = (dateStr) => {
    // Use timezone-safe date parsing
    const date = parseLocalDate(dateStr);
    return format(date, "dd");
  };

  const formatDayOfWeek = (dateStr) => {
    // Use timezone-safe date parsing
    const date = parseLocalDate(dateStr);
    return format(date, "EEE"); // Mon, Tue, Wed, etc.
  };

  return (
    <div className={`entry-item ${entry.imported ? "imported-entry" : ""}`}>
      <div className="entry-item-header">
        <div className="entry-date">
          <span className="day-number">{formatDateForDisplay(entry.date)}</span>
          <span className="day-of-week">{formatDayOfWeek(entry.date)}</span>
          {entry.imported && (
            <span className="imported-badge" title="Imported from markdown">
              <Upload size={10} />
            </span>
          )}
        </div>
        <div className="entry-content">
          <div className="main-entry">
            <MarkdownPreview
              source={entry.mainEntry}
              data-color-mode="light"
              style={{
                backgroundColor: "transparent",
                fontSize: "0.95rem",
                lineHeight: "1.6",
              }}
            />
          </div>
        </div>
        <div className="entry-actions">
          <button
            onClick={() => onEdit(entry)}
            className="edit-button"
            title="Edit entry"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="delete-button"
            title="Delete entry"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

const WeekSection = ({
  weekStart,
  entries,
  onDeleteEntry,
  onEditEntry,
  isExpanded,
  onToggle,
}) => {
  const totalEntries = entries.length;

  const copyWeekContent = async () => {
    try {
      // Sort entries by date (oldest first for chronological order)
      const sortedEntries = [...entries].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Format the week content as plain text
      let weekText = `Week of ${weekStart}\n`;
      weekText += "=".repeat(weekText.length - 1) + "\n\n";

      sortedEntries.forEach((entry) => {
        const date = parseLocalDate(entry.date);
        const dayName = format(date, "EEEE"); // Full day name (Monday, Tuesday, etc.)
        const dayDate = format(date, "MMM dd"); // Month day (Jan 15)

        weekText += `${dayName}, ${dayDate}\n`;
        weekText += "-".repeat(`${dayName}, ${dayDate}`.length) + "\n";

        // Remove markdown formatting and get plain text
        const plainText = entry.mainEntry
          .replace(/#{1,6}\s+/g, "") // Remove headers
          .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
          .replace(/\*(.*?)\*/g, "$1") // Remove italic
          .replace(/`(.*?)`/g, "$1") // Remove inline code
          .replace(/```[\s\S]*?```/g, "") // Remove code blocks
          .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links, keep text
          .replace(/^\s*[-*+]\s+/gm, "• ") // Convert list items to bullets
          .replace(/^\s*\d+\.\s+/gm, "• ") // Convert numbered lists to bullets
          .trim();

        weekText += plainText + "\n\n";
      });

      // Copy to clipboard
      await navigator.clipboard.writeText(weekText.trim());

      // Show success feedback (you could add a toast notification here)
      console.log("Week content copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy week content:", error);
      // Fallback for older browsers - recreate the text since it's out of scope
      try {
        const sortedEntries = [...entries].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        let fallbackText = `Week of ${weekStart}\n`;
        fallbackText += "=".repeat(fallbackText.length - 1) + "\n\n";
        sortedEntries.forEach((entry) => {
          const date = parseLocalDate(entry.date);
          const dayName = format(date, "EEEE");
          const dayDate = format(date, "MMM dd");
          fallbackText += `${dayName}, ${dayDate}\n`;
          fallbackText += "-".repeat(`${dayName}, ${dayDate}`.length) + "\n";
          const plainText = entry.mainEntry
            .replace(/#{1,6}\s+/g, "")
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .replace(/`(.*?)`/g, "$1")
            .replace(/```[\s\S]*?```/g, "")
            .replace(/\[(.*?)\]\(.*?\)/g, "$1")
            .replace(/^\s*[-*+]\s+/gm, "• ")
            .replace(/^\s*\d+\.\s+/gm, "• ")
            .trim();
          fallbackText += plainText + "\n\n";
        });

        const textArea = document.createElement("textarea");
        textArea.value = fallbackText.trim();
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch (fallbackError) {
        console.error("Fallback copy also failed:", fallbackError);
      }
    }
  };

  return (
    <div className="week-section">
      <div className="week-header">
        <div className="week-title" onClick={onToggle}>
          <div className="week-toggle">
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            <h4>Week of {weekStart}</h4>
          </div>
          <div className="week-stats">
            <span className="stat-item">
              <Calendar size={10} />
              {totalEntries} days
            </span>
            <span className="stat-item">
              <BarChart3 size={10} />
              {totalEntries} entries
            </span>
          </div>
        </div>
        <button
          className="copy-week-button"
          onClick={(e) => {
            e.stopPropagation();
            copyWeekContent();
          }}
          title="Copy week content to clipboard"
        >
          <Copy size={14} />
        </button>
      </div>

      {isExpanded && (
        <div className="week-entries">
          {entries.map((entry) => (
            <EntryItem
              key={entry.id}
              entry={entry}
              onDelete={onDeleteEntry}
              onEdit={onEditEntry}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const MonthSection = ({
  month,
  entries,
  onDeleteEntry,
  onEditEntry,
  isExpanded,
  onToggle,
  autoExpandDate,
}) => {
  const [expandedWeeks, setExpandedWeeks] = useState({});

  const totalEntries = entries.length;
  const activeDays = entries.length;

  // Group entries by weeks
  const weekGroups = {};
  entries.forEach((entry) => {
    const date = parseLocalDate(entry.date);
    const weekStart = startOfWeek(date);
    const weekKey = format(weekStart, "MMM dd");

    if (!weekGroups[weekKey]) {
      weekGroups[weekKey] = [];
    }
    weekGroups[weekKey].push(entry);
  });

  // Sort weeks by date (newest first)
  const sortedWeeks = Object.keys(weekGroups).sort((a, b) => {
    const dateA = new Date(a + ", " + new Date().getFullYear());
    const dateB = new Date(b + ", " + new Date().getFullYear());
    return dateB - dateA;
  });

  const toggleWeek = (weekKey) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekKey]: !prev[weekKey],
    }));
  };

  // Auto-expand week when autoExpandDate is provided
  useEffect(() => {
    if (autoExpandDate && isExpanded) {
      const date = parseLocalDate(autoExpandDate);
      const entryMonth = format(date, "MMMM");

      if (entryMonth === month) {
        const weekStart = startOfWeek(date);
        const weekKey = format(weekStart, "MMM dd");
        setExpandedWeeks((prev) => ({
          ...prev,
          [weekKey]: true,
        }));
      }
    }
  }, [autoExpandDate, isExpanded, month]);

  return (
    <div className="month-section">
      <div className="month-header" onClick={onToggle}>
        <div className="month-title">
          <div className="month-toggle">
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            <h3>{month}</h3>
          </div>
          <div className="month-stats">
            <span className="stat-item">
              <Calendar size={12} />
              {activeDays} days
            </span>
            <span className="stat-item">
              <BarChart3 size={12} />
              {totalEntries} entries
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="month-weeks">
          {sortedWeeks.map((weekKey) => (
            <WeekSection
              key={weekKey}
              weekStart={weekKey}
              entries={weekGroups[weekKey]}
              onDeleteEntry={onDeleteEntry}
              onEditEntry={onEditEntry}
              isExpanded={expandedWeeks[weekKey] || false}
              onToggle={() => toggleWeek(weekKey)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const YearSection = ({
  year,
  months,
  onDeleteEntry,
  onEditEntry,
  isExpanded,
  onToggle,
  autoExpandDate,
}) => {
  const [expandedMonths, setExpandedMonths] = useState({});

  const sortedMonths = Object.keys(months).sort((a, b) => {
    const monthOrder = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthOrder.indexOf(b) - monthOrder.indexOf(a); // Newest first
  });

  // Calculate year totals
  const yearTotals = Object.values(months).reduce(
    (totals, monthEntries) => {
      totals.entries += monthEntries.length;
      totals.activeDays += monthEntries.length;
      return totals;
    },
    { entries: 0, activeDays: 0 }
  );

  // Calculate semester summaries
  const semesters = {
    "First Half": ["January", "February", "March", "April", "May", "June"],
    "Second Half": [
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  };

  const semesterStats = Object.entries(semesters)
    .map(([semesterName, semesterMonths]) => {
      const stats = semesterMonths.reduce(
        (totals, monthName) => {
          if (months[monthName]) {
            totals.entries += months[monthName].length;
            totals.activeDays += months[monthName].length;
          }
          return totals;
        },
        { entries: 0, activeDays: 0 }
      );
      return { name: semesterName, ...stats };
    })
    .filter((semester) => semester.entries > 0);

  const toggleMonth = (monthName) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthName]: !prev[monthName],
    }));
  };

  // Auto-expand month when autoExpandDate is provided
  useEffect(() => {
    if (autoExpandDate && isExpanded) {
      const date = parseLocalDate(autoExpandDate);
      const entryYear = date.getFullYear();

      if (entryYear === parseInt(year)) {
        const month = format(date, "MMMM");
        setExpandedMonths((prev) => ({
          ...prev,
          [month]: true,
        }));
      }
    }
  }, [autoExpandDate, isExpanded, year]);

  return (
    <div className="year-section">
      <div className="year-header" onClick={onToggle}>
        <div className="year-title">
          <div className="year-toggle">
            {isExpanded ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
            <h2>{year}</h2>
          </div>
          <div className="year-stats">
            <span className="year-stat">
              <Calendar size={14} />
              {yearTotals.activeDays} days
            </span>
            <span className="year-stat">
              <BarChart3 size={14} />
              {yearTotals.entries} entries
            </span>
          </div>
        </div>

        {isExpanded && semesterStats.length > 1 && (
          <div className="semester-summaries">
            {semesterStats.map((semester) => (
              <div key={semester.name} className="semester-summary">
                <span className="semester-label">{semester.name}:</span>
                <span className="semester-stats">
                  {semester.activeDays} days, {semester.entries} entries
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="year-months">
          {sortedMonths.map((month) => (
            <MonthSection
              key={month}
              month={month}
              entries={months[month]}
              onDeleteEntry={onDeleteEntry}
              onEditEntry={onEditEntry}
              isExpanded={expandedMonths[month] || false}
              onToggle={() => toggleMonth(month)}
              autoExpandDate={autoExpandDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const EntryList = ({
  entries,
  onDeleteEntry,
  onEditEntry,
  onSetView,
  autoExpandDate,
}) => {
  const [expandedYears, setExpandedYears] = useState({});
  const [filter, setFilter] = useState("all"); // "all", "last7days", "last30days", "last90days"

  // Filter entries based on selected time range
  const filterEntries = (entries) => {
    if (filter === "all") return entries;

    const today = new Date();
    let cutoffDate;

    switch (filter) {
      case "last7days":
        cutoffDate = subDays(today, 7);
        break;
      case "last30days":
        cutoffDate = subDays(today, 30);
        break;
      case "last90days":
        cutoffDate = subDays(today, 90);
        break;
      default:
        return entries;
    }

    return entries.filter((entry) => {
      const entryDate = parseLocalDate(entry.date);
      return isAfter(entryDate, cutoffDate) || isSameDay(entryDate, cutoffDate);
    });
  };

  const groupEntriesByYearAndMonth = (entries) => {
    const grouped = {};

    entries.forEach((entry) => {
      const date = parseLocalDate(entry.date);
      const year = date.getFullYear();
      const month = format(date, "MMMM");

      if (!grouped[year]) {
        grouped[year] = {};
      }
      if (!grouped[year][month]) {
        grouped[year][month] = [];
      }

      grouped[year][month].push(entry);
    });

    // Sort entries within each month by date (newest first)
    Object.keys(grouped).forEach((year) => {
      Object.keys(grouped[year]).forEach((month) => {
        grouped[year][month].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
      });
    });

    return grouped;
  };

  const toggleYear = (year) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  // Auto-expand logic for newly created entries
  useEffect(() => {
    if (autoExpandDate) {
      const date = parseLocalDate(autoExpandDate);
      const year = date.getFullYear();

      // Expand the year containing the new entry
      setExpandedYears((prev) => ({
        ...prev,
        [year]: true,
      }));
    }
  }, [autoExpandDate]);

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <FileText size={48} />
        <p>No entries yet. Start by adding your first daily entry!</p>
        <button onClick={() => onSetView("add")} className="cta-button">
          <Plus size={16} />
          Add First Entry
        </button>
      </div>
    );
  }

  const filteredEntries = filterEntries(entries);
  const groupedEntries = groupEntriesByYearAndMonth(filteredEntries);
  const sortedYears = Object.keys(groupedEntries).sort((a, b) => b - a); // Newest first

  return (
    <div className="entries-list">
      <div className="entries-header">
        <h2>Journal Entries ({filteredEntries.length})</h2>
        <div className="entries-filters">
          <div className="filter-label">
            <Filter size={16} />
            Filter:
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-button ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Time
            </button>
            <button
              className={`filter-button ${
                filter === "last7days" ? "active" : ""
              }`}
              onClick={() => setFilter("last7days")}
            >
              Last 7 Days
            </button>
            <button
              className={`filter-button ${
                filter === "last30days" ? "active" : ""
              }`}
              onClick={() => setFilter("last30days")}
            >
              Last 30 Days
            </button>
            <button
              className={`filter-button ${
                filter === "last90days" ? "active" : ""
              }`}
              onClick={() => setFilter("last90days")}
            >
              Last 90 Days
            </button>
          </div>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <p>No entries found for the selected time period.</p>
          <button onClick={() => setFilter("all")} className="cta-button">
            <X size={16} />
            Clear Filter
          </button>
        </div>
      ) : (
        <div className="entries-hierarchy">
          {sortedYears.map((year) => (
            <YearSection
              key={year}
              year={year}
              months={groupedEntries[year]}
              onDeleteEntry={onDeleteEntry}
              onEditEntry={onEditEntry}
              isExpanded={expandedYears[year] || false}
              onToggle={() => toggleYear(year)}
              autoExpandDate={autoExpandDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EntryList;
