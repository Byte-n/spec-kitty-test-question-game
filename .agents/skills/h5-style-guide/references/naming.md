# 命名规范详细指南

## 目录

1. [基础规则](#基础规则)
2. [组件级命名](#组件级命名)
3. [状态和修饰类](#状态和修饰类)
4. [常见场景示例](#常见场景示例)
5. [禁止项](#禁止项)

---

## 基础规则

- **统一使用小驼峰（lowerCamelCase）**
- 类名见名知意，反映结构语义而非视觉样式
- 避免过度嵌套，最多 3 层 SCSS 嵌套
- 组件根元素以组件名命名，子元素以功能描述命名

```scss
// 组件根元素
.productCard { }

// 子元素
.productCard {
  .coverImg { }
  .contentWrap { }
  .titleText { }
  .priceRow { }
  .btnGroup { }
}
```

---

## 组件级命名

| 元素角色 | 命名示例 |
|----------|----------|
| 容器/包裹 | `.wrap`, `.container`, `.inner` |
| 头部 | `.header`, `.headerBar` |
| 内容区 | `.content`, `.body`, `.main` |
| 底部 | `.footer`, `.footerBar` |
| 列表 | `.list`, `.listWrap` |
| 列表项 | `.listItem`, `.item` |
| 图片 | `.img`, `.coverImg`, `.avatarImg` |
| 标题 | `.title`, `.subTitle`, `.label` |
| 文本 | `.text`, `.desc`, `.tip` |
| 按钮 | `.btn`, `.btnPrimary`, `.actionBtn` |
| 标签/徽章 | `.tag`, `.badge`, `.chip` |
| 图标 | `.icon`, `.iconWrap` |
| 弹窗 | `.modal`, `.popup`, `.drawer` |
| 遮罩 | `.mask`, `.overlay` |

---

## 状态和修饰类

### 状态类（`is` 前缀）

```scss
.tabItem {
  // 基础样式
  color: #666;

  &.isActive {
    color: #ff5000;
    font-weight: 600;
  }

  &.isDisabled {
    opacity: 0.4;
    pointer-events: none;
  }

  &.isLoading {
    // 加载态
  }

  &.isSelected {
    border-color: #ff5000;
  }
}
```

### 修饰类（`has` 前缀）

```scss
.card {
  // 基础样式

  &.hasIcon {
    padding-left: 60px; // 有图标时留出空间
  }

  &.hasBadge {
    position: relative;
  }

  &.hasBottomLine {
    border-bottom: 1px solid #eee;
  }
}
```

### 尺寸变体（`size` 描述）

```scss
.btn {
  // 默认中等尺寸
  height: 80px;
  font-size: 28px;

  &.btnLarge {
    height: 96px;
    font-size: 32px;
  }

  &.btnSmall {
    height: 56px;
    font-size: 24px;
  }
}
```

---

## 常见场景示例

### 商品卡片

```scss
.goodsCard {
  .coverImg { }
  .infoWrap { }
  .goodsName { }
  .priceWrap {
    .currentPrice { }
    .originPrice { }
  }
  .tagList { }
  .tagItem { }
  .actionRow {
    .cartBtn { }
    .buyBtn { }
  }
}
```

### 表单

```scss
.formWrap {
  .formItem { }
  .formLabel { }
  .formInput { }
  .formTip { }
  .formError { }
  .submitBtn { }
}
```

### 导航/Tab

```scss
.tabBar {
  .tabItem {
    &.isActive { }
  }
  .tabIcon { }
  .tabLabel { }
  .tabBadge { }
}
```

---

## 禁止项

```scss
// ❌ 拼音
.shangpin { }
.biaoti { }

// ❌ 无意义缩写
.w { }
.ct { }
.box1 { }

// ❌ 下划线
.goods_card { }
.form_item { }

// ❌ 大写开头
.GoodsCard { }
.FormItem { }

// ❌ 样式描述性命名（不利于维护）
.redText { }
.bigFont { }
.marginTop20 { }
```
