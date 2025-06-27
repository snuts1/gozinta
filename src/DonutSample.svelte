<script>
  import { quantize, interpolatePlasma, pie, arc } from 'd3';
  import { formatDataForDonut } from './utils/donutFormatter';
  import { onMount } from 'svelte';
  export let entries, categories;

  let chartData = [];
  let wedges = [];
  let colors = [];


  $: chartData = formatDataForDonut(entries, categories);

  $: if (chartData.length > 0) {
    // D3 calculations now run *only* when `chartData` has data
    wedges = pie()
      .padAngle(padAngle)
      .sort(null)
      .value(d => d.value)(chartData);

    // Colors the sections based on their category  
    const categoryMap = new Map(categories.map(c => [c.name,c.isPos]))
    chartData.forEach(n => {
        colors.push(categoryMap.get(n.group) ? '#46E736' : '#E92525');
    });
    //colors = quantize(t => interpolatePlasma(t * 0.7 + 0.3), chartData.length);

  }


  // Chart Constants
  const width = 350;
  const height = width;
  const percent = false;
  const fontSize = 14; // the font size of the x and y values
  const strokeWidth = 1;
  const strokeLinejoin = 'round';
  const outerRadius = Math.min(width, height) * 0.5 - 60; // the outer radius of the circle, in pixels
  const innerRadius = 130; // the inner radius of the chart, in pixels
  const labelPosition = 0.7; // the position of the label offset from center
  const labelRadius = (innerRadius * labelPosition + outerRadius * 0.6); // center radius of labels
  const strokeColorWOR = 'white';
  const strokeColorWIR = 'none';
  const stroke = innerRadius > 0 ? strokeColorWIR : strokeColorWOR;
  const padAngle = stroke === 'none' ? 1 / outerRadius : 0; // angular separation between wedges

  $: arcPath = arc().innerRadius(innerRadius).outerRadius(outerRadius);

  $: arcLabel = arc().innerRadius(labelRadius).outerRadius(labelRadius);

  $: console.log("Donut Data: ", { chartData });
</script>
<div class="chart-container">
    <svg {width} {height} viewBox="{-width / 2} {-height / 2} {width} {height}">
    {#if chartData.length > 0 && wedges.length > 0}
        {#each wedges as wedge, i}
        <path fill={colors[i]} d={arcPath(wedge)} stroke={stroke} stroke-width={strokeWidth} stroke-linejoin={strokeLinejoin}/>
        <g text-anchor='middle' transform='translate({arcLabel.centroid(wedge)})'>
            <text font-size={fontSize} fill='#ffffff'>
            <tspan font-weight='bold'>{chartData[i].group}</tspan>
            <tspan x = '0' dy='1.1em'>{percent ? `${(chartData[i].value / chartData.reduce((sum, d) => sum + d.value, 0) * 100).toFixed(2)}%` : '$' + chartData[i].value.toLocaleString('en-US')}</tspan>
            </text>
        </g>
        {/each}
    {:else}
        <text x="0" y="0" text-anchor="middle" alignment-baseline="middle" font-size="20" fill="gray">No data for donut chart</text>
    {/if}
    </svg>
</div>
    
<style>
    .chart-container {
    max-width: 570px; /* Match the original SVG width to prevent it from becoming too large on desktops */
    width: 100%;      /* Ensure it scales down on smaller screens */
    margin: 2rem auto;/* Center the container and add some vertical spacing */
  }
</style>