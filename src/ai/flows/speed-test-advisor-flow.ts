
'use server';
/**
 * @fileOverview An AI agent that provides advice based on internet speed test results.
 *
 * - diagnoseInternetSpeed - A function that handles generating advice for internet speed.
 * - SpeedTestAdvisorInput - The input type for the diagnoseInternetSpeed function.
 * - SpeedTestAdvisorOutput - The return type for the diagnoseInternetSpeed function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const SpeedTestAdvisorInputSchema = z.object({
  downloadSpeedMbps: z.number().describe('Download speed in Mbps.'),
  uploadSpeedMbps: z.number().describe('Upload speed in Mbps.'),
  pingMilliseconds: z.number().describe('Ping time in milliseconds.'),
});
export type SpeedTestAdvisorInput = z.infer<typeof SpeedTestAdvisorInputSchema>;

const SpeedTestAdvisorOutputSchema = z.object({
  advice: z
    .string()
    .describe(
      'Actionable advice for the user based on their internet speed test results. Provide a few bullet points if multiple issues are detected. If all speeds are good, congratulate the user.'
    ),
});
export type SpeedTestAdvisorOutput = z.infer<
  typeof SpeedTestAdvisorOutputSchema
>;

export async function diagnoseInternetSpeed(
  input: SpeedTestAdvisorInput
): Promise<SpeedTestAdvisorOutput> {
  return speedTestAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'speedTestAdvisorPrompt',
  input: { schema: SpeedTestAdvisorInputSchema },
  output: { schema: SpeedTestAdvisorOutputSchema },
  prompt: `You are an expert internet connectivity advisor.
Analyze the following internet speed test results and provide concise, actionable advice to the user.

Download Speed: {{{downloadSpeedMbps}}} Mbps
Upload Speed: {{{uploadSpeedMbps}}} Mbps
Ping: {{{pingMilliseconds}}} ms

Consider these general guidelines:
- Ping:
  - Excellent: < 20ms
  - Good: 20-50ms
  - Fair: 50-100ms
  - Poor: > 100ms (If ping is high, suggest checking router proximity, using Ethernet, or looking for network congestion or too many devices connected).
- Download Speed (for general browsing, streaming HD):
  - Good: > 25 Mbps
  - Fair: 10-25 Mbps
  - Poor: < 10 Mbps (If low, suggest restarting modem/router, checking ISP plan, or other devices using bandwidth).
- Upload Speed (for video calls, uploading files):
  - Good: > 5 Mbps
  - Fair: 2-5 Mbps
  - Poor: < 2 Mbps (If low, similar advice to low download speed).

If multiple issues exist, provide advice for each.
If all metrics are good or excellent, congratulate the user on their great internet speed.
Keep the advice friendly and easy to understand. Format the advice as a short paragraph or a few bullet points.
Example for good speed: "Your internet speeds look great! Enjoy smooth browsing and streaming."
Example for high ping: "- Your ping is a bit high. Try moving closer to your Wi-Fi router or using an Ethernet cable if possible."
Example for low download: "- Your download speed is on the lower side. You might want to restart your modem and router, or check if other devices are heavily using the internet."
`,
});

const speedTestAdvisorFlow = ai.defineFlow(
  {
    name: 'speedTestAdvisorFlow',
    inputSchema: SpeedTestAdvisorInputSchema,
    outputSchema: SpeedTestAdvisorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate advice.');
    }
    return output;
  }
);
