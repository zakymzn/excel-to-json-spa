import type { ConvertedFile } from "../domain/converted-file";
import { isSupportedExcelFile, removeFileExtension } from "../domain/excel-file";
import type { WorkbookParser } from "./workbook-parser";

const createFileId = () => {
	if (globalThis.crypto?.randomUUID) {
		return globalThis.crypto.randomUUID();
	}

	return Math.random().toString(36).slice(2, 11);
};

const createFailedFile = (file: File, error: string): ConvertedFile => ({
	id: createFileId(),
	name: file.name,
	error,
	convertedData: null,
});

export const convertExcelFiles = async (
	files: File[],
	parser: WorkbookParser,
): Promise<ConvertedFile[]> =>
	Promise.all(
		files.map(async (file) => {
			if (!isSupportedExcelFile(file.name)) {
				return createFailedFile(file, "Format harus .xlsx atau .xls");
			}

			try {
				const convertedData = await parser.parse(file);

				return {
					id: createFileId(),
					name: removeFileExtension(file.name),
					error: null,
					convertedData,
				};
			} catch {
				return createFailedFile(file, "Gagal mengonversi file.");
			}
		}),
	);
