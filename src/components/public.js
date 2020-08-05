export const allSelectStatus = [
  "upstreamChannelStatus", "configStatus", "dictStatus", "operatorStatus", 
  "roleStatus", "appStatus", "regionStatus", "userStatus", "configStatus", 
  "dictStatus", "configStatus", "taskStatus", "typeStatus"
]
export const allSelectMessageStatus = ["smsSendStatus"]
export const allSelectTaskStatus = ["taskStatus"]
export const supportCustomSign = ["supportCustomSign", ]
export const supportQueryBalance = ["supportQueryBalance", ]
export const allUserType = ["userType" ]
export const allOperatorSex = ["operatorSex" ]
export const allOperatorLevel = ["operatorLevel" ]
export const allResetType = ["resetType" ]
export const allDictLevel = ["dictLevel" ]
export const allRegionGroupCode = ["regionGroupCode" ]

export const hiddenAllId = ["id"]

export const regionGroupCode = [
  {selectText: '默认', selectValue: 'defalut' },
  {selectText: '其他', selectValue: '' }
];
export const resetType = [
  {selectText: '全局', selectValue: 'default' },
  {selectText: '月重置', selectValue: 'month' },
  {selectText: '日重置', selectValue: 'day' },
  {selectText: '时重置', selectValue: 'hour' }
];
export const dictLevel = [
  {selectText: '全局', selectValue: 'whole' },
  {selectText: '应用', selectValue: 'app' }
];
export const operatorLevel = [
  {selectText: '归属管理员', selectValue: 'belonging_admin' },
  {selectText: '普通操作员', selectValue: 'ordinary_operator' }
];
export const operatorSex = [
  {selectText: '男', selectValue: 'male' },
  {selectText: '女', selectValue: 'female' }
];
export const userType = [
  {selectText: '全部', selectValue: '' },
  {selectText: '支撑平台操作人员', selectValue: 'operation_supplier' }
];
export const queryStatus = [
  {selectText: '全部', selectValue: '' },
  {selectText: '启用', selectValue: 'enabled' },
  {selectText: '禁用', selectValue: 'disabled' }
];
export const smsSendStatus = [
  {selectText: '全部', selectValue: '' },
  {selectText: '成功', selectValue: 'success' },
  {selectText: '失败', selectValue: 'fail' }
];
export const taskStatus = [
  {selectText: '全部', selectValue: '' },
  {selectText: '正常', selectValue: 'default' },
  {selectText: '暂停', selectValue: 'paused' }
];
export const querySupport = [
  {selectText: '全部', selectValue: '' },
  {selectText: '支持', selectValue: 'support' },
  {selectText: '不支持', selectValue: 'not_support' }
];
export const queryAddOrEditStatus = [
  {selectText: '启用', selectValue: 'enabled' },
  {selectText: '禁用', selectValue: 'disabled' }
];
export const queryAddOrEditSupport = [
  {selectText: '支持', selectValue: 'support' },
  {selectText: '不支持', selectValue: 'not_support' }
];

export const menuShowType = [
  { selectText: '显示', selectValue: 'display' },
  { selectText: '隐藏', selectValue: 'hide' }
];
export const menuStatus = [
  { selectText: '启用', selectValue: 'enabled' },
  { selectText: '禁用', selectValue: 'disabled' }
];
export const menuType = [
  { selectText: '菜单', selectValue: 'menu' },
  { selectText: '目录', selectValue: 'catalog' },
  { selectText: '按钮', selectValue: 'button' }
];

export const in_array = (arr, element) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == element) {
      return true;
    }
  }
  return false;
}