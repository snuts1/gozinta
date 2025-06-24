const DB_NAME = 'cashFlowDB';
const DB_VERSION = 5; // Increment version due to schema changes
const STORE_NAME = 'entries';
const STORES = [STORE_NAME, 'categories', 'accounts', 'scenarios', 'debts'];
let db;

/**
 * Initializes the IndexedDB database.
 * Creates the object store and indexes if they don't exist.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
 */
const defaultCategories = [
  {
    id: 'cat_paycheck',
    name: 'Paycheck',
    description: 'Regular income from employment.',
    isPos: true
  },
  {
    id: 'cat_sales',
    name: 'Sales',
    description: 'Income from sales of goods or services.',
    isPos: true
  },
  {
    id: 'cat_rent',
    name: 'Rent',
    description: 'Monthly rent payment for housing.',
    isPos: false
  },
  {
    id: 'cat_mortgage',
    name: 'Mortgage',
    description: 'Monthly mortgage payment for property.',
    isPos: false
  },
  {
    id: 'cat_gas',
    name: 'Gas',
    description: 'Expenses for vehicle fuel.',
    isPos: false
  },
  {
    id: 'cat_food',
    name: 'Food',
    description: 'Expenses for groceries and dining out.',
    isPos: false
  },
  {
    id: 'cat_entertainment',
    name: 'Entertainment',
    description: 'Expenses for leisure activities, movies, events, etc.',
    isPos: false
  },
  {
    id: 'cat_adjustment',
    name: 'Adjustment',
    description: 'fixeroo',
    isPos: false
  },
  {
    id: 'cat_startingBalance',
    name: 'Starting Balance',
    description: 'Initial Balance Entry',
    isPos: true
  },
  // You can add more default categories here
];


export async function initDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("Database error:", event.target.error);
            reject("Database error: " + event.target.error.message);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("Database opened successfully");
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const currentDB = event.target.result;
            const upgradeTransaction = event.target.transaction; // Use this transaction for data seeding
            const oldVersion = event.oldVersion;
            let entriesStore;

    // Handle upgrades incrementally
    // Each 'if' block applies changes needed to get from an older version to the next.
    // These will run sequentially if upgrading across multiple versions.

            if (oldVersion < 4) {
                // This is the logic for the V3 to V4 jump, important to nuke old DB because indexes are changing.
                // It includes deleting and recreating 'entries', creating 'categories', 'accounts'.
                console.log("Applying V3 to V4 schema changes...");

                let entriesStore;
                if (currentDB.objectStoreNames.contains(STORE_NAME)) {
                    console.warn(`Recreating '${STORE_NAME}' store for V4 schema. Existing data will be lost if not migrated.`);
                    currentDB.deleteObjectStore(STORE_NAME);
                    entriesStore = currentDB.createObjectStore(STORE_NAME, { keyPath: 'id' });
                } else {
                    entriesStore = currentDB.createObjectStore(STORE_NAME, { keyPath: 'id' });
                };

                entriesStore.createIndex('entryType', 'entryType', { unique: false });
                entriesStore.createIndex('transactionDate', 'transactionDate', { unique: false });
                entriesStore.createIndex('projectedDate', 'projectedDate', { unique: false });
                entriesStore.createIndex('linkedProjectionId', 'linkedProjectionId', { unique: false });
                entriesStore.createIndex('categoryId', 'categoryId', { unique: false });
                entriesStore.createIndex('accountId', 'accountId', { unique: false });
                console.log(`Object store '${STORE_NAME}' set up for V4.`);

                if (!currentDB.objectStoreNames.contains('categories')) {
                    const categoriesStore = currentDB.createObjectStore('categories', { keyPath: 'id' });
                    categoriesStore.createIndex('name', 'name', { unique: true });
                    categoriesStore.createIndex('isPos', 'isPos');
                    console.log('Created categories object store for V4');
                    const categoriesDataStore = upgradeTransaction.objectStore('categories');
                    defaultCategories.forEach(category => { // Assuming defaultCategories is defined
                        categoriesDataStore.add(category);
                    });
                    console.log('Added default categories for V4');
                }; 

                if (!currentDB.objectStoreNames.contains('accounts')) {
                    const accountsStore = currentDB.createObjectStore('accounts', { keyPath: 'id' });
                    accountsStore.createIndex('name', 'name', { unique: true });
                    console.log('Created accounts object store for V4');
                };
            };

            if (oldVersion < 5) {
                console.log("Applying V4 to V5 schema changes for scenarios and debts...");

                // Add scenarioId index to the existing entries store
                const entriesStore = upgradeTransaction.objectStore(STORE_NAME);
                if (!entriesStore.indexNames.contains('scenarioId')) {
                    entriesStore.createIndex('scenarioId', 'scenarioId', { unique: false });
                    console.log(`Created 'scenarioId' index on '${STORE_NAME}' store.`);
                }

                // Create a new object store for scenarios
                if (!currentDB.objectStoreNames.contains('scenarios')) {
                    currentDB.createObjectStore('scenarios', { keyPath: 'id' });
                    console.log('Created scenarios object store for V5');
                }

                // Create a new object store for debts
                if (!currentDB.objectStoreNames.contains('debts')) {
                    currentDB.createObjectStore('debts', { keyPath: 'id' });
                    console.log('Created debts object store for V5');
                }
            }
        };
    });
};
    /**
     * Adds a new entry to the database.
     * The entry object should conform to the new Entry typedef, including an 'id' (e.g., UUID).
     * @param {Entry} entry - The entry object to add.
     * @returns {Promise<string>} A promise that resolves with the ID of the newly added entry.
     */
    // Ensure you have a UUID generation function available, e.g., import { v4 as uuidv4 } from 'uuid';
    // and call entry.id = uuidv4(); before adding if not provided.
    export async function addEntry(entry) {
        if (!db) await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORES, 'readwrite'); // Use all stores for transaction
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(entry);

            // If 'id' is not auto-incrementing, it must be provided in the 'entry' object.
            // Consider adding UUID generation here if `entry.id` might be missing.

            request.onsuccess = (event) => {
                resolve(event.target.result); // Returns the key of the new object
            };
            request.onerror = (event) => {
                console.error("Error adding entry:", event.target.error);
                reject("Error adding entry: " + event.target.error.message);
            };
        });
    }

