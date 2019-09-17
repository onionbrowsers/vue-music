export function addClass(dom, className) {
    if (hasClass(dom, className)) {
        return false
    }
    let newClass = dom.className.split(' ')
    newClass.push(className)
    dom.className = newClass.join(' ')
}

// 正则判断是否已经有了该类名
export function hasClass(dom, className) {
    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
    return reg.test(dom.className)
}

// 获取html标签中的dataset
export function getData(el, name, val) {
    const prefix = 'data-'
    if (val) {
        return el.setAttribute(prefix + name, val)
    } else {
        return el.dataset[name]
    }
}

// 在js中写css3是没有postcss帮忙添加浏览器前缀的，所以自己手写封装
let elementStyle = document.createElement('div').style

let vendor = (() => {
    let transformNames = {
        webkit: 'webkitTransform',
        Moz: 'MozTransform',
        O: 'OTransform',
        ms: 'msTransform',
        standard: 'transform'
    }

    // 判断用有该css属性div在哪一个浏览器内, 重点为了返回浏览器前缀
    for (let key in transformNames) {
        if (elementStyle[transformNames[key]] !== undefined) {
            return key
        }
    }

    return false
})()

// 该函数调用后给某一元素添加对应的css属性
export function prefixStyle(style) {
    if (vendor === false) {
        return false
    }
    if (vendor === 'standard') {
        return style
    }
    return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}