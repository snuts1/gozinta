// In a types definition file or at the top of db.js/relevant modules

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {boolean} isPos - True for income, false for expense.
 */

/**
 * @typedef {Object} Account
 * @property {string} id
 * @property {string} name
 * @property {number} balance - Current balance in cents.
 */

/**
 * @typedef {Object} Debt
 * @property {string} id
 * @property {string} name
 * @property {number} balance - Current balance in cents (as a positive number).
 * @property {number} apr - Annual Percentage Rate (e.g., 19.99 for 19.99%).
 * @property {number} minimumPayment - Minimum monthly payment in cents.
 */

/**
 * @typedef {'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'} RecurrenceFrequency
 */

/**
 * A simplified but realistic rule for how an entry repeats.
 * It generates occurrences by incrementing from the start date.
 * e.g., for monthly, it increments the month, handling end-of-month complexities automatically (Date object behavior).
 * @typedef {Object} RecurrenceRule
 * @property {RecurrenceFrequency} frequency
 * @property {number} interval - The number of frequency units to skip (e.g., frequency: 'weekly', interval: 2 for bi-weekly).
 * @property {Date} seriesStartDate - The very first start date of this recurring series.
 * @property {Date} [untilDate] - The series stops on or before this date.
 * @property {number} [count] - The series stops after this many occurrences.
 */

/**
 * @typedef {Object} Scenario
 * @property {string} id - Unique identifier (e.g., UUID).
 * @property {string} name - User-defined name for the scenario (e.g., "Pay off Visa early").
 * @property {string} [description] - More details about the scenario.
 * @property {Date} createdAt - When the scenario was created.
 */

/**
 * @typedef {'recurring_template' | 'one_time_projection' | 'actual_transaction' | 'cancellation'} EntryType
 *   - 'recurring_template': Defines a recurring projected income/expense.
 *   - 'one_time_projection': A specific, non-recurring budgeted item.
 *   - 'actual_transaction': A real transaction that occurred.
 *   - 'cancellation': In a scenario, this marks a recurring projection from the base timeline as "stopped" from a certain date.
 */

/**
 * An Entry represents a "rule of change" for a financial projection.
 * It can be a recurring event, a one-off event, or a modification to another rule in a "what-if" scenario.
 * @typedef {Object} Entry
 * @property {string} id - Unique identifier (e.g., UUID).
 * @property {string} [scenarioId] - ID of the what-if scenario this entry belongs to. Null/undefined for the main/base timeline.
 * @property {EntryType} entryType - The nature of this entry.
 * @property {string} description
 * @property {string} categoryId
 * @property {string} [accountId]
 *
 * // --- Fields for 'recurring_template' and 'one_time_projection' ---
 * @property {number} [projectedAmount] - The expected amount for each occurrence (in cents).
 *
 * // --- Fields for 'recurring_template' ---
 * @property {RecurrenceRule} [recurrenceRule] - How this template repeats.
 *
 * // --- Fields for 'one_time_projection' ---
 * @property {Date} [projectedDate] - The date this one-off projection is planned for.
 *
 * // --- Fields for 'actual_transaction' ---
 * @property {Date} [transactionDate] - The date the actual transaction occurred.
 * @property {number} [actualAmount] - The actual amount of the transaction (in cents).
 * @property {Date} [originalProjectedDateForLink] - If linked to a recurring_template, this is the specific projected date
 *                                                  of the occurrence this actual corresponds to (e.g., "June 1st mortgage payment").
 *                                                  Helps distinguish if a payment was early/late for a specific instance.
 *
 * // --- Fields used by multiple types ('actual_transaction', 'cancellation') ---
 * @property {string} [linkedProjectionId] - ID of the 'recurring_template' this entry is linked to.
 * @property {Date} [cancellationDate] - For 'cancellation' type: the date from which the linked projection is cancelled.
 */

