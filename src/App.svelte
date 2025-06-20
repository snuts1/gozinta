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
  <h2>Transactions</h2>
  {#if entries.length === 0}
    <p>No transactions yet. Please complete the initial setup or add a new transaction.</p>
  {:else}
    <ul>
      {#each entries as entry (entry.id)}
        {@const amount = entry.entryType === 'actual_transaction' ? entry.actualAmount : entry.projectedAmount}
        {@const dateToDisplay = entry.entryType === 'actual_transaction' ? entry.transactionDate : (entry.entryType === 'one_time_projection' ? entry.projectedDate : (entry.recurrenceRule ? entry.recurrenceRule.seriesStartDate : null))}
        {@const displayType = entry.entryType === 'actual_transaction' ? '(Actual)' : '(Projected Template/Goal)'}

        <li>
          {entry.description}:
          {#if typeof amount === 'number'}
            <span style="color: {amount < 0 ? '#ff6b6b' : '#19e155'};">
              { (amount / 100).toFixed(2) }
            </span>
          {:else}
            <span>(No amount)</span>
          {/if}

          {#if dateToDisplay}
            on {new Date(dateToDisplay).toLocaleDateString()}
          {/if}

          {#if entry.entryType === 'recurring_template' && entry.recurrenceRule}
            (Recurs every {entry.recurrenceRule.interval} {entry.recurrenceRule.frequency})
          {/if}

          {displayType}
          <span style="font-size: 0.8em; color: #888;"> (Type: {entry.entryType}, ID: {entry.id})</span> <!-- Debugging info -->
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
