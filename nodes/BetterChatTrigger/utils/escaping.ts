/**
 * Escape curly braces to prevent AI Agent template parsing errors
 * This function recursively escapes all string values in nested objects/arrays
 */
export function escapeBraces(value: any): any {
	if (typeof value === 'string') {
		// Replace single braces with double braces for AI Agent compatibility
		return value.replace(/{/g, '{{').replace(/}/g, '}}');
	}
	if (Array.isArray(value)) {
		return value.map(escapeBraces);
	}
	if (value && typeof value === 'object') {
		const escaped: any = {};
		for (const key in value) {
			if (value.hasOwnProperty(key)) {
				escaped[key] = escapeBraces(value[key]);
			}
		}
		return escaped;
	}
	return value;
}