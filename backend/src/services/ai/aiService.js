import OpenAI from 'openai';
import config from '../../config/index.js';
import * as scrapeRepo from '../../repositories/project/scrapeRepository.js';
import * as chatRepo from '../../repositories/chat/chatRepository.js';
import { badRequest } from '../../utils/errors.js';

let openai = null;

function getClient() {
  if (!config.openai.apiKey) {
    throw badRequest('OpenAI API key not configured. Set OPENAI_API_KEY in environment.');
  }
  if (!openai) {
    openai = new OpenAI({ apiKey: config.openai.apiKey });
  }
  return openai;
}

export async function generateEmbedding(text) {
  const client = getClient();
  const input = text.slice(0, 8000);
  const response = await client.embeddings.create({
    model: config.openai.embeddingModel,
    input,
  });
  return response.data[0].embedding;
}

export function extractTextForEmbedding(contentJson) {
  const parts = [];
  if (contentJson.metadata?.title) parts.push(contentJson.metadata.title);
  if (contentJson.metadata?.description) parts.push(contentJson.metadata.description);
  (contentJson.text || []).slice(0, 50).forEach((t) => parts.push(t.content));
  (contentJson.items || []).slice(0, 20).forEach((item) => {
    if (typeof item === 'object') {
      parts.push(Object.values(item).filter(Boolean).join(' - '));
    } else {
      parts.push(String(item));
    }
  });
  (contentJson.custom && Object.values(contentJson.custom).flat().slice(0, 20))?.forEach((v) =>
    parts.push(String(v))
  );
  return parts.join('\n').slice(0, 8000);
}

export async function chatWithProject({ projectId, userId, message, onChunk }) {
  const client = getClient();

  await chatRepo.saveMessage({ projectId, userId, role: 'user', message });

  const queryEmbedding = await generateEmbedding(message);
  const relevantDocs = await scrapeRepo.semanticSearch(projectId, queryEmbedding, 8);

  const context = relevantDocs
    .map((doc, i) => `[Document ${i + 1}]\n${JSON.stringify(doc.content_json, null, 2)}`)
    .join('\n\n');

  const history = await chatRepo.getHistory(projectId, userId, 10);
  const messages = [
    {
      role: 'system',
      content: `You are WebPulse AI, an intelligent assistant that helps users explore and analyze scraped web data.
Use the provided context from scraped data to answer questions accurately.
If the context doesn't contain enough information, say so clearly.
Be concise and helpful. When discussing changes, reference specific fields.`,
    },
    ...history.slice(-8).map((h) => ({ role: h.role, content: h.message })),
    {
      role: 'user',
      content: `Context from scraped data:\n${context || 'No scraped data available yet.'}\n\nUser question: ${message}`,
    },
  ];

  const stream = await client.chat.completions.create({
    model: config.openai.model,
    messages,
    stream: true,
    temperature: 0.3,
    max_tokens: 1500,
  });

  let fullResponse = '';
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      fullResponse += content;
      if (onChunk) onChunk(content);
    }
  }

  await chatRepo.saveMessage({ projectId, userId, role: 'assistant', message: fullResponse });
  return fullResponse;
}
