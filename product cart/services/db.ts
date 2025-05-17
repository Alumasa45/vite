import { CartItem }  from "../product";

const DB_NAME = 'shop_db';
const DB_VERSION = 1;
const CART_STORE = 'cart';

export const initializeDB = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(CART_STORE)) {
                const cartStore = db.createObjectStore(CART_STORE, {keyPath: 'id', autoIncrement: true});
                cartStore.createIndex('productId', 'productId', { unique: true });
            }
        };

        request.onsuccess = () => {
            console.log('IndexedDB initialized successfully');
            resolve(true);
        };

        request.onerror = (event) => {
            console.error('Error initializing IndexedDB:', (event.target as IDBOpenDBRequest).error);
            reject(false);
        };
    });
};

const getDBConnection = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = () => {
            resolve(request.result);
            
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
};


export const saveToCart = async (item: { productId: number; quantity: number; [key: string]: any }) => {
    try {
        const db = await getDBConnection();
        const existingItem = await getCartItemByProductId(item.productId);

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(CART_STORE, 'readwrite');
            const store = transaction.objectStore(CART_STORE);
            let request: IDBRequest;
            if (existingItem) {
                const updatedItem = {
                    ...existingItem, quantity: existingItem.quantity + item.quantity
                };
                request = store.put(updatedItem);
            } else {
                request = store.add(item);
            }

            request.onsuccess = (event) => {
                resolve((event.target as IDBRequest<number>).result);
            };
            request.onerror = (event) => {
                reject((event.target as IDBRequest).error);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        });

    } catch (error) {
        console.error('Error saving item to cart:', error);
        throw error;
    }
};

// getting all items from the cart.
export const getCartItems = async (): Promise<CartItem[]> => {
    try {
        const db = await getDBConnection();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(CART_STORE, 'readonly');
            const store = transaction.objectStore(CART_STORE);
            const request = store.getAll();

            request.onsuccess = (event) => {
                resolve((event.target as IDBRequest<CartItem[]>).result);
            };
            request.onerror = (event) => {
                reject((event.target as IDBRequest).error);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        });

    } catch (error) {
            console.error('Error getting cart items:', error);
            throw error;
        }
    };

    // getting a cart item by product id
    export const getCartItemByProductId = async (productId: number): Promise<CartItem|undefined> => {
        try{
            const db = await getDBConnection();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction (CART_STORE , 'readonly');
                const store = transaction.objectStore (CART_STORE);
                const index = store.index('productId');
                const request = index.get(productId);

                request.onsuccess = (event) => {
                    resolve((event.target as IDBRequest<CartItem>).result);
                };

                request.onerror = (event) => {
                    reject((event.target as IDBRequest).error);
                };

                transaction.oncomplete = () => {
                    db.close();
                };
            });
        } catch (error) {
            console.error('Error getting cart item by productId:', error);
            throw error;
        }
    };

    // removing a cart item by id
    export const removeCartItem = async (id: number): Promise<void> => {
        try {
            const db = await getDBConnection();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(CART_STORE, 'readwrite');
                const store = transaction.objectStore(CART_STORE);
                const request = store.delete(id);

                request.onsuccess = () => {
                    resolve();
                };
                request.onerror = (event) => {
                    reject((event.target as IDBRequest).error);
                };

                transaction.oncomplete = () => {
                    db.close();
                };
            });
        } catch (error) {
            console.error('Error removing cart item:', error);
            throw error;
        }
    };

    // updating cart quantity
    export const updateCartItemQuantity = async (id: number, quantity: number): Promise<void> => {
        try {
            if(quantity <= 0) {
                await removeCartItem(id);
                return;
            }
            const db = await getDBConnection();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(CART_STORE, 'readwrite');
                const store = transaction.objectStore(CART_STORE);
                const getRequest = store.get(id);

                getRequest.onsuccess = (event) => {
                    const item = (event.target as IDBRequest<CartItem>).result;
                    if(item) {
                        item.quantity = quantity;
                        const updateRequest = store.put(item);

                        updateRequest.onerror = () => {
                            resolve();
                        };

                        updateRequest.onerror = (event) => {
                            reject((event.target as IDBRequest).error);
                        };
                    } else {
                        reject(new Error('Item not found'));
                    }
                };

                getRequest.onerror = (event) => {
                    reject((event.target as IDBRequest).error);
                };

                transaction.oncomplete = () => {
                    db.close();
                };
            });

        } catch (error) {
            console.error('Error updating cart item quantity:', error);
            throw error;
        }
    };


    
    
    

       