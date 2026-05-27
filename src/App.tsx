import React, { useState } from "react";
import * as xlsx from "xlsx";

function App() {
	const [fileData, setFileData] = useState(null);
	const [fileName, setFileName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	// Fungsi untuk menangani saat pengguna memilih file
	const handleFileUpload = (event: any) => {
		const file = event.target.files[0];
		if (!file) return;

		// Validasi ekstensi file
		if (
			!file.name.toLowerCase().endsWith(".xlsx") &&
			!file.name.toLowerCase().endsWith(".xls")
		) {
			setError("Harap unggah file dengan format .xlsx atau .xls");
			setFileData(null);
			return;
		}

		setError("");
		setIsLoading(true);
		setFileName(file.name.replace(/\.[^/.]+$/, "")); // Mengambil nama file tanpa ekstensi

		const reader = new FileReader();

		// Proses konversi setelah file berhasil dibaca oleh browser
		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target.result);
				const workbook = xlsx.read(data, { type: "array" });
				const outputData = {};

				// Iterasi setiap sheet dan ubah ke JSON
				workbook.SheetNames.forEach((sheetName) => {
					const worksheet = workbook.Sheets[sheetName];
					const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: "" });
					outputData[sheetName] = jsonData;
				});

				setFileData(outputData);
			} catch (err) {
				setError("Gagal memproses file Excel. Pastikan file tidak rusak.");
			} finally {
				setIsLoading(false);
			}
		};

		reader.onerror = () => {
			setError("Terjadi kesalahan saat membaca file.");
			setIsLoading(false);
		};

		// Membaca file sebagai ArrayBuffer
		reader.readAsArrayBuffer(file);
	};

	// Fungsi untuk mengunduh hasil JSON
	const handleDownload = () => {
		if (!fileData) return;

		const jsonString = JSON.stringify(fileData, null, 2);
		const blob = new Blob([jsonString], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = `${fileName}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	return (
		<div style={styles.container}>
			<div style={styles.card}>
				<h1 style={styles.title}>Konverter Excel ke JSON</h1>
				<p style={styles.subtitle}>
					Unggah file .xlsx Anda untuk melihat pratinjau dan mengunduh format
					JSON-nya.
				</p>

				{/* Input File */}
				<div style={styles.uploadArea}>
					<input
						type="file"
						accept=".xlsx, .xls"
						onChange={handleFileUpload}
						style={styles.fileInput}
						id="file-upload"
					/>
					<label htmlFor="file-upload" style={styles.uploadLabel}>
						Pilih File Excel
					</label>
				</div>

				{/* Notifikasi Error & Loading */}
				{error && <p style={styles.error}>{error}</p>}
				{isLoading && <p style={styles.loading}>Memproses file...</p>}

				{/* Area Pratinjau (Preview) */}
				{fileData && (
					<div style={styles.previewContainer}>
						<div style={styles.previewHeader}>
							<h3 style={{ margin: 0, color: "#333" }}>Pratinjau JSON</h3>
							<button onClick={handleDownload} style={styles.downloadButton}>
								Unduh JSON
							</button>
						</div>
						<pre style={styles.preCode}>
							{JSON.stringify(fileData, null, 2)}
						</pre>
					</div>
				)}
			</div>
		</div>
	);
}

// Objek gaya dasar agar tampilan langsung rapi
const styles = {
	container: {
		minHeight: "100vh",
		backgroundColor: "#f3f4f6",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		padding: "20px",
		fontFamily: "system-ui, -apple-system, sans-serif",
	},
	card: {
		backgroundColor: "#ffffff",
		padding: "30px",
		borderRadius: "12px",
		boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
		width: "100%",
		maxWidth: "800px",
	},
	title: {
		margin: "0 0 10px 0",
		color: "#1f2937",
		textAlign: "center",
	},
	subtitle: {
		margin: "0 0 24px 0",
		color: "#6b7280",
		textAlign: "center",
		fontSize: "14px",
	},
	uploadArea: {
		display: "flex",
		justifyContent: "center",
		marginBottom: "20px",
	},
	fileInput: {
		display: "none",
	},
	uploadLabel: {
		backgroundColor: "#3b82f6",
		color: "white",
		padding: "10px 20px",
		borderRadius: "8px",
		cursor: "pointer",
		fontWeight: "500",
		transition: "background-color 0.2s",
	},
	error: {
		color: "#ef4444",
		textAlign: "center",
		marginBottom: "20px",
	},
	loading: {
		color: "#3b82f6",
		textAlign: "center",
		marginBottom: "20px",
	},
	previewContainer: {
		marginTop: "20px",
		border: "1px solid #e5e7eb",
		borderRadius: "8px",
		overflow: "hidden",
	},
	previewHeader: {
		backgroundColor: "#f9fafb",
		padding: "15px",
		borderBottom: "1px solid #e5e7eb",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
	},
	downloadButton: {
		backgroundColor: "#10b981",
		color: "white",
		border: "none",
		padding: "8px 16px",
		borderRadius: "6px",
		cursor: "pointer",
		fontWeight: "bold",
	},
	preCode: {
		margin: 0,
		padding: "15px",
		backgroundColor: "#1f2937",
		color: "#d1d5db",
		maxHeight: "400px",
		overflowY: "auto",
		fontSize: "14px",
	},
};

export default App;
