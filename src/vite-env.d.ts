/// <reference types="vite/client" />

// Less Modules 类型声明
declare module '*.module.less' {
  const classes: Record<string, string>
  export default classes
}
