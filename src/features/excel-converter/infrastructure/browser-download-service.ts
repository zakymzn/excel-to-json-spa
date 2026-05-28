import type { DownloadService } from "../application/download-service";
import type { ConvertedFile } from "../domain/converted-file";
import { hasConvertedData } from "../domain/converted-file";

const downloadBlob = (blob: Blob, fileName: string) => {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");

	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

export class BrowserDownloadService implements DownloadService {
	downloadJson(file: ConvertedFile): void {
		if (!hasConvertedData(file)) return;

		const jsonString = JSON.stringify(file.convertedData, null, 2);
		const blob = new Blob([jsonString], { type: "application/json" });
		downloadBlob(blob, `${file.name}.json`);
	}

	async downloadZip(files: ConvertedFile[]): Promise<void> {
		const validFiles = files.filter(hasConvertedData);
		if (validFiles.length === 0) return;

		const { default: JSZip } = await import("jszip");
		const zip = new JSZip();

		validFiles.forEach((file) => {
			const jsonString = JSON.stringify(file.convertedData, null, 2);
			zip.file(`${file.name}.json`, jsonString);
		});

		const zipBlob = await zip.generateAsync({ type: "blob" });
		const timestamp = new Date().toISOString().slice(0, 10);
		downloadBlob(zipBlob, `excel-to-json-${timestamp}.zip`);
	}
}
