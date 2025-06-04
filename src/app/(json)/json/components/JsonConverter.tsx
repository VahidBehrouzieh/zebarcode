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

      <div className='flex flex-col mt-5 gap-2'>
        <button onClick={() => convert(transformToXml, 'xml')} className='btn'>to xml</button>
        <button onClick={() => convert(transformToYaml, 'yaml')} className='btn'>to yaml</button>
        <button onClick={() => convert(transformToCsv, 'csv')} className='btn'>to csv</button>
        <button onClick={() => convert(transformToToml, 'toml')} className='btn'>to toml</button>
        <button onClick={() => convert(transformToJava, 'java')} className='btn'>to java</button>
        <button onClick={() => convert(transformToKotlin, 'kotlin')} className='btn'>to kotlin</button>
      </div>

      <div className='w-5/12'>
        <MonacoEditorComponent
          language={outputLang}
          value={output}
          onChange={() => {}}
          
          options={{ readOnly: true }}
        />
      </div>
    </div>
  );
};

export default JsonConverter;
