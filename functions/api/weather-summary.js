export async function onRequestPost(context) {
  try {
    const weather = await context.request.json();

    const prompt = `
You are a professional weather forecaster.

Summarize the following weather data in natural language.

Rules:
- Use no more than 2 sentences.
- Be concise and conversational.
- Mention temperature and important weather conditions.
- Mention weather conditions only when relevant.
- Only provide summary, dont include any info/metadata about the summary.
- Do not invent weather information.
- Do not repeat raw weather codes.

Weather data:
${JSON.stringify(weather)}

Weather summary:
`;

    const result = await context.env.AI.run(
      "@cf/meta/llama-3.2-1b-instruct",
      {
        prompt,
        max_tokens: 100,
        temperature: 0.3,
      },
    );

    return Response.json({
      summary: result.response,
    });
  } catch (error) {
    console.error("Weather summary: Error generating summary", error);
    return Response.json(
      { error: "Unable to generate weather summary" },
      { status: 500 },
    );
  }
}
