# DollyVault Design Guide

## 1. Product Personality

DollyVault 是一个面向收藏品用户的图鉴和库存管理工具。它应该感觉可爱、干净、轻量，但仍然像一个可以长期记录价格、状态和历史的专业工具。

设计关键词：

- 粉色、白色、浅灰
- 轻卡片、圆角、柔和阴影
- 移动端优先
- 信息清晰、操作直接
- 收藏感、图鉴感、分享感

不要做成企业后台，也不要做成营销落地页。第一屏应该是可用的应用界面，而不是产品宣传。

## 2. Visual Principles

- **功能优先**：收藏列表、图鉴、统计、海报生成都要让用户快速完成操作。
- **甜但不腻**：粉色是主色，但页面不能只由一种粉色铺满，需要白色、浅灰、深色文字和少量辅助色平衡。
- **卡片轻量**：卡片用于承载收藏、图鉴、表单、设置分组和海报预览；不要做卡片套卡片。
- **移动优先**：手机端底部 Tab 是主导航；PC 端保留宽屏布局但限制内容宽度。
- **真实商品优先**：图片区域用于展示用户上传的真实收藏图。没有图片时使用柔和渐变占位，不使用 Disney 官方素材或角色图。
- **空状态友好**：空页面要提供下一步行动，例如“去图鉴看看”“创建第一个图鉴”。

## 3. Color System

当前主色来自 `apps/web/src/styles.css` 和 Ant Design `ConfigProvider`。

| Token | Value | Usage |
| --- | --- | --- |
| `--pink` | `#ff5c9a` | 主按钮、选中导航、价格重点、品牌色 |
| `--pink-strong` | `#ff3f89` | 强调态、可用于 hover 或重要 CTA |
| `--pink-soft` | `#fff0f6` | 选中背景、轻提示、空状态图标背景 |
| `--mint` | `#25c2a0` | 正向状态、辅助图表色 |
| `--lavender` | `#7c5cff` | 图表辅助色、轻幻想感 |
| `--amber` | `#f6b44b` | 图表辅助色、复古模板点缀 |
| `--ink` | `#18243a` | 主文字 |
| `--muted` | `#7a8494` | 次级文字、说明文字 |
| `--line` | `#e8edf4` | 边框、分割线 |
| `--bg` | `#f7f8fb` | 页面背景 |
| `--card` | `#ffffff` | 卡片背景 |

Ant Design 主题：

```ts
token: {
  colorPrimary: '#ff5c9a',
  borderRadius: 12,
}
```

使用规则：

- 主 CTA 使用 `#ff5c9a`。
- 大面积背景使用 `#f7f8fb` 或白色，不使用高饱和粉色铺满。
- 选中态优先使用粉色文字加 `#fff0f6` 背景。
- 金额重点可用粉色，危险操作使用 Ant Design danger 红色。
- 图表不要只用粉色，至少搭配紫、绿、橙等辅助色。

## 4. Typography

字体栈：

