import jsonp from 'common/js/jsonp'
import { commonParams, commonOptions } from './config'

// const debug = process.env.NODE_ENV !== 'production'

// 获取歌手列表
export function getSingerList() {
    const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'

    const data = Object.assign({}, commonParams, {
        channel: 'singer',
        page: 'list',
        key: 'all_all_all',
        pagesize: 100,
        pagenum: 1,
        hostUin: 0,
        needNewCode: 0,
        platform: 'yqq',
        g_tk: 1664029744
    })

    return jsonp(url, data, commonOptions)
}

// 当点入一个歌手的时候用来请求该歌手下的专辑名，专辑代号，歌曲名，歌曲，歌手代号等
export function getSingerDetail(singerId) {
    const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'

    const data = Object.assign({}, commonParams, {
        hostUin: 0,
        needNewCode: 0,
        platform: 'yqq',
        order: 'listen',
        begin: 0,
        num: 100,
        songstatus: 1,
        singermid: singerId,
        g_tk: 1664029744
    })

    return jsonp(url, data, commonOptions)
}