import { useState } from 'react';
import { FileCode, Copy, Download, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner@2.0.3';

export function XmlFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState('');

  const formatXml = (xml: string, indentSize: number): string => {
    const PADDING = ' '.repeat(indentSize);
    const reg = /(>)(<)(\/*)/g;
    let formatted = '';
    let pad = 0;

    xml = xml.replace(reg, '$1\n$2$3');
    
    xml.split('\n').forEach((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/) && pad > 0) {
        pad -= 1;
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }

      formatted += PADDING.repeat(pad) + node + '\n';
      pad += indent;
    });

    return formatted.trim();
  };

  const minifyXml = (xml: string): string => {
    return xml
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const validateXml = (xml: string): boolean => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const parseError = xmlDoc.querySelector('parsererror');
    return !parseError;
  };

  const handleFormat = () => {
    setError('');
    if (!input.trim()) {
      toast.error('请输入 XML 内容');
      return;
    }

    try {
      if (!validateXml(input)) {
        throw new Error('XML 格式错误');
      }
      const formatted = formatXml(input, indent);
      setOutput(formatted);
      toast.success('格式化成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      toast.error('XML 格式错误');
    }
  };

  const handleMinify = () => {
    setError('');
    if (!input.trim()) {
      toast.error('请输入 XML 内容');
      return;
    }

    try {
      if (!validateXml(input)) {
        throw new Error('XML 格式错误');
      }
      const minified = minifyXml(input);
      setOutput(minified);
      toast.success('压缩成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      toast.error('XML 格式错误');
    }
  };

  const handleCopy = () => {
    if (!output) {
      toast.error('没有可复制的内容');
      return;
    }
    navigator.clipboard.writeText(output);
    toast.success('已复制到剪贴板');
  };

  const handleDownload = () => {
    if (!output) {
      toast.error('没有可下载的内容');
      return;
    }
    const blob = new Blob([output], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.xml';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('下载成功');
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const handleValidate = () => {
    setError('');
    if (!input.trim()) {
      toast.error('请输入 XML 内容');
      return;
    }

    try {
      if (validateXml(input)) {
        toast.success('XML 格式正确');
        setError('');
      } else {
        throw new Error('XML 格式不正确');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      toast.error('XML 格式错误');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-slate-900 mb-1">XML 格式化工具</h2>
          <p className="text-slate-600">格式化、压缩和验证 XML 数据</p>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="indent">缩进空格:</Label>
            <select
              id="indent"
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-200 rounded-md"
            >
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="8">8</option>
            </select>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button onClick={handleValidate} variant="outline">
              <FileCode className="w-4 h-4 mr-2" />
              验证
            </Button>
            <Button onClick={handleFormat}>
              <Maximize2 className="w-4 h-4 mr-2" />
              格式化
            </Button>
            <Button onClick={handleMinify} variant="outline">
              <Minimize2 className="w-4 h-4 mr-2" />
              压缩
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <p>错误: {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>输入 XML</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='<?xml version="1.0"?><root><item>示例</item></root>'
                className="min-h-[500px] font-mono"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>输出结果</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!output}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!output}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={output}
                readOnly
                placeholder="格式化后的 XML 将显示在这里..."
                className="min-h-[500px] font-mono bg-slate-50"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={handleClear}>
            清空
          </Button>
        </div>
      </div>
    </div>
  );
}