/**
 * Retrieves all entries from the database.
 * @returns {Promise<Array<Entry>>} A promise that resolves with an array of all entries.
 */
export async function getAllEntries() {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES, 'readonly'); // Use all stores for transaction
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            console.error("Error fetching all entries:", event.target.error);
            reject("Error fetching all entries: " + event.target.error.message);
        };
    });
}

/**
 * Retrieves a single entry by its ID.
 * @param {string} id - The ID of the entry to retrieve.
 * @returns {Promise<Entry|undefined>} A promise that resolves with the entry object, or undefined if not found.
 */
export async function getEntry(id) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES, 'readonly'); // Use all stores for transaction
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            console.error("Error fetching entry:", event.target.error);
            reject("Error fetching entry: " + event.target.error.message);
        };
    });
}

/**
 * Updates an existing entry in the database.
 * The entry object must have an 'id' property.
 * @param {Entry} entry - The entry object to update.
 * @returns {Promise<string>} A promise that resolves with the ID of the updated entry.
 */
export async function updateEntry(entry) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        if (!entry.id) {
            return reject("Entry must have an id to be updated.");
        }
        const transaction = db.transaction(STORES, 'readwrite'); // Use all stores for transaction
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(entry); // put() updates if key exists, otherwise adds.

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            console.error("Error updating entry:", event.target.error);
            reject("Error updating entry: " + event.target.error.message);
        };
    });
}

/**
 * Deletes an entry from the database by its ID.
 * @param {string} id - The ID of the entry to delete.
 * @returns {Promise<void>} A promise that resolves when the entry is deleted.
 */
export async function deleteEntry(id) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES, 'readwrite'); // Use all stores for transaction
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
            resolve();
        };
        request.onerror = (event) => {
            console.error("Error deleting entry:", event.target.error);
            reject("Error deleting entry: " + event.target.error.message);
        };
    });
}

/**
 * Retrieves all categories from the database.
 * @returns {Promise<Array<{id: string, name: string, description?: string, isPos?: boolean}>>} A promise that resolves with an array of all category objects.
 */
