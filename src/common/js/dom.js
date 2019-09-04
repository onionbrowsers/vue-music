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

export function getData(el, name, val) {
    const prefix = 'data-'
    if (val) {
        return el.setAttribute(prefix + name, val)
    } else {
        return el.dataset[name]
    }
}