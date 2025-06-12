<script>
  import { createEventDispatcher } from 'svelte';
  import { addEntry } from './db.js';

  export let show = false;
  // export let entryToEdit = null; // For future edit functionality

  const dispatch = createEventDispatcher();

  let description = '';
  let amount = null;
  let entryDate = new Date().toISOString().split('T')[0];
  let recurrenceDays = 0;
  let isProjected = false;
  let isExpense = true; // Default to expense

  let errorMessage = '';
  let isLoading = false;

  // $: if (!show) { /* Reset form when hidden, if needed */ }

  async function handleSubmit() {
    errorMessage = '';
    if (!description.trim()) {
      errorMessage = 'Description is required.';
      return;
    }
    if (amount === null || amount <= 0) {
      errorMessage = 'Please enter a valid positive amount.';
      return;
    }

    isLoading = true;
    try {
      const entryData = {
        date: new Date(entryDate),
        amount: Math.round(parseFloat(amount) * 100) * (isExpense ? -1 : 1), // Store in cents
        recurrence: parseInt(recurrenceDays) || 0,
        isProjected: isProjected,
        description: description.trim()
      };

      // Placeholder for future edit logic
      // if (entryToEdit && entryToEdit.id) {
      //   await updateEntry({ ...entryData, id: entryToEdit.id });
      // } else {
      await addEntry(entryData);
      // }
      dispatch('entryAdded'); // Signal success
      resetForm();
    } catch (error) {
      console.error('Error saving entry:', error);
      errorMessage = `Failed to save entry: ${error.message || error}`;
    } finally {
      isLoading = false;
    }
  }

  function resetForm() {
    description = '';
    amount = null;
    entryDate = new Date().toISOString().split('T')[0];
    recurrenceDays = 0;
    isProjected = false;
    isExpense = true;
    errorMessage = '';
  }

  function handleClose() {
    if (!isLoading) {
      resetForm();
      dispatch('close');
    }
  }
</script>

{#if show}
  <div class="modal-overlay" on:click|self={handleClose}>
    <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="entry-form-title">
      <h2 id="entry-form-title">{false ? 'Edit Entry' : 'Add New Entry'}</h2>

      <form on:submit|preventDefault={handleSubmit}>
        <div><label for="description">Description:</label><input type="text" id="description" bind:value={description} required /></div>
        <div><label for="amount">Amount ($):</label><input type="number" id="amount" bind:value={amount} step="0.01" min="0.01" required /></div>
        <div>
          <label>Type:</label>
          <label class="radio-label"><input type="radio" bind:group={isExpense} name="entryType" value={true} /> Expense</label>
          <label class="radio-label"><input type="radio" bind:group={isExpense} name="entryType" value={false} /> Income</label>
        </div>
        <div><label for="entryDate">Date:</label><input type="date" id="entryDate" bind:value={entryDate} required /></div>
        <div><label for="recurrenceDays">Recurrence (days, 0 for none):</label><input type="number" id="recurrenceDays" bind:value={recurrenceDays} min="0" /></div>
        <div><label class="checkbox-label"><input type="checkbox" bind:checked={isProjected} /> Is Projected?</label></div>

        {#if errorMessage}<p class="error-message">{errorMessage}</p>{/if}

        <div class="modal-actions">
          <button type="button" on:click={handleClose} disabled={isLoading}>Cancel</button>
          <button type="submit" class="primary" disabled={isLoading}>{isLoading ? 'Saving...' : (false ? 'Update Entry' : 'Add Entry')}</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  /* Styles are very similar to SetupModal; consider sharing via global styles or a Modal component */
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
  .modal-content { background-color: white; padding: 25px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
  label { display: block; margin-top: 10px; margin-bottom: 5px; font-weight: 500; }
  input[type="text"], input[type="number"], input[type="date"], select { width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
  .checkbox-label, .radio-label { display: inline-flex; align-items: center; margin-top: 10px; margin-right: 15px; font-weight: normal;}
  .checkbox-label input, .radio-label input { margin-right: 8px; width: auto; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  button { padding: 10px 15px; border-radius: 4px; border: 1px solid #ccc; cursor: pointer; }
  button.primary { background-color: #007bff; color: white; border-color: #007bff; }
  button:disabled { opacity: 0.7; cursor: not-allowed; }
  .error-message { color: red; margin-top: 10px; }
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.75); /* Darker overlay */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-content {
    background-color: #2c2c2c; /* Dark background for modal content */
    color: #e0e0e0; /* Light text for modal */
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }
  label {
    display: block;
    margin-top: 10px;
    margin-bottom: 5px;
    font-weight: 500;
    color: #ccc;
  }
  input[type="text"], input[type="number"], input[type="date"], select {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #555;
    border-radius: 4px;
    box-sizing: border-box;
    background-color: #3b3b3b; /* Darker input background */
    color: #e0e0e0; /* Light input text */
  }
  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1); /* Makes the date picker icon visible on dark backgrounds */
  }
  .checkbox-label, .radio-label { display: inline-flex; align-items: center; margin-top: 10px; margin-right: 15px; font-weight: normal; color: #ccc;}
  .checkbox-label input, .radio-label input { margin-right: 8px; width: auto; accent-color: #0d6efd; /* Style checkbox/radio color */ }
  .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  button { padding: 10px 15px; border-radius: 4px; border: 1px solid #555; cursor: pointer; background-color: #4f4f4f; color: #e0e0e0; }
  button.primary { background-color: #0d6efd; color: white; border-color: #0d6efd; }
  button:disabled { opacity: 0.5; cursor: not-allowed; background-color: #333; border-color: #444;}
  .error-message { color: #ff6b6b; /* Lighter red for errors */ margin-top: 10px; }
</style>