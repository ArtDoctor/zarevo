import { writable } from 'svelte/store';

export interface ValidationFormData {
	startupIdea: string;
	targetMarket: string;
	problem: string;
	solution: string;
	competitors: string;
}

const initial: ValidationFormData = {
	startupIdea: '',
	targetMarket: '',
	problem: '',
	solution: '',
	competitors: ''
};

export const validationFormStore = writable<ValidationFormData>(initial);

export function setValidationForm(data: Partial<ValidationFormData>) {
	validationFormStore.update((prev) => ({ ...prev, ...data }));
}

export function resetValidationForm() {
	validationFormStore.set(initial);
}
