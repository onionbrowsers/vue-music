// 当点击为随机播放时，用来打乱数组顺序的函数
export function shuffle (arr) {
    let _arr = arr.slice()
    for (let i = 0; i < _arr.length; i++) {
        // 该函数用来获取一个在数组内的随即索引值
        let j = getRandomInt(0, i)
        let t = _arr[i]
        _arr[i] = _arr[j]
        _arr[j] = t
    }
    return _arr
}

function getRandomInt (min, max) {
    return (Math.random() * (max - min + 1) + min) | 0
}

// 节流函数
export function debounce(func, delay) {
    let timer
    return function(...args) {
        // 每次调用时清除上一个定时器，重新开启一个新的定时器
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}