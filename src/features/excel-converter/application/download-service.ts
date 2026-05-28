import type { ConvertedFile } from "../domain/converted-file";

export interface DownloadService {
	downloadJson(file: ConvertedFile): void;
	downloadZip(files: ConvertedFile[]): Promise<void>;
}
