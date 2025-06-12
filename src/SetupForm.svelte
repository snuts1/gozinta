<script>
  import { createEventDispatcher } from 'svelte';
  import { addEntry } from './db.js';

  export let show = false;

  const dispatch = createEventDispatcher();

  let balanceAmount = null;
  let balanceDate = new Date().toISOString().split('T')[0];

  let incomeDescription = 'Salary';
  let incomeAmount = null;
  let incomeRecurrenceOption = 'monthly'; // 'none', 'weekly', 'biweekly', 'monthly'
  let incomeNextDate = new Date().toISOString().split('T')[0];

  let errorMessage = '';
  let isLoading = false;

  const recurrenceOptions = [
    { value: 'none', label: 'One-time (No Recurrence)', days: 0 },
    { value: 'weekly', label: 'Weekly', days: 7 },
    { value: 'biweekly', label: 'Bi-Weekly (Every 2 Weeks)', days: 14 },
    { value: 'monthly', label: 'Monthly (approx. 30 days)', days: 30 },
  ];

  function getRecurrenceDays() {
    const selected = recurrenceOptions.find(opt => opt.value === incomeRecurrenceOption);
    return selected ? selected.days : 0;
  }

  async function handleSubmit() {
    errorMessage = '';
    if (balanceAmount === null || balanceAmount <= 0) {
      errorMessage = 'Please enter a valid starting balance.';
      return;
    }
    if (!incomeDescription.trim()) {
        errorMessage = 'Please enter a description for your income.';
        return;
    }
    // Income amount can be optional if they only want to set balance
    // if (incomeAmount === null || incomeAmount <= 0) {
    //   errorMessage = 'Please enter a valid income amount.';
    //   return;
    // }

    isLoading = true;
    try {
      // 1. Create Starting Balance Entry
      const balanceEntry = {
        date: new Date(balanceDate),
        amount: Math.round(parseFloat(balanceAmount) * 100), // Store in cents
        recurrence: 0, // Non-recurring
        isProjected: false, // Actual balance
        description: 'Starting Balance'
      };
      await addEntry(balanceEntry);

      // 2. Create Income Entry (if amount is provided)
      if (incomeAmount && incomeAmount > 0) {
        const incomeEntry = {
          date: new Date(incomeNextDate),
          amount: Math.round(parseFloat(incomeAmount) * 100),
          recurrence: getRecurrenceDays(),
          isProjected: true, // Typically, future income is projected
          description: incomeDescription.trim()
        };
        await addEntry(incomeEntry);
      }

      dispatch('setupComplete');
    } catch (error) {
      console.error('Error saving setup data:', error);
      errorMessage = `Failed to save setup data: ${error.message || error}`;
    } finally {
      isLoading = false;
    }
  }

  function handleClose() {
    if (!isLoading) {
      dispatch('close');
    }
  }
</script>

{#if show}
  <div class="modal-overlay" on:click|self={handleClose}>
    <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="setup-modal-title">
      <h2 id="setup-modal-title">Initial Setup</h2>
      <p>Let's get your cash flow started with your current balance and optionally, your primary income.</p>

      <form on:submit|preventDefault={handleSubmit}>
        <fieldset>
          <legend>Current Balance</legend>
          <div>
            <label for="balanceAmount">Amount ($):</label>
            <input type="number" id="balanceAmount" bind:value={balanceAmount} step="0.01" min="0.01" required />
          </div>
          <div>
            <label for="balanceDate">As of Date:</label>
            <input type="date" id="balanceDate" bind:value={balanceDate} required />
          </div>
        </fieldset>

        <fieldset>
          <legend>Primary Income (Optional)</legend>
          <div>
            <label for="incomeDescription">Description (e.g., Salary, Freelance):</label>
            <input type="text" id="incomeDescription" bind:value={incomeDescription} />
          </div>
          <div>
            <label for="incomeAmount">Amount ($ per occurrence):</label>
            <input type="number" id="incomeAmount" bind:value={incomeAmount} step="0.01" min="0.01" />
          </div>
          <div>
            <label for="incomeRecurrence">How often do you receive this income?</label>
            <select id="incomeRecurrence" bind:value={incomeRecurrenceOption}>
              {#each recurrenceOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for="incomeNextDate">Next Occurrence Date:</label>
            <input type="date" id="incomeNextDate" bind:value={incomeNextDate} />
          </div>
        </fieldset>

        {#if errorMessage}
          <p class="error-message">{errorMessage}</p>
        {/if}

        <div class="modal-actions">
          <button type="button" on:click={handleClose} disabled={isLoading}>Cancel</button>
          <button type="submit" class="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Setup'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
  .modal-content { background-color: white; padding: 25px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
  fieldset { border: 1px solid #ccc; border-radius: 4px; padding: 15px; margin-bottom: 20px; }
  legend { font-weight: bold; padding: 0 5px; }
  label { display: block; margin-top: 10px; margin-bottom: 5px; font-weight: 500; }
  input[type="text"], input[type="number"], input[type="date"], select { width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  button { padding: 10px 15px; border-radius: 4px; border: 1px solid #ccc; cursor: pointer; }
  button.primary { background-color: #007bff; color: white; border-color: #007bff; }
  button:disabled { opacity: 0.7; cursor: not-allowed; }
  .error-message { color: red; margin-top: 10px; }
</style>