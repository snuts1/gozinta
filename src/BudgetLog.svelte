<script>
  import { createEventDispatcher } from 'svelte';
  export let entries;

  const dispatch = createEventDispatcher();

  $: budgetEntries = entries.filter((e) => e.entryType === 'recurring_template');

  // This computed property was unused in the template, but I've left it here
  // in case you plan to use it later.
  $: displayableBudgets = budgetEntries.map((entry) => {
    const amount = entry.actualAmount || entry.projectedAmount || 0;
    let displayText = '(Budget)';

    if (entry.entryType === 'recurring_template' && entry.recurrenceRule) {
      displayText = `(Recurs every ${entry.recurrenceRule.interval} ${
        entry.recurrenceRule.frequency
      } starting ${new Date(entry.recurrenceRule.seriesStartDate).toLocaleDateString()})`;
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
  const tblHeaders = ['Amount', 'Frequency', 'Description', 'Category', ''];

  function handleEdit(entry) {
    dispatch('edit', entry);
  }
</script>


<!-- Budget Table -->
<div class="log-container">
  <!-- This container makes the table scroll horizontally on small screens -->
  <div class="table-container">
    <table>
      <thead>
        <tr>
          {#each tblHeaders as hdr}
            <!-- Use <th> for table headers for better semantics & accessibility -->
            <th>{hdr}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each budgetEntries as entry (entry.id)}
          <tr>
            <td>${((entry.actualAmount ?? entry.projectedAmount) / 100).toFixed(2)}</td>
            <td>{entry.recurrenceRule?.frequency ?? 'N/A'}</td>
            <td>{entry.description}</td>
            <td>{entry.categoryId}</td>
            <td><button class="edit-btn" on:click={() => handleEdit(entry)}> Edit </button></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .log-container {
    padding: 0 1rem; /* Add some padding to the component itself */
    margin-bottom: 2rem;
  }

  .table-container {
    overflow-x: auto; /* This is the key! Enables horizontal scrolling */
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    border: 1px solid #444;
    border-radius: 8px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px; /* Set a min-width to ensure it overflows on small screens */
  }

  th,
  td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #444;
    white-space: nowrap; /* Prevents text from wrapping, keeping columns clean */
  }

  tbody tr {
    background-color: #2c2c2c;
  }

  tbody tr:nth-of-type(odd) {
    background-color: #3a3a3a;
  }

  .edit-btn {
    background-color: #fc3030;
    color: #e0e0e0;
    border: 1px solid #f64b4b;
    border-radius: 4px;
    padding: 5px 10px;
    cursor: pointer;
  }

  .edit-btn:hover {
    background-color: #5a5a5a;
  }
</style>