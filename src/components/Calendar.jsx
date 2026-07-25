import "../styles/Calendar.css";

export default function Calendar({
  days,
  selectedDates,
  isBlocked,
  handleSelectDate,
  setHoverDate,
  isInRangePreview
}) {
  return (
    <div className="calendar-grid text-center">
      {days.map((date) => {

        const blocked = isBlocked(date);

        const selectedStart =
          selectedDates.start &&
          new Date(selectedDates.start).toDateString() ===
            date.toDateString();

        const selectedEnd =
          selectedDates.end &&
          new Date(selectedDates.end).toDateString() ===
            date.toDateString();

        const inRange =
          selectedDates.start &&
          selectedDates.end &&
          date > new Date(selectedDates.start) &&
          date < new Date(selectedDates.end);

        const preview =
          isInRangePreview(date);

        const classNames = [
          "day",
          blocked && "blocked",
          (selectedStart || selectedEnd) && "selected",
          inRange && "range",
          preview && "preview"
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={date.toISOString()}
            type="button"
            disabled={blocked}
            onClick={() => handleSelectDate(date)}
            onMouseEnter={() => setHoverDate(date)}
            className={classNames}
          >
            {date.getDate()}
          </button>
        );
      })}
    </div>
  );
}