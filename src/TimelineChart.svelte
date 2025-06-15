<script>
  import { onMount } from 'svelte';
  import { BarChartStacked } from '@carbon/charts-svelte';
  import { getAllEntries } from './db.js'; // Adjust path if db.js is elsewhere
  import { formatDataForDailyTimeline } from './utils/timelineFormatter.js'; // Adjust path and function name
  import { categories as allCategoriesStore, loadCategories } from './stores/categoryStore.js'; // Import category store

  export let entries = [];

  let chartData = [];
  let chartError = null;
  let currentChartOptions = {};

  // Define the options for the chart
  // Refer to Carbon Charts documentation for all available options
  const baseChartOptions = {
    title: 'Ins & Outs (last 30 days)',
    axes: {
      left: {
        mapsTo: 'value',
        stacked: true, // This enables stacking
        title: 'Amount ($)',
      },
      bottom: {
        mapsTo: 'date',
        scaleType: 'time', // Important for date-based axes
        title: 'Date',
        timeInterval: 'day',
        dateFormat: 'MMM d'
      },
    },
    height: '400px', // Or any desired height
    // Optional: Define colors for your groups
    // Removing static color scale as groups are now dynamic category names.
    // Carbon Charts will assign default colors
    tooltip: {
        enabled: true
    },
    toolbar: {
      enabled: false // Disable the toolbar
    },
    legend: {
      enabled: false // Disable the legend
    }
  };
  let localCategories = [];
  onMount(async () => {
    try {
      await loadCategories();
    } catch (error) {
        console.error('Some done wrong wit categories:', error);
    }
  });
   // Keep localCategories in sync with the store
  $: localCategories = $allCategoriesStore;

   // Reactive block: This will re-run whenever 'entries' or 'localCategories' change.
  $: {
    if (entries && localCategories && localCategories.length > 0) {
      try {
        const dynamicColorScale = {};
        localCategories.forEach(category => {
          dynamicColorScale[category.name] = category.isPos ? '#2ca02c' : '#d62728';
        });
        dynamicColorScale['Uncategorized'] = '#888888';

        let today = new Date();
        const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        let pastDate = new Date(endDate);
        pastDate.setDate(endDate.getDate() - 29);
        const startDate = new Date(pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate());

        chartData = formatDataForDailyTimeline(entries || [], localCategories, startDate, endDate);

        currentChartOptions = {
          ...baseChartOptions,
          color: { scale: dynamicColorScale }
        };
        chartError = null; // Clear previous errors
      } catch (error) {
        console.error('Failed to format chart data:', error);
        chartError = 'Could not update chart data.';
        chartData = [];
        currentChartOptions = { ...baseChartOptions }; // Reset to base options on error
      }
    } else if (entries) { // Handle cases where categories might not be loaded yet, or entries are empty
      // If entries are present but categories aren't, chart might briefly show default colors
      // or the formatter might produce 'Uncategorized' if it can't find category names.
      // For simplicity, we'll let the formatter handle it, or show "loading/no data".
      // If entries are empty, chartData will naturally be empty from the formatter.
      const tempStartDate = new Date();
      const tempEndDate = new Date();
      tempStartDate.setDate(tempEndDate.getDate() -29);
      chartData = formatDataForDailyTimeline(entries || [], localCategories, tempStartDate, tempEndDate);
      currentChartOptions = { ...baseChartOptions }; // Use base options if colors can't be determined
    }
  }
</script>

{#if chartError}
  <p class="error-message">{chartError}</p>
{:else if chartData.length > 0}
  <div class="chart-container">
    <div class="chart-wrapper">
        <BarChartStacked data={chartData} options={currentChartOptions} />
    </div>
  </div>
{:else}
  <p>Loading chart data or no data available for the selected period...</p>
{/if}

<style>
  .chart-container {
    /* This is the outer container, you might use it for margins or overall positioning */
    margin-top: 20px;
    margin-bottom: 20px;
  }
  .chart-wrapper {
    /* This div directly wraps the chart component. */
    /* You can set explicit dimensions here if not fully controlled by chartOptions.height/width */
    /* For example, to constrain its maximum width or ensure it behaves well in a flex/grid layout */
    max-width: 100%; /* Or a specific max-width like 800px */
    position: relative; /* Often useful for positioning child elements or pseudo-elements if needed */
  }
  .error-message {
    color: #fa4d56; /* Carbon red for errors */
    padding: 1rem;
    border: 1px solid #fa4d56;
    border-radius: 4px;
    background-color: #fff1f1;
  }
</style>