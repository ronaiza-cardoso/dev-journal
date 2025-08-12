import React, { useState } from "react";
import {
  format,
  subDays,
  startOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  differenceInDays,
  isSameDay,
} from "date-fns";
import { TrendingUp, Flame, Trophy, BarChart, Clock } from "lucide-react";
import { parseLocalDate } from "../utils/dateUtils";
import MarkdownPreview from "@uiw/react-markdown-preview";

const ConsistencyView = ({ entries, onSetView }) => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const today = new Date();

  // Calculate streaks
  const calculateStreaks = () => {
    if (entries.length === 0) return { current: 0, longest: 0 };

    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    const entryDates = new Set(sortedEntries.map((entry) => entry.date));

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);

    while (currentStreak < 365) {
      // Prevent infinite loop
      const dateStr = format(checkDate, "yyyy-MM-dd");
      if (entryDates.has(dateStr)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;

    // Get all dates from first entry to today
    const firstEntryDate = new Date(
      sortedEntries[sortedEntries.length - 1].date
    );
    const allDays = eachDayOfInterval({ start: firstEntryDate, end: today });

    for (const day of allDays) {
      const dateStr = format(day, "yyyy-MM-dd");
      if (entryDates.has(dateStr)) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { current: currentStreak, longest: longestStreak };
  };

  // Calculate consistency percentages
  const calculateConsistency = () => {
    const entryDates = new Set(entries.map((entry) => entry.date));

    // Last 7 days
    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });
    const consistency7Days =
      (last7Days.filter((day) => entryDates.has(format(day, "yyyy-MM-dd")))
        .length /
        last7Days.length) *
      100;

    // Last 30 days
    const last30Days = eachDayOfInterval({
      start: subDays(today, 29),
      end: today,
    });
    const consistency30Days =
      (last30Days.filter((day) => entryDates.has(format(day, "yyyy-MM-dd")))
        .length /
        last30Days.length) *
      100;

    // Last 90 days
    const last90Days = eachDayOfInterval({
      start: subDays(today, 89),
      end: today,
    });
    const consistency90Days =
      (last90Days.filter((day) => entryDates.has(format(day, "yyyy-MM-dd")))
        .length /
        last90Days.length) *
      100;

    return {
      last7Days: Math.round(consistency7Days),
      last30Days: Math.round(consistency30Days),
      last90Days: Math.round(consistency90Days),
    };
  };

  // Generate mini calendar for current month
  const generateMonthCalendar = () => {
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const entryDates = new Set(entries.map((entry) => entry.date));
    const entryMap = new Map(entries.map((entry) => [entry.date, entry]));

    return monthDays.map((day) => ({
      date: day,
      dateStr: format(day, "yyyy-MM-dd"),
      hasEntry: entryDates.has(format(day, "yyyy-MM-dd")),
      entry: entryMap.get(format(day, "yyyy-MM-dd")),
      isPast: day < startOfDay(today),
      isToday: isSameDay(day, today),
      isFuture: day > startOfDay(today),
    }));
  };

  const handleDayClick = (dayData) => {
    if (dayData.hasEntry) {
      setSelectedEntry(dayData.entry);
    }
  };

  const streaks = calculateStreaks();
  const consistency = calculateConsistency();
  const monthCalendar = generateMonthCalendar();

  // Calculate total stats
  const totalEntries = entries.length;
  const daysJournaling =
    entries.length > 0
      ? differenceInDays(today, new Date(entries[entries.length - 1].date)) + 1
      : 0;
  const averagePerWeek =
    daysJournaling > 0
      ? Math.round((totalEntries / daysJournaling) * 7 * 10) / 10
      : 0;

  return (
    <div className="consistency-view">
      <div className="consistency-tracker">
        <div className="consistency-header">
          <div className="consistency-title">
            <TrendingUp size={20} />
            <span>Consistency Tracker</span>
          </div>
        </div>

        <div className="consistency-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Flame
                size={24}
                style={{ color: streaks.current > 0 ? "#f59e0b" : "#6b7280" }}
              />
            </div>
            <div className="stat-content">
              <div className="stat-value">{streaks.current}</div>
              <div className="stat-label">Current Streak</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Trophy size={24} style={{ color: "#10b981" }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{streaks.longest}</div>
              <div className="stat-label">Longest Streak</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <BarChart size={24} style={{ color: "#3b82f6" }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalEntries}</div>
              <div className="stat-label">Total Entries</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={24} style={{ color: "#8b5cf6" }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{averagePerWeek}</div>
              <div className="stat-label">Avg/Week</div>
            </div>
          </div>
        </div>

        <div className="consistency-periods">
          <div className="period-stat">
            <span className="period-label">Last 7 days</span>
            <div className="period-bar">
              <div
                className="period-fill"
                style={{
                  width: `${consistency.last7Days}%`,
                  backgroundColor:
                    consistency.last7Days >= 70
                      ? "#10b981"
                      : consistency.last7Days >= 40
                      ? "#f59e0b"
                      : "#ef4444",
                }}
              />
            </div>
            <span className="period-value">{consistency.last7Days}%</span>
          </div>

          <div className="period-stat">
            <span className="period-label">Last 30 days</span>
            <div className="period-bar">
              <div
                className="period-fill"
                style={{
                  width: `${consistency.last30Days}%`,
                  backgroundColor:
                    consistency.last30Days >= 70
                      ? "#10b981"
                      : consistency.last30Days >= 40
                      ? "#f59e0b"
                      : "#ef4444",
                }}
              />
            </div>
            <span className="period-value">{consistency.last30Days}%</span>
          </div>

          <div className="period-stat">
            <span className="period-label">Last 90 days</span>
            <div className="period-bar">
              <div
                className="period-fill"
                style={{
                  width: `${consistency.last90Days}%`,
                  backgroundColor:
                    consistency.last90Days >= 70
                      ? "#10b981"
                      : consistency.last90Days >= 40
                      ? "#f59e0b"
                      : "#ef4444",
                }}
              />
            </div>
            <span className="period-value">{consistency.last90Days}%</span>
          </div>
        </div>

        <div className="month-calendar">
          <div className="calendar-header">
            <span>{format(today, "MMMM yyyy")}</span>
            <p className="calendar-instruction">
              Click on green days to view entries
            </p>
          </div>
          <div className="calendar-grid">
            {monthCalendar.map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${day.hasEntry ? "has-entry" : ""} ${
                  day.isToday ? "is-today" : ""
                } ${day.isFuture ? "is-future" : ""} ${
                  day.hasEntry ? "clickable" : ""
                }`}
                title={`${format(day.date, "MMM dd")} ${
                  day.hasEntry
                    ? "✓ Entry - Click to view"
                    : day.isFuture
                    ? "Future"
                    : "No entry"
                }`}
                onClick={() => handleDayClick(day)}
              >
                {format(day.date, "d")}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedEntry && (
        <div className="selected-entry">
          <div className="entry-header">
            <h3>
              Entry for{" "}
              {format(
                parseLocalDate(selectedEntry.date),
                "EEEE, MMMM dd, yyyy"
              )}
            </h3>
            <button
              className="close-entry-button"
              onClick={() => setSelectedEntry(null)}
            >
              ×
            </button>
          </div>
          <div className="entry-content">
            <MarkdownPreview
              source={selectedEntry.mainEntry}
              data-color-mode="light"
              style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsistencyView;
