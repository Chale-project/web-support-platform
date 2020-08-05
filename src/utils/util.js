
export function timeFix() {
  const time = new Date()
  const hour = time.getHours()
  return hour < 9 ? '早上好' : (hour <= 11 ? '上午好' : (hour <= 13 ? '中午好' : (hour < 20 ? '下午好' : '晚上好')))
}

export function welcome() {
  const arr = ['休息一会儿吧', '准备吃什么呢?', '要不要打一把 DOTA', '我猜你可能累了']
  let index = Math.floor((Math.random() * arr.length))
  return arr[index]
}

export const formatePhone = (value) => {
  if (typeof (value) == "string") {
    return value.substr(0, 3) + '*****' + value.substr(8);
  } else {
    return
  }
};

export const formateEmail = (value) => {
  if (value) {
    let number = value.indexOf("@")
    value = '*****' + value.substr(number)
  } else {
    value = '*****@**.com'
  }
  return value
};

export const compareTime = (startTime, endTime) => {
  var startTimes = startTime.substring(0, 10).split('-');
  var endTimes = endTime.substring(0, 10).split('-');
  startTime = startTimes[1] + '-' + startTimes[2] + '-' + startTimes[0] + ' ' + startTime.substring(10, 19);
  endTime = endTimes[1] + '-' + endTimes[2] + '-' + endTimes[0] + ' ' + endTime.substring(10, 19);
  var thisResult = (Date.parse(endTime) - Date.parse(startTime)) / 3600 / 1000;
  return thisResult;
}
//构建菜单树

export const toTree = (data) => {
  // 删除 所有 children,以防止多次调用
  data.forEach(function (item) {
    delete item.children;
  });

  // 将数据存储为 以 id 为 KEY 的 map 索引数据列
  var map = {};
  data.forEach(function (item, index) {
    map[item.id] = item;
    map[item.id].key = item.id;
    map[item.id].value = item.id;
    map[item.id].title = item.menuName;
  });
  // console.log(map);
  var val = [];
  data.forEach(function (item) {
    // 以当前遍历项，的pid,去map对象中找到索引的id
    var parent = map[item.parentMenuId];
    // 好绕啊，如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
    if (parent) {
      (parent.children || (parent.children = [])).push(item);
    } else {
      //如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到 val结果集中，作为顶级
      val.push(item);
    }
  });
  return val;
}

// 手机号隐藏中间四位
export const mobileToStar = (mobile) => {
  var str = mobile.substring(0, 3) + "****" + mobile.substring(7, 11);
  return str;
}
