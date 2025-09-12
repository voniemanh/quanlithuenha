export function checkAvailable(contract) {
  if (!contract) return "available";

  const today = new Date();
  const start = new Date(contract.startDate);
  const end = new Date(contract.endDate);

  if (contract.status === "paid" && start <= today && today <= end) {
    return "rented";
  }

  return "available";
}
