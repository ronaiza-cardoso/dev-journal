class IndexedDBService {
  constructor() {
    this.dbName = "DevJournalDB";
    this.version = 1;
    this.storeName = "entries";
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("Error opening IndexedDB:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create the entries store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" });

          // Create indexes for efficient querying
          store.createIndex("date", "date", { unique: false });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  async getAllEntries() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error("Error getting all entries:", request.error);
        reject(request.error);
      };
    });
  }

  async saveEntry(entry) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error("Error saving entry:", request.error);
        reject(request.error);
      };
    });
  }

  async updateEntry(entry) {
    // updateEntry is the same as saveEntry since put() will update if exists
    return this.saveEntry(entry);
  }

  async saveMultipleEntries(entries) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      let savedCount = 0;
      const totalEntries = entries.length;

      if (totalEntries === 0) {
        resolve(0);
        return;
      }

      entries.forEach((entry) => {
        const request = store.put(entry);

        request.onsuccess = () => {
          savedCount++;
          if (savedCount === totalEntries) {
            resolve(savedCount);
          }
        };

        request.onerror = () => {
          console.error("Error saving entry:", request.error);
          reject(request.error);
        };
      });
    });
  }

  async deleteEntry(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        console.error("Error deleting entry:", request.error);
        reject(request.error);
      };
    });
  }

  async getEntryById(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error("Error getting entry by ID:", request.error);
        reject(request.error);
      };
    });
  }

  async getEntriesByDateRange(startDate, endDate) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("date");
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error("Error getting entries by date range:", request.error);
        reject(request.error);
      };
    });
  }

  async clearAllEntries() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        console.error("Error clearing all entries:", request.error);
        reject(request.error);
      };
    });
  }

  // Migration helper to move data from localStorage to IndexedDB
  async migrateFromLocalStorage() {
    try {
      const localStorageData = localStorage.getItem("journalEntries");
      if (localStorageData) {
        const entries = JSON.parse(localStorageData);
        if (entries.length > 0) {
          await this.saveMultipleEntries(entries);
          console.log(
            `Migrated ${entries.length} entries from localStorage to IndexedDB`
          );
          return entries.length;
        }
      }
      return 0;
    } catch (error) {
      console.error("Error migrating from localStorage:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const indexedDBService = new IndexedDBService();
export default indexedDBService;
