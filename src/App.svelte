<script>
  import { onMount } from 'svelte';
  import { initDB, addEntry, getAllEntries, getAllCategories } from './db.js';
  import Summary from './Summary.svelte'
  import AddEntryButton from './AddEntryButton.svelte';
  import SetupForm from './SetupForm.svelte';
  import InputForm from './InputForm.svelte';
  import TimelineChart from './TimelineChart.svelte';
  import BudgetLog from './BudgetLog.svelte';
  import OneTimeLog from './OneTimeLog.svelte';
  import GaugeChart from './GaugeChart.svelte';
  import DonutSample from './DonutSample.svelte';
  import '@carbon/charts-svelte/styles.css';
  /**
   * @typedef {import('./types.js').Entry} Entry
   * @typedef {import('./types.js').EntryType} EntryType
   */

  let showSetupModal = false;
  let showEntryFormModal = false;
  let entries = [];
  let categories = [];
  let currentBalance =0;
    onMount(async () => {
    try {
      await initDB();
      console.log("CashFlow DB Initialized from App.svelte");
      await loadEntries();
      categories = await getAllCategories();
      if (entries.length === 0) {
        // If no entries, prompt for initial setup.
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
  <div>
    <BudgetLog {entries} />
  </div>
  <div>
    <OneTimeLog {entries} />
  </div>
   <!---- <div>
    <GaugeChart {entries} {categories} width="300px" height="300px" />
  </div>-->
  {#if entries.length > 0 && categories.length > 0}
  <div>
    <DonutSample {entries} {categories} />
  </div>
  {/if}


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
  
  <div>
    <TimelineChart {entries} />
  </div>
</main>

<style global lang="scss">
  @use '@carbon/themes';
  @use '@carbon/type';
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
