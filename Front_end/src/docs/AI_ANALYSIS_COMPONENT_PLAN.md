# AI 分析组件重构计划 (AIAnalysisReport)

## 1. 概述

当前AI航班分析报告的纯Markdown展示方式用户体验不佳。为了提升信息的可读性和交互性，我们将重构 `AIAnalysisReport` 组件，采用标签页（Tabs）界面来结构化地展示分析结果。

此计划的核心思想是 **“JSON优先，Markdown备用”**。组件将优先使用后端返回的结构化JSON数据进行渲染，这更加健- robust、高效且易于维护。当JSON数据不可用时，组件将优雅地降级，解析原始的Markdown字符串，以确保向后兼容和系统的韧性。

## 2. 组件设计 (`AIAnalysisReport.jsx`)

### 2.1. 组件职责

-   接收来自父组件 (`FlightResults.jsx`) 的完整AI分析响应。
-   智能判断数据源：优先解析和使用内嵌的JSON对象，如果JSON不存在，则回退到解析Markdown字符串。
-   将解析后的数据动态渲染到多个标签页中。
-   提供一个“原始数据”标签页，用于开发和调试。

### 2.2. 组件Props

```jsx
/**
 * @param {object} searchResult - 后端返回的完整搜索结果对象.
 *   - {string} [searchResult.ai_analysis_report] - 包含Markdown和内嵌JSON的字符串。
 *   - {object} [searchResult.ai_processing] - AI处理的元数据。
 * @param {boolean} expanded - 控制手风琴是否展开。
 * @param {function} onExpandChange - 手风琴展开/收起时的回调函数。
 */
<AIAnalysisReport 
  searchResult={searchResult} 
  expanded={aiReportExpanded} 
  onExpandChange={() => setAiReportExpanded(!aiReportExpanded)} 
/>
```

### 2.3. 状态管理 (State)

```jsx
const [activeTab, setActiveTab] = useState(0); // 当前激活的标签页索引
const [parsedData, setParsedData] = useState(null); // 解析后的数据对象
const [error, setError] = useState(null); // 解析或处理过程中的错误信息
```

## 3. 核心数据处理策略

这是本次重构最关键的部分。数据处理流程将遵循以下步骤：

### 3.1. 数据提取与解析流程图

```mermaid
graph TD
    A[接收 searchResult.ai_analysis_report] --> B{提取JSON字符串};
    B --> C{JSON.parse()};
    C --> D{解析成功?};
    D -- 是 --> E[使用JSON对象作为parsedData];
    D -- 否 --> F{回退：按 '---' 分割Markdown};
    F --> G[从Markdown片段中提取标题和内容];
    G --> H[将Markdown片段转换为对象数组];
    H --> E;
    E --> I[渲染标签页和内容];
    C -- 解析失败 --> J[设置错误状态];
    J --> I;
```

### 3.2. JSON优先策略 (Primary Strategy)

1.  **提取JSON**: 组件将首先尝试从 `ai_analysis_report` 字符串中提取JSON块。后端返回的格式通常是Markdown后紧跟一个 `json` 代码块。我们将使用正则表达式 `/\`\`\`json\s*([\s\S]*?)\s*\`\`\`/` 来捕获JSON内容。
2.  **解析JSON**: 使用 `JSON.parse()` 将提取的字符串转换为JavaScript对象。
3.  **数据映射**: 将解析后的JSON对象映射到标签页所需的数据结构。根据 `Backend/fastapi_app/prompts/flight_processor_prompts.py` 中定义的结构，映射关系如下：
    *   **AI摘要**: `summary.user_preference_analysis` + `summary.best_value_recommendation`
    *   **价格分析**: `summary.price_range` (可以渲染成简单的文本或图表)
    *   **推荐航班**: `flights` 数组 (可以渲染成精简的航班卡片列表)
    *   **旅行建议**: `summary.travel_tips` 数组
    *   **隐藏城市指南**: 从 `flights` 数组中筛选 `is_hidden_city: true` 的航班，并提供通用说明。
    *   **原始数据**: 完整的 `ai_analysis_report` 字符串。

### 3.3. Markdown备用策略 (Fallback Strategy)

如果JSON提取或解析失败，组件将自动切换到Markdown解析模式：

1.  **分割内容**: 使用 `analysisReport.split('---')` 将Markdown字符串分割成多个内容块。
2.  **提取标题和内容**: 对每个内容块，使用正则表达式 `/(?:^|\n)###\s*(.*?)\n([\s\S]*)/` 提取H3标题作为标签页的标题，其余部分作为内容。
3.  **数据结构化**: 将提取的信息转换成与JSON模式类似的数组对象，例如：`[{ title: 'AI摘要', content: '...' }, { title: '价格趋势', content: '...' }]`。
4.  **渲染**: 使用一个可靠的Markdown渲染库（如 `react-markdown`）来显示内容，而不是当前的手写解析器。

## 4. 实施步骤

### 步骤 1: 改造 `AIAnalysisReport.jsx`

1.  **引入依赖**: 添加 `react-markdown` 库以替代现有的手动Markdown解析逻辑。
2.  **修改Props**: 调整组件接收的props，直接接收 `searchResult` 对象而不是单独的 `analysisReport` 字符串，以便访问完整的后端数据。
3.  **实现数据解析逻辑**:
    *   在 `useEffect` hook 中实现“JSON优先，Markdown备用”的数据处理策略。
    *   当 `searchResult` prop 变化时，触发数据解析。
    *   将解析结果（或错误）保存在组件的state中。
4.  **构建标签页界面**:
    *   使用 Material-UI 的 `<Tabs>` 和 `<Tab>` 组件创建主界面。
    *   根据 `parsedData` 动态生成标签页。
    *   为每个标签页创建一个对应的面板组件（e.g., `SummaryTab.jsx`, `FlightsTab.jsx`），负责渲染特定部分的数据。
    *   添加“原始数据”标签页，用于显示未经处理的 `ai_analysis_report` 字符串，方便调试。

### 步骤 2: 更新父组件 `FlightResults.jsx`

1.  修改对 `AIAnalysisReport` 的调用，将整个 `searchResult` 对象作为prop传入。

    ```jsx
    // Before
    <AIAnalysisReport
      analysisReport={aiAnalysisReport}
      processingInfo={processingInfo}
      ...
    />

    // After
    <AIAnalysisReport
      searchResult={searchResult}
      ...
    />
    ```

### 步骤 3: (可选，但强烈建议) 与后端协同

1.  **沟通**: 与后端开发人员沟通，确保AI服务在生成报告时，总是将结构化的JSON数据包含在 `ai_analysis_report` 字段的末尾。
2.  **优化**: 理想情况下，后端API应直接返回一个结构化对象，其中包含 `markdown_report` 和 `structured_data` 两个独立字段，这将完全消除前端解析字符串的需要，是未来的最佳实践。

## 5. 验收标准

1.  当后端返回包含有效JSON的数据时，AI分析报告以标签页形式正确显示。
2.  每个标签页（摘要、价格、航班等）都正确渲染了对应的数据。
3.  当后端返回不含JSON的纯Markdown数据时，组件能优雅降级，按 `---` 分割内容并显示在标签页中。
4.  “原始数据”标签页始终显示从后端接收到的完整、未经修改的字符串。
5.  旧的手动Markdown解析逻辑被完全移除。

---

此计划旨在提供一个清晰、健壮且面向未来的解决方案。通过优先处理结构化数据，我们不仅能提升当前的用户体验，还能为未来功能的扩展打下坚实的基础。