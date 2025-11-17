import { useState } from "react";
import { ToolsPage } from "./components/ToolsPage";
import { Base64Page } from "./components/Base64Page";
import { JsonFormatterPage } from "./components/JsonFormatterPage";
import { XmlFormatterPage } from "./components/XmlFormatterPage";
import { TodoListPage } from "./components/TodoListPage";
import {
  Wrench,
  Key,
  FileJson,
  FileCode,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";

type PageType = "tools" | "base64" | "json" | "xml" | "todo";

export default function App() {
  const [activePage, setActivePage] =
    useState<PageType>("tools");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    { id: "tools" as PageType, label: "工具箱", icon: Wrench },
    { id: "base64" as PageType, label: "Base64", icon: Key },
    {
      id: "json" as PageType,
      label: "JSON格式化",
      icon: FileJson,
    },
    {
      id: "xml" as PageType,
      label: "XML格式化",
      icon: FileCode,
    },
    {
      id: "todo" as PageType,
      label: "待办事项",
      icon: CheckSquare,
    },
  ];

  const renderPage = () => {
    switch (activePage) {
      case "tools":
        return <ToolsPage />;
      case "base64":
        return <Base64Page />;
      case "json":
        return <JsonFormatterPage />;
      case "xml":
        return <XmlFormatterPage />;
      case "todo":
        return <TodoListPage />;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-slate-50">
        {/* 左侧导航栏 */}
        <aside
          className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${
            isCollapsed ? "w-16" : "w-60"
          }`}
        >
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            {!isCollapsed && (
              <h1 className="text-slate-900">多功能工具箱</h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-1 rounded transition-colors ml-auto"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
          <nav className="flex-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const button = (
                <button
                  key={tab.id}
                  onClick={() => setActivePage(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    activePage === tab.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-700 hover:bg-slate-50"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{tab.label}</span>}
                </button>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={tab.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      {button}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{tab.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return button;
            })}
          </nav>
        </aside>

        {/* 右侧内容区域 */}
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </TooltipProvider>
  );
}