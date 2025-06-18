// In a types definition file or at the top of db.js/relevant modules

/**
 * @typedef {'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'} RecurrenceFrequency
 */

/**
 * @typedef {Object} RecurrenceRule
 * @property {RecurrenceFrequency} frequency
 * @property {number} interval
 * @property {number[]} [daysOfWeek] // For weekly, [1,2,3] = Sun/Mon/Tue
 * @property {'dayOfMonth' | 'nthDayOfWeek'} [monthlyType] // For monthly
 * @property {number} [dayOfMonth]
 * @property {{week: number, day: number}} [nthDayOfWeek]
 * @property {Date} [untilDate]
 * @property {number} [count]
 * @property {Date} seriesStartDate - The very first start date of this recurring series.
 */

/**
 * @typedef {'recurring_template' | 'one_time_projection' | 'actual_transaction'} EntryType
 *   - 'recurring_template': Defines a recurring projected income/expense.
 *   - 'one_time_projection': A specific, non-recurring budgeted item.
 *   - 'actual_transaction': A real transaction that occurred.
 */

/**
 * @typedef {Object} Entry
 * @property {string} id - Unique identifier (e.g., UUID).
 * @property {EntryType} entryType - The nature of this entry.
 * @property {string} description
 * @property {string} categoryId
 * @property {string} [accountId]
 *
 * // --- Fields for 'recurring_template' ---
 * @property {RecurrenceRule} [recurrenceRule] - How this template repeats.
 * @property {number} [projectedAmount] - The expected amount for each occurrence (in cents).
 *
 * // --- Fields for 'one_time_projection' ---
 * @property {Date} [projectedDate] - The date this one-off projection is planned for.
 * // uses 'projectedAmount' from 'recurring_template' section if applicable, or define one if you want them separate
 * // For simplicity, let's assume one_time_projection also uses 'projectedAmount'.
 *
 * // --- Fields for 'actual_transaction' ---
 * @property {Date} [transactionDate] - The date the actual transaction occurred.
 * @property {number} [actualAmount] - The actual amount of the transaction (in cents).
 * @property {string} [linkedProjectionId] - ID of the 'recurring_template' or 'one_time_projection' this actual fulfills.
 * @property {Date} [originalProjectedDateForLink] - If linked to a recurring_template, this is the specific projected date
 *                                                  of the occurrence this actual corresponds to (e.g., "June 1st mortgage payment").
 *                                                  Helps distinguish if a payment was early/late for a specific instance.
 */
