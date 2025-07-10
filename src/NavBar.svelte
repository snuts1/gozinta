<script>
    import { activeView } from './stores/navigationStore.js'
</script>
<nav>
    <div class="app-name">
        <i>gozinta</i>
    </div>
    <div class="nav-links">
        <button class:active={$activeView === 'home'} on:click={() => activeView.set('home')}>Home</button>
        <button class:active={$activeView === 'budget'} on:click={() => activeView.set('budget')}>Budget</button>
        <button class:active={$activeView === 'logs'} on:click={() => activeView.set('logs')}>Logs</button>
    </div>
</nav>

<style>
    nav {
        display: flex;
        justify-content: space-between;
        align-items: center; /* Vertically center the content */
        padding: 0 1.5rem; /* Horizontal padding */
        height: 60px; /* A fixed, reliable height */
    }
    .app-name {
        font-size: 1.5em;
        font-weight: bold;
        color: #f5f5f5;
    }

    .nav-links {
        display: flex;
        gap: 1.5rem; /* Adds space between the buttons */
    }
    button {
        background: none;
        border: none;
        color: #e0e0e0;
        font-size: 1.2em;
        font-weight: 500;
        cursor: pointer;
        transition: color 0.2s ease;
    }

    button:hover {
        color: white;
    }

    .active {
        color: #46E736; /* A bright green to indicate the active state */
        font-weight: bold;
        border-bottom: 2px solid #46E736;
    }

    /* --- Responsive Styles for Mobile --- */
    @media (max-width: 600px) {
        nav {
            padding: 0 0.75rem; /* Reduce padding on mobile */
            height: 50px; /* Slightly smaller header on mobile */
        }
        .app-name {
            font-size: 1.3em; /* Slightly smaller app name */
        }
        .nav-links {
            gap: 0.5rem; /* Reduce space between buttons */
        }
        button {
            font-size: 1em; /* Smaller button text */
            /* Add padding to ensure text doesn't wrap and click area is decent */
            padding: 0.25rem;
            border-bottom: none; /* Remove border on mobile for more space */
        }
    }
</style>
