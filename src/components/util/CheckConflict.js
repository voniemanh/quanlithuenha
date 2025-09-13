export const checkConflict = (contracts, propertyId, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return contracts.some(c => {
    if (c.propertyId !== propertyId) return false;
    if (c.status !== "paid") return false;

    const cStart = new Date(c.startDate);
    const cEnd = new Date(c.endDate);
    return start < cEnd && end > cStart;
  });
};