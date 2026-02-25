# CSS 属性书写顺序规范

## 目录

1. [分组顺序概览](#分组顺序概览)
2. [各组详细属性列表](#各组详细属性列表)
3. [完整示例](#完整示例)

---

## 分组顺序概览

```
1. 定位（Positioning）
2. 盒模型（Box Model）
3. 视觉（Visual）
4. 文字（Typography）
5. 其他（Misc）
```

组间用**空行**分隔，同组内属性无需空行。

---

## 各组详细属性列表

### 1. 定位

```scss
position
top
right
bottom
left
z-index
```

### 2. 盒模型

```scss
display
flex
flex-direction
flex-wrap
justify-content
align-items
align-self
flex-grow
flex-shrink
flex-basis
order

grid-template-columns
grid-template-rows
grid-column
grid-row
gap

width
min-width
max-width
height
min-height
max-height

padding
padding-top
padding-right
padding-bottom
padding-left

margin
margin-top
margin-right
margin-bottom
margin-left

box-sizing
overflow
overflow-x
overflow-y
```

### 3. 视觉

```scss
background
background-color
background-image
background-repeat
background-position
background-size

border
border-top
border-right
border-bottom
border-left
border-width
border-style
border-color
border-radius

outline

box-shadow
opacity
visibility
```

### 4. 文字

```scss
font-family
font-size
font-weight
font-style
line-height
letter-spacing
word-spacing

color
text-align
text-decoration
text-transform
text-overflow
white-space
word-break
word-wrap
```

### 5. 其他

```scss
cursor
pointer-events
user-select

transition
transform
animation

content
list-style
```

---

## 完整示例

```scss
.productCard {
  // 1. 定位
  position: relative;
  z-index: 1;

  // 2. 盒模型
  display: flex;
  flex-direction: column;
  width: 686px;
  min-height: 200px;
  padding: 24px 32px;
  margin-bottom: 20px;
  overflow: hidden;
  box-sizing: border-box;

  // 3. 视觉
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

  // 4. 文字（卡片本身通常不直接写文字属性，子元素写）

  // 5. 其他
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
}

.productCard .titleText {
  // 1. 定位（无）

  // 2. 盒模型
  width: 100%;
  margin-bottom: 12px;

  // 3. 视觉（无）

  // 4. 文字
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
```

---

## 常见问题

**Q: `overflow: hidden` 放在盒模型还是视觉组？**
A: 放在盒模型组（第2组），因为它影响盒子的裁剪行为。

**Q: `transform` 和 `transition` 放哪里？**
A: 放在其他组（第5组）。

**Q: `content` 放哪里？**
A: 放在其他组（第5组），通常配合 `::before` / `::after` 使用。
