// const DB_NAME = "BoulderTrackDB";
// const STORE_NAME = "climbs";
// const DB_VERSION = 1;

// function openDB() {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open(DB_NAME, DB_VERSION);

//     request.onupgradeneeded = (event) => {
//       const database = event.target.result;
//       if (!database.objectStoreNames.contains(STORE_NAME)) {
//         database.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
//       }
//     };

//     request.onsuccess = () => resolve(request.result);
//     request.onerror = () => reject(request.error);
//   });
// }

// function addClimbRecord(db, record) {
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction(STORE_NAME, "readwrite");
//     const store = tx.objectStore(STORE_NAME);
//     const request = store.add(record);
//     request.onsuccess = () => resolve(request.result);
//     request.onerror = () => reject(request.error);
//   });
// }

// function getAllClimbRecords(db) {
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction(STORE_NAME, "readonly");
//     const store = tx.objectStore(STORE_NAME);
//     const request = store.getAll();
//     request.onsuccess = () => resolve(request.result || []);
//     request.onerror = () => reject(request.error);
//   });
// }

// function getClimbRecord(db, id) {
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction(STORE_NAME, "readonly");
//     const store = tx.objectStore(STORE_NAME);
//     const request = store.get(id);
//     request.onsuccess = () => resolve(request.result);
//     request.onerror = () => reject(request.error);
//   });
// }

// function deleteClimbRecord(db, id) {
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction(STORE_NAME, "readwrite");
//     const store = tx.objectStore(STORE_NAME);
//     const request = store.delete(id);
//     request.onsuccess = () => resolve();
//     request.onerror = () => reject(request.error);
//   });
// }