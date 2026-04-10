type FieldDef = {
  name: string
  fieldType: string
  options?: string[]
  isRequired: boolean
}

type TemplateDef = {
  name: string
  fields: FieldDef[]
}

const BODY_REGIONS = ['頭部', '首', '肩', '背中（上部）', '背中（下部）', '腰', '臀部', '股関節', '膝', '足首', '足底', '上腕', '前腕', '手首', '手指']

export const SEITAI_TEMPLATE: TemplateDef = {
  name: '整体院カルテ',
  fields: [
    { name: '主訴', fieldType: 'textarea', isRequired: true },
    { name: '発症時期', fieldType: 'text', isRequired: false },
    { name: '既往歴', fieldType: 'textarea', isRequired: false },
    { name: '服薬情報', fieldType: 'textarea', isRequired: false },
    { name: '姿勢分析', fieldType: 'select', options: ['正常', '前傾', '後傾', '側弯（右）', '側弯（左）', 'その他'], isRequired: false },
    { name: '可動域', fieldType: 'textarea', isRequired: false },
    { name: '圧痛部位', fieldType: 'multi_select', options: BODY_REGIONS, isRequired: false },
    { name: '施術部位', fieldType: 'multi_select', options: BODY_REGIONS, isRequired: false },
    { name: '手技', fieldType: 'multi_select', options: ['指圧', 'ストレッチ', '関節モビライゼーション', '筋膜リリース', 'トリガーポイント', 'その他'], isRequired: false },
    { name: '施術時間', fieldType: 'select', options: ['30分', '45分', '60分', '90分', '120分'], isRequired: false },
    { name: '施術後の状態', fieldType: 'textarea', isRequired: false },
    { name: '次回の方針', fieldType: 'textarea', isRequired: false },
    { name: 'メモ', fieldType: 'textarea', isRequired: false },
  ],
}

export const SHINKYU_TEMPLATE: TemplateDef = {
  name: '鍼灸院カルテ',
  fields: [
    { name: '主訴', fieldType: 'textarea', isRequired: true },
    { name: '発症時期', fieldType: 'text', isRequired: false },
    { name: '既往歴', fieldType: 'textarea', isRequired: false },
    { name: '服薬情報', fieldType: 'textarea', isRequired: false },
    { name: '脈診', fieldType: 'select', options: ['浮脈', '沈脈', '遅脈', '数脈', '弦脈', '滑脈', '細脈', 'その他'], isRequired: false },
    { name: '舌診', fieldType: 'select', options: ['淡紅', '紅', '紫暗', '淡白', '歯痕あり', '苔厚', 'その他'], isRequired: false },
    { name: '腹診', fieldType: 'textarea', isRequired: false },
    { name: '使用経穴（鍼）', fieldType: 'multi_select', options: ['合谷', '足三里', '三陰交', '百会', '風池', '肩井', '委中', '太衝', '内関', '曲池', '天柱', '腎兪', '大椎', 'その他'], isRequired: false },
    { name: '使用鍼', fieldType: 'select', options: ['0番（0.14mm）', '1番（0.16mm）', '2番（0.18mm）', '3番（0.20mm）', '5番（0.24mm）', 'その他'], isRequired: false },
    { name: '使用経穴（灸）', fieldType: 'multi_select', options: ['合谷', '足三里', '三陰交', '関元', '気海', '中脘', '腎兪', '大椎', 'その他'], isRequired: false },
    { name: '灸の種類', fieldType: 'select', options: ['直接灸', '間接灸', '温灸', '棒灸', '台座灸', 'その他'], isRequired: false },
    { name: '施術後の状態', fieldType: 'textarea', isRequired: false },
    { name: '次回の方針', fieldType: 'textarea', isRequired: false },
    { name: 'メモ', fieldType: 'textarea', isRequired: false },
  ],
}

export const ALL_TEMPLATES = {
  seitai: SEITAI_TEMPLATE,
  shinkyu: SHINKYU_TEMPLATE,
} as const

export type TemplateType = keyof typeof ALL_TEMPLATES
