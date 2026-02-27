export function validateUserDataLogin(userData: { username: string; password: string }): string {
	if (!userData.username?.trim()) {
		return 'Username is required';
	}
	if (!userData.password) {
		return 'Password is required';
	}
	if (userData.password.length < 8) {
		return 'Password must be at least 8 characters';
	}
	return '';
}

export function validateUserDataRegister(userData: {
	username: string;
	email: string;
	password: string;
}): string {
	if (!userData.username?.trim()) {
		return 'Username is required';
	}
	if (!userData.email?.trim()) {
		return 'Email is required';
	}
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(userData.email)) {
		return 'Please enter a valid email address';
	}
	if (!userData.password) {
		return 'Password is required';
	}
	if (userData.password.length < 8) {
		return 'Password must be at least 8 characters';
	}
	return '';
}
