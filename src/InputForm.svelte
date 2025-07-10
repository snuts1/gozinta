<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { v4 as uuidv4 } from 'uuid';
  import { addEntry, updateEntry, getAllCategories } from './db.js';

  /**
   * @typedef {import('./types.js').Entry} Entry
   * @typedef {import('./types.js').EntryType} EntryType
   * @typedef {import('./types.js').RecurrenceRule} RecurrenceRule
   * @typedef {import('./types.js').Category} Category
   * @typedef {import('./types.js').RecurrenceFrequency} RecurrenceFrequency
   */

  export let show = false;
  /** @type {Entry | null} */
  export let entry = null;
  const dispatch = createEventDispatcher();

  // A computed property to easily check if we are editing an existing entry.
  $: isEditMode = !!entry;

  /** @type {EntryType} */
  let entryType = 'actual_transaction';
  let description = '';
  let amount = null;
  let transactionDate = new Date().toISOString().split('T')[0]; // For actual_transaction
  let projectedDate = new Date().toISOString().split('T')[0];   // For one_time_projection
  let categoryId = '';
  // let accountId = ''; // Future: Add account selection

  // Recurrence fields (for recurring_template)
  /** @type {RecurrenceFrequency} */
  let recurrenceFrequency = 'monthly';
  let recurrenceInterval = 1;
  let seriesStartDate = new Date().toISOString().split('T')[0];

  /** @type {Category[]} */
  let categories = [];
  let errorMessage = '';
  let isLoading = false;

  const entryTypeOptions = [
    { value: 'actual_transaction', label: 'Actual Transaction' },
    { value: 'one_time_projection', label: 'One-Time Projection/Goal' },
    { value: 'recurring_template', label: 'Recurring Template' },
  ];

  const recurrenceFrequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  onMount(async () => {
    try {
      categories = await getAllCategories();
      if (categories.length > 0 && !categoryId) {
        categoryId = categories[0].id; // Default to first category
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      errorMessage = "Could not load categories.";
    }
  });

  // This reactive block populates the form when it's opened in edit mode,
  // or resets it for add mode.
  $: {
    if (show && isEditMode) {
      // Edit mode: populate form from the 'entry' prop
      entryType = entry.entryType;
      description = entry.description;
      categoryId = entry.categoryId;

      if (entry.entryType === 'actual_transaction') {
        amount = (entry.actualAmount ?? 0) / 100;
        transactionDate = new Date(entry.transactionDate).toISOString().split('T')[0];
      } else {
        amount = (entry.projectedAmount ?? 0) / 100;
        if (entry.entryType === 'one_time_projection') {
          projectedDate = new Date(entry.projectedDate).toISOString().split('T')[0];
        } else if (entry.entryType === 'recurring_template' && entry.recurrenceRule) {
          ({ frequency: recurrenceFrequency, interval: recurrenceInterval, seriesStartDate: seriesStartDate } = entry.recurrenceRule);
          seriesStartDate = new Date(seriesStartDate).toISOString().split('T')[0];
        }
      }
    } else if (show && !isEditMode) {
      resetForm();
    }
  }
  /** @returns {RecurrenceRule | undefined} */
  function createRecurrenceRuleForTemplate() {
    if (entryType !== 'recurring_template' || !amount || amount === 0) {
      return undefined;
    }
    const startDateObj = new Date(seriesStartDate);
    return {
      frequency: recurrenceFrequency,
      interval: parseInt(recurrenceInterval, 10) || 1,
      seriesStartDate: startDateObj,
      ...(recurrenceFrequency === 'monthly' && { monthlyType: 'dayOfMonth', dayOfMonth: startDateObj.getDate() }),
      ...(recurrenceFrequency === 'weekly' && { daysOfWeek: [startDateObj.getDay()] }),
    };
  }

  async function handleSubmit() {
    errorMessage = '';
    if (!description.trim()) {
      errorMessage = 'Please enter a description.';
      return;
    }
    if (amount === null || (entryType !== 'recurring_template' && amount === 0) ) { // Amount can be 0 for templates if desired, but not for actuals/one-time
      errorMessage = 'Please enter a valid amount.';
      return;
    }
    if (!categoryId) {
      errorMessage = 'Please select a category.';
      return;
    }

    isLoading = true;
    /** @type {Partial<Entry>} */
    let entryData = {
      id: isEditMode ? entry.id : uuidv4(),
      description: description.trim(),
      categoryId: categoryId,
      // accountId: accountId || undefined, // Future
    };

    let numericAmount = Math.round(parseFloat(amount) * 100);
    
    switch (entryType) {
      case 'actual_transaction':
        entryData = {
          ...entryData,
          entryType: 'actual_transaction',
          actualAmount: numericAmount,
          transactionDate: new Date(transactionDate),
        };
        break;
      case 'one_time_projection':
        entryData = {
          ...entryData,
          entryType: 'one_time_projection',
          projectedAmount: numericAmount,
          projectedDate: new Date(projectedDate),
        };
        break;
      case 'recurring_template':
        const recurrenceRule = createRecurrenceRuleForTemplate()
        if (!recurrenceRule) {
          errorMessage = "Could not create valid recurrence rule.";
          isLoading = false;
          return;
        }
        entryData = {
          ...entryData,
          entryType: 'recurring_template',
          projectedAmount: numericAmount,
          recurrenceRule: recurrenceRule,
        };
        break;
      default:
        errorMessage = "Invalid entry type selected.";
        isLoading = false;
        return;
    }

    try {
      if (isEditMode) {
        await updateEntry(/** @type {Entry} */ (entryData));
        dispatch('entryUpdated');
      } else {
        await addEntry(/** @type {Entry} */ (entryData));
        dispatch('entryAdded');
      }
      resetForm();
    } catch (error) {
      const action = isEditMode ? 'update' : 'add';
      console.error(`Error ${action}ing entry:`, error);
      errorMessage = `Failed to ${action} entry: ${error.message || error}`;
    } finally {
      isLoading = false;
    }
  }

  function resetForm() {
    description = '';
    amount = null
    entryType = 'actual_transaction';
    categoryId = categories.length > 0 ? categories[0].id : '';
    transactionDate = new Date().toISOString().split('T')[0];
    projectedDate = new Date().toISOString().split('T')[0];
    seriesStartDate = new Date().toISOString().split('T')[0];
    recurrenceFrequency = 'monthly';
    recurrenceInterval = 1;
  }
  function handleClose() {
    if (!isLoading) {
      // resetForm(); // Optionally reset form on close
      dispatch('close');
    }
  }
</script>

{#if show}
  <div class="modal-overlay" on:click|self={handleClose}>
    <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="entry-form-title">
      <h2 id="entry-form-title">{isEditMode ? 'Edit Entry' : 'Add New Entry'}</h2>

      <form on:submit|preventDefault={handleSubmit}>
        <div>
          <label for="entryType">Entry Type:</label>
          <select id="entryType" bind:value={entryType} disabled={isEditMode}>
            {#each entryTypeOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>

        <div>
          <label for="description">Description:</label>
          <input type="text" id="description" bind:value={description} required />
        </div>

        <div>
          <label for="amount">Amount ($):</label>
          <input type="number" id="amount" bind:value={amount} step="0.01" required />
        </div>

        {#if entryType === 'actual_transaction'}
          <div>
            <label for="transactionDate">Transaction Date:</label>
            <input type="date" id="transactionDate" bind:value={transactionDate} required />
          </div>
        {/if}

        {#if entryType === 'one_time_projection'}
          <div>
            <label for="projectedDate">Projected Date:</label>
            <input type="date" id="projectedDate" bind:value={projectedDate} required />
          </div>
        {/if}

        {#if entryType === 'recurring_template'}
          <fieldset>
            <legend>Recurrence Details</legend>
            <div>
              <label for="seriesStartDate">Starts On:</label>
              <input type="date" id="seriesStartDate" bind:value={seriesStartDate} required />
            </div>
            <div>
              <label for="recurrenceFrequency">Repeats:</label>
              <select id="recurrenceFrequency" bind:value={recurrenceFrequency}>
                {#each recurrenceFrequencyOptions as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </div>
            <div>
              <label for="recurrenceInterval">Every X {recurrenceFrequency === 'daily' ? 'day(s)' : recurrenceFrequency === 'weekly' ? 'week(s)' : recurrenceFrequency === 'monthly' ? 'month(s)' : 'year(s)'}:</label>
              <input type="number" id="recurrenceInterval" bind:value={recurrenceInterval} min="1" step="1" />
            </div>
          </fieldset>
        {/if}

        <div>
          <label for="category">Category:</label>
          {#if categories.length > 0}
            <select id="category" bind:value={categoryId} required>
              {#each categories as category (category.id)}
                <option value={category.id}>{category.name}</option>
              {/each}
            </select>
          {:else if !errorMessage}
            <p>Loading categories...</p>
          {/if}
        </div>

        <!-- Future: Account Selection -->

        {#if errorMessage}
          <p class="error-message">{errorMessage}</p>
        {/if}

        <div class="modal-actions">
          <button type="button" on:click={handleClose} disabled={isLoading}>Cancel</button>
          <button type="submit" class="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : (isEditMode ? 'Update Entry' : 'Add Entry')}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
  .modal-content { background-color: #2a2a2a; color: #e0e0e0; padding: 25px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); width: 90%; max-width: 550px; max-height: 90vh; overflow-y: auto; }
  fieldset { border: 1px solid #444; border-radius: 4px; padding: 15px; margin-bottom: 20px; margin-top: 15px; }
  legend { font-weight: bold; padding: 0 5px; color: #00aaff; }
  label { display: block; margin-top: 12px; margin-bottom: 6px; font-weight: 500; }
  input[type="text"], input[type="number"], input[type="date"], select { width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #555; border-radius: 4px; box-sizing: border-box; background-color: #333; color: #e0e0e0; }
  input:focus, select:focus { border-color: #00aaff; outline: none; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; }
  button { padding: 10px 18px; border-radius: 4px; border: 1px solid #555; cursor: pointer; background-color: #444; color: #e0e0e0; }
  button.primary { background-color: #007bff; color: white; border-color: #007bff; }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
  .error-message { color: #ff6b6b; margin-top: 10px; text-align: center; }
</style>