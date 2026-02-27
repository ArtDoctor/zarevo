import { writable } from 'svelte/store';

export const showAuthModal = writable(false);
export const authModalMode = writable<'signin' | 'signup'>('signin');

export function requestSignIn() {
	authModalMode.set('signin');
	showAuthModal.set(true);
}

export function requestSignUp() {
	authModalMode.set('signup');
	showAuthModal.set(true);
}
