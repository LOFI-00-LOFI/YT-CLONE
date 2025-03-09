import { writable } from 'svelte/store';
import { persisted } from '$lib/utils/persisted';

export const isSearchExpanded = writable(false);
export const sidebarOpen = persisted('sidebarOpen', false);
export const theme = persisted('theme', 'dark'); 