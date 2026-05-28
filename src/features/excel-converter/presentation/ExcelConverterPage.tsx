import { useMemo } from "react";
import { BrowserDownloadService } from "../infrastructure/browser-download-service";
import { XlsxWorkbookParser } from "../infrastructure/xlsx-workbook-parser";
import { BatchDownloadBanner } from "./components/BatchDownloadBanner";
import { FileList } from "./components/FileList";
import { PreviewPanel } from "./components/PreviewPanel";
import { UploadActions } from "./components/UploadActions";
import { useExcelConverter } from "./use-excel-converter";
import "./excel-converter.css";

export const ExcelConverterPage = () => {
	const parser = useMemo(() => new XlsxWorkbookParser(), []);
	const downloadService = useMemo(() => new BrowserDownloadService(), []);
	const converter = useExcelConverter({ parser, downloadService });

	return (
		<main className="converter-shell">
			<section className="converter-card" aria-labelledby="converter-title">
				<header className="converter-header">
					<h1 id="converter-title">Batch Excel to JSON Converter</h1>
					<p>
						Unggah banyak file .xlsx sekaligus, lihat pratinjau, dan unduh
						hasilnya dalam format ZIP.
					</p>
				</header>

				<UploadActions
					hasFiles={converter.filesList.length > 0}
					isLoading={converter.isLoading}
					onClear={converter.clearAllFiles}
					onUpload={converter.handleFileUpload}
				/>

				<BatchDownloadBanner
					isZipping={converter.isZipping}
					successCount={converter.successCount}
					onDownloadAll={converter.downloadAllAsZip}
				/>

				{converter.filesList.length > 0 && (
					<div className="converter-dashboard">
						<FileList
							activeFileId={converter.activeFileId}
							files={converter.filesList}
							onDownload={converter.downloadSingleFile}
							onSelect={converter.selectFile}
						/>
						<PreviewPanel
							file={converter.activeFile}
							onDownload={converter.downloadSingleFile}
						/>
					</div>
				)}
			</section>
		</main>
	);
};
