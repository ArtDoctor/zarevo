export function validateEmail(email: string): string {
	if (!email?.trim()) {
		return 'Email is required';
	}
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return 'Please enter a valid email address';
	}
	return '';
}

export function validateOTPCode(code: string): string {
	if (!code?.trim()) {
		return 'Verification code is required';
	}
	return '';
}

export function validatePassword(password: string, passwordConfirm?: string): string {
	if (!password?.trim()) {
		return 'Password is required';
	}
	if (password.length < 8) {
		return 'Password must be at least 8 characters';
	}
	if (passwordConfirm !== undefined && password !== passwordConfirm) {
		return 'Passwords do not match';
	}
	return '';
}
