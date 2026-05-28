import type { ChangeEvent } from "react";

interface UploadActionsProps {
	hasFiles: boolean;
	isLoading: boolean;
	onClear: () => void;
	onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const UploadActions = ({
	hasFiles,
	isLoading,
	onClear,
	onUpload,
}: UploadActionsProps) => (
	<div className="converter-upload">
		<input
			type="file"
			accept=".xlsx,.xls"
			onChange={onUpload}
			className="converter-file-input"
			id="file-upload"
			multiple
		/>
		<label htmlFor="file-upload" className="button button-primary">
			{isLoading ? "Memproses File..." : "Pilih Banyak File Excel"}
		</label>

		{hasFiles && (
			<button type="button" onClick={onClear} className="button button-muted">
				Bersihkan Semua
			</button>
		)}
	</div>
);
