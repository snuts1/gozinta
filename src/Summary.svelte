<script>
  // Placeholder data for now
  export let currentBalance = 0;
  let dailyAverageCashFlow = '$-';
</script>

<div class="summary-container">
  <div class="tile">
    <h3 class="tile-title">Current Balance</h3>
    {#if currentBalance >=0}
      <p class="tile-value-pos">${currentBalance}</p>
    {:else}
      <p class="tile-value-neg">${currentBalance}</p>
    {/if}
  </div>

  <div class="tile">
    <h3 class="tile-title">Daily Avg. Cash Flow</h3>
    <p class="tile-value-pos">{dailyAverageCashFlow}</p>
  </div>
</div>

<style>
  .summary-container {
    display: flex;
    gap: 20px; /* Space between tiles */
    margin-bottom: 20px; /* Space below the summary section */
    justify-content: space-around; /* Distribute space if container is wider */
    flex-wrap: wrap; /* Allow tiles to wrap on smaller screens */
  }
  .tile {
    background-color: #2c2c2c; /* Darker background for tiles */
    border: 1px solid #444;    /* Slightly lighter border */
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    min-width: 200px; /* Minimum width for a tile */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* Adjusted shadow for dark theme */
    color: #e0e0e0; /* Light text for tiles */
  }

  .tile-title {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.1em;
    color: #bbb; /* Lighter title color */
  }

  .tile-value-pos {
    font-size: 1.8em;
    font-weight: bold;
    color: #19e155; /* Lighter blue, or another accent color */
    margin: 0;
  }
  .tile-value-neg {
    font-size: 1.8em;
    font-weight: bold;
    color: #f32719; /* Lighter blue, or another accent color */
    margin: 0;
  }
</style>