export const convertedDateStart = (parsedDate: Date) => {
  const converted = new Date(
    parsedDate.getUTCFullYear(),
    parsedDate.getUTCMonth(),
    parsedDate.getUTCDate(),
    0,
    0,
    0,
    0,
  );
  return converted;
};

export const convertedDateEnd = (parsedDate: Date) => {
  const converted = new Date(
    parsedDate.getUTCFullYear(),
    parsedDate.getUTCMonth(),
    parsedDate.getUTCDate(),
    23,
    59,
    59,
    999,
  );
  return converted;
};
