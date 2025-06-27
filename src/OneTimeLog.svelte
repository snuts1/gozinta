<script>
    export let entries
    $: oneTimeEntries = entries.filter(e => e.entryType === 'actual_transaction'|| e.entryType === 'one_time_projection');
    // Use .map() to transform raw data into display-ready objects.
  // This separates data logic from presentation.
  $: displayableOneTimes = oneTimeEntries.map(entry => {
    const amount = entry.actualAmount || entry.projectedAmount || 0;
    return {
      id: entry.id,
      description: entry.description,
      displayAmount: (amount / 100).toFixed(2),
      isNegative: amount < 0,
      displayDate: entry.transactionDate ? new Date(entry.transactionDate).toLocaleDateString() : (entry.projectedDate ? new Date(entry.projectedDate).toLocaleDateString() : 'No Date'),
      debugInfo: `(ID: ${entry.id})`
    };
  });
</script>
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


          <span style="font-size: 0.8em; color: #888;"> (ID: {entry.id})</span> <!-- Debugging info -->
        </li>
      {/each}
    </ul>
  {/if}