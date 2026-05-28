import type { CSSProperties, ChangeEvent, MouseEvent } from "react";
import { useState } from "react";
import * as xlsx from "xlsx";

type ExcelRow = Record<string, unknown>;
type ExcelJsonData = Record<string, ExcelRow[]>;

type ConvertedFile = {
	id: string;
	name: string;
	error: null;
	convertedData: ExcelJsonData;
};

type FailedFile = {
	id: string;
	name: string;
	error: string;
	convertedData: null;
};

type ExcelFileItem = ConvertedFile | FailedFile;
type StyleMap = Record<string, CSSProperties>;

function App() {
	const [filesList, setFilesList] = useState<ExcelFileItem[]>([]); // Menyimpan daftar file [{ id, name, data, error }]
	const [isLoading, setIsLoading] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null); // File yang sedang aktif di pratinjau

	// Fungsi untuk menangani unggahan banyak file sekaligus
	const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) return;

		const uploadedFiles = Array.from(event.target.files);
		if (uploadedFiles.length === 0) return;

		setIsLoading(true);

		// Memproses setiap file secara paralel menggunakan Promise
		const filePromises = uploadedFiles.map((file) => {
			return new Promise<ExcelFileItem>((resolve) => {
				const fileId = Math.random().toString(36).substring(2, 9);
				const cleanName = file.name.replace(/\.[^/.]+$/, "");

				// Validasi Ekstensi
				if (
					!file.name.toLowerCase().endsWith(".xlsx") &&
					!file.name.toLowerCase().endsWith(".xls")
				) {
					resolve({
						id: fileId,
						name: file.name,
						error: "Format harus .xlsx atau .xls",
						convertedData: null,
					});
					return;
				}

				const reader = new FileReader();
				reader.onload = (e) => {
					try {
						const result = e.target?.result;
						if (!(result instanceof ArrayBuffer)) {
							throw new Error("File tidak dapat dibaca sebagai ArrayBuffer.");
						}

						const data = new Uint8Array(result);
						const workbook = xlsx.read(data, { type: "array" });
						const outputData: ExcelJsonData = {};

						// Iterasi setiap sheet di dalam file Excel ini
						workbook.SheetNames.forEach((sheetName) => {
							const worksheet = workbook.Sheets[sheetName];
							outputData[sheetName] = xlsx.utils.sheet_to_json<ExcelRow>(
								worksheet,
								{
									defval: "",
								},
							);
						});

						resolve({
							id: fileId,
							name: cleanName,
							error: null,
							convertedData: outputData,
						});
					} catch {
						resolve({
							id: fileId,
							name: file.name,
							error: "Gagal mengonversi file.",
							convertedData: null,
						});
					}
				};

				reader.onerror = () => {
					resolve({
						id: fileId,
						name: file.name,
						error: "Gagal membaca file.",
						convertedData: null,
					});
				};

				reader.readAsArrayBuffer(file);
			});
		});

		// Tunggu semua file selesai diproses
		const results = await Promise.all(filePromises);

		setFilesList((prev) => {
			const updatedList = [...prev, ...results];
			// Otomatis aktifkan pratinjau ke file pertama dari hasil unggahan baru jika belum ada yang aktif
			if (activeIndex === null) setActiveIndex(prev.length);
			return updatedList;
		});

		setIsLoading(false);
		// Reset nilai input agar file yang sama bisa diunggah ulang jika dibutuhkan
		event.target.value = "";
	};

	// Fungsi utilitas untuk mengunduh satu file JSON
	const downloadSingleFile = (file: ExcelFileItem) => {
		if (!file.convertedData) return;
		const jsonString = JSON.stringify(file.convertedData, null, 2);
		const blob = new Blob([jsonString], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = `${file.name}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	// Fungsi untuk mengunduh semua file yang berhasil dikonversi sekaligus
	const downloadAllFiles = () => {
		filesList.forEach((file) => {
			if (!file.error && file.convertedData) {
				downloadSingleFile(file);
			}
		});
	};

	// Fungsi untuk menghapus semua daftar file
	const clearAllFiles = () => {
		setFilesList([]);
		setActiveIndex(null);
	};

	// Menghitung berapa banyak file yang sukses dikonversi
	const successCount = filesList.filter((f) => !f.error).length;
	const activeFile = activeIndex === null ? null : filesList[activeIndex];

	return (
		<div style={styles.container}>
			<div style={styles.card}>
				<h1 style={styles.title}>Batch Excel to JSON Converter</h1>
				<p style={styles.subtitle}>
					Unggah banyak file .xlsx sekaligus, lihat pratinjau, dan unduh
					hasilnya secara massal.
				</p>

				{/* Zona Input File */}
				<div style={styles.uploadArea}>
					<input
						type="file"
						accept=".xlsx, .xls"
						onChange={handleFileUpload}
						style={styles.fileInput}
						id="file-upload"
						multiple // Atribut krusial untuk memilih banyak file sekaligus
					/>
					<label htmlFor="file-upload" style={styles.uploadLabel}>
						{isLoading ? "Memproses File..." : "Pilih Banyak File Excel"}
					</label>

					{filesList.length > 0 && (
						<button onClick={clearAllFiles} style={styles.clearButton}>
							Bersihkan Semua
						</button>
					)}
				</div>

				{/* Kontrol Aksi Massal */}
				{successCount > 0 && (
					<div style={styles.batchActionContainer}>
						<span>
							Berhasil mengonversi <strong>{successCount}</strong> file.
						</span>
						<button onClick={downloadAllFiles} style={styles.downloadAllButton}>
							Unduh Semua JSON ({successCount})
						</button>
					</div>
				)}

				{/* Layout Utama Dashboard */}
				{filesList.length > 0 && (
					<div style={styles.dashboard}>
						{/* Panel Kiri: Daftar File */}
						<div style={styles.sidebar}>
							<h3 style={styles.sectionTitle}>
								Daftar File ({filesList.length})
							</h3>
							<div style={styles.fileListContainer}>
								{filesList.map((file, index) => (
									<div
										key={file.id}
										onClick={() => !file.error && setActiveIndex(index)}
										style={{
											...styles.fileItem,
											...(activeIndex === index ? styles.activeFileItem : {}),
											...(file.error ? styles.errorFileItem : {}),
										}}>
										<div style={styles.fileInfo}>
											<span style={styles.fileName} title={file.name}>
												{file.name}
											</span>
											{file.error ? (
												<span style={styles.errorTag}>{file.error}</span>
											) : (
												<span style={styles.successTag}>Ready</span>
											)}
										</div>
										{!file.error && (
											<button
												onClick={(e: MouseEvent<HTMLButtonElement>) => {
													e.stopPropagation(); // Mencegah terpicunya klik pada parent div
													downloadSingleFile(file);
												}}
												style={styles.miniDownloadBtn}
												title="Unduh file ini saja">
												⬇️
											</button>
										)}
									</div>
								))}
							</div>
						</div>

						{/* Panel Kanan: Tempat Pratinjau Objek Aktif */}
						<div style={styles.previewPanel}>
							{activeFile && !activeFile.error ? (
								<>
									<div style={styles.previewHeader}>
										<span style={{ fontWeight: "600", color: "#374151" }}>
											Pratinjau: {activeFile.name}.json
										</span>
										<button
											onClick={() => downloadSingleFile(activeFile)}
											style={styles.downloadButton}>
											Unduh File Ini
										</button>
									</div>
									<pre style={styles.preCode}>
										{JSON.stringify(activeFile.convertedData, null, 2)}
									</pre>
								</>
							) : (
								<div style={styles.emptyPreview}>
									<p>
										Silakan pilih file yang sukses dikonversi di panel kiri
										untuk melihat isi strukturnya.
									</p>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

// Desain Layout UI Dashboard Interaktif
const styles: StyleMap = {
	container: {
		minHeight: "100vh",
		backgroundColor: "#f3f4f6",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		padding: "24px",
		fontFamily: "system-ui, -apple-system, sans-serif",
	},
	card: {
		backgroundColor: "#ffffff",
		padding: "30px",
		borderRadius: "16px",
		boxShadow:
			"0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
		width: "100%",
		maxWidth: "1100px",
	},
	title: {
		margin: "0 0 8px 0",
		color: "#111827",
		textAlign: "center",
		fontSize: "28px",
		fontWeight: "700",
	},
	subtitle: {
		margin: "0 0 32px 0",
		color: "#4b5563",
		textAlign: "center",
		fontSize: "15px",
	},
	uploadArea: {
		display: "flex",
		justifyContent: "center",
		gap: "12px",
		marginBottom: "24px",
	},
	fileInput: {
		display: "none",
	},
	uploadLabel: {
		backgroundColor: "#2563eb",
		color: "white",
		padding: "12px 24px",
		borderRadius: "8px",
		cursor: "pointer",
		fontWeight: "600",
		fontSize: "15px",
		transition: "background-color 0.2s",
	},
	clearButton: {
		backgroundColor: "#e5e7eb",
		color: "#374151",
		border: "none",
		padding: "12px 20px",
		borderRadius: "8px",
		cursor: "pointer",
		fontWeight: "500",
	},
	batchActionContainer: {
		backgroundColor: "#f0fdf4",
		border: "1px solid #bbf7d0",
		padding: "14px 20px",
		borderRadius: "8px",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "24px",
		color: "#166534",
		fontSize: "15px",
	},
	downloadAllButton: {
		backgroundColor: "#10b981",
		color: "white",
		border: "none",
		padding: "10px 18px",
		borderRadius: "6px",
		cursor: "pointer",
		fontWeight: "600",
	},
	dashboard: {
		display: "grid",
		gridTemplateColumns: "320px 1fr",
		gap: "24px",
		border: "1px solid #e5e7eb",
		borderRadius: "12px",
		overflow: "hidden",
		height: "550px",
	},
	sidebar: {
		borderRight: "1px solid #e5e7eb",
		backgroundColor: "#f9fafb",
		display: "flex",
		flexDirection: "column",
		height: "100%",
	},
	sectionTitle: {
		margin: 0,
		padding: "16px",
		fontSize: "14px",
		fontWeight: "600",
		color: "#4b5563",
		borderBottom: "1px solid #e5e7eb",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
	},
	fileListContainer: {
		padding: "12px",
		overflowY: "auto",
		flexGrow: 1,
		display: "flex",
		flexDirection: "column",
		gap: "8px",
	},
	fileItem: {
		padding: "12px",
		borderRadius: "8px",
		backgroundColor: "white",
		border: "1px solid #e5e7eb",
		cursor: "pointer",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		transition: "all 0.2s",
	},
	activeFileItem: {
		borderColor: "#2563eb",
		backgroundColor: "#eff6ff",
	},
	errorFileItem: {
		backgroundColor: "#fef2f2",
		borderColor: "#fca5a5",
		cursor: "not-allowed",
	},
	fileInfo: {
		display: "flex",
		flexDirection: "column",
		gap: "4px",
		overflow: "hidden",
		flexGrow: 1,
		paddingRight: "8px",
	},
	fileName: {
		fontSize: "14px",
		fontWeight: "500",
		color: "#111827",
		whiteSpace: "nowrap",
		overflow: "hidden",
		textOverflow: "ellipsis",
	},
	successTag: {
		fontSize: "11px",
		color: "#15803d",
		fontWeight: "600",
	},
	errorTag: {
		fontSize: "11px",
		color: "#b91c1c",
		fontWeight: "500",
	},
	miniDownloadBtn: {
		background: "none",
		border: "none",
		cursor: "pointer",
		fontSize: "16px",
		padding: "4px",
	},
	previewPanel: {
		display: "flex",
		flexDirection: "column",
		height: "100%",
		backgroundColor: "#ffffff",
	},
	previewHeader: {
		padding: "16px",
		borderBottom: "1px solid #e5e7eb",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#fff",
	},
	downloadButton: {
		backgroundColor: "#4b5563",
		color: "white",
		border: "none",
		padding: "8px 14px",
		borderRadius: "6px",
		cursor: "pointer",
		fontWeight: "500",
		fontSize: "13px",
	},
	preCode: {
		margin: 0,
		padding: "20px",
		backgroundColor: "#1f2937",
		color: "#f3f4f6",
		flexGrow: 1,
		overflowY: "auto",
		fontFamily:
			"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
		fontSize: "13px",
		lineHeight: "1.5",
	},
	emptyPreview: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: "100%",
		color: "#9ca3af",
		padding: "40px",
		textAlign: "center",
		fontSize: "15px",
	},
};

export default App;
