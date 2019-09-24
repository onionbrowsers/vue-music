import jsonp from 'common/js/jsonp'
import {commonParams, commonOptions} from './config'

// 获取热门关键词接口
export function getHotKey() {
    const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

    const data = Object.assign({}, commonParams, {
        uin: 0,
        needNewCode: 1,
        platform: 'h5'
    })

    return jsonp(url, data, commonOptions)
}