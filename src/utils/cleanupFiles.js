import fs from "fs/promises";

export const cleanupTempFiles = async (files) => {
    if (!files) return;

    const allFiles = Object.values(files).flat();

    await Promise.all(
        allFiles.map(async (file) => {
            if (file?.path) {
                try {
                    await fs.unlink(file.path);
                } catch (err) {
                    // ignore delete error
                }
            }
        })
    );
};
