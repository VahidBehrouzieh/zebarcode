import { js2xml } from 'xml-js';
import * as yaml from 'js-yaml';
import { unparse } from 'papaparse';
import tomlify from 'tomlify-j0.4';

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const transformToXml = (data: any): string =>
  js2xml(data, { compact: true, spaces: 2 });

export const transformToYaml = (data: any): string =>
  yaml.dump(data);

export const transformToToml = (data: any): string =>
  tomlify.toToml(data, { space: 2 });

export const transformToCsv = (data: any): string => {
  if (Array.isArray(data)) {
    return unparse(data);
  } else if (typeof data === 'object' && data !== null) {
    return unparse([data]); // تبدیل آبجکت به آرایه حاوی یک آیتم
  } else {
    throw new Error('CSV conversion requires a valid object or array');
  }
};

// ---------------- JAVA ----------------
export const transformToJava = (jsonObj: any): string => {
  const classMap = new Map<string, string>();

  const getJavaType = (key: string, value: any): string => {
    if (value === null) return 'String';
    if (Array.isArray(value)) {
      if (value.length > 0) {
        return `List<${getJavaType(key, value[0])}>`;
      }
      return 'List<Object>';
    }
    switch (typeof value) {
      case 'string': return 'String';
      case 'number': return value % 1 === 0 ? 'int' : 'double';
      case 'boolean': return 'boolean';
      case 'object':
        const className = capitalize(key);
        generateClass(className, value);
        return className;
      default: return 'String';
    }
  };

  const generateClass = (className: string, obj: any) => {
    if (classMap.has(className)) return;

    let fields = '';
    let methods = '';

    for (const key in obj) {
      const type = getJavaType(key, obj[key]);
      fields += `  private ${type} ${key};\n`;
      methods += `
  public ${type} get${capitalize(key)}() {
    return ${key};
  }

  public void set${capitalize(key)}(${type} ${key}) {
    this.${key} = ${key};
  }
`;
    }

    const classDef = `public class ${className} {\n${fields}\n${methods}}`;
    classMap.set(className, classDef);
  };

  generateClass('Main', jsonObj);
  return Array.from(classMap.values()).reverse().join('\n\n');
};

// ---------------- KOTLIN ----------------
export const transformToKotlin = (jsonObj: any): string => {
  const classMap = new Map<string, string>();

  const getKotlinType = (key: string, value: any): string => {
    if (value === null) return 'String?';
    if (Array.isArray(value)) {
      if (value.length > 0) {
        return `List<${getKotlinType(key, value[0])}>`;
      }
      return 'List<Any>';
    }
    switch (typeof value) {
      case 'string': return 'String';
      case 'number': return value % 1 === 0 ? 'Int' : 'Double';
      case 'boolean': return 'Boolean';
      case 'object':
        const className = capitalize(key);
        generateKotlinClass(className, value);
        return className;
      default: return 'String';
    }
  };

  const generateKotlinClass = (className: string, obj: any) => {
    if (classMap.has(className)) return;

    const fields = Object.entries(obj)
      .map(([key, value]) => `  val ${key}: ${getKotlinType(key, value)}`)
      .join(',\n');

    const classDef = `data class ${className}(\n${fields}\n)`;
    classMap.set(className, classDef);
  };

  generateKotlinClass('Main', jsonObj);
  return Array.from(classMap.values()).reverse().join('\n\n');
};
