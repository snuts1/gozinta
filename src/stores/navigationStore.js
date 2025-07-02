import { writable } from 'svelte/store';

// writable object sets the main app view

export const activeView = writable('home')