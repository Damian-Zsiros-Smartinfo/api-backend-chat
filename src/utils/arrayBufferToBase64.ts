export async function arrayBufferToBase64(
  arrayBuffer: ArrayBuffer
): Promise<string | undefined> {
  try {
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString("base64");
    return base64String;
  } catch (error) {
    if (error instanceof Error)
      throw new Error(
        "Error al convertir ArrayBuffer a base64: " + error.message
      );
  }
}
