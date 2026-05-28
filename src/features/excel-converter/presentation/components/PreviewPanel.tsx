import type { ConvertedFile } from "../../domain/converted-file";
import { hasConvertedData } from "../../domain/converted-file";

interface PreviewPanelProps {
	file: ConvertedFile | null;
	onDownload: (file: ConvertedFile) => void;
}

export const PreviewPanel = ({ file, onDownload }: PreviewPanelProps) => {
	if (!file || !hasConvertedData(file)) {
		return (
			<section className="preview-panel preview-panel-empty">
				<p>
					Silakan pilih file yang sukses dikonversi di panel kiri untuk melihat
					isi strukturnya.
				</p>
			</section>
		);
	}

	return (
		<section className="preview-panel">
			<header className="preview-header">
				<strong>Pratinjau: {file.name}.json</strong>
				<button
					type="button"
					onClick={() => onDownload(file)}
					className="button button-dark"
				>
					Unduh File Ini
				</button>
			</header>
			<pre className="preview-code">
				{JSON.stringify(file.convertedData, null, 2)}
			</pre>
		</section>
	);
};
