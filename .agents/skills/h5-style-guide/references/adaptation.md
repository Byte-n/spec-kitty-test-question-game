# rem 适配方案详细说明

## 目录

1. [方案概述](#方案概述)
2. [postcss-pxtorem 配置](#postcss-pxtorem-配置)
3. [flexible.js 配置](#flexiblejs-配置)
4. [换算规则](#换算规则)
5. [特殊场景处理](#特殊场景处理)

---

## 方案概述

- **设计稿宽度**：750px
- **适配方案**：`lib-flexible` + `postcss-pxtorem`
- **根字体基准**：`rootValue = 37.5`（即设计稿 75px = 1rem）
- **原则**：代码中按设计稿标注数值直接写 `px`，构建时自动转换为 `rem`

---

## postcss-pxtorem 配置

```js
// postcss.config.js 或 vite.config.js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 37.5,        // 与 flexible 的基准保持一致
      propList: ['*'],        // 转换所有属性
      selectorBlackList: [],  // 不转换的选择器
      minPixelValue: 2,       // 小于 2px 不转换（避免 1px 被转）
      unitPrecision: 5,       // rem 精度
      exclude: /node_modules/i,
    }
  }
}
```

> **注意**：`minPixelValue: 2` 确保 `1px` 边框不被转换，保持 1 物理像素效果。

---

## flexible.js 配置

```js
// 页面入口引入
import 'lib-flexible'

// 或在 HTML 中内联（保证最早执行）
// flexible 会动态设置 html 的 font-size
// 以 375px 视口为例：html font-size = 375 / 10 = 37.5px
```

---

## 换算规则

| 设计稿 px | rootValue | 代码写法 | 转换结果 |
|-----------|-----------|----------|----------|
| 750px（全宽） | 37.5 | `width: 750px` | `20rem` |
| 375px（半宽） | 37.5 | `width: 375px` | `10rem` |
| 32px（间距） | 37.5 | `padding: 32px` | `0.85333rem` |
| 28px（字体） | 37.5 | `font-size: 28px` | `0.74667rem` |
| 1px（边框） | — | `border: 1px solid` | 保持 `1px`（minPixelValue:2 不转换） |

---

## 特殊场景处理

### 不希望被转换的属性

使用大写 `PX` 或注释阻止转换：

```scss
.fixedElement {
  border: 1Px solid #eee;      // 大写 P，不转换
  box-shadow: 0 2PX 8PX rgba(0,0,0,0.1);  // 不转换
}
```

或者配置 `selectorBlackList` 排除特定选择器：

```js
selectorBlackList: ['.no-rem', /^\.fixed-/]
```

### 第三方组件库

如果第三方组件使用自己的 px 单位，通过 `exclude` 排除：

```js
exclude: /node_modules\/third-party-ui/i
```

### 纯 px 场景（不需要响应式）

```scss
// 使用 1Px 大写来保持 px
.divider {
  height: 1Px;
  background: #eee;
}
```

### 安全区适配

```scss
.bottomBar {
  padding-bottom: constant(safe-area-inset-bottom);  // iOS 11.0
  padding-bottom: env(safe-area-inset-bottom);       // iOS 11.2+
}
```

### vh 场景（全屏页面）

```scss
// 使用 100vh 时需考虑移动端浏览器工具栏
.fullPage {
  min-height: 100vh;
  // 或使用 JS 动态设置高度
}
```

---

## 调试技巧

在浏览器开发者工具中：
1. 切换设备到 iPhone 6/7/8（375px 宽度）
2. 检查 `html` 的 `font-size` 是否为 `37.5px`
3. 元素尺寸应与设计稿的 50% 相符（750 设计稿显示在 375 屏）
