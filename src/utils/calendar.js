export const createGoogleCalendarUrl = ({
  title,
  startDate,
  durationMinutes = 60,
  details = "",
  location = ""
}) => {

  const start = new Date(startDate);

  const end = new Date(
    start.getTime() +
    durationMinutes * 60 * 1000
  );

  const formatDate = (date) => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  return (
    "https://calendar.google.com/calendar/render" +
    "?action=TEMPLATE" +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${formatDate(start)}/${formatDate(end)}` +
    `&details=${encodeURIComponent(details)}` +
    `&location=${encodeURIComponent(location)}`
  );
};