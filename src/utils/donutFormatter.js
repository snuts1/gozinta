
/**
 * @typedef {import('../types.js').Entry} Entry
 * @typedef {import('../types.js').Category} Category
 */


/**
 * Formats entry data for a donut chart, summing the absolute values for each category.
 * This function primarily processes 'actual_transaction' type entries.
 *
 * @param {Entry[]} entries - Array of raw entry objects.
 * @param {Category[]} categories - Array of category objects.
 * @returns {Array<{group: string, value: number}>} - Each object represents a category and its total absolute value.
 */
export function formatDataForDonut(entries, categories) {
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
    const categoryTotals = new Map();
    let colors = [];
    for (const e of entries) {
        if (e.entryType !== 'recurring_template'){
            continue;       // only use recurring (budget) entries for now. later add one timers
        }

        const categoryName = categoryMap.get(e.categoryId) || 'Uncategorized';
        const amountInDollars = Math.abs(e.projectedAmount / 100); // amounts are stored in cents
        const currentTotal = categoryTotals.get(categoryName) || 0;

        categoryTotals.set(categoryName, currentTotal + amountInDollars);

    }
    const chartData = [];
    categoryTotals.forEach((value,categoryName) => {
        chartData.push({group: categoryName, value: value});
    });
    return chartData;
}
