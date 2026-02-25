import { Button, Card, ConfigProvider, Space, Tag, Typography } from 'antd'
import styles from './App.module.less'

const { Title, Paragraph } = Typography

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <div className={styles.app}>
        <div className={styles.container}>
          {/* Tailwind utility classes + Less Modules 混用示例 */}
          <h1 className={styles.title}>
            Vite + React + Tailwind v3 + Ant Design v6 + Less Modules
          </h1>

          <Card className={`${styles.card} mb-6`}>
            <Title level={4}>技术栈</Title>
            <div className={styles.tagGroup}>
              {['Vite', 'React 19', 'TypeScript', 'Tailwind v3', 'antd v6', 'Less Modules'].map(
                (tech) => (
                  <Tag key={tech} color="blue" className="text-sm">
                    {tech}
                  </Tag>
                ),
              )}
            </div>
          </Card>

          <Card className={`${styles.card} mt-4`}>
            <Title level={4}>快速开始</Title>
            <Paragraph className="text-gray-600">
              当前项目已集成：Vite 构建工具、React 19、TypeScript 严格模式、
              Tailwind CSS v3（preflight 已关闭避免与 antd 冲突）、
              Ant Design v6、Less Modules（camelCase 类名）。
            </Paragraph>

            <Space className="mt-4">
              <Button type="primary">Primary Button</Button>
              <Button>Default Button</Button>
              <Button type="dashed">Dashed Button</Button>
              <Button danger>Danger Button</Button>
            </Space>
          </Card>
        </div>
      </div>
    </ConfigProvider>
  )
}
