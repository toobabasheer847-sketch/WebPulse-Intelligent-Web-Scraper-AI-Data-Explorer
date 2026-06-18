import { useEffect, useState, useRef } from 'react';
import { Send, Trash2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjectStore } from '@/stores/projectStore';
import { projectsApi, streamChat } from '@/lib/api';

const CustomChatRenderer = ({ content }) => {
  if (!content || typeof content !== 'string') return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-sm text-zinc-300 leading-relaxed">
      {lines.map((line, index) => {
        // 1. Detect and render markdown images: ![Image](url)
        const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
        let match;
        if ((match = imgRegex.exec(line)) !== null) {
          const alt = match[1];
          let src = match[2];
          
          // Auto-correct books.toscrape.com paths dynamically
          if (src.includes('books.toscrape.com') && !src.includes('/media/')) {
            src = src.replace('books.toscrape.com/cache/', 'books.toscrape.com/media/cache/');
          }
          return (
            <div key={index} className="my-2 block">
              <img
                src={src}
                alt={alt || "Book Cover"}
                className="max-h-32 w-auto rounded-lg shadow-md border border-zinc-800 my-2"
              />
            </div>
          );
        }

        // 2. Detect and render bold text: **text**
        const boldRegex = /\*\*(.*?)\*\*/g;
        if (boldRegex.test(line)) {
          const parts = line.split(/\*\*/g);
          return (
            <p key={index}>
              {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-white">{part}</strong> : part)}
            </p>
          );
        }

        // 3. Detect and render bullet points: - item
        if (line.trim().startsWith('- ')) {
          return (
            <li key={index} className="list-disc list-inside ml-2 my-1 text-zinc-350">
              {line.trim().substring(2)}
            </li>
          );
        }

        // Default plain text paragraph
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
};

export default function AIChat() {
  const { projects, fetchProjects } = useProjectStore();
  const [selectedProject, setSelectedProject] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProject) {
      projectsApi.chatHistory(selectedProject).then(({ data }) => {
        setMessages(data.history.map((h) => ({ role: h.role, content: h.message })));
      });
    }
  }, [selectedProject]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedProject || streaming) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setStreaming(true);

    let assistantContent = '';
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    await streamChat(
      selectedProject,
      userMessage,
      (chunk) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
          return updated;
        });
      },
      () => setStreaming(false),
      (err) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: `Error: ${err}` };
          return updated;
        });
        setStreaming(false);
      }
    );
  };

  const handleClear = async () => {
    if (!selectedProject) return;
    await projectsApi.clearChat(selectedProject);
    setMessages([]);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <div className="flex items-center gap-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedProject && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4 mr-1" /> Clear History
          </Button>
        )}
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!selectedProject ? (
              <p className="text-center text-muted-foreground py-16">Select a project to start chatting about scraped data</p>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-16 space-y-2">
                <Bot className="h-12 w-12 mx-auto opacity-50" />
                <p>Ask questions about your scraped data</p>
                <p className="text-xs">Try: "What changed since last week?" or "Summarize the main content"</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && <Bot className="h-6 w-6 text-primary shrink-0 mt-1" />}
                  <div className={`rounded-lg px-4 py-2 max-w-[80%] text-sm ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {msg.role === 'user' ? (
                      <div className="text-zinc-300 text-sm whitespace-pre-wrap">
                        {msg.content || ""}
                      </div>
                    ) : (
                      <CustomChatRenderer content={msg.content || ""} />
                    )}
                  </div>
                  {msg.role === 'user' && <User className="h-6 w-6 text-muted-foreground shrink-0 mt-1" />}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedProject ? 'Ask about your scraped data...' : 'Select a project first'}
              disabled={!selectedProject || streaming}
            />
            <Button type="submit" disabled={!selectedProject || streaming || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