export async function getAllCategories() {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES, 'readonly'); // Use all stores for transaction
        const store = transaction.objectStore('categories');
        const request = store.getAll();

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            console.error("Error fetching all categories:", event.target.error);
            reject("Error fetching all categories: " + event.target.error.message);
        };
    });
}

/**
 * Adds a new account to the database.
 * @param {import('./types.js').Account} account - The account object to add.
 * @returns {Promise<string>} A promise that resolves with the ID of the newly added account.
 */
export async function addAccount(account) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES, 'readwrite');
        const store = transaction.objectStore('accounts');
        const request = store.add(account);

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => {
            console.error("Error adding account:", event.target.error);
            reject("Error adding account: " + event.target.error.message);
        };
    });
}

/**
 * Retrieves all accounts from the database.
 * @returns {Promise<Array<import('./types.js').Account>>} A promise that resolves with an array of all accounts.
 */
export async function getAllAccounts() {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES, 'readonly');
        const store = transaction.objectStore('accounts');
        const request = store.getAll();

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => {
            console.error("Error fetching all accounts:", event.target.error);
            reject("Error fetching all accounts: " + event.target.error.message);
        };
    });
}

/**
 * Adds a new debt to the database.
 * @param {import('./types.js').Debt} debt - The debt object to add.
 * @returns {Promise<string>} A promise that resolves with the ID of the newly added debt.
 */
export async function addDebt(debt) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES, 'readwrite');
        const store = transaction.objectStore('debts');
        const request = store.add(debt);

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => {
            console.error("Error adding debt:", event.target.error);
            reject("Error adding debt: " + event.target.error.message);
        };
    });
}

/**
 * Retrieves all debts from the database.
 * @returns {Promise<Array<import('./types.js').Debt>>} A promise that resolves with an array of all debts.
 */
export async function getAllDebts() {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES, 'readonly');
        const store = transaction.objectStore('debts');
        const request = store.getAll();

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => {
            console.error("Error fetching all debts:", event.target.error);
            reject("Error fetching all debts: " + event.target.error.message);
        };
    });
}

/**
 * Adds a new scenario to the database.
 * @param {import('./types.js').Scenario} scenario - The scenario object to add.
 * @returns {Promise<string>} A promise that resolves with the ID of the newly added scenario.
 */
export async function addScenario(scenario) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES, 'readwrite');
        const store = transaction.objectStore('scenarios');
        const request = store.add(scenario);

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => {
            console.error("Error adding scenario:", event.target.error);
            reject("Error adding scenario: " + event.target.error.message);
        };
    });
}

/**
 * Retrieves all scenarios from the database.
 * @returns {Promise<Array<import('./types.js').Scenario>>} A promise that resolves with an array of all scenarios.
 */
export async function getAllScenarios() {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES, 'readonly');
        const store = transaction.objectStore('scenarios');
        const request = store.getAll();

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => {
            console.error("Error fetching all scenarios:", event.target.error);
            reject("Error fetching all scenarios: " + event.target.error.message);
        };
    });
}

/**
 * Retrieves all entries needed to build a projection for a given scenario.
 * This includes all base entries plus the specific entries for that scenario.
 *
 * @param {string | null} scenarioId - The ID of the scenario, or null for the base timeline.
 * @returns {Promise<Array<import('./types.js').Entry>>} A promise that resolves with an array of combined entries.
 */
export async function getEntriesForProjection(scenarioId) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll(); // Fetch all entries

        request.onsuccess = (event) => {
            const allEntries = event.target.result;
            const combinedEntries = [];

            // Add base entries (those without any scenarioId)
            for (const entry of allEntries) {
                if (!entry.scenarioId) {
                    combinedEntries.push(entry);
                }
            }

            // If a specific scenario is requested, add its entries
            if (scenarioId) {
                for (const entry of allEntries) {
                    if (entry.scenarioId === scenarioId) {
                        combinedEntries.push(entry);
                    }
                }
            }
            resolve(combinedEntries);
        };
        request.onerror = (event) => {
            console.error("Error fetching entries for projection:", event.target.error);
            reject("Error fetching entries for projection: " + event.target.error.message);
        };
    });
}
