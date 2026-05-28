export type JsonWorkbook = Record<string, unknown[]>;

export interface ConvertedFile {
	id: string;
	name: string;
	error: string | null;
	convertedData: JsonWorkbook | null;
}

export const hasConvertedData = (
	file: ConvertedFile,
): file is ConvertedFile & { convertedData: JsonWorkbook; error: null } =>
	file.error === null && file.convertedData !== null;
