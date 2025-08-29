/**
 * File handling utilities for Better Chat Trigger
 */

import { ProcessedFile } from '../types/interfaces';

/**
 * Process files from request body and convert to n8n binary format
 */
export function processFiles(files: any[]): ProcessedFile[] {
	if (!Array.isArray(files) || files.length === 0) {
		return [];
	}

	const processedFiles: ProcessedFile[] = [];

	files.forEach((file: any, index: number) => {
		try {
			// Validate file object structure
			if (!file || !file.data) {
				console.error(`Invalid file object at index ${index}:`, file);
				return; // Skip this file
			}

			// File data should already be pure base64 from frontend
			// But handle both cases for compatibility
			let base64Data = file.data;
			if (typeof file.data === 'string' && file.data.startsWith('data:')) {
				// Legacy: Extract base64 from data URL if needed
				const parts = file.data.split(',');
				base64Data = parts[1] || file.data;
			}

			// Validate base64 data
			if (!base64Data || typeof base64Data !== 'string') {
				console.error(`Invalid base64 data for file ${file.name}`);
				return; // Skip this file
			}

			// Create processed file object
			processedFiles.push({
				name: file.name || `file_${index}`,
				type: file.type || 'application/octet-stream',
				size: file.size || 0,
				data: base64Data,
			});

		} catch (fileError) {
			console.error(`Error processing file at index ${index}:`, fileError);
			// Continue with next file
		}
	});

	return processedFiles;
}

/**
 * Convert processed files to n8n binary format
 */
export function convertToBinaryFormat(processedFiles: ProcessedFile[]): { binary: any; binaryPropertyNames: string[] } {
	const binary: any = {};
	const binaryPropertyNames: string[] = [];

	processedFiles.forEach((file, index) => {
		try {
			const binaryPropertyName = `data${index}`;

			// Convert base64 to Buffer with error handling
			let buffer: Buffer;
			try {
				buffer = Buffer.from(file.data, 'base64');
			} catch (bufferError) {
				console.error(`Error converting base64 to buffer for file ${file.name}:`, bufferError);
				return; // Skip this file
			}

			// Add to binary object in n8n standard format
			binary[binaryPropertyName] = {
				data: buffer,
				fileName: file.name,
				mimeType: file.type,
				fileSize: buffer.length,
			};

			// Track binary property names
			binaryPropertyNames.push(binaryPropertyName);

		} catch (fileError) {
			console.error(`Error processing file at index ${index}:`, fileError);
			// Continue with next file
		}
	});

	return { binary, binaryPropertyNames };
}

/**
 * Clean file data from body to prevent template parsing errors
 */
export function cleanFileDataFromBody(bodyData: any): any {
	if (!bodyData || typeof bodyData !== 'object') {
		return bodyData;
	}

	const cleanBody = { ...bodyData };
	if (cleanBody.files && Array.isArray(cleanBody.files)) {
		// Keep file metadata but remove actual data
		cleanBody.files = cleanBody.files.map((f: any) => ({
			name: f.name,
			type: f.type,
			size: f.size,
			// data field removed to prevent template errors
		}));
	}

	return cleanBody;
}

/**
 * Extract files from request body
 */
export function extractFiles(bodyData: any): any[] {
	if (!bodyData || !bodyData.files || !Array.isArray(bodyData.files)) {
		return [];
	}

	return bodyData.files;
}

/**
 * Validate file type against allowed types
 */
export function validateFileType(fileName: string, mimeType: string, allowedTypes: string): boolean {
	if (!allowedTypes || allowedTypes === '*') {
		return true;
	}

	const allowed = allowedTypes.split(',').map(type => type.trim().toLowerCase());
	
	// Check file extension
	const extension = fileName.toLowerCase().split('.').pop();
	if (extension && allowed.some(type => type === `.${extension}` || type === extension)) {
		return true;
	}

	// Check MIME type
	if (allowed.some(type => mimeType.toLowerCase().includes(type.replace(/[.*]/g, '')))) {
		return true;
	}

	return false;
}

/**
 * Validate file size against maximum allowed size
 */
export function validateFileSize(fileSize: number, maxSizeMB: number): boolean {
	if (!maxSizeMB || maxSizeMB <= 0) {
		return true; // No limit
	}

	const maxSizeBytes = maxSizeMB * 1024 * 1024;
	return fileSize <= maxSizeBytes;
}