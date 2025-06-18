/**
 * @typedef {import('../types.js').Entry} Entry
 * @typedef {import('../types.js').Category} Category
 */

/**
 * Formats entry data for a daily timeline chart, suitable for a stacked bar chart
 * where income is positive and expenses are negative, grouped by category.
 * Ensures all days in the range are present, even with zero values.
 * This version primarily processes 'actual_transaction' type entries.
 *
 * @param {Entry[]} entries - Array of raw entry objects.
 * @param {Category[]} categories - Array of category objects.
 * @param {Date} rangeStartDate - The start of the date range (inclusive).
 * @param {Date} rangeEndDate - The end of the date range (inclusive).
 * @returns {Array<{date: string, group: string, value: number}>} - Group is category name.
 */
export function formatDataForDailyTimeline(entries, categories, rangeStartDate, rangeEndDate) {
  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
  const categoryLookup = new Map(categories.map(cat => [cat.id, cat]));
  const dailyCategoryAggregates = new Map(); // Map<dateKey, Map<categoryName, valueInDollars>>

  // Normalize range dates to avoid time-of-day issues
  const normStartDate = new Date(rangeStartDate.getFullYear(), rangeStartDate.getMonth(), rangeStartDate.getDate());
  const normEndDate = new Date(rangeEndDate.getFullYear(), rangeEndDate.getMonth(), rangeEndDate.getDate());

  for (const entry of entries) {
    // Only process actual transactions that have a transactionDate
    if (entry.entryType !== 'actual_transaction' || !entry.transactionDate || typeof entry.actualAmount === 'undefined') {
      continue;
    }

    const entryDate = new Date(entry.transactionDate);
    const normEntryDate = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());

    // Only consider entries within the specified date range
    if (normEntryDate >= normStartDate && normEntryDate <= normEndDate) {
      const dateKey = normEntryDate.toISOString().split('T')[0];
      const categoryName = categoryMap.get(entry.categoryId) || 'Uncategorized';
      const category =  categoryLookup.get(entry.categoryId);

      if (!dailyCategoryAggregates.has(dateKey)) {
        dailyCategoryAggregates.set(dateKey, new Map());
      }
      const dayAggregates = dailyCategoryAggregates.get(dateKey);
      const currentValue = dayAggregates.get(categoryName) || 0;
      let amountForChart = entry.actualAmount / 100; // Convert to dollars
      if (category && category.isPos === false) {
        amountForChart = -Math.abs(amountForChart); // Ensure it's negative for expense categories
      }
      // Store amount in dollars, keeping its original sign (positive for income, negative for expense)
      dayAggregates.set(categoryName, currentValue + amountForChart);
    }
  }

  const chartData = [];
  let currentDate = new Date(normStartDate);

  while (currentDate <= normEndDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayAggregates = dailyCategoryAggregates.get(dateKey);

    if (dayAggregates) {
      dayAggregates.forEach((value, categoryName) => {
        // Create a Date object for local midnight from the dateKey
        const [year, month, day] = dateKey.split('-').map(Number);
        const localMidnightDate = new Date(year, month - 1, day); // month is 0-indexed
        chartData.push({ date: localMidnightDate, group: categoryName, value: value });
      });
    }
    // If a day has no entries, no data points are added for it.
    // The chart will show a gap for that day if no data exists.

    currentDate.setDate(currentDate.getDate() + 1);
  }
  console.log(chartData);
  return chartData;
}