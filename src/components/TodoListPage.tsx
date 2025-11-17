import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Calendar, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  createdAt: string;
}

type FilterType = 'all' | 'active' | 'completed';

const CATEGORIES = ['工作', '生活', '学习', '其他'];
const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-red-100 text-red-700 border-red-200',
};
const PRIORITY_LABELS = {
  low: '低',
  medium: '中',
  high: '高',
};

export function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set());
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  
  const [formData, setFormData] = useState({
    title: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '工作',
    dueDate: '',
  });

  // 从 localStorage 加载数据
  useEffect(() => {
    const stored = localStorage.getItem('todos');
    if (stored) {
      try {
        setTodos(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load todos:', error);
      }
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // 切换任务展开状态
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedTodos);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTodos(newExpanded);
  };

  // 检查内容是否很长
  const isLongContent = (content: string) => {
    return content.length > 100 || content.split('\n').length > 3;
  };

  // 快速添加待办
  const handleQuickAdd = () => {
    if (!newTodoTitle.trim()) {
      toast.error('请输入任务内容');
      return;
    }

    const newTodo: Todo = {
      id: Date.now().toString(),
      title: newTodoTitle.trim(),
      completed: false,
      priority: 'medium',
      category: '其他',
      createdAt: new Date().toISOString(),
    };

    setTodos([newTodo, ...todos]);
    setNewTodoTitle('');
    toast.success('任务已添加');
  };

  // 详细添加待办
  const handleDetailedAdd = () => {
    if (!formData.title.trim()) {
      toast.error('请输入任务内容');
      return;
    }

    if (editingTodo) {
      setTodos(
        todos.map((todo) =>
          todo.id === editingTodo.id
            ? {
                ...todo,
                title: formData.title,
                priority: formData.priority,
                category: formData.category,
                dueDate: formData.dueDate || undefined,
              }
            : todo
        )
      );
      toast.success('任务已更新');
    } else {
      const newTodo: Todo = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        completed: false,
        priority: formData.priority,
        category: formData.category,
        dueDate: formData.dueDate || undefined,
        createdAt: new Date().toISOString(),
      };
      setTodos([newTodo, ...todos]);
      toast.success('任务已添加');
    }

    setFormData({
      title: '',
      priority: 'medium',
      category: '工作',
      dueDate: '',
    });
    setEditingTodo(null);
    setIsAddDialogOpen(false);
    setEditorTab('write');
  };

  const handleToggleComplete = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDelete = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    setDeletingTodoId(null);
    toast.success('任务已删除');
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      priority: todo.priority,
      category: todo.category,
      dueDate: todo.dueDate || '',
    });
    setIsAddDialogOpen(true);
    setEditorTab('write');
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingTodo(null);
    setFormData({
      title: '',
      priority: 'medium',
      category: '工作',
      dueDate: '',
    });
    setEditorTab('write');
  };

  // 计算剩余天数
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // 筛选待办
  const filteredTodos = todos.filter((todo) => {
    const statusMatch =
      filter === 'all' ||
      (filter === 'active' && !todo.completed) ||
      (filter === 'completed' && todo.completed);
    
    const categoryMatch =
      selectedCategory === '全部' || todo.category === selectedCategory;

    return statusMatch && categoryMatch;
  });

  // 统计数据
  const totalTodos = todos.length;
  const activeTodos = todos.filter((t) => !t.completed).length;
  const completedTodos = todos.filter((t) => t.completed).length;
  const todayTodos = todos.filter((t) => {
    if (!t.dueDate) return false;
    const today = new Date().toDateString();
    const dueDate = new Date(t.dueDate).toDateString();
    return today === dueDate;
  }).length;

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* 头部统计 */}
        <div className="mb-6">
          <h2 className="text-slate-900 mb-4">待办事项</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-slate-500 text-sm">全部任务</div>
              <div className="text-slate-900 mt-1">{totalTodos}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-slate-500 text-sm">未完成</div>
              <div className="text-blue-600 mt-1">{activeTodos}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-slate-500 text-sm">已完成</div>
              <div className="text-green-600 mt-1">{completedTodos}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-slate-500 text-sm">今日待办</div>
              <div className="text-orange-600 mt-1">{todayTodos}</div>
            </div>
          </div>
        </div>

        {/* 快速添加 */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex gap-2">
            <Input
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
              placeholder="快速添加任务..."
              className="flex-1"
            />
            <Button onClick={handleQuickAdd}>
              <Plus className="w-4 h-4 mr-2" />
              添加
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingTodo(null);
                setIsAddDialogOpen(true);
              }}
            >
              详细
            </Button>
          </div>
        </div>

        {/* 分类和筛选 */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-sm text-slate-600 mb-2 block">分类</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === '全部' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('全部')}
                >
                  全部
                </Button>
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <Label className="text-sm text-slate-600 mb-2 block">状态</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  全部
                </Button>
                <Button
                  variant={filter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('active')}
                >
                  未完成
                </Button>
                <Button
                  variant={filter === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('completed')}
                >
                  已完成
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 待办列表 */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTodos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl p-12 text-center shadow-sm"
              >
                <div className="text-slate-400 text-sm">暂无任务</div>
              </motion.div>
            ) : (
              filteredTodos.map((todo) => {
                const daysRemaining = todo.dueDate
                  ? getDaysRemaining(todo.dueDate)
                  : null;
                const isOverdue = daysRemaining !== null && daysRemaining < 0;
                const isDueToday = daysRemaining === 0;
                const isExpanded = expandedTodos.has(todo.id);
                const shouldShowToggle = isLongContent(todo.title);

                return (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${
                      todo.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* 完成复选框 */}
                      <button
                        onClick={() => handleToggleComplete(todo.id)}
                        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          todo.completed
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {todo.completed && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </button>

                      {/* 任务内容 */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`prose prose-sm max-w-none ${
                            todo.completed ? 'line-through opacity-60' : ''
                          } ${!isExpanded && shouldShowToggle ? 'line-clamp-3' : ''}`}
                        >
                          <ReactMarkdown
                            components={{
                              // 自定义样式以适配深色模式和主题
                              h1: ({ node, ...props }) => <h1 className="text-slate-900" {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-slate-900" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-slate-900" {...props} />,
                              p: ({ node, ...props }) => <p className="text-slate-700" {...props} />,
                              code: ({ node, className, children, ...props }) => {
                                const isInline = !className;
                                return isInline ? (
                                  <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-sm" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className={`${className} bg-slate-100 text-slate-800 block p-2 rounded`} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              ul: ({ node, ...props }) => <ul className="text-slate-700 list-disc ml-4" {...props} />,
                              ol: ({ node, ...props }) => <ol className="text-slate-700 list-decimal ml-4" {...props} />,
                              a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                              blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600" {...props} />
                              ),
                            }}
                          >
                            {todo.title}
                          </ReactMarkdown>
                        </div>

                        {/* 展开/收起按钮 */}
                        {shouldShowToggle && (
                          <button
                            onClick={() => toggleExpanded(todo.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm mt-2 flex items-center gap-1"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                收起
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                展开
                              </>
                            )}
                          </button>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {/* 分类标签 */}
                          <Badge variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {todo.category}
                          </Badge>

                          {/* 优先级标签 */}
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              PRIORITY_COLORS[todo.priority]
                            }`}
                          >
                            {PRIORITY_LABELS[todo.priority]}优先级
                          </Badge>

                          {/* 截止日期 */}
                          {todo.dueDate && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                isOverdue
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : isDueToday
                                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              {isOverdue
                                ? `逾期${Math.abs(daysRemaining!)}天`
                                : isDueToday
                                ? '今天截止'
                                : daysRemaining! > 0
                                ? `${daysRemaining}天后`
                                : new Date(todo.dueDate).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(todo)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingTodoId(todo.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 添加/编辑对话框 - 支持Markdown */}
      <Dialog open={isAddDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingTodo ? '编辑任务' : '添加任务'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="title">任务内容 (支持 Markdown)</Label>
              <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="write">编辑</TabsTrigger>
                  <TabsTrigger value="preview">预览</TabsTrigger>
                </TabsList>
                
                <TabsContent value="write" className="mt-2">
                  <Textarea
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="输入任务内容，支持 Markdown 格式&#10;&#10;示例：&#10;# 标题&#10;## 子标题&#10;- 列表项&#10;**粗体** *斜体*&#10;`代码`&#10;[链接](https://example.com)"
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <div className="mt-2 text-xs text-slate-500">
                    支持标题、列表、粗体、斜体、代码、链接等 Markdown 语法
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="mt-2">
                  <div className="min-h-[300px] border border-slate-200 rounded-md p-4 bg-slate-50">
                    {formData.title ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-slate-900" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-slate-900" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-slate-900" {...props} />,
                            p: ({ node, ...props }) => <p className="text-slate-700" {...props} />,
                            code: ({ node, className, children, ...props }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded text-sm" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className={`${className} bg-slate-200 text-slate-800 block p-2 rounded`} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            ul: ({ node, ...props }) => <ul className="text-slate-700 list-disc ml-4" {...props} />,
                            ol: ({ node, ...props }) => <ol className="text-slate-700 list-decimal ml-4" {...props} />,
                            a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                            blockquote: ({ node, ...props }) => (
                              <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600" {...props} />
                            ),
                          }}
                        >
                          {formData.title}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-sm">预览将在这里显示...</div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">分类</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">优先级</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as 'low' | 'medium' | 'high',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">截止日期（可选）</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              取消
            </Button>
            <Button onClick={handleDetailedAdd}>
              {editingTodo ? '保存' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog
        open={!!deletingTodoId}
        onOpenChange={() => setDeletingTodoId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个任务吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTodoId && handleDelete(deletingTodoId)}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
