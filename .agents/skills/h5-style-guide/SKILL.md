---
name: h5-style-guide
description: H5 移动端项目样式编写规范指南。适用于：(1) 编写新组件样式，(2) 修改或重构已有组件样式，(3) Code Review 检查样式代码是否符合规范，(4) 解答样式写法相关问题。核心约定：camelCase 命名，rem 适配（750px 设计稿基准），多种样式方案混合使用。触发词包括：写样式、CSS规范、SCSS规范、样式检查、样式规范、rem适配、H5适配、组件样式。
---

# H5 项目样式编写规范

## 核心约定速查

| 项目 | 规范 |
|------|------|
| 命名方式 | camelCase（小驼峰） |
| 设计稿基准 | 750px |
| 适配单位 | rem（postcss-pxtorem 自动转换） |
| 固定尺寸单位 | px（边框线、阴影等装饰性属性） |

**样式方案优先级（必须按此顺序选用）：**

| 优先级 | 方案 | 适用场景 |
|--------|------|----------|
| 1st | **Ant Design 布局组件**（Flex、Row/Col、Grid、Space） | 所有布局排列场景 |
| 2nd | **Tailwind CSS** | 布局以外的样式需求 |
| 3rd | **Less Module** | Tailwind 无法表达的复杂样式 |
| 4th | **`style` 内联** | 仅限动态值（如 JS 计算的宽高、颜色） |

---

## 样式方案选用规则

### 布局 → Ant Design 组件优先

凡是涉及排列、间距、栅格的布局，优先用 Ant Design 提供的布局组件：

```tsx
// ✅ 用 Ant Design Flex 做水平排列
import { Flex, Space } from 'antd'

<Flex align="center" justify="space-between" gap={16}>
  <span>左侧</span>
  <span>右侧</span>
</Flex>

// ✅ 用 Row/Col 做栅格布局
<Row gutter={[16, 16]}>
  <Col span={12}>...</Col>
  <Col span={12}>...</Col>
</Row>

// ❌ 不要为了布局手写 Tailwind flex 或 Less
<div className="flex items-center justify-between">...</div>
```

### 其他样式 → Tailwind CSS

布局以外的样式（颜色、字体、圆角、阴影、间距微调等）优先用 Tailwind：

```tsx
// ✅ 用 Tailwind 处理视觉样式
<div className="rounded-xl bg-white text-sm text-gray-600 shadow-sm px-4 py-3">
  内容
</div>

// ✅ Tailwind 处理状态
<button className={`rounded-full px-6 py-2 ${isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
  按钮
</button>
```

### 复杂样式 → Less Module

Tailwind 无法表达时（伪元素、复杂动画、媒体查询组合、1px 线等）用 Less Module：

```tsx
// ✅ 复杂伪元素用 Less Module
import styles from './Card.module.less'

<div className={styles.card}>...</div>
```

```less
// Card.module.less
.card {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    transform: scaleY(0.5);
    background: #eee;
  }
}
```

### 内联 `style` → 仅限动态值

```tsx
// ✅ 仅用于 JS 计算出的动态值
<div style={{ width: `${progress}%`, color: themeColor }}>...</div>

// ❌ 不要用内联 style 写静态样式
<div style={{ fontSize: '14px', color: '#333' }}>...</div>
```

---

## 单位使用规则

- **rem**：布局、尺寸相关的值（宽高、间距、字体大小）
- **px**：`1px` 边框线、`box-shadow`、不需要随屏幕缩放的装饰值
- **%**：父容器百分比布局
- **vw / vh**：全屏容器、视口比例场景
- postcss-pxtorem 会自动将代码中的 `px` 转为 `rem`，直接按设计稿数值写即可

```scss
// ✅ 正确
.card {
  width: 686px;        // postcss 转 rem
  padding: 24px 32px;  // postcss 转 rem
  border: 1px solid #eee;      // 保持 px
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);  // 保持 px
}

// ❌ 错误
.card {
  width: 343px; /* px-ignore */ // 不要用 ignore 阻止转换来达到固定尺寸
}
```

---

## 命名规范（camelCase）

- 类名使用小驼峰：`.cardItem`、`.headerTitle`、`.btnPrimary`
- 状态类加 `is` 前缀：`.isActive`、`.isDisabled`、`.isLoading`
- 修饰类加 `has` 前缀：`.hasIcon`、`.hasBadge`
- JS 钩子类加 `js` 前缀（不写样式）：`.jsToggle`
- 禁止使用拼音、无意义缩写

```scss
// ✅ 正确
.productCard { }
.productCard .coverImg { }
.productCard.isSelected { }

// ❌ 错误
.product_card { }       // 下划线
.ProductCard { }        // 大写开头
.pic { }                // 无意义缩写
.tupian { }             // 拼音
```

详细命名示例见 [references/naming.md](references/naming.md)

---

## 属性书写顺序

按分组顺序书写，组间空行分隔：

1. **定位** — `position`, `top/right/bottom/left`, `z-index`
2. **盒模型** — `display`, `flex-*`, `width`, `height`, `padding`, `margin`
3. **视觉** — `background`, `border`, `border-radius`, `box-shadow`, `opacity`
4. **文字** — `font-size`, `font-weight`, `color`, `line-height`, `text-align`
5. **其他** — `cursor`, `overflow`, `transition`, `transform`, `animation`

详细规则和示例见 [references/properties-order.md](references/properties-order.md)

---

## rem 适配方案

设计稿 750px，`rootValue = 37.5`（即 1rem = 37.5px）。

直接按设计稿标注的 px 数值写，postcss 自动换算：
- 设计稿 `750px` → 代码写 `750px` → 转为 `20rem`
- 设计稿 `32px` 间距 → 代码写 `32px` → 转为 `0.853rem`

详细配置见 [references/adaptation.md](references/adaptation.md)

---

## 常用样式模式

单行省略、多行省略、flex 布局、1px 细线、安全区适配等见 [references/common-patterns.md](references/common-patterns.md)

---

## Code Review 检查项

**样式方案选用：**
- [ ] 布局排列是否优先使用 Ant Design Flex / Row / Col / Space
- [ ] 非布局样式是否优先使用 Tailwind，而非 Less Module
- [ ] Less Module 仅用于 Tailwind 无法表达的复杂场景
- [ ] 内联 `style` 仅用于动态值，无静态内联样式

**代码质量：**
- [ ] 类名使用 camelCase，无拼音/无意义缩写
- [ ] 布局尺寸使用 px（由 postcss 转 rem），装饰性属性保持 px
- [ ] 属性按分组顺序书写
- [ ] 嵌套不超过 3 层（Less）
- [ ] 无 `!important`（除非覆盖第三方库）
- [ ] 颜色、间距使用变量，无魔法数字
