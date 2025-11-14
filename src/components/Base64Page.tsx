import { useState } from 'react';
import { Upload, Download, Copy, RotateCw } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner@2.0.3';

export function Base64Page() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const handleEncode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
      toast.success('编码成功');
    } catch (error) {
      toast.error('编码失败，请检查输入内容');
      console.error(error);
    }
  };

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(input)));
      setOutput(decoded);
      toast.success('解码成功');
    } catch (error) {
      toast.error('解码失败，请检查 Base64 格式');
      console.error(error);
    }
  };

  const handleProcess = () => {
    if (!input.trim()) {
      toast.error('请输入内容');
      return;
    }
    if (mode === 'encode') {
      handleEncode();
    } else {
      handleDecode();
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

  const handleSwap = () => {
    setInput(output);
    setOutput(input);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-slate-900 mb-1">Base64 加解密</h2>
          <p className="text-slate-600">Base64 编码和解码工具</p>
        </div>

        <div className="mb-4 flex gap-2">
          <Button
            variant={mode === 'encode' ? 'default' : 'outline'}
            onClick={() => setMode('encode')}
          >
            <Upload className="w-4 h-4 mr-2" />
            编码
          </Button>
          <Button
            variant={mode === 'decode' ? 'default' : 'outline'}
            onClick={() => setMode('decode')}
          >
            <Download className="w-4 h-4 mr-2" />
            解码
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {mode === 'encode' ? '原始文本' : 'Base64 编码'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'encode'
                    ? '输入要编码的文本...'
                    : '输入要解码的 Base64 字符串...'
                }
                className="min-h-[400px] font-mono"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {mode === 'encode' ? 'Base64 编码' : '解码结果'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!output}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={output}
                readOnly
                placeholder="结果将显示在这里..."
                className="min-h-[400px] font-mono bg-slate-50"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleProcess} className="flex-1">
            {mode === 'encode' ? '编码' : '解码'}
          </Button>
          <Button variant="outline" onClick={handleSwap}>
            <RotateCw className="w-4 h-4 mr-2" />
            交换
          </Button>
          <Button variant="outline" onClick={handleClear}>
            清空
          </Button>
        </div>
      </div>
    </div>
  );
}
