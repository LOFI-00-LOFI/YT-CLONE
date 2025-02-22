import { persisted } from '$lib/utils/persisted';

export const isDarkMode = persisted('theme', true); 