let _uid = ''

// 获取接口参数uid，用来获取guid（不太了解为什么这么算）
export function getUid() {
  if (_uid) {
    return _uid
  }
  if (!_uid) {
    // 根据世界时获取毫秒数
    const t = new Date().getUTCMilliseconds()
    _uid = '' + Math.round(2147483647 * Math.random()) * t % 1e10
    console.log(_uid)
  }
  return _uid
}