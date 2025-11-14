import { useState, useRef } from 'react';
import { Plus, Search, ExternalLink, FolderOpen, Trash2, Edit2, X, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';

interface Tool {
  id: string;
  name: string;
  type: 'local' | 'url';
  path: string;
  description?: string;
  icon?: string;
  bgColor?: string;
  iconImage?: string; // 图片URL或base64
}

export function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([
    {
      id: '1',
      name: '喵盒',
      type: 'url',
      path: 'https://example.com',
      icon: '🎨',
      bgColor: 'bg-gradient-to-br from-green-400 to-cyan-500',
    },
    {
      id: '2',
      name: 'SparkDesk',
      type: 'url',
      path: 'https://example.com',
      icon: '🔥',
      bgColor: 'bg-gradient-to-br from-orange-400 to-red-500',
    },
    {
      id: '3',
      name: '秘塔AI搜索',
      type: 'url',
      path: 'https://example.com',
      icon: '🔍',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700',
    },
    {
      id: '4',
      name: 'Poe',
      type: 'url',
      path: 'https://example.com',
      icon: '💬',
      bgColor: 'bg-gradient-to-br from-purple-400 to-pink-500',
    },
    {
      id: '5',
      name: 'Perplexity',
      type: 'local',
      path: 'C:\\Program Files\\Example\\app.exe',
      icon: '🌐',
      bgColor: 'bg-gradient-to-br from-slate-700 to-slate-900',
    },
    {
      id: '6',
      name: 'DEVV_',
      type: 'url',
      path: 'https://example.com',
      icon: '📦',
      bgColor: 'bg-slate-900',
    },
    {
      id: '7',
      name: '天工AI',
      type: 'url',
      path: 'https://example.com',
      icon: '🎯',
      bgColor: 'bg-gradient-to-br from-blue-300 to-blue-500',
    },
    {
      id: '8',
      name: 'HuggingChat',
      type: 'url',
      path: 'https://example.com',
      icon: '🤗',
      bgColor: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
    },
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [iconTab, setIconTab] = useState<'emoji' | 'upload' | 'url'>('emoji');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'local' as 'local' | 'url',
    path: '',
    description: '',
    icon: '',
    bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
    iconImage: '',
    imageUrl: '',
  });

  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 处理文件拖拽到整个页面
  const handlePageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handlePageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handlePageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      
      // 提取文件信息
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // 移除扩展名
      const filePath = file.path || file.name; // 在Electron中file.path会包含完整路径

      // 读取图标（如果是图片文件，直接使用；否则尝试提取图标）
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData({
            ...formData,
            name: fileName,
            type: 'local',
            path: filePath,
            iconImage: event.target?.result as string,
          });
          setEditingTool(null);
          setIsDialogOpen(true);
        };
        reader.readAsDataURL(file);
      } else {
        // 对于非图片文件（如.exe），在浏览器中无法提取ICO
        // 在Electron环境中，这里可以调用Node.js API来提取
        setFormData({
          ...formData,
          name: fileName,
          type: 'local',
          path: filePath,
          iconImage: '',
        });
        setEditingTool(null);
        setIsDialogOpen(true);
        toast.info('已添加文件，请设置图标');
      }
    }
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          iconImage: event.target?.result as string,
        });
        toast.success('图片上传成功');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTool = () => {
    if (!formData.name || !formData.path) {
      toast.error('请填写工具名称和路径');
      return;
    }

    if (editingTool) {
      setTools(
        tools.map((tool) =>
          tool.id === editingTool.id
            ? { 
                ...tool, 
                name: formData.name,
                type: formData.type,
                path: formData.path,
                description: formData.description,
                icon: formData.icon,
                bgColor: formData.bgColor,
                iconImage: formData.iconImage,
              }
            : tool
        )
      );
      setEditingTool(null);
      toast.success('工具已更新');
    } else {
      const newTool: Tool = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        path: formData.path,
        description: formData.description,
        icon: formData.icon,
        bgColor: formData.bgColor,
        iconImage: formData.iconImage,
      };
      setTools([...tools, newTool]);
      toast.success('工具已添加');
    }

    setFormData({ 
      name: '', 
      type: 'local', 
      path: '', 
      description: '', 
      icon: '',
      bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
      iconImage: '',
      imageUrl: '',
    });
    setIsDialogOpen(false);
  };

  const handleEditTool = (tool: Tool, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      type: tool.type,
      path: tool.path,
      description: tool.description || '',
      icon: tool.icon || '',
      bgColor: tool.bgColor || 'bg-gradient-to-br from-blue-400 to-blue-600',
      iconImage: tool.iconImage || '',
      imageUrl: '',
    });
    
    // 根据图标类型设置默认tab
    if (tool.iconImage) {
      setIconTab(tool.iconImage.startsWith('http') ? 'url' : 'upload');
    } else {
      setIconTab('emoji');
    }
    
    setIsDialogOpen(true);
  };

  const handleDeleteTool = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTools(tools.filter((tool) => tool.id !== id));
    toast.success('工具已删除');
  };

  const handleOpenTool = (tool: Tool) => {
    if (tool.type === 'url') {
      window.open(tool.path, '_blank');
    } else {
      console.log('打开本地程序:', tool.path);
      // 在Electron环境中，这里会调用IPC通信打开本地程序
      alert(`在 Electron 环境中将打开: ${tool.path}`);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTool(null);
    setFormData({ 
      name: '', 
      type: 'local', 
      path: '', 
      description: '', 
      icon: '',
      bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
      iconImage: '',
      imageUrl: '',
    });
    setIconTab('emoji');
  };

  const handleImageUrlApply = () => {
    if (formData.imageUrl) {
      setFormData({
        ...formData,
        iconImage: formData.imageUrl,
      });
      toast.success('图片链接已应用');
    }
  };

  const bgColorOptions = [
    'bg-gradient-to-br from-blue-400 to-blue-600',
    'bg-gradient-to-br from-purple-400 to-pink-500',
    'bg-gradient-to-br from-green-400 to-cyan-500',
    'bg-gradient-to-br from-orange-400 to-red-500',
    'bg-gradient-to-br from-yellow-300 to-yellow-500',
    'bg-gradient-to-br from-red-400 to-pink-500',
    'bg-gradient-to-br from-indigo-400 to-purple-500',
    'bg-slate-900',
  ];

  return (
    <div 
      className="h-full bg-white relative"
      onDragOver={handlePageDragOver}
      onDragLeave={handlePageDragLeave}
      onDrop={handlePageDrop}
    >
      {/* 拖拽覆盖层 */}
      {dragOver && (
        <div className="absolute inset-0 bg-blue-50 bg-opacity-90 border-4 border-dashed border-blue-400 z-50 flex items-center justify-center">
          <div className="text-center">
            <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <p className="text-blue-700">拖放文件到这里添加工具</p>
            <p className="text-blue-500 text-sm mt-2">支持拖放 .exe 文件或图片</p>
          </div>
        </div>
      )}

      {/* 搜索栏 */}
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索"
            className="pl-10 bg-slate-50 border-slate-200"
          />
        </div>
      </div>

      {/* 工具网格 */}
      <div className="p-6">
        <div className="grid grid-cols-8 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="relative group"
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
            >
              <button
                onClick={() => handleOpenTool(tool)}
                className="w-full flex flex-col items-center gap-2 transition-transform hover:scale-105"
              >
                {/* 图标显示：优先显示图片，否则显示emoji+背景色 */}
                {tool.iconImage ? (
                  <div className="w-16 h-16 rounded-2xl shadow-md overflow-hidden bg-white">
                    <img 
                      src={tool.iconImage} 
                      alt={tool.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-2xl ${tool.bgColor} flex items-center justify-center text-white shadow-md`}>
                    <span className="text-2xl">{tool.icon || '📱'}</span>
                  </div>
                )}
                <span className="text-slate-700 text-sm text-center w-full truncate px-1">
                  {tool.name}
                </span>
              </button>
              
              {/* 悬浮时显示编辑和删除按钮 */}
              {hoveredTool === tool.id && (
                <div className="absolute top-0 right-0 flex gap-1">
                  <button
                    onClick={(e) => handleEditTool(tool, e)}
                    className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-100"
                  >
                    <Edit2 className="w-3 h-3 text-slate-600" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteTool(tool.id, e)}
                    className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50"
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* 添加工具按钮 */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                onClick={() => {
                  setEditingTool(null);
                  setIconTab('emoji');
                }}
                className="flex flex-col items-center gap-2 transition-transform hover:scale-105"
              >
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-slate-500 text-sm">自定义</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTool ? '编辑工具' : '添加工具'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">工具名称</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="输入工具名称"
                  />
                </div>

                {/* 图标设置 - 使用Tabs */}
                <div className="space-y-2">
                  <Label>图标设置</Label>
                  <Tabs value={iconTab} onValueChange={(v) => setIconTab(v as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="emoji">Emoji</TabsTrigger>
                      <TabsTrigger value="upload">上传</TabsTrigger>
                      <TabsTrigger value="url">链接</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="emoji" className="space-y-3">
                      <Input
                        value={formData.icon}
                        onChange={(e) =>
                          setFormData({ ...formData, icon: e.target.value, iconImage: '' })
                        }
                        placeholder="例如: 🚀"
                      />
                      <div>
                        <Label className="text-sm text-slate-600 mb-2 block">背景颜色</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {bgColorOptions.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setFormData({ ...formData, bgColor: color })}
                              className={`w-full h-10 rounded-lg ${color} ${
                                formData.bgColor === color
                                  ? 'ring-2 ring-blue-500 ring-offset-2'
                                  : ''
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="upload" className="space-y-3">
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          选择图片
                        </Button>
                      </div>
                      {formData.iconImage && !formData.iconImage.startsWith('http') && (
                        <div className="mt-2">
                          <img 
                            src={formData.iconImage} 
                            alt="预览" 
                            className="w-16 h-16 rounded-lg object-cover mx-auto border"
                          />
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="url" className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={formData.imageUrl}
                          onChange={(e) =>
                            setFormData({ ...formData, imageUrl: e.target.value })
                          }
                          placeholder="https://example.com/icon.png"
                        />
                        <Button
                          type="button"
                          onClick={handleImageUrlApply}
                          variant="outline"
                        >
                          应用
                        </Button>
                      </div>
                      {formData.iconImage && formData.iconImage.startsWith('http') && (
                        <div className="mt-2">
                          <img 
                            src={formData.iconImage} 
                            alt="预览" 
                            className="w-16 h-16 rounded-lg object-cover mx-auto border"
                            onError={(e) => {
                              toast.error('图片加载失败');
                            }}
                          />
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">类型</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'local' | 'url',
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                  >
                    <option value="local">本地程序</option>
                    <option value="url">URL链接</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="path">
                    {formData.type === 'local' ? '程序路径' : 'URL地址'}
                  </Label>
                  <Input
                    id="path"
                    value={formData.path}
                    onChange={(e) =>
                      setFormData({ ...formData, path: e.target.value })
                    }
                    placeholder={
                      formData.type === 'local'
                        ? 'C:\\Program Files\\...'
                        : 'https://...'
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">描述（可选）</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="工具描述"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={handleDialogClose}>
                    取消
                  </Button>
                  <Button onClick={handleAddTool}>
                    {editingTool ? '保存' : '添加'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
