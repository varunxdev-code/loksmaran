export async function uploadImage(file: File): Promise<string> {
  // Prototype "cloud" slot — swap for S3/R2 without touching UI.
  return URL.createObjectURL(file);
}

export async function uploadAudio(blob: Blob): Promise<string> {
  return URL.createObjectURL(blob);
}
