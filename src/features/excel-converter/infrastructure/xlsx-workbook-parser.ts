import type { JsonWorkbook } from "../domain/converted-file";
import type { WorkbookParser } from "../application/workbook-parser";

const readFileAsArrayBuffer = (file: File) =>
	new Promise<ArrayBuffer>((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			if (!event.target?.result) {
				reject(new Error("Gagal membaca hasil file."));
				return;
			}

			resolve(event.target.result as ArrayBuffer);
		};

		reader.onerror = () => reject(new Error("Gagal membaca file."));
		reader.readAsArrayBuffer(file);
	});

export class XlsxWorkbookParser implements WorkbookParser {
	async parse(file: File): Promise<JsonWorkbook> {
		const xlsx = await import("xlsx");
		const buffer = await readFileAsArrayBuffer(file);
		const data = new Uint8Array(buffer);
		const workbook = xlsx.read(data, { type: "array" });

		return workbook.SheetNames.reduce<JsonWorkbook>((output, sheetName) => {
			const worksheet = workbook.Sheets[sheetName];
			output[sheetName] = xlsx.utils.sheet_to_json(worksheet, { defval: "" });
			return output;
		}, {});
	}
}
