import { Transaction } from "@/types/finance";
import { addDays, addWeeks, addMonths, addYears, isAfter, startOfDay } from "date-fns";

export const generateRecurringTransactions = (
  baseTransactions: Transaction[],
  targetDate: Date = new Date()
): Transaction[] => {
  const generatedTransactions: Transaction[] = [];
  const today = startOfDay(new Date());
  const target = startOfDay(targetDate);

  baseTransactions
    .filter(t => t.isRecurring && t.recurringFrequency)
    .forEach(transaction => {
      const transactionDate = startOfDay(new Date(transaction.date));
      
      // Don't generate if transaction is in the future relative to today
      if (isAfter(transactionDate, today)) {
        return;
      }

      let nextDate = new Date(transactionDate);
      let iterationCount = 0;
      const maxIterations = 1000; // Safety limit

      while (iterationCount < maxIterations) {
        // Calculate next occurrence
        switch (transaction.recurringFrequency) {
          case "daily":
            nextDate = addDays(nextDate, 1);
            break;
          case "weekly":
            nextDate = addWeeks(nextDate, 1);
            break;
          case "monthly":
            nextDate = addMonths(nextDate, 1);
            break;
          case "yearly":
            nextDate = addYears(nextDate, 1);
            break;
          default:
            return;
        }

        // Stop if we've gone beyond the target date
        if (isAfter(nextDate, target)) {
          break;
        }

        // Skip if we haven't reached today yet
        if (!isAfter(nextDate, today) && nextDate.getTime() !== today.getTime()) {
          iterationCount++;
          continue;
        }

        // Check if this transaction already exists
        const existingTransaction = baseTransactions.find(t => 
          t.category === transaction.category &&
          t.amount === transaction.amount &&
          t.type === transaction.type &&
          t.description === transaction.description &&
          startOfDay(new Date(t.date)).getTime() === nextDate.getTime()
        );

        if (!existingTransaction) {
          // Generate new transaction
          const newTransaction: Transaction = {
            ...transaction,
            id: `${transaction.id}-recurring-${nextDate.getTime()}`,
            date: nextDate.toISOString(),
          };

          generatedTransactions.push(newTransaction);
        }

        iterationCount++;
      }
    });

  return generatedTransactions;
};

export const getNextRecurringDate = (
  date: Date,
  frequency: "daily" | "weekly" | "monthly" | "yearly"
): Date => {
  switch (frequency) {
    case "daily":
      return addDays(date, 1);
    case "weekly":
      return addWeeks(date, 1);
    case "monthly":
      return addMonths(date, 1);
    case "yearly":
      return addYears(date, 1);
    default:
      return date;
  }
};