import { writable } from 'svelte/store';

export const showAuthModal = writable(false);
export const authModalMode = writable<'signin' | 'signup'>('signin');
export const signupCredits = writable(3);

export function requestSignIn() {
	authModalMode.set('signin');
	showAuthModal.set(true);
}

export function requestSignUp(credits = 3) {
	signupCredits.set(credits);
	authModalMode.set('signup');
	showAuthModal.set(true);
}
