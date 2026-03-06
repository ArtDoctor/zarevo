import { writable } from 'svelte/store';

export interface ValidationFormData {
	startupIdea: string;
	geography: string;
	problem: string;
	customer: string;
	founder_specific: string;
	validationType: 'basic' | 'pro' | null;
}

const initial: ValidationFormData = {
	startupIdea: '',
	geography: '',
	problem: '',
	customer: '',
	founder_specific: '',
	validationType: null
};

export const validationFormStore = writable<ValidationFormData>(initial);

export function setValidationForm(data: Partial<ValidationFormData>) {
	validationFormStore.update((prev) => ({ ...prev, ...data }));
}

export function clearValidationForm() {
	validationFormStore.set({ ...initial });
}
