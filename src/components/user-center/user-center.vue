<template>
    <!-- 个人中心组件 -->
    <transition name="slide">
        <div class="user-center">
            <div class="back" @click="goBack">
                <i class="icon-back"></i>
            </div>
            <div class="switches-wrapper">
                <switches @switch='switchItem' :currentIndex='currentIndex' :switches='switches'></switches>
            </div>
            <div ref="playBtn" class="play-btn" @click="random">
                <i class="icon-play"></i>
                <span class="text">随机播放全部</span>
            </div>
            <div class="list-wrapper" ref="listWrapper">
                <scroll ref="favoriteList" class="list-scroll" v-if="currentIndex === 0" :data='favoriteList'>
                    <div class="list-inner">
                        <song-list :songs='favoriteList' @select="selectSong"></song-list>
                    </div>
                </scroll>
                <scroll ref="playList" class="list-scroll" v-if="currentIndex === 1" :data='playHistory'>
                    <div class="list-inner">
                        <song-list :songs='playHistory' @select="selectSong"></song-list>
                    </div>
                </scroll>
            </div>
            <div class="no-result-wrapper" v-show="noResult">
                <no-result :title="noResultDesc"></no-result>
            </div>
        </div>
    </transition>
</template>
<script>
import switches from '@/base/switch/switch'
import { mapGetters, mapActions } from 'vuex'
import scroll from '@/base/scroll/scroll'
import songList from '@/base/song-list/song-list'
import noResult from '@/base/no-result/no-result'
import Song from 'common/js/song'
import {playlistMixin} from 'common/js/mixin'

export default {
    mixins: [playlistMixin],
    components: {
        switches,
        scroll,
        songList,
        noResult
    },
    computed: {
        // 判断是否列表为空来决定是否显示
        noResult() {
            if (this.currentIndex === 0) {
                return !this.favoriteList.length
            } else {
                return !this.playHistory.length
            }
        },
        // 无数据的显示文字
        noResultDesc() {
            if (this.currentIndex === 0) {
                return '无收藏歌曲'
            } else {
                return '无听过歌曲'
            }
        },
        ...mapGetters(['favoriteList', 'playHistory'])
    },
    data() {
        return {
            currentIndex: 0,
            switches: [
                {name: '我喜欢的'},
                {name: '最近听的'}
            ]
        }
    },
    methods: {
        // 解决底部因为miniplayer展示不全问题
        handlePlaylist(playList) {
            const bottom = playList.length > 0 ? '60px' : ''
            this.$refs.listWrapper.style.bottom = bottom
            this.$refs.favoriteList && this.$refs.favoriteList.refresh()
            this.$refs.playList && this.$refs.playList.refresh()
        },
        goBack() {
            this.$router.back()
        },
        switchItem(index) {
            this.currentIndex = index
        },
        selectSong(song) {
            this.insertSong(new Song(song))
        },
        random() {
            let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
            if (!list.length) return
            // new Song是因为拿到的歌曲不是song的实例，有些方法无法调用，比如getCurLyric
            list = list.map((song) => {
                return new Song(song)
            })
            this.randomPlay({list})
        },
        ...mapActions(['insertSong', 'randomPlay'])
    }
}
</script>
<style lang="stylus" scoped>
@import '~common/stylus/variable'

.user-center
    position fixed
    top 0
    bottom 0
    z-index 100
    width 100%
    background-color $color-background
    &.slide-enter-active, &.slide-leave-active
        transition: all 0.3s
    &.slide-enter, &.slide-leave-to
        transform: translate3d(100%, 0, 0)
    .back
        position absolute
        top: 0
        left: 6px
        z-index: 50
        .icon-back
            display: block
            padding: 10px
            font-size: $font-size-large-x
            color: $color-theme
    .switches-wrapper
        margin: 10px 0 30px 0
    .play-btn
        box-sizing: border-box
        width: 135px
        padding: 7px 0
        margin: 0 auto
        text-align: center
        border: 1px solid  $color-text-l
        color: $color-text-l
        border-radius: 100px
        font-size: 0
        .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
        .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
    .list-wrapper
        position: absolute
        top: 110px
        bottom: 0
        width: 100%
        .list-scroll
            height: 100%
            overflow: hidden
            .list-inner
                padding: 20px 30px
    .no-result-wrapper
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
