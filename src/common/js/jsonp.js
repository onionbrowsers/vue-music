import originJSONP from 'jsonp'

// 在封装基础上再次封装，将所有参数放在url后面
export default function jsonp(url, data, option) {
    // 判断url是否已经带有?
    url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
    return new Promise((resolve, reject) => {
        originJSONP(url, option, (err, data) => {
            if (!err) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    })
}

function param(data) {
    let url = ''
    for (var k in data) {
        // 将要发送的参数都写在url后面
        let value = data[k] !== undefined ? data[k] : ''
        url += '&' + k + '=' + encodeURIComponent(value)
    }
    // 去掉第一个&符号
    return url ? url.substring(1) : ''
}