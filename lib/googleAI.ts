export async function generateTextFromGoogle(prompt: string) {
  const key = process.env.GOOGLE_API_KEY;

  if (!key) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error(await response.text());
      return null;
    }

    const data = await response.json();

    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}

export default generateTextFromGoogle;
