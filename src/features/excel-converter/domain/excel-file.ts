const SUPPORTED_EXTENSIONS = [".xlsx", ".xls"] as const;

export const isSupportedExcelFile = (fileName: string) =>
	SUPPORTED_EXTENSIONS.some((extension) =>
		fileName.toLowerCase().endsWith(extension),
	);

export const removeFileExtension = (fileName: string) =>
	fileName.replace(/\.[^/.]+$/, "");
