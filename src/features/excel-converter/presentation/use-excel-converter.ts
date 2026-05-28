import { useMemo, useState, type ChangeEvent } from "react";
import { convertExcelFiles } from "../application/convert-excel-files";
import type { DownloadService } from "../application/download-service";
import type { WorkbookParser } from "../application/workbook-parser";
import type { ConvertedFile } from "../domain/converted-file";
import { hasConvertedData } from "../domain/converted-file";

interface UseExcelConverterOptions {
	parser: WorkbookParser;
	downloadService: DownloadService;
}

export const useExcelConverter = ({
	parser,
	downloadService,
}: UseExcelConverterOptions) => {
	const [filesList, setFilesList] = useState<ConvertedFile[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isZipping, setIsZipping] = useState(false);
	const [activeFileId, setActiveFileId] = useState<string | null>(null);

	const activeFile = useMemo(
		() => filesList.find((file) => file.id === activeFileId) ?? null,
		[activeFileId, filesList],
	);

	const successCount = useMemo(
		() => filesList.filter(hasConvertedData).length,
		[filesList],
	);

	const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
		const uploadedFiles = Array.from(event.target.files ?? []);
		if (uploadedFiles.length === 0) return;

		setIsLoading(true);

		try {
			const results = await convertExcelFiles(uploadedFiles, parser);

			setFilesList((currentFiles) => {
				const shouldSelectFirstSuccess = activeFileId === null;
				const firstSuccessFile = results.find(hasConvertedData);

				if (shouldSelectFirstSuccess && firstSuccessFile) {
					setActiveFileId(firstSuccessFile.id);
				}

				return [...currentFiles, ...results];
			});
		} finally {
			setIsLoading(false);
			event.target.value = "";
		}
	};

	const selectFile = (file: ConvertedFile) => {
		if (hasConvertedData(file)) {
			setActiveFileId(file.id);
		}
	};

	const downloadSingleFile = (file: ConvertedFile) => {
		downloadService.downloadJson(file);
	};

	const downloadAllAsZip = async () => {
		setIsZipping(true);

		try {
			await downloadService.downloadZip(filesList);
		} catch (error) {
			console.error("Gagal membuat file ZIP:", error);
			window.alert("Terjadi kesalahan saat mengompres file.");
		} finally {
			setIsZipping(false);
		}
	};

	const clearAllFiles = () => {
		setFilesList([]);
		setActiveFileId(null);
	};

	return {
		activeFile,
		activeFileId,
		clearAllFiles,
		downloadAllAsZip,
		downloadSingleFile,
		filesList,
		handleFileUpload,
		isLoading,
		isZipping,
		selectFile,
		successCount,
	};
};