```css
-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

排版规则：

- 页面标题：`21px` mobile，`24px` desktop。
- 分组标题：`20px` 左右。
- 卡片主标题：使用粗体，避免过大。
- 价格重点：`18px` 到 `30px`，根据区域层级放大。
- 字间距保持 `0`，不要使用负字距。
- 中文按钮和表单文字必须完整显示，不允许挤压、截断或重叠。

## 5. Layout

### App Shell

移动端：

- 使用底部 Tab 导航。
- Tab 顺序固定：`首页`、`统计`、`图鉴`、`海报`、`我的`。
- 页面内容底部留出 `88px`，避免被 TabBar 遮挡。
- 页面横向 padding 使用 `14px` 到 `16px`。

PC 端：

- 左侧固定导航宽度 `220px`。
- 主内容容器最大宽度 `1180px`。
- 表单和详情卡片最大宽度 `860px`，避免在宽屏被拉得过宽。
- 列表和图鉴使用响应式 grid。

断点：

```css
@media (max-width: 860px)
```

`860px` 以下切换为移动布局。

## 6. Navigation

### Mobile

使用 `antd-mobile` 的 `TabBar`。

图标使用 `lucide-react`：

- 首页：`Home`
- 统计：`BarChart3`
- 图鉴：`BookOpen`
- 海报：`ImageDown`
- 我的：`UserRound`

选中态：

- 图标和文字使用主粉色。
- TabBar 固定在底部，白色半透明背景，顶部浅边框。

### Desktop

左侧导航：

- 白色背景，右侧浅边框。
- 品牌名 `DollyVault` 使用粉色粗体。
- 当前导航项使用粉色文字和 `--pink-soft` 背景。
- 图标加文字，不使用纯文字长按钮。

## 7. Core Components

### Page Header

用于每个主页面顶部：

- 左侧标题和说明。
- 可选返回按钮。
- 右侧放主要操作，例如创建图鉴、编辑、删除。
- 标题不要过大，说明文字使用 `--muted`。

### Cards

卡片用于：

- 收藏条目
- 图鉴条目
- 详情区块
- 表单容器
- 设置分组
- 图表容器
- 海报预览

卡片规则：

- 圆角 `16px` 到 `20px`。
- 边框使用 `--line`。
- 阴影轻，不做厚重浮层。
- 移动端卡片内部布局要自动换行。

### Buttons

- 主要操作使用 Ant Design `Button type="primary"`。
- 按钮高度约 `42px`。
- 图标按钮优先使用 `lucide-react` 或 Ant Design Icons。
- 删除使用 danger。
- 表单提交按钮在移动端可以 `block`。

### Forms

表单规则：

- 使用 Ant Design 表单。
- `layout="vertical"`。
- 必填项必须有明确错误文案。
- 创建图鉴时，名称已填写后不能再提示“名称不能为空”。
- 图片上传放在表单顶部。
- 复杂表单使用 `form-surface`，最大宽度 `860px`。

### Image Upload

图片上传规则：

- 最大 5 张。
- 使用方形缩略图。
- 无图时使用粉紫渐变占位。
- 前端不处理 OSS 密钥，只调用后端上传接口。
- 后端返回 `url` 和 `objectKey` 后保存到业务表。

### Empty State

空状态包含：

- 圆形粉色轻图标背景。
- 一句清晰标题。
- 可选说明。
- 可选下一步按钮。

空状态不是错误页。它应该鼓励用户继续创建图鉴、添加收藏或录入价格。

## 8. Page Patterns

### 登录和注册

- 左侧为账号表单，右侧为柔和插画卡片。
- 移动端隐藏右侧插画，聚焦表单。
- 不使用邮箱，账号字段为 username。
- username 文案规则：英文、数字、下划线，4 到 20 位。

### 首页 / 我的收藏

- 顶部展示收藏数量、估值合计和浮动比例。
- 收藏列表使用横向卡片：图片、名称、标签、日期、估值。
- 空状态引导去图鉴添加。

### 统计页

- 顶部使用四个统计卡片。
- 分布图和趋势图使用 ECharts。
- 图表颜色必须多色搭配，不只使用粉色。
- 没有数据时展示空状态。

### 图鉴列表

- 顶部搜索框。
- 图鉴卡片使用方形封面图。
- 卡片展示名称、角色、系列、标签和官方价。
- 空状态引导创建第一个图鉴。

### 图鉴详情

- 顶部大图区域使用 `object-fit: contain`，适合商品查看。
- 详情卡片展示名称、角色、系列、标签和描述。
- 支持添加价格记录。
- 主要 CTA 是“添加到我的收藏”。

### 添加到我的收藏弹窗

- 顶部展示商品缩略图和名称。
- 表单字段包括购入价、购入日期、渠道、品相、状态、估值、备注和实拍图。
- 移动端弹窗内容要可滚动，底部操作不能遮挡表单。

### 收藏详情

- 顶部展示实拍图、商品名称、状态、品相、估值和购入价。
- 下方可编辑收藏字段。
- 删除操作必须二次确认。

### 时间线

- 使用 Timeline 展示用户重要操作。
- 每条记录展示标题和时间。
- 删除事件可用红色，其余事件用粉色或默认色。

### 海报生成

布局：

- PC 端左侧控制区，右侧海报预览。
- 移动端控制区和预览上下排列。
- 海报比例固定为 `3 / 4`。

模板：

- `Minimal`：白底、清爽、突出商品和价格。
- `CutePink`：粉紫渐变，可爱、柔和。
- `CollectionCard`：深色收藏卡片，适合价格信息展示。
- `Vintage`：暖色纸感、复古边框。

海报内容：

- 商品图片
- 商品名称
- 角色 / 系列
- 当前估值
- 浮动金额
- DollyVault Logo

### 我的 / 设置

使用分组卡片：

- 账号信息
- 偏好设置
- 数据管理
- 帮助

开关类设置使用 `Switch`，货币单位使用 `Radio.Group`。导出 JSON 必须通过前端带 JWT 请求后下载，不使用直接裸链接。

## 9. Poster Template Style

海报预览类名：

- `.poster-preview`
- `.poster-Minimal`
- `.poster-CutePink`
- `.poster-CollectionCard`
- `.poster-Vintage`

通用规则：

- 宽度 `420px`，移动端不超过容器宽。
- 比例 `3 / 4`。
- 图片为正方形，圆角 `24px`。
- 价格模块居中。
- Logo 在底部。

不要在海报中使用 Disney 官方图片、角色素材或第三方 Logo。第一版使用用户上传图片或渐变占位。

## 10. Responsive Rules

必须验证以下视口：

- `375px` 手机
- `768px` 平板
- `1440px` 桌面

检查点：

- 底部 Tab 不遮挡内容。
- 页面标题和按钮不重叠。
- 表单输入框不超出容器。
- 图鉴卡片图片保持正方形。
- 收藏卡片在手机端价格信息换到第二列下方。
- 海报预览在手机端不横向溢出。
- PC 端表单和详情页不被拉满全屏。

## 11. Content Tone

文案语气：

- 亲切、清楚、轻量。
- 使用“宝贝”“收藏”“图鉴”“库存”等贴合收藏用户的词。
- 错误提示要具体，例如“用户名只能包含英文、数字、下划线，长度 4-20 位”。
- 空状态给出下一步，而不是只说“暂无数据”。

避免：

- 过度卖萌。
- 大段功能说明。
- 企业后台式冷冰冰文案。
- 在 UI 中解释快捷键、实现细节或技术栈。

## 12. Accessibility And Usability

- 所有按钮必须有清晰文字或 `aria-label`。
- 图标按钮要有 `title` 或可理解的上下文。
- 图片必须有 `alt`，通常使用商品名称。
- 表单错误必须显示在对应字段下方。
- 颜色不能作为状态的唯一表达，状态标签需要文字。
- 所有主要操作在移动端都应可单手触达。

## 13. Do And Do Not

Do:

- 使用 Ant Design 和 Ant Design Mobile 做稳定控件。
- 使用 CSS 覆盖成 DollyVault 品牌风格。
- 使用 `lucide-react` 图标表达导航和操作。
- 保持白色卡片、浅灰背景和粉色重点。
- 让列表、表单、详情和海报都适配移动端。

Do not:

- 不复制参考网站代码、Logo 或图片素材。
- 不使用 Disney 官方图片或角色素材作为默认资源。
- 不做营销式 hero 页面。
- 不使用大面积高饱和渐变背景。
- 不把页面内容无限拉宽。
- 不使用负字距或随视口缩放的字体。
- 不在卡片里再套大卡片。

## 14. Implementation Source Of Truth

主要设计实现位置：

- Theme provider: `apps/web/src/app/providers.tsx`
- App shell and navigation: `apps/web/src/app/layouts/AppShell.tsx`
- Global styles: `apps/web/src/styles.css`
- Empty state: `apps/web/src/shared/components/EmptyState.tsx`
- Page header: `apps/web/src/shared/components/PageHeader.tsx`
- Image upload: `apps/web/src/shared/components/ImageUploader.tsx`
- Poster preview: `apps/web/src/pages/poster/PosterPage.tsx`

新增页面或组件时，先复用这些模式，再决定是否扩展新的样式。
