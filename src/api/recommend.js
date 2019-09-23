import jsonp from 'common/js/jsonp'
import { commonParams, commonOptions } from './config'
import axios from 'axios'

const debug = process.env.NODE_ENV !== 'production'

// 获取数据的api接口 轮播图数据
export function getRecommend() {
    const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
    const data = Object.assign({}, commonParams, {
        platform: 'h5',
        needNewCode: 1,
        uin: 0
    })
    return jsonp(url, data, commonOptions)
}

// 获取歌单数据
export function getDiscList() {
    const url = debug ? '/api/getDiscList' : 'http://ustbhuangyi.com/music/api/getDiscList'

    const data = Object.assign({}, commonParams, {
        platform: 'yqq',
        hostUin: 0,
        sin: 0,
        ein: 29,
        sortId: 5,
        needNewCode: 0,
        categoryId: 10000000,
        rnd: Math.random(),
        format: 'json'
    })

    return axios.get(url, {
        params: data
    }).then(res => {
        console.log(res)
        return Promise.resolve(res.data)
    })
}

// 获取推荐页面详情歌单
export function getSongList(disstid) {
    const url = debug ? '/api/getCdInfo' : 'http://ustbhuangyi.com/music/api/getCdInfo'
    const data = Object.assign({}, commonParams, {
        disstid,
        type: 1,
        json: 1,
        utf8: 1,
        onlysong: 0,
        platform: 'yqq',
        hostUin: 0,
        needNewCode: 0
    })

    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data)
    })
}
