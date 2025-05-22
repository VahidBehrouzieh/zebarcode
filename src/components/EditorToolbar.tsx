import { useRef } from 'react';

type EditorToolbarProps = {
  getContent: () => string;
  setContent: (value: string) => void;
  filename?: string;
};

const EditorToolbar = ({ getContent, setContent, filename = 'output.txt' }: EditorToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getContent());
      alert('Copied to clipboard!');
    } catch (err) {
      alert('Copy failed');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContent(text);
    } catch (err) {
      alert('Paste failed');
    }
  };

  const handleSave = () => {
    const blob = new Blob([getContent()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2 mb-2">
      <button onClick={handleCopy} className="btn btn-sm bg-blue-500 text-white">Copy</button>
      <button onClick={handlePaste} className="btn btn-sm bg-yellow-500 text-white">Paste</button>
      <button onClick={handleSave} className="btn btn-sm bg-green-600 text-white">Save</button>
    </div>
  );
};

export default EditorToolbar;
