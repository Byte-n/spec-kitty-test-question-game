import type { QuestionBank } from '../types'

export const DEFAULT_BANK: QuestionBank = {
  id: 'builtin',
  name: '通用知识题库',
  type: 'builtin',
  createdAt: '2026-02-25T00:00:00.000Z',
  questions: [
    // ─── 中国历史 ─────────────────────────────────────────────
    {
      id: 'q001',
      text: '中国历史上第一个封建王朝是哪个？',
      options: [
        { id: 'q001-a', text: '夏朝' },
        { id: 'q001-b', text: '商朝' },
        { id: 'q001-c', text: '秦朝' },
        { id: 'q001-d', text: '周朝' },
      ],
      correctOptionId: 'q001-c',
    },
    {
      id: 'q002',
      text: '长城最初建造的主要目的是什么？',
      options: [
        { id: 'q002-a', text: '划分省份边界' },
        { id: 'q002-b', text: '防御北方游牧民族入侵' },
        { id: 'q002-c', text: '作为皇帝出行的道路' },
        { id: 'q002-d', text: '防洪排水' },
      ],
      correctOptionId: 'q002-b',
    },
    {
      id: 'q003',
      text: '四大发明中，哪一项发明最早出现？',
      options: [
        { id: 'q003-a', text: '活字印刷术' },
        { id: 'q003-b', text: '火药' },
        { id: 'q003-c', text: '造纸术' },
        { id: 'q003-d', text: '指南针' },
      ],
      correctOptionId: 'q003-c',
    },
    {
      id: 'q004',
      text: '明朝迁都北京是在哪位皇帝在位期间？',
      options: [
        { id: 'q004-a', text: '朱元璋（洪武帝）' },
        { id: 'q004-b', text: '朱允炆（建文帝）' },
        { id: 'q004-c', text: '朱棣（永乐帝）' },
        { id: 'q004-d', text: '朱高炽（洪熙帝）' },
      ],
      correctOptionId: 'q004-c',
    },
    // ─── 地理 ────────────────────────────────────────────────
    {
      id: 'q005',
      text: '中国的首都是哪里？',
      options: [
        { id: 'q005-a', text: '上海' },
        { id: 'q005-b', text: '广州' },
        { id: 'q005-c', text: '南京' },
        { id: 'q005-d', text: '北京' },
      ],
      correctOptionId: 'q005-d',
    },
    {
      id: 'q006',
      text: '世界上最高的山峰是哪座？',
      options: [
        { id: 'q006-a', text: '珠穆朗玛峰' },
        { id: 'q006-b', text: '乔戈里峰' },
        { id: 'q006-c', text: '干城章嘉峰' },
        { id: 'q006-d', text: '洛子峰' },
      ],
      correctOptionId: 'q006-a',
    },
    {
      id: 'q007',
      text: '黄河发源于哪个省份？',
      options: [
        { id: 'q007-a', text: '四川省' },
        { id: 'q007-b', text: '青海省' },
        { id: 'q007-c', text: '甘肃省' },
        { id: 'q007-d', text: '宁夏回族自治区' },
      ],
      correctOptionId: 'q007-b',
    },
    {
      id: 'q008',
      text: '下列哪个城市不是中国的直辖市？',
      options: [
        { id: 'q008-a', text: '天津' },
        { id: 'q008-b', text: '重庆' },
        { id: 'q008-c', text: '成都' },
        { id: 'q008-d', text: '上海' },
      ],
      correctOptionId: 'q008-c',
    },
    // ─── 科学与自然 ──────────────────────────────────────────
    {
      id: 'q009',
      text: '光在真空中的速度约为多少？',
      options: [
        { id: 'q009-a', text: '每秒 30 万公里' },
        { id: 'q009-b', text: '每秒 3 万公里' },
        { id: 'q009-c', text: '每秒 300 万公里' },
        { id: 'q009-d', text: '每秒 30 亿公里' },
      ],
      correctOptionId: 'q009-a',
    },
    {
      id: 'q010',
      text: '水的化学式是什么？',
      options: [
        { id: 'q010-a', text: 'H₂O₂' },
        { id: 'q010-b', text: 'HO' },
        { id: 'q010-c', text: 'H₂O' },
        { id: 'q010-d', text: 'H₃O' },
      ],
      correctOptionId: 'q010-c',
    },
    {
      id: 'q011',
      text: '人体中最大的器官是哪个？',
      options: [
        { id: 'q011-a', text: '肝脏' },
        { id: 'q011-b', text: '皮肤' },
        { id: 'q011-c', text: '大肠' },
        { id: 'q011-d', text: '肺' },
      ],
      correctOptionId: 'q011-b',
    },
    {
      id: 'q012',
      text: '地球绕太阳公转一圈大约需要多长时间？',
      options: [
        { id: 'q012-a', text: '24 小时' },
        { id: 'q012-b', text: '30 天' },
        { id: 'q012-c', text: '365 天' },
        { id: 'q012-d', text: '100 天' },
      ],
      correctOptionId: 'q012-c',
    },
    // ─── 文学与语言 ──────────────────────────────────────────
    {
      id: 'q013',
      text: '《红楼梦》的作者是谁？',
      options: [
        { id: 'q013-a', text: '吴承恩' },
        { id: 'q013-b', text: '施耐庵' },
        { id: 'q013-c', text: '罗贯中' },
        { id: 'q013-d', text: '曹雪芹' },
      ],
      correctOptionId: 'q013-d',
    },
    {
      id: 'q014',
      text: '"床前明月光，疑是地上霜"出自哪位诗人？',
      options: [
        { id: 'q014-a', text: '杜甫' },
        { id: 'q014-b', text: '白居易' },
        { id: 'q014-c', text: '李白' },
        { id: 'q014-d', text: '王维' },
      ],
      correctOptionId: 'q014-c',
    },
    {
      id: 'q015',
      text: '汉语中"成语"通常由几个字组成？',
      options: [
        { id: 'q015-a', text: '两个字' },
        { id: 'q015-b', text: '三个字' },
        { id: 'q015-c', text: '四个字' },
        { id: 'q015-d', text: '五个字' },
      ],
      correctOptionId: 'q015-c',
    },
    // ─── 流行文化与体育 ──────────────────────────────────────
    {
      id: 'q016',
      text: '奥运会每隔多少年举办一次？',
      options: [
        { id: 'q016-a', text: '两年' },
        { id: 'q016-b', text: '三年' },
        { id: 'q016-c', text: '四年' },
        { id: 'q016-d', text: '五年' },
      ],
      correctOptionId: 'q016-c',
    },
    {
      id: 'q017',
      text: '足球比赛一支球队上场有多少名球员？',
      options: [
        { id: 'q017-a', text: '9 名' },
        { id: 'q017-b', text: '10 名' },
        { id: 'q017-c', text: '11 名' },
        { id: 'q017-d', text: '12 名' },
      ],
      correctOptionId: 'q017-c',
    },
    {
      id: 'q018',
      text: '下列哪项不是中国传统节日？',
      options: [
        { id: 'q018-a', text: '春节' },
        { id: 'q018-b', text: '中秋节' },
        { id: 'q018-c', text: '情人节' },
        { id: 'q018-d', text: '端午节' },
      ],
      correctOptionId: 'q018-c',
    },
    // ─── 综合知识 ────────────────────────────────────────────
    {
      id: 'q019',
      text: '互联网起源于哪个国家？',
      options: [
        { id: 'q019-a', text: '英国' },
        { id: 'q019-b', text: '日本' },
        { id: 'q019-c', text: '德国' },
        { id: 'q019-d', text: '美国' },
      ],
      correctOptionId: 'q019-d',
    },
    {
      id: 'q020',
      text: '钢铁的主要成分是什么？',
      options: [
        { id: 'q020-a', text: '铁和碳' },
        { id: 'q020-b', text: '铁和铜' },
        { id: 'q020-c', text: '铁和铝' },
        { id: 'q020-d', text: '铁和锌' },
      ],
      correctOptionId: 'q020-a',
    },
    {
      id: 'q021',
      text: '联合国总部位于哪个城市？',
      options: [
        { id: 'q021-a', text: '华盛顿' },
        { id: 'q021-b', text: '纽约' },
        { id: 'q021-c', text: '日内瓦' },
        { id: 'q021-d', text: '巴黎' },
      ],
      correctOptionId: 'q021-b',
    },
    {
      id: 'q022',
      text: '下列哪种动物是哺乳动物？',
      options: [
        { id: 'q022-a', text: '鳄鱼' },
        { id: 'q022-b', text: '蟒蛇' },
        { id: 'q022-c', text: '鲸鱼' },
        { id: 'q022-d', text: '金枪鱼' },
      ],
      correctOptionId: 'q022-c',
    },
    {
      id: 'q023',
      text: '1 千字节（KB）等于多少字节（Byte）？',
      options: [
        { id: 'q023-a', text: '100' },
        { id: 'q023-b', text: '512' },
        { id: 'q023-c', text: '1000' },
        { id: 'q023-d', text: '1024' },
      ],
      correctOptionId: 'q023-d',
    },
    {
      id: 'q024',
      text: '彩虹通常由多少种颜色组成？',
      options: [
        { id: 'q024-a', text: '五种' },
        { id: 'q024-b', text: '六种' },
        { id: 'q024-c', text: '七种' },
        { id: 'q024-d', text: '八种' },
      ],
      correctOptionId: 'q024-c',
    },
  ],
}
