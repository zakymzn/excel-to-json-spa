interface BatchDownloadBannerProps {
	isZipping: boolean;
	successCount: number;
	onDownloadAll: () => void;
}

export const BatchDownloadBanner = ({
	isZipping,
	successCount,
	onDownloadAll,
}: BatchDownloadBannerProps) => {
	if (successCount === 0) return null;

	return (
		<div className="batch-banner">
			<span>
				Berhasil mengonversi <strong>{successCount}</strong> file.
			</span>
			<button
				type="button"
				onClick={onDownloadAll}
				className="button button-success"
				disabled={isZipping}
			>
				{isZipping ? "Mengompres..." : `Unduh Semua ZIP (${successCount})`}
			</button>
		</div>
	);
};
