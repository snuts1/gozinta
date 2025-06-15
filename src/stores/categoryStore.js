import { writable, derived } from 'svelte/store';
import { getAllCategories as dbGetAllCategories } from '../db.js';

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {boolean} isPos - true for income, false for expense
 */

/** @type {import('svelte/store').Writable<Category[]>} */
export const categories = writable([]);

let categoriesLoaded = false;

export async function loadCategories() {
  if (categoriesLoaded) return;
  try {
    const fetchedCategories = await dbGetAllCategories();
    categories.set(fetchedCategories || []);
    categoriesLoaded = true;
    console.log('Categories loaded:', fetchedCategories);
  } catch (error) {
    console.error('Failed to load categories:', error);
    categories.set([]); // Set to empty array on error
  }
}

export const incomeCategories = derived(categories, ($categories) =>
  $categories.filter(cat => cat.isPos)
);

export const expenseCategories = derived(categories, ($categories) =>
  $categories.filter(cat => !cat.isPos)
);
