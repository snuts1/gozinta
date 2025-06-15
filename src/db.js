const DB_NAME = 'cashFlowDB';
const DB_VERSION = 3;
const STORE_NAME = 'entries';

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
  }
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

            if (!currentDB.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = currentDB.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                // Define indexes for efficient querying
                objectStore.createIndex('date', 'date', { unique: false });
                objectStore.createIndex('isProjected', 'isProjected', { unique: false });
                objectStore.createIndex('amount', 'amount', { unique: false });
                objectStore.createIndex('recurrence', 'recurrence', { unique: false });
                objectStore.createIndex('categoryID','categoryId', { unique: false });
                objectStore.createIndex('accountID','accountId', { unique: false });
                console.log("Object store 'entries' created with indexes.");
            }
            // Create 'categories' object store if it doesn't exist
            if (!currentDB.objectStoreNames.contains('categories')) {
                const categoriesStore = currentDB.createObjectStore('categories', {
                keyPath: 'id' // 'id' will be the unique key
                });
                // Optional: Create an index on 'name' if you want to query by name,
                // or on 'isPos' if you want to easily fetch all income/expense categories.
                categoriesStore.createIndex('name', 'name', { unique: true });
                categoriesStore.createIndex('isPos', 'isPos');
                console.log('Created categories object store');

                // Populate with default categories
                // Use the transaction provided to the upgrade callback
                
                const categoriesDataStore  = upgradeTransaction.objectStore('categories');
                defaultCategories.forEach(category => {
                categoriesDataStore.add(category);
                });
                console.log('Added default categories');
            }

            // Create 'accounts' object store (example)
            if (!currentDB.objectStoreNames.contains('accounts')) {
                const accountsStore = currentDB.createObjectStore('accounts', {
                keyPath: 'id'
                });
                accountsStore.createIndex('name', 'name', { unique: true });
                accountsStore.createIndex('type', 'type');
                console.log('Created accounts object store');
            }

        };
    });
}

/**
 * Adds a new entry to the database.
 * @param {object} entry - The entry object to add.
 *                         Example: { date: new Date(), amount: 100, recurrence: 0, isProjected: false, description: 'Lunch' }
 * @returns {Promise<number>} A promise that resolves with the ID of the newly added entry.
 */
export async function addEntry(entry) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(entry);

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
 * @returns {Promise<Array<object>>} A promise that resolves with an array of all entries.
 */
export async function getAllEntries() {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
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
 * @param {number} id - The ID of the entry to retrieve.
 * @returns {Promise<object|undefined>} A promise that resolves with the entry object, or undefined if not found.
 */
export async function getEntry(id) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
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
 * @param {object} entry - The entry object to update.
 * @returns {Promise<number>} A promise that resolves with the ID of the updated entry.
 */
export async function updateEntry(entry) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        if (!entry.id) {
            return reject("Entry must have an id to be updated.");
        }
        const transaction = db.transaction([STORE_NAME], 'readwrite');
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
 * @param {number} id - The ID of the entry to delete.
 * @returns {Promise<void>} A promise that resolves when the entry is deleted.
 */
export async function deleteEntry(id) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
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
 * @returns {Promise<Array<object>>} A promise that resolves with an array of all category objects.
 */
export async function getAllCategories() {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['categories'], 'readonly');
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
