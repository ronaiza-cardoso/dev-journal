import React, { useState } from "react";
import { format, startOfWeek } from "date-fns";
import {
  FileText,
  Plus,
  Upload,
  Calendar,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Edit3,
} from "lucide-react";
import MarkdownPreview from "@uiw/react-markdown-preview";

const EntryItem = ({ entry, onDelete, onEdit }) => {
  const formatDateForDisplay = (dateStr) => {
    const date = new Date(dateStr);
    return format(date, "dd");
  };

  const formatDayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
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

  return (
    <div className="week-section">
      <div className="week-header" onClick={onToggle}>
        <div className="week-title">
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
}) => {
  const [expandedWeeks, setExpandedWeeks] = useState({});

  const totalEntries = entries.length;
  const activeDays = entries.length;

  // Group entries by weeks
  const weekGroups = {};
  entries.forEach((entry) => {
    const date = new Date(entry.date);
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

const EntryList = ({ entries, onDeleteEntry, onEditEntry, onSetView }) => {
  const [expandedYears, setExpandedYears] = useState({});

  const groupEntriesByYearAndMonth = (entries) => {
    const grouped = {};

    entries.forEach((entry) => {
      const date = new Date(entry.date);
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

  const groupedEntries = groupEntriesByYearAndMonth(entries);
  const sortedYears = Object.keys(groupedEntries).sort((a, b) => b - a); // Newest first

  return (
    <div className="entries-list">
      <div className="entries-header">
        <h2>Journal Entries ({entries.length})</h2>
      </div>

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
          />
        ))}
      </div>
    </div>
  );
};

export default EntryList;
