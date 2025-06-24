<script>
  import { onMount } from 'svelte';
  import Summary from './Summary.svelte'
  import AddEntryButton from './AddEntryButton.svelte';
  import SetupForm from './SetupForm.svelte';
  import InputForm from './InputForm.svelte';
  import TimelineChart from './TimelineChart.svelte';
  import { initDB, addEntry, getAllEntries } from './db.js';
  /**
   * @typedef {import('./types.js').Entry} Entry
   * @typedef {import('./types.js').EntryType} EntryType
   */

  let showSetupModal = false;
  let showEntryFormModal = false;
  let entries = [];
  let currentBalance =0;
    onMount(async () => {
    try {
      await initDB();
      console.log("CashFlow DB Initialized from App.svelte");
      await loadEntries();
      if (entries.length === 0) {
        // If no entries, prompt for initial setup
        showSetupModal = true;
      }
    } catch (error) {
      console.error("Failed to initialize DB or perform initial operations:", error);
    }
  });
  async function loadEntries() {
    entries = await getAllEntries();
    console.log("All current entries:", entries); // Enable for debugging
  }

  function handleAddEntryClick() {
    showEntryFormModal = true;
  }

  async function refreshDataAndCloseModals() {
    showSetupModal = false;
    showEntryFormModal = false;
    await loadEntries();
  }

  // Calculate current balance based on actual transactions
  $: {
    if (entries && entries.length >0) {
      currentBalance = entries.reduce((sum, entry) => {
        if (entry.entryType === 'actual_transaction' && typeof entry.actualAmount === 'number') {
          return sum + entry.actualAmount;
        }
        return sum;
      }, 0) / 100;
    } else {
      currentBalance = 0;
    }
  }
  $: oneTimeEntries = entries.filter(e => e.entryType === 'actual_transaction'|| e.entryType === 'one_time_projection');
  $: budgetEntries = entries.filter(e => e.entryType === 'recurring_template' );
    // Use .map() to transform raw data into display-ready objects.
  // This separates data logic from presentation.
  $: displayableOneTimes = oneTimeEntries.map(entry => {
    const amount = entry.actualAmount || entry.projectedAmount || 0;
    return {
      id: entry.id,
      description: entry.description,
      displayAmount: (amount / 100).toFixed(2),
      isNegative: amount < 0,
      displayDate: entry.transactionDate || entry.projectedDate ? new Date(entry.transactionDate).toLocaleDateString() : 'No Date',
      debugInfo: `(ID: ${entry.id})`
    };
  });

  $: displayableBudgets = budgetEntries.map(entry => {
    const amount = entry.actualAmount || entry.projectedAmount || 0;
    let displayText = '(Budget)';

    if (entry.entryType === 'recurring_template' && entry.recurrenceRule) {
      displayText = `(Recurs every ${entry.recurrenceRule.interval} ${entry.recurrenceRule.frequency} starting ${new Date(entry.recurrenceRule.seriesStartDate).toLocaleDateString()})`;
    }
    return {
      id: entry.id,
      description: entry.description,
      displayAmount: (amount / 100).toFixed(2),
      isNegative: amount < 0,
      displayText: displayText,
      debugInfo: `(ID: ${entry.id})`
    };
  });
</script>

<main>
  <h1><i>gozinta</i></h1>
  <div>
    <Summary {currentBalance} />
  </div>
  <div>
    <AddEntryButton on:click={handleAddEntryClick} />
  </div>



  {#if showSetupModal}
    <SetupForm
      show={showSetupModal}
      on:close={() => showSetupModal = false}
      on:setupComplete={refreshDataAndCloseModals}
    />
  {/if}

  {#if showEntryFormModal}
    <InputForm
      show={showEntryFormModal}
      on:close={() => showEntryFormModal = false}
      on:entryAdded={refreshDataAndCloseModals}
    />
  {/if}

  <!-- Basic display of entries for verification -->
  <h2>One Time Entries</h2>
  {#if oneTimeEntries.length === 0}
    <p>No one-time entries yet. Please complete the initial setup or add a new transaction.</p>
  {:else}
    <ul>
      {#each displayableOneTimes as entry (entry.id)}
        <li>
          {entry.description}:
            <span style="color: {entry.isNegative ? '#ff6b6b' : '#19e155'};">
              { (entry.displayAmount)}
            </span>

          {#if entry.displayDate}
            on {new Date(entry.displayDate).toLocaleDateString()}
          {/if}

          {entry.debugInfo}
          <span style="font-size: 0.8em; color: #888;"> (ID: {entry.id})</span> <!-- Debugging info -->
        </li>
      {/each}
    </ul>
  {/if}
  <h2>Budgets</h2>
  {#if budgetEntries.length === 0}
    <p>No budgets yet.</p>
  {:else}
    <ul>
      {#each displayableBudgets as entry (entry.id)}
        <li>
          {entry.description}:
            <span style="color: {entry.isNegative ? '#ff6b6b' : '#19e155'};">
              { (entry.displayAmount)}
            </span>

          {#if entry.displayText}
            {entry.displayText}
          {/if}
        
          {entry.debugInfo}
          <span style="font-size: 0.8em; color: #888;"> (ID: {entry.id})</span> <!-- Debugging info -->
        </li>
      {/each}
    </ul>
  {/if}
  <div>
    <TimelineChart {entries} />
  </div>
</main>

<style>
  :global(body) {
    margin: 0; /* Remove default browser margin & override template */
    display: block; /* Override template's flex/grid centering */
    /* Or, if you want to keep body as flex but align top:
    display: flex; flex-direction: column; align-items: flex-start; */
    min-height: 100vh; /* Ensure body takes full viewport height */
    background-color: #1e1e1e; /* Dark background for the whole page */
    color: #e0e0e0; /* Light text color */
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  h1 {
    font-size: 3.2em;
  }
  h2 {
    color: #f5f5f5; /* Ensure headings are light */
  }
  a {
    color: #64b5f6; /* Lighter blue for links */
  }
</style>
