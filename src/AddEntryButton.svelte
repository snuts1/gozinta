<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch('click');
    }
</script>

<div>
    <button class="global-add--button" on:click={handleClick}>Add Transaction</button>
</div>

<style>
    .global-add--button {
        padding: 0.8em 1.5em;
        font-size: 1.1em;
        border: none;
        border-radius: 5px;
        background-color: #28a745; /* Green, similar to modal save */
        color: white;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .global-add--button:hover {
        background-color: #2c8f4a; /* Darker green on hover */
    }
    .global-add--button:disabled {
        background-color: #555; /* Darker disabled state */
        color: #aaa;
        cursor: not-allowed;
    }
</style>