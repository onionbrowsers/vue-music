import jsonp from 'common/js/jsonp'
import {commonParams, commonOptions} from './config'
import axios from 'axios'

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

// 获取搜索详情的接口
export function search(query, page, zhida, perpage) {
    const url = '/api/search'

    const data = Object.assign({}, commonParams, {
        w: query,
        p: page,
        perpage,
        n: perpage,
        catZhida: zhida ? 1 : 0,
        zhidaqu: 1,
        t: 0,
        flag: 1,
        ie: 'utf-8',
        sem: 1,
        aggr: 0,
        remoteplace: 'txt.mqq.all',
        uin: 0,
        needNewCode: 1,
        platform: 'h5'
    })

    return axios.get(url, {
        params: data
    }).then(res => {
        // return jsonp(url, data, commonOptions)
        return Promise.resolve(res.data)
    })
  }
