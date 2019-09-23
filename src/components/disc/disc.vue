<template>
    <!-- 首页推荐歌单二级路由，用来展示点击某歌单详情 -->
    <transition name="slide">
        <music-list :title="title" :bg-image='bgImage' :songs='songs'></music-list>
    </transition>
</template>

<script>
import MusicList from '../music-list/music-list'
import {mapGetters} from 'vuex'
import {getSongList} from '@/api/recommend.js'
import {ERR_OK} from '@/api/config'
import { createSong, isValidMusic, processSongsUrl } from '@/common/js/song'

export default {
    components: {
        MusicList
    },
    computed: {
        title() {
            return this.disc.dissname
        },
        bgImage() {
            return this.disc.imgurl
        },
        ...mapGetters([
            'disc'
        ])
    },
    data() {
        return {
            songs: []
        }
    },
    created() {
        this._getSongList()
    },
    methods: {
        // 和歌手详情页一样，封装数据，然后返回song类获得所有的变量
        _getSongList() {
            // 在该页面刷新没有dissid，就返回到父级路由
            if (!this.disc.dissid) {
                this.$router.push({
                    path: '/recommend'
                })
            }
            getSongList(this.disc.dissid).then(res => {
                if (res.code === ERR_OK) {
                    processSongsUrl(this._normalizeSongs(res.cdlist[0].songlist)).then((songs) => {
                        this.songs = songs
                    })
                }
            })
        },
        _normalizeSongs(list) {
            let ret = []
            list.forEach((item) => {
                // isValidMusic函数用来判断是否有必须的参数，判断是否有必要创建song类
                if (isValidMusic(item)) {
                    ret.push(createSong(item))
                }
            })
            return ret
        }
    }
}
</script>
<style lang="stylus" scoped>
    .slide-enter-active, .slide-leave-active
        transition all 0.3s
    .slide-enter, .slide-leave-to
        transform translate3d(100%, 0, 0)
</style>
