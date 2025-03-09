import { writable, type Writable } from 'svelte/store';

export function persisted<T>(key: string, initialValue: T): Writable<T> {
	// Get stored value from localStorage if it exists
	const storedValue = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
	const initial = storedValue ? JSON.parse(storedValue) : initialValue;

	// Create a writable store with the initial value
	const store = writable<T>(initial);

	// Subscribe to changes and update localStorage
	if (typeof window !== 'undefined') {
		store.subscribe((value) => {
			window.localStorage.setItem(key, JSON.stringify(value));
		});
	}

	return store;
}
