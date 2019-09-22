<template>
    <music-list :songs='songs' :title="title" :bgImage='bgImage' ></music-list>
</template>

<script>
// vuex获取vuex中state对象中的数据的语法糖
import {mapGetters} from 'vuex'
import {getSingerDetail} from '@/api/singer'
import {ERR_OK} from '@/api/config'
import { createSong, isValidMusic, processSongsUrl } from '@/common/js/song'
import MusicList from '@/components/music-list/music-list'

export default {
    components: {
        MusicList
    },
    data() {
        return {
            songs: []
        }
    },
    created() {
        this._getDetail()
    },
    computed: {
        // 扩展运算符写法，获取数据传参为数组
        ...mapGetters([
            'singer'
        ]),
        title() {
            return this.singer.name
        },
        bgImage() {
            return this.singer.avatar
        }
    },
    methods: {
        _getDetail() {
            if (!this.singer.id) {
                this.$router.push('/singer')
                return
            }
            // 点击歌手时获取该歌手的num条歌曲
            getSingerDetail(this.singer.id).then(res => {
                if (res.code === ERR_OK) {
                    // 成功后，根据该函数，将已经创建好的song类返回给该函数内的getSongUrl接口去给每一个song类添加url
                    processSongsUrl(this._normalizeSongs(res.data.list)).then((songs) => {
                        this.songs = songs
                    })
                }
            })
        },
        // 该函数用来循环拿到的歌手的歌曲数组，为他们创建song类
        _normalizeSongs(list) {
            let ret = []
            list.forEach((item) => {
                let {musicData} = item
                // isValidMusic函数用来判断是否有必须的参数，判断是否有必要创建song类
                if (isValidMusic(musicData)) {
                    ret.push(createSong(musicData))
                }
            })
            return ret
        }
    }
}
</script>

<style lang="stylus" scoped>
</style>