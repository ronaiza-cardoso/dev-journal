import React from "react";
import {
  format,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  getDay,
} from "date-fns";

const ContributionsCalendar = ({ entries }) => {
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date(currentYear, 0, 1));
  const yearEnd = endOfYear(new Date(currentYear, 11, 31));

  // Create a map of dates to entry counts
  const entryCountByDate = {};
  entries.forEach((entry) => {
    const date = entry.date;
    if (!entryCountByDate[date]) {
      entryCountByDate[date] = 0;
    }
    entryCountByDate[date] += 1;
  });

  // Get all days of the year
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

  // Group days by weeks
  const weeks = [];
  let currentWeek = [];

  // Add empty cells for days before the year starts
  const firstDayOfWeek = getDay(yearStart);
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  allDays.forEach((day, index) => {
    currentWeek.push(day);

    if (currentWeek.length === 7 || index === allDays.length - 1) {
      // Fill remaining days of the week if it's the last week
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getIntensityLevel = (count) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 2) return 2;
    if (count <= 4) return 3;
    return 4;
  };

  const getTooltipText = (day, count) => {
    if (!day) return "";
    const dateStr = format(day, "MMM dd, yyyy");
    if (count === 0) {
      return `No entries on ${dateStr}`;
    }
    return `${count} ${count === 1 ? "entry" : "entries"} on ${dateStr}`;
  };

  const monthLabels = [];
  const currentDate = new Date(yearStart);
  while (currentDate <= yearEnd) {
    const monthName = format(currentDate, "MMM");
    const weekIndex = Math.floor(
      (currentDate - yearStart) / (7 * 24 * 60 * 60 * 1000)
    );
    monthLabels.push({ name: monthName, week: weekIndex });
    currentDate.setMonth(currentDate.getMonth() + 1);
    currentDate.setDate(1);
  }

  // Remove duplicate months
  const uniqueMonthLabels = monthLabels.filter(
    (month, index, arr) => index === 0 || month.name !== arr[index - 1].name
  );

  const totalEntries = entries.filter((entry) => {
    const entryYear = new Date(entry.date).getFullYear();
    return entryYear === currentYear;
  }).length;

  const activeDays = Object.keys(entryCountByDate).filter((date) => {
    const entryYear = new Date(date).getFullYear();
    return entryYear === currentYear && entryCountByDate[date] > 0;
  }).length;

  return (
    <div className="contributions-calendar">
      <div className="calendar-header">
        <h2>Journal Activity in {currentYear}</h2>
        <div className="activity-stats">
          <span className="stat">
            <strong>{totalEntries}</strong> entries in the last year
          </span>
          <span className="stat">
            <strong>{activeDays}</strong> active days
          </span>
        </div>
      </div>

      <div className="calendar-container">
        <div className="month-labels">
          {uniqueMonthLabels.map((month, index) => (
            <span
              key={index}
              className="month-label"
              style={{ gridColumn: `${month.week + 1} / span 4` }}
            >
              {month.name}
            </span>
          ))}
        </div>

        <div className="weekdays">
          <span className="weekday">Sun</span>
          <span className="weekday">Mon</span>
          <span className="weekday">Tue</span>
          <span className="weekday">Wed</span>
          <span className="weekday">Thu</span>
          <span className="weekday">Fri</span>
          <span className="weekday">Sat</span>
        </div>

        <div className="calendar-grid">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="calendar-week">
              {week.map((day, dayIndex) => {
                if (!day) {
                  return (
                    <div key={dayIndex} className="calendar-day empty"></div>
                  );
                }

                const dateStr = format(day, "yyyy-MM-dd");
                const count = entryCountByDate[dateStr] || 0;
                const intensity = getIntensityLevel(count);

                return (
                  <div
                    key={dayIndex}
                    className={`calendar-day intensity-${intensity}`}
                    title={getTooltipText(day, count)}
                    data-count={count}
                    data-date={dateStr}
                  ></div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="calendar-legend">
          <span className="legend-text">Less</span>
          <div className="legend-squares">
            <div className="legend-square intensity-0"></div>
            <div className="legend-square intensity-1"></div>
            <div className="legend-square intensity-2"></div>
            <div className="legend-square intensity-3"></div>
            <div className="legend-square intensity-4"></div>
          </div>
          <span className="legend-text">More</span>
        </div>
      </div>
    </div>
  );
};

export default ContributionsCalendar;
