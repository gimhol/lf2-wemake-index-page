export async function read_blob_as_array_buffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsArrayBuffer(blob);
    fr.onload = () => {
      const { result } = fr;
      if (typeof result === 'string') reject(new Error('result got string'));
      else if (result == null) reject(new Error(`result got null`));
      else resolve(result);
    };
    fr.onerror = () => reject(fr.error);
    fr.onabort = () => reject(fr.error);
  });
}
