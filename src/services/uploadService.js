import apiFetch from "./apiFetch";

// =========================
// UPLOAD SINGLE FILE TO S3
// =========================
export async function uploadToS3(file) {
  // 1. demander URL signée à ton backend
  const { upload_url, key } = await apiFetch("/uploads/upload-url", {
    method: "POST",
    body: {
      filename: file.name,
      content_type: file.type,
    },
  });

  // 2. upload direct vers S3
  await fetch(upload_url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  // 3. retourner uniquement la KEY (pas une URL)
  return key;
}

export async function uploadImages(files) {
  return Promise.all(files.map((file) => uploadToS3(file)));
}
