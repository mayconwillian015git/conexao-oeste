// Extract plain text from a .docx buffer using mammoth
// This runs SERVER-SIDE only (API route / server action)

export async function extractDocxText(buffer: Buffer): Promise<string> {
  // Dynamic import to ensure it runs only on the server
  const mammoth = await import('mammoth')

  const result = await mammoth.extractRawText({ buffer })

  if (result.messages.length > 0) {
    console.warn('[docx-extract] Mammoth warnings:', result.messages)
  }

  return result.value.trim()
}

export async function extractDocxHtml(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')

  const result = await mammoth.convertToHtml({ buffer })

  if (result.messages.length > 0) {
    console.warn('[docx-extract] Mammoth warnings:', result.messages)
  }

  return result.value
}
