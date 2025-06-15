/**
 * @typedef {Object} Entry
 * @property {string} id
 * @property {Date} date
 * @property {number} amount - in cents (positive for income, negative for expense)
 * @property {number} recurrence
 * @property {boolean} isProjected
 * @property {string} description
 * @property {string} categoryId
 * @property {string} [accountId]
 */

/**
 * Formats entry data for a daily timeline chart, suitable for a stacked bar chart
 * where income is positive and expenses are negative, grouped by category.
 * Ensures all days in the range are present, even with zero values.
 *
 * @param {Entry[]} entries - Array of raw entry objects.
 * @param {Array<{id: string, name: string}>} categories - Array of category objects.
 * @param {Date} rangeStartDate - The start of the date range (inclusive).
 * @param {Date} rangeEndDate - The end of the date range (inclusive).
 * @returns {Array<{date: string, group: string, value: number}>} - Group is category name.
 */
export function formatDataForDailyTimeline(entries, categories, rangeStartDate, rangeEndDate) {
  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
  const dailyCategoryAggregates = new Map(); // Map<dateKey, Map<categoryName, valueInDollars>>

  // Normalize range dates to avoid time-of-day issues
  const normStartDate = new Date(rangeStartDate.getFullYear(), rangeStartDate.getMonth(), rangeStartDate.getDate());
  const normEndDate = new Date(rangeEndDate.getFullYear(), rangeEndDate.getMonth(), rangeEndDate.getDate());

  for (const entry of entries) {
    // Assuming you only want to chart actual entries, not projected ones
    if (entry.isProjected) continue;

    const entryDate = new Date(entry.date);
    const normEntryDate = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());

    // Only consider entries within the specified date range
    if (normEntryDate >= normStartDate && normEntryDate <= normEndDate) {
      const dateKey = normEntryDate.toISOString().split('T')[0];
      const categoryName = categoryMap.get(entry.categoryId) || 'Uncategorized';

      if (!dailyCategoryAggregates.has(dateKey)) {
        dailyCategoryAggregates.set(dateKey, new Map());
      }
      const dayAggregates = dailyCategoryAggregates.get(dateKey);
      const currentValue = dayAggregates.get(categoryName) || 0;

      // Store amount in dollars, keeping its original sign (positive for income, negative for expense)
      dayAggregates.set(categoryName, currentValue + entry.amount / 100);
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