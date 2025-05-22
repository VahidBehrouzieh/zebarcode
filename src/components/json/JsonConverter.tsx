'use client';

import { useState } from 'react';
import MonacoEditorComponent from '@/components/MonacoEditorComponent';
import {
  transformToXml,
  transformToYaml,
  transformToCsv,
  transformToToml,
  transformToJava,
  transformToKotlin,
} from '@/lib/jsonTransformers';

type Language = 'xml' | 'yaml' | 'csv' | 'toml' | 'java' | 'kotlin' | 'plaintext';

const JsonConverter = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [output, setOutput] = useState('');
  const [outputLang, setOutputLang] = useState<Language>('plaintext');

  const handleJsonChange = (value: string | undefined) => {
    setJsonInput(value || '');
  };

  const parseJsonSafely = (): any | null => {
    try {
      const obj = JSON.parse(jsonInput);
      if (typeof obj === 'object' && obj !== null) return obj;
      setOutput('Invalid JSON structure');
    } catch {
      setOutput('Invalid JSON');
    }
    return null;
  };

  const convert = (fn: (data: any) => string, lang: Language) => {
    const json = parseJsonSafely();
    if (!json) return;

    try {
      const result = fn(json);
      setOutput(result);
      setOutputLang(lang);
    } catch (err: any) {
      setOutput(`Conversion failed: ${err.message}`);
      setOutputLang('plaintext');
    }
  };

  return (
    <div className='flex w-full h-96 justify-between'>
      <div className='w-5/12'>
        <MonacoEditorComponent
          language="json"
          value={jsonInput}
          onChange={handleJsonChange}
          options={{}}
          readOnly={false}
        />
      </div>

      <div className='flex flex-wrap mt-5 gap-2 w-80 justify-center h-40'>
        <button onClick={() => convert(transformToXml, 'xml')} className='w-36 h-10 cursor-pointer flex items-center justify-center px-4  transition rounded-lg hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r text-white from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>to xml</button>
        <button onClick={() => convert(transformToYaml, 'yaml')} className='w-36 h-10 cursor-pointer flex items-center justify-center px-4  transition rounded-lg hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r text-white from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>to yaml</button>
        <button onClick={() => convert(transformToCsv, 'csv')} className='w-36 h-10 cursor-pointer flex items-center justify-center px-4  transition rounded-lg hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r text-white from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>to csv</button>
        <button onClick={() => convert(transformToToml, 'toml')} className='w-36 h-10 cursor-pointer flex items-center justify-center px-4  transition rounded-lg hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r text-white from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>to toml</button>
        <button onClick={() => convert(transformToJava, 'java')} className='w-36 h-10 cursor-pointer flex items-center justify-center px-4  transition rounded-lg hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r text-white from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>to java</button>
        <button onClick={() => convert(transformToKotlin, 'kotlin')} className='w-36 h-10 cursor-pointer flex items-center justify-center px-4  transition rounded-lg hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r text-white from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>to kotlin</button>
      </div>

      <div className='w-5/12'>
        <MonacoEditorComponent
          language={outputLang}
          value={output}
          onChange={() => {}}
          readOnly={true}
          options={{ readOnly: true }}
        />
      </div>
    </div>
  );
};

export default JsonConverter;
