<template>
    <!-- 首页推荐歌单二级路由，用来展示点击某歌单详情 -->
    <transition name="slide">
        <music-list :rank='rank' :title="title" :bgImage='bgImage' :songs='songs'></music-list>
    </transition>
</template>

<script>
import MusicList from '../music-list/music-list'
import {mapGetters} from 'vuex'
import {getMusicList} from '@/api/rank.js'
import {ERR_OK} from '@/api/config'
import { createSong, isValidMusic, processSongsUrl } from '@/common/js/song'

export default {
    components: {
        MusicList
    },
    data() {
        return {
            songs: [],
            rank: true
        }
    },
    computed: {
        title() {
            return this.topList.topTitle
        },
        bgImage() {
            if (this.songs.length) {
                return this.songs[0].image
            }
        },
        ...mapGetters(['topList'])
    },
    created() {
        this._getMusicList()
    },
    methods: {
        _getMusicList() {
            if (!this.topList.id) {
                this.$router.push({
                    path: '/rank'
                })
                return
            }
            getMusicList(this.topList.id).then(res => {
                if (res.code === ERR_OK) {
                    processSongsUrl(this._normalizeSongs(res.songlist)).then((songs) => {
                        console.log(songs)
                        if (typeof songs === 'string') {
                            this.songs = []
                        } else {
                            this.songs = songs
                        }
                    })
                }
            })
        },
        _normalizeSongs(list) {
            let ret = []
            list.forEach((item) => {
                // isValidMusic函数用来判断是否有必须的参数，判断是否有必要创建song类
                let {data} = item
                if (isValidMusic(data)) {
                    ret.push(createSong(data))
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
