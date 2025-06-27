<script>
    export let entries

    $: budgetEntries = entries.filter(e => e.entryType === 'recurring_template' );

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
        
          <span style="font-size: 0.8em; color: #888;"> (ID: {entry.id})</span> <!-- Debugging info -->
        </li>
      {/each}
    </ul>
  {/if}