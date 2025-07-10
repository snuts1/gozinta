
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
    const categoryNameMap = new Map(categories.map(cat => [cat.id, cat.name]));
    const categoryPosMap = new Map(categories.map(cat => [cat.name, cat.isPos]));
    const categoryTotals = new Map();
    let netTotal = 0;
    let amountInDollars=0;

    for (const e of entries) {
        if (e.entryType !== 'recurring_template'){
            continue;       // only use recurring (budget) entries for now. later add one timers
        }

        const categoryName = categoryNameMap.get(e.categoryId) || 'Uncategorized';
        const categoryPos = categoryPosMap.get(e.categoryName) || false;
        if(e.recurrenceRule.frequency==='daily'){
            amountInDollars = Math.round((Math.abs(e.projectedAmount*365 / 12) / 100)); // amounts are stored in cents
        }
        else if(e.recurrenceRule.frequency==='weekly'){
            amountInDollars = Math.round((Math.abs(e.projectedAmount*52 / 12) / 100));
        }
        else {
            amountInDollars = Math.round(Math.abs(e.projectedAmount / 100));
        }
        
        const currentTotal = categoryTotals.get(categoryName) || 0;

        categoryTotals.set(categoryName, currentTotal + amountInDollars);
    }
    const chartData = [];
    
    categoryTotals.forEach((value,categoryName) => {
        console.log('value: ', value, 'categoryName: ',categoryName)
        if(categoryPosMap.get(categoryName)) {
            netTotal += value;
        }
        else {
            chartData.push({group: categoryName, value: value, isPos: false});
            netTotal -= value;
        }
    });
    chartData.push({group: 'Net Total', value: netTotal, isPos: true});
    return chartData;
}
