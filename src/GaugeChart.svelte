<script>
      import { ChartTheme, GaugeChart } from '@carbon/charts-svelte';
      import { getAllCategories } from './db.js'; // Import function to get categories
      import { onMount } from 'svelte'; // Import onMount lifecycle hook
      import '@carbon/charts-svelte/styles.css';
      import { green, yellow, red } from '@carbon/colors'; 
    import { thresholdSturges } from 'd3';
      export let entries
      export let width
      export let height
      export let categories
      let dataLoaded = true;

      $: budgetEntries = entries.filter(e => e.entryType === 'recurring_template' );
      $: budgetEntriesWithCategories = budgetEntries.map(entry => {
    // Assuming entry.categoryId exists and matches category.id
            const category = categories.find(cat => cat.id === entry.categoryId);
            return { ...entry, category };
      }).filter(entry => entry.category); // Ensure only entries with a found category are included
        // 3. Filter for income budget items based on category.isPos
      $: incomeBudgetItems = budgetEntriesWithCategories.filter(e => e.category?.isPos);

      // 4. Filter for expense budget items based on category.isPos
      $: expenseBudgetItems = budgetEntriesWithCategories.filter(e => !e.category?.isPos);
      
      // 5. Calculate total income (this will be the gauge's max value).
      // Amounts are in cents, so we divide by 100.
      $: totalIncome = incomeBudgetItems.reduce((sum, entry) => {
      return sum + (entry.projectedAmount || 0);
      }, 0) / 100;

      // 6. Calculate total expenses (this will be the gauge's current value).
      // Expense amounts are negative, so we take the absolute value for the gauge.
      $: totalExpenses = Math.abs(expenseBudgetItems.reduce((sum, entry) => {
      return sum + (entry.projectedAmount || 0);
      }, 0) / 100);
      // Calculate the ratio for dynamic coloring
      $: expenseRatio = totalIncome > 0 ? totalExpenses / totalIncome : 0;


      // 7. Format the data for the Carbon GaugeChart component.
      // The 'value' is what the gauge needle points to (total expenses).
      $: gaugeData = [
      {
            group: 'value',
            value: 100*expenseRatio
      }
      ];

      // 8. Configure the chart's appearance and behavior.
      // The key is setting `gauge.max` to our total income.
      const gaugeOptions = {
            title: 'Monthly Cash Flow',
            resizable: true,
            theme: ChartTheme.G90,
            gauge: {
                  type: 'half', // A half circle gauge, use 'full' for full circle
                  showPercentageSymbol: false,
                  numberFormatter: (value) => `$${(value*totalIncome/100).toFixed(2)} / $${totalIncome.toFixed(2)}`, // Display actual expenses and total income
                  valueFontSize: (radius) => radius / 5.5,
                  },
            tooltip: {
                  enabled: true
            },
            toolbar: {
                  enabled: false // Disable the toolbar
            },
            legend: {
                  enabled: false // Disable the legend
            },
            color: {
                  scale: {
                        value: red[60]
                  }
            }
      };

      // Apply the dynamic color to the 'Expenses' group

      $: console.log("expenses: ", {totalExpenses}, "income: ", {totalIncome})
      $: console.log(
      "GaugeChart Reactive Log:",
      "\n  dataLoaded:", dataLoaded,
      "\n  entries.length:", entries?.length,
      "\n  categories.length:", categories?.length,
      "\n  budgetEntries.length:", budgetEntries?.length,
      "\n  budgetEntriesWithCategories.length:", budgetEntriesWithCategories?.length,
      "\n  incomeBudgetItems.length:", incomeBudgetItems?.length,
      "\n  expenseBudgetItems.length:", expenseBudgetItems?.length,
      "\n  totalIncome:", totalIncome,
      "\n  totalExpenses:", totalExpenses,
      "\n  expenseRatio:", expenseRatio,
      "\n is this a number? ", typeof totalExpenses,
      );
</script>


<div class="chart-container">
  {#if !dataLoaded}
    <p>Loading gauge data...</p>
  {:else if totalIncome > 0}
      <GaugeChart data={gaugeData} options={gaugeOptions} {width} {height} />
  {:else}
    <p>No income budget items found to create the gauge.</p>
  {/if}
</div>

<style>
  .chart-container {
    text-align: center;
    margin-top: 2rem;
    margin: 2rem auto; /* Center the container and add top margin */
    width: 300px; /* Give it a fixed width */
    height: 300px; /* Give it a fixed height, slightly larger than chart.options.height */
    /* Ensure the chart itself fills the container */
    /* :global() is used because .cds--chart-holder is a class from the Carbon Charts library */
    :global(.cds--chart-holder) {
      width: 100%;
      height: 100%;
    }
    /* You can use max-width if you want it to be responsive but not too large: */
    /* max-width: 300px; */
  }

</style>
