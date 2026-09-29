import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Wand2, Scissors, Sparkles, Languages, FileText, Upload, Download, RefreshCw, Send, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadMedia } from '../lib/storage';

const TOOLS = [
  { id: 'chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'generate', label: 'Image Generator', icon: Wand2 },
  { id: 'bg-remove', label: 'Background Remover', icon: Scissors },
  { id: 'enhance', label: 'Image Enhancer', icon: Sparkles },
  { id: 'translate', label: 'AI Translator', icon: Languages },
  { id: 'ocr', label: 'Image to Text', icon: FileText },
];

export default function AIStudio() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="pb-20 md:pb-8 min-h-screen bg-black">
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          Omnix AI Studio
        </h1>
      </div>

      <div className="flex flex-col md:flex-row max-w-6xl mx-auto h-[calc(100vh-140px)]">
        {/* Navigation Sidebar / Tabs */}
        <div className="md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-zinc-800 overflow-x-auto no-scrollbar bg-zinc-950/50">
          <div className="flex md:flex-col gap-2 p-4">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap ${
                  activeTab === tool.id 
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                    : 'text-zinc-400 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <tool.icon className="w-5 h-5" />
                <span>{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-black">
          {activeTab === 'chat' && <AIChat />}
          {activeTab === 'generate' && <ImageGenerator />}
          {activeTab === 'bg-remove' && <ImageEditor type="remove_background" title="Background Remover" desc="Remove backgrounds to make them transparent." />}
          {activeTab === 'enhance' && <ImageEditor type="enhance_image" title="Image Enhancer" desc="Upscale and reduce blur to improve image quality." />}
          {activeTab === 'translate' && <AITranslator />}
          {activeTab === 'ocr' && <ImageToText />}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 1. AI Chat
// ---------------------------------------------------------
function AIChat() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: 'Hi! I am the Omnix AI Assistant. I can answer questions, explain features, or help you write captions and posts. How can I help today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: userMsg }] })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      let aiText = '';
      setMessages(prev => [...prev, { role: 'ai', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'text') {
                  aiText += data.text;
                  setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1].content = aiText;
                    return newArr;
                  });
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-200 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 text-zinc-400 p-4 rounded-2xl rounded-bl-none flex gap-2 items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75" />
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl disabled:opacity-50 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 2. Image Generator
// ---------------------------------------------------------
function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setResult(null);
    setSavedUrl(null);
    setStatus('Generating image...');

    try {
      const res = await fetch('/api/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_image', prompt })
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      
      setResult(data.result);
      
      if (data.result.startsWith('http')) {
        setSavedUrl(data.result);
        setStatus('Ready!');
      } else {
        setStatus('Saving to Supabase Storage...');
        
        // Upload Base64 to Supabase
        const response = await fetch(data.result);
        const blob = await response.blob();
        const file = new File([blob], `gen_${Date.now()}.png`, { type: blob.type || 'image/png' });
        
        const publicUrl = await uploadMedia('ai-studio', `generated/${file.name}`, file);
        setSavedUrl(publicUrl);
        setStatus('Ready!');
      }
    } catch (error: any) {
      if (error?.message && !error.message.includes("fetch")) console.warn('AIStudio notice:', error);
      setStatus('Generation failed. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = 'generated-image.png';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">AI Image Generator</h2>
        <p className="text-zinc-400">Generate stunning images from text prompts.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A futuristic cyberpunk cityscape at night..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
        />
        <button 
          onClick={handleGenerate}
          disabled={isProcessing || !prompt.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 min-w-[140px]"
        >
          {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          Generate
        </button>
      </div>

      {status && <p className="text-sm text-zinc-500">{status}</p>}

      {result && (
        <div className="mt-8 flex flex-col items-center gap-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <img src={result} alt="Generated" className="w-full max-w-lg rounded-xl shadow-lg border border-zinc-800 aspect-square object-cover" />
          <div className="flex gap-4">
            <button onClick={downloadImage} className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors">
              <Download className="w-4 h-4" /> Download
            </button>
            {savedUrl && (
              <button onClick={() => {
                navigator.clipboard.writeText(savedUrl);
                alert("URL copied to clipboard! You can now use it to post.");
              }} className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                <Copy className="w-4 h-4" /> Copy URL
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// 3 & 4. Image Editor (BG Remove / Enhancer)
// ---------------------------------------------------------
function ImageEditor({ type, title, desc }: { type: string, title: string, desc: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setSavedUrl(null);
      setStatus('');
    }
  };

  const processImage = async () => {
    if (!file) return;
    setIsProcessing(true);
    setStatus('Processing image...');
    setResult(null);
    setSavedUrl(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Full = reader.result as string;
        const base64Data = base64Full.split(',')[1];

        const res = await fetch('/api/studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: type, 
            imageBase64: base64Data, 
            mimeType: file.type 
          })
        });

        if (!res.ok) throw new Error('Processing failed');
        const data = await res.json();
        
        setResult(data.result);
        setStatus('Saving result to Supabase Storage...');
        
        // Upload Base64 to Supabase
        const response = await fetch(data.result);
        const blob = await response.blob();
        const outFile = new File([blob], `edit_${Date.now()}.png`, { type: blob.type || 'image/png' });
        
        const publicUrl = await uploadMedia('ai-studio', `edited/${outFile.name}`, outFile);
        setSavedUrl(publicUrl);
        setStatus('Completed successfully!');
      };
    } catch (err: any) {
      if (err?.message && !err.message.includes("fetch")) console.warn('AIStudio notice:', err);
      setStatus('Failed to process image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = `edited_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-zinc-400">{desc}</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden group min-h-[300px]">
        {preview && !result && (
          <img src={preview} alt="Original" className="max-h-[300px] rounded-xl object-contain opacity-50 mb-4" />
        )}
        {result && (
          <img src={result} alt="Edited" className="max-h-[300px] rounded-xl object-contain mb-4 shadow-[0_0_40px_rgba(168,85,247,0.2)]" />
        )}
        
        {!preview && (
          <>
            <Upload className="w-12 h-12 text-zinc-600 mb-4" />
            <p className="text-white font-medium mb-1">Click or drag image to upload</p>
            <p className="text-zinc-500 text-sm">PNG, JPG up to 10MB</p>
          </>
        )}
        
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
      </div>

      {status && (
        <div className={`flex items-center gap-2 text-sm font-medium ${status.includes('fail') ? 'text-red-400' : 'text-zinc-400'}`}>
          {isProcessing && <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />}
          {!isProcessing && status.includes('Completed') && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {status}
        </div>
      )}

      {file && !result && (
        <button 
          onClick={processImage}
          disabled={isProcessing}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          Apply {title}
        </button>
      )}

      {result && (
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={downloadImage} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Download className="w-5 h-5" /> Download Result
          </button>
          {savedUrl && (
            <button onClick={() => {
              navigator.clipboard.writeText(savedUrl);
              alert("URL copied to clipboard! You can now use it to post.");
            }} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Copy className="w-5 h-5" /> Copy URL
            </button>
          )}
          <button onClick={() => setPreview(null)} className="flex-1 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-colors relative">
            Upload Another
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer"/>
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// 5. AI Translator
// ---------------------------------------------------------
function AITranslator() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setResult('');
    
    try {
      const res = await fetch('/api/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'translate', prompt: text })
      });
      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      setResult(data.result);
    } catch (err: any) {
      if (err?.message && !err.message.includes("fetch")) console.warn('AIStudio notice:', err);
      setResult('Failed to translate text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">AI Translator</h2>
        <p className="text-zinc-400">Translate any text with high precision while preserving original formatting.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-zinc-400 text-sm font-medium">Source Text</label>
          <textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text here to translate..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-zinc-400 text-sm font-medium">Translated Result</label>
            {result && (
              <button onClick={handleCopy} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 font-medium transition-colors">
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
            )}
          </div>
          <div className={`w-full h-[216px] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-300 whitespace-pre-wrap ${!result && 'flex items-center justify-center italic text-zinc-600'}`}>
            {isProcessing ? (
               <div className="flex items-center justify-center h-full">
                 <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
               </div>
            ) : (
              result || 'Translation will appear here...'
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={handleTranslate}
        disabled={isProcessing || !text.trim()}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
      >
        <Languages className="w-5 h-5" /> Translate Text
      </button>
    </div>
  );
}

// ---------------------------------------------------------
// 6. Image to Text (OCR)
// ---------------------------------------------------------
function ImageToText() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult('');
    }
  };

  const processOCR = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResult('');
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Full = reader.result as string;
        const base64Data = base64Full.split(',')[1];

        const res = await fetch('/api/studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'ocr', 
            imageBase64: base64Data, 
            mimeType: file.type 
          })
        });

        if (!res.ok) throw new Error('Processing failed');
        const data = await res.json();
        setResult(data.result);
      };
    } catch (err: any) {
      if (err?.message && !err.message.includes("fetch")) console.warn('AIStudio notice:', err);
      setResult('Failed to extract text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Image to Text (OCR)</h2>
        <p className="text-zinc-400">Extract text accurately from receipts, screenshots, documents, and signs.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-4 text-center flex flex-col items-center justify-center relative overflow-hidden group min-h-[300px]">
          {preview ? (
            <img src={preview} alt="Upload preview" className="max-h-[260px] rounded-lg object-contain" />
          ) : (
            <>
              <FileText className="w-12 h-12 text-zinc-600 mb-4" />
              <p className="text-white font-medium mb-1">Upload image with text</p>
              <p className="text-zinc-500 text-sm">PNG, JPG up to 5MB</p>
            </>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-zinc-400 text-sm font-medium">Extracted Text</label>
            {result && (
              <button onClick={handleCopy} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 font-medium transition-colors">
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          <div className={`w-full h-full min-h-[260px] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-300 whitespace-pre-wrap ${!result && 'flex items-center justify-center italic text-zinc-600'}`}>
            {isProcessing ? (
               <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-500">
                 <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
                 <span>Analyzing text...</span>
               </div>
            ) : (
              result || 'Text will appear here...'
            )}
          </div>
        </div>
      </div>

      {file && !result && !isProcessing && (
        <button 
          onClick={processOCR}
          disabled={isProcessing}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <FileText className="w-5 h-5" /> Extract Text
        </button>
      )}
    </div>
  );
}
