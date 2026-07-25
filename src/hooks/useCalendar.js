import { useState, useMemo } from "react";

export function useCalendar(vehicle, unavailableRanges) {

  const [selectedDates, setSelectedDates] = useState({
    start: null,
    end: null
  });

  const [hoverDate, setHoverDate] = useState(null);

  // =========================
  // BLOCKED DATES
  // =========================
  const isBlocked = (date) => {
    return unavailableRanges.some(range => {
      const d = new Date(date);
      return (
        d >= new Date(range.start) &&
        d <= new Date(range.end)
      );
    });
  };

  // =========================
  // SELECT DATE LOGIC
  // =========================
  const handleSelectDate = (date) => {
    if (isBlocked(date)) return;

    if (!selectedDates.start || selectedDates.end) {
      setSelectedDates({
        start: date,
        end: null
      });
      return;
    }

    const start = new Date(selectedDates.start);
    const end = new Date(date);

    if (end < start) {
      setSelectedDates({
        start: date,
        end: selectedDates.start
      });
    } else {
      setSelectedDates(prev => ({
        ...prev,
        end: date
      }));
    }
  };

  // =========================
  // PREVIEW RANGE
  // =========================
  const isInRangePreview = (date) => {
    if (!selectedDates.start || selectedDates.end) return false;
    if (!hoverDate) return false;

    const start = new Date(selectedDates.start);
    const hover = new Date(hoverDate);
    const d = new Date(date);

    return d >= start && d <= hover;
  };

  // =========================
  // FORM VALIDATION
  // =========================
const isRangeValid = useMemo(() => {
  if (!selectedDates.start || !selectedDates.end) return false;

  const start = new Date(selectedDates.start);
  const end = new Date(selectedDates.end);

  const d = new Date(start);

  while (d <= end) {
    if (isBlocked(d)) return false;
    d.setDate(d.getDate() + 1);
  }

  return true;
}, [selectedDates, unavailableRanges, isBlocked]);

const isFormValid =
  vehicle.type !== "rent"
    ? true
    : selectedDates.start &&
      selectedDates.end &&
      isRangeValid;
  // =========================
  // DAYS GENERATION
  // =========================
    const today = new Date();

  const days = useMemo(() => {
    const generateMonthDays = (year, month) => {
      const days = [];
      const date = new Date(year, month, 1);

      while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
      }

      return days;
    };    

    return generateMonthDays(
      today.getFullYear(),
      today.getMonth()
    );
  }, []);


const monthLabel = useMemo(() => {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric"
  }).format(today);
}, []);

  return {
    selectedDates,
    setSelectedDates,
    hoverDate,
    setHoverDate,
    isBlocked,
    handleSelectDate,
    isInRangePreview,
    isFormValid,
    days,
    monthLabel
  };
}