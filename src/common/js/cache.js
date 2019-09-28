// 用来操作localStorage和搜索历史的一些函数
import storage from 'good-storage'

// localStorage的key值
const SEARCH_KEY = '__search__'
// 搜索历史最多存储数据
const SEACH_MAX_LENGTH = 15

// 在搜索历史中插入一条数据
function insertArray(arr, val, compare, maxLen) {
    // 四个参数为，要插入的数组，插入值，对比函数，最大长度,因为直接操作原数组，所以不需要return出去
    const index = arr.findIndex(compare)
    // 如果当前值的索引是0，直接return不用改变
    if (index === 0) return
    // 如果历史中已经有这条数据，将原数据清除，并插在第一个的位置上
    if (index > 0) {
        arr.splice(index, 1)
    }
    arr.unshift(val)
    // 当超过长度时，将最后的数据清除
    if (maxLen && arr.length > maxLen) {
        arr.pop()
    }
}

// 删除历史数据, 同上
function deleteFromArray(arr, compare) {
    const index = arr.findIndex(compare)
    if (index > -1) {
        arr.splice(index, 1)
    }
}

// 重点改变localStorage和 return 改变后的数组出去
export function saveSearch(query) {
    // 获取判断是否已有该key值，有直接拿出，没有则赋值空数组
    let searches = storage.get(SEARCH_KEY, [])
    // 调用插入数据方法
    insertArray(searches, query, (item) => {
        return item === query
    }, SEACH_MAX_LENGTH)
    // 将调用后的数组设置到localStorage里
    storage.set(SEARCH_KEY, searches)
    return searches
}

// 获取当前localStorage中的数组，没有返回空数组
export function localSearch() {
    return storage.get(SEARCH_KEY, [])
}

// 删除localStorage中的数组，并返回去出去，原理同上
export function deleteSearch(query) {
    let searches = storage.get(SEARCH_KEY, [])
    deleteFromArray(searches, (item) => {
        return item === query
    })
    storage.set(SEARCH_KEY, searches)
    return searches
}

// 清空历史数据
export function clearSearch() {
    storage.remove(SEARCH_KEY)
    return []
}