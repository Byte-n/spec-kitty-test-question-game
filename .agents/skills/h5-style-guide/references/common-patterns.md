# 常用样式模式

## 目录

1. [文本截断](#文本截断)
2. [Flex 布局常用组合](#flex-布局常用组合)
3. [1px 细线](#1px-细线)
4. [安全区适配](#安全区适配)
5. [图片处理](#图片处理)
6. [滚动容器](#滚动容器)
7. [点击态与动画](#点击态与动画)
8. [遮罩与弹层](#遮罩与弹层)
9. [居中方案](#居中方案)

---

## 文本截断

### 单行省略

```scss
.singleLine {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 多行省略（Webkit）

```scss
.multiLine {
  display: -webkit-box;
  -webkit-line-clamp: 2;   // 行数
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### SCSS mixin

```scss
@mixin ellipsis($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// 使用
.title {
  @include ellipsis(2);
}
```

---

## Flex 布局常用组合

### 水平排列，垂直居中

```scss
.row {
  display: flex;
  align-items: center;
}
```

### 两端对齐

```scss
.spaceBetween {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

### 居中对齐

```scss
.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 垂直排列

```scss
.column {
  display: flex;
  flex-direction: column;
}
```

### 子元素平均分配

```scss
.equalItem {
  flex: 1;
  min-width: 0;  // 防止 flex 子元素溢出
}
```

---

## 1px 细线

移动端 1px 物理像素方案（使用伪元素 + transform）：

```scss
@mixin hairline($direction: bottom, $color: #eee) {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    @if $direction == bottom {
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      transform: scaleY(0.5);
      transform-origin: 0 100%;
    } @else if $direction == top {
      top: 0;
      left: 0;
      width: 100%;
      height: 1px;
      transform: scaleY(0.5);
      transform-origin: 0 0;
    } @else if $direction == left {
      top: 0;
      left: 0;
      width: 1px;
      height: 100%;
      transform: scaleX(0.5);
      transform-origin: 0 0;
    } @else if $direction == right {
      top: 0;
      right: 0;
      width: 1px;
      height: 100%;
      transform: scaleX(0.5);
      transform-origin: 100% 0;
    }
    background: $color;
    pointer-events: none;
  }
}

// 使用
.listItem {
  @include hairline(bottom, #f0f0f0);
}
```

---

## 安全区适配

```scss
// 底部安全区
.bottomBar {
  padding-bottom: 24px;
  padding-bottom: calc(24px + constant(safe-area-inset-bottom));
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

// 顶部安全区（刘海屏）
.topBar {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

// 固定定位底部
.fixedBottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## 图片处理

### 图片填充容器（cover）

```scss
.imgWrap {
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}
```

### 等比例图片容器（宽高比锁定）

```scss
// 宽高比 16:9
.aspectRatio {
  position: relative;
  width: 100%;
  padding-top: 56.25%;  // 9/16 * 100%

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// 1:1 正方形
.square {
  position: relative;
  width: 100%;
  padding-top: 100%;
}
```

---

## 滚动容器

### 横向滚动（不换行）

```scss
.scrollRow {
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;  // iOS 惯性滚动

  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }

  .scrollItem {
    flex-shrink: 0;
    margin-right: 16px;

    &:last-child {
      margin-right: 32px;  // 最后一项留出右边距
    }
  }
}
```

### 垂直滚动

```scss
.scrollContainer {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: 100%;
}
```

---

## 点击态与动画

### 点击缩放

```scss
.tapItem {
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.96);
  }
}
```

### 透明度点击态

```scss
.tapBtn {
  &:active {
    opacity: 0.7;
  }
}
```

### 淡入淡出

```scss
.fadeIn {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## 遮罩与弹层

### 全屏遮罩

```scss
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
}
```

### 底部弹窗

```scss
.bottomSheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 24px 24px 0 0;
  z-index: 101;
  padding-bottom: env(safe-area-inset-bottom);
  transform: translateY(100%);
  transition: transform 0.3s ease;

  &.isVisible {
    transform: translateY(0);
  }
}
```

---

## 居中方案

### Flex 居中（推荐）

```scss
.flexCenter {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 绝对定位居中

```scss
.absoluteCenter {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 文字垂直居中（固定高度）

```scss
.textCenter {
  height: 80px;
  line-height: 80px;  // 与 height 相等
  text-align: center;
}
```
