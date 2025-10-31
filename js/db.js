// 简单的 IndexedDB 封装，用于存储相册、画师和图片（Blob）
const DB_NAME = 'oc-showcase-db';
const DB_VERSION = 1;

function openDB(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e)=>{
      const db = e.target.result;
      if(!db.objectStoreNames.contains('albums')){
        db.createObjectStore('albums',{keyPath:'id',autoIncrement:true});
      }
      if(!db.objectStoreNames.contains('artists')){
        db.createObjectStore('artists',{keyPath:'id',autoIncrement:true});
      }
      if(!db.objectStoreNames.contains('images')){
        const store = db.createObjectStore('images',{keyPath:'id',autoIncrement:true});
        store.createIndex('albumId','albumId', {unique:false});
        store.createIndex('artistId','artistId', {unique:false});
      }
    };
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}

async function withStore(storeName, mode, callback){
  const db = await openDB();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = callback(store);
    tx.oncomplete = ()=>resolve(result);
    tx.onerror = ()=>reject(tx.error);
  });
}

async function add(store, value){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(store,'readwrite');
    const st = tx.objectStore(store);
    const req = st.add(value);
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}

async function put(store, value){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(store,'readwrite');
    const st = tx.objectStore(store);
    const req = st.put(value);
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}

async function getAll(store){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(store,'readonly');
    const st = tx.objectStore(store);
    const req = st.getAll();
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}

async function getByIndex(store, indexName, indexValue){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(store,'readonly');
    const st = tx.objectStore(store);
    const idx = st.index(indexName);
    const req = idx.getAll(indexValue);
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}

async function get(store, key){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(store,'readonly');
    const st = tx.objectStore(store);
    const req = st.get(key);
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}

async function del(store, key){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(store,'readwrite');
    const st = tx.objectStore(store);
    const req = st.delete(key);
    req.onsuccess = ()=>resolve(true);
    req.onerror = ()=>reject(req.error);
  });
}

// 导出到全局，方便在 file:// 环境下以非模块脚本使用
window.DB = { add, put, getAll, getByIndex, get, del };
