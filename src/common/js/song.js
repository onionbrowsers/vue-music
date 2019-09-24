import { getSongsUrl } from '@/api/song'
import { ERR_OK } from '@/api/config'
import { getLyric } from '../../api/song'
import { Base64 } from 'js-base64'

// 包装一个song类，用来得到关于歌曲的id，名字，专辑名，歌曲url等
export default class Song {
    constructor({id, mid, singer, name, album, duration, image, url}) {
        this.id = id
        this.singer = singer
        this.mid = mid
        this.name = name
        this.album = album
        this.duration = duration
        this.image = image
        this.url = url
    }

    // 在song类上添加该方法来给song类添加歌词变量
    getCurLyric() {
        // 如果当前歌曲已有歌词变量情况下，不用再次调用接口，直接返回promise即可
        if (this.lyric) {
            return Promise.resolve(this.lyric)
        }
        return new Promise((resolve, reject) => {
            getLyric(this.mid).then((res) => {
                if (res.retcode === ERR_OK) {
                    this.lyric = Base64.decode(res.lyric)
                    resolve(this.lyric)
                } else {
                    reject(new Error('no lyric'))
                }
            })
        })
    }
}

// 在包装的类上创建一层，减少代码量，不需要每次都去new Song后传入很多参数
export function createSong(musicData) {
    return new Song({
        id: musicData.songid,
        mid: musicData.songmid,
        singer: filterSinger(musicData.singer),
        name: musicData.songname,
        album: musicData.albumname,
        duration: musicData.interval,
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`
    })
}

// 多个歌手的时候用/隔开
function filterSinger(singer) {
    let ret = []
    if (!singer) {
        return ''
    }
    singer.forEach(item => {
        ret.push(item.name)
    })
    return ret.join('/')
}

// 用来判断当前这首歌曲是否含有歌曲id专辑id等来判断是否有该歌曲的url
export function isValidMusic(musicData) {
    return musicData.songid && musicData.albummid && (!musicData.pay || musicData.pay.payalbumprice === 0)
}

// 用来获取每一个创建的song类的url
export function processSongsUrl(songs) {
    if (!songs.length) {
        return Promise.resolve(songs)
    }

    // 此接口为api song中真正的获取url接口，传入songs参数去获取每一个歌曲的url，返回一个promise函数
    return getSongsUrl(songs).then((res) => {
        if (res.code === ERR_OK) {
            let midUrlInfo = res.url_mid.data.midurlinfo
            // midUrlInfo包含歌曲真正的url，即purl，将其赋值给创建的每个song类
            midUrlInfo.forEach((info, index) => {
                let song = songs[index]
                song.url = `http://dl.stream.qqmusic.qq.com/${info.purl}`
            })
        }
        return songs
    }).catch(e => {
        // 用来显示没有歌曲情况下的数据,还没写完
        return '暂无歌曲数据'
    })
}