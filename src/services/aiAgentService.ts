export class AiAgentService {
  /**
   * Call the configured AI agent endpoint to generate a mini-site payload.
   * Picks VITE_AI_AGENT_URL (client) or falls back to a sensible default.
   */
  static async generate(websiteUrl: string): Promise<any> {
    const env = (import.meta && (import.meta as any).env) || {};
    const agentUrl = env.VITE_AI_AGENT_URL || (window && (window as any).AI_AGENT_URL) || 'http://localhost:4001/generate';
    const apiKey = env.VITE_AI_AGENT_KEY || (window && (window as any).AI_AGENT_KEY) || null;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['x-ai-agent-key'] = apiKey;

    const res = await fetch(agentUrl, { method: 'POST', headers, body: JSON.stringify({ url: websiteUrl }) });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Agent request failed ${res.status}: ${text}`);
    }
    const json = await res.json();
    return json;
  }
}

export default AiAgentService;
