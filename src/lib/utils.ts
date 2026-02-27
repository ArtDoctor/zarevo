export function serializeNonPOJOs<T>(obj: T): T {
	return structuredClone(obj);
}
