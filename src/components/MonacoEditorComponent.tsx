'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, DragEvent } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type Props = {
  language?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  options?: any;
  filenamePrefix?: string;
  readOnly?: boolean;
};

const MonacoEditorComponent = ({
  language = 'plaintext',
  value = '',
  onChange,
  options,
  filenamePrefix = 'output',
  readOnly = false,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');

  const getExtension = (lang: string) => {
    switch (lang) {
      case 'json': return 'json';
      case 'xml': return 'xml';
      case 'yaml': return 'yaml';
      case 'csv': return 'csv';
      case 'java': return 'java';
      case 'kotlin': return 'kt';
      case 'toml': return 'toml';
      default: return 'txt';
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value || '');
      alert('Copied!');
    } catch {
      alert('Copy failed');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange?.(text);
    } catch {
      alert('Paste failed');
    }
  };

  const handleSave = () => {
    const ext = getExtension(language);
    const blob = new Blob([value || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenamePrefix}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadFile(file);
  };

  const handleUrlLoad = async () => {
    if (!urlInput.trim()) {
      setError('URL cannot be empty');
      return;
    }

    try {
      const res = await fetch(urlInput);
      const text = await res.text();
      onChange?.(text);
      setShowModal(false);
      setError('');
    } catch {
      setError('Failed to fetch file from URL');
    }
  };

  const loadFile = (file: File) => {
    const ext = getExtension(language);
    if (!file.name.endsWith(`.${ext}`)) {
      setError(`Only .${ext} files are supported.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onChange?.(e.target?.result as string);
      setShowModal(false);
      setError('');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (readOnly) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      className="h-full flex flex-col border rounded overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Toolbar */}
      <div className="flex gap-2 p-2 bg-gray-900 border-b border-gray-700">
        {/* {!readOnly && (
          <>
            <button onClick={handleCopy} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Copy</button>
            <button onClick={handlePaste} className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600">Paste</button>
            <button onClick={handleSave} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Save</button>
            <button onClick={() => setShowModal(true)} className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">Open</button>
          </>
        )} */}
        
        <button onClick={handleCopy} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Copy</button>
        <button onClick={handlePaste} className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600">Paste</button>
        <button onClick={handleSave} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Save</button>
        {!readOnly && (
          <button onClick={() => setShowModal(true)} className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">Open</button>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={language}
          theme="vs-dark"
          value={value}
          onChange={onChange}
          options={{ ...options, readOnly }}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
            <h2 className="text-lg font-bold mb-4">Open File</h2>

            {error && <p className="text-red-600 mb-2">{error}</p>}

            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste file URL here"
              className="border w-full p-2 mb-3 rounded"
            />

            <button
              onClick={handleUrlLoad}
              className="w-full mb-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
            >
              Load from URL
            </button>

            <input
              type="file"
              accept={`.${getExtension(language)}`}
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="mb-3"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500 text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonacoEditorComponent;
