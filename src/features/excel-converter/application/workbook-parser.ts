import type { JsonWorkbook } from "../domain/converted-file";

export interface WorkbookParser {
	parse(file: File): Promise<JsonWorkbook>;
}
