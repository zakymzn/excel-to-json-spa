import type { ConvertedFile } from "../../domain/converted-file";
import { hasConvertedData } from "../../domain/converted-file";

interface FileListProps {
	activeFileId: string | null;
	files: ConvertedFile[];
	onDownload: (file: ConvertedFile) => void;
	onSelect: (file: ConvertedFile) => void;
}

export const FileList = ({
	activeFileId,
	files,
	onDownload,
	onSelect,
}: FileListProps) => (
	<aside className="converter-sidebar">
		<h2 className="converter-section-title">Daftar File ({files.length})</h2>
		<div className="file-list">
			{files.map((file) => {
				const isReady = hasConvertedData(file);
				const className = [
					"file-item",
					activeFileId === file.id ? "file-item-active" : "",
					!isReady ? "file-item-error" : "",
				]
					.filter(Boolean)
					.join(" ");

				return (
					<div
						key={file.id}
						className={className}
					>
						<button
							type="button"
							onClick={() => onSelect(file)}
							className="file-select"
							disabled={!isReady}
						>
							<span className="file-name" title={file.name}>
								{file.name}
							</span>
							<span className={isReady ? "status status-success" : "status status-error"}>
								{isReady ? "Ready" : file.error}
							</span>
						</button>

						{isReady && (
							<button
								type="button"
								className="mini-download"
								title="Unduh file ini saja"
								onClick={() => onDownload(file)}
							>
								Download
							</button>
						)}
					</div>
				);
			})}
		</div>
	</aside>
);
