function combineDateAndTime(date, timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);

  // Get the calendar date in UTC so it doesn't depend on the server timezone
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  // IST is UTC+5:30
  const istOffsetMinutes = 5 * 60 + 30;

  return new Date(
    Date.UTC(year, month, day, hours, minutes) - istOffsetMinutes * 60 * 1000
  );
}

export function getAssessmentTimeStatus(assessment) {
  const now = new Date();

  const startDateTime = combineDateAndTime(
    assessment.startDate,
    assessment.startTime
  );

  const endDateTime = combineDateAndTime(
    assessment.startDate,
    assessment.endTime
  );

  if (now < startDateTime) return "UPCOMING";
  if (now > endDateTime) return "ENDED";

  return "LIVE";
}

export function attachTimeStatus(assessmentDoc) {
  const assessment = assessmentDoc.toObject
    ? assessmentDoc.toObject()
    : assessmentDoc;

  return {
    ...assessment,
    timeStatus: getAssessmentTimeStatus(assessment),
  };
}