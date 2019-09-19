<template>
    <!-- 播放器控件 -->
    <div class="player" v-show="playList.length > 0">
        <!-- vue过渡组件和其四个钩子函数 -->
        <transition name="normal" @enter='enter' @after-enter='afterEnter' @leave='leave' @after-leave='afterLeave'>
            <div class="normal-player" v-show="fullScreen">
                <div class="background">
                    <img :src="currentSong.image" width='100%' height="100%" >
                </div>
                <div class="top">
                    <div class="back" @click="back">
                        <i class="icon-back"></i>
                    </div>
                    <h1 class="title" v-html="currentSong.name"></h1>
                    <h1 class="subtitle" v-html="currentSong.singer"></h1>
                </div>
                <div class="middle">
                    <div class="middle-l">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <div class="cd" :class="cdCls">
                                <img :src="currentSong.image" alt="" class="image">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bottom">
                    <div class="progress-wrapper">
                        <span class="time time-l">{{format(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <progress-bar @percentChange='onProgressBarChange' :percent="percent"></progress-bar>
                        </div>
                        <span class="time time-r">{{format(currentSong.duration)}}</span>
                    </div>
                    <div class="operators">
                        <div class="icon i-left">
                            <i class="icon-sequence"></i>
                        </div>
                        <div class="icon i-left" :class="disableCls">
                            <i @click="prev" class="icon-prev"></i>
                        </div>
                        <div class="icon i-center" :class="disableCls">
                            <i @click="togglePlaying" :class="playIcon"></i>
                        </div>
                        <div class="icon i-right" :class="disableCls">
                            <i @click="next" class="icon-next"></i>
                        </div>
                        <div class="icon i-right">
                            <i class="icon icon-not-favorite"></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <transition name="mini">
            <div class="mini-player" v-show="!fullScreen" @click="open">
                <div class="icon">
                    <div class="imgWrapper">
                        <img :class="cdCls" :src="currentSong.image" width="40" height="40">
                    </div>
                </div>
                <div class="text">
                    <h2 class="name" v-html="currentSong.name"></h2>
                    <p class="desc" v-html="currentSong.singer"></p>
                </div>
                <div class="control">
                    <i @click.stop.prevent="togglePlaying" :class="miniIcon"></i>
                </div>
                <div class="control">
                    <i class="icon-playlist"></i>
                </div>
            </div>
        </transition>
        <!-- 内置播放器三个内置函数，canplay代表歌曲已经加载完成，error为报错，timeupdate为获取当前歌曲播放时间 -->
        <audio
            ref="audio"
            :src="currentSong.url"
            @canplay="ready"
            @error="error"
            @timeupdate="updateTime">
        </audio>
    </div>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
// 用js动态写aniamtion的库
import animations from 'create-keyframe-animation'
import {prefixStyle} from 'common/js/dom'
import progressBar from '@/base/progress-bar/progress-bar'

const transform = prefixStyle('transform')

export default {
    components: {
        progressBar
    },
    data() {
        return {
            // 判断当前歌曲是否缓存完整
            songReady: false,
            currentTime: 0
        }
    },
    computed: {
        // 播放按钮图标
        playIcon() {
            return this.playing ? 'icon-pause' : 'icon-play'
        },
        // 迷你播放器按钮图标
        miniIcon() {
            return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
        },
        // 中间cd旋转判定
        cdCls() {
            return this.playing ? 'play' : 'play pause'
        },
        // 当快速点击上下曲歌曲没有缓存好的时候，将按钮置灰
        disableCls() {
            return this.songReady ? '' : 'disable'
        },
        // 获取播放百分比，用于进度条
        percent() {
            return this.currentTime / this.currentSong.duration
        },
        ...mapGetters([
            'fullScreen',
            'playList',
            'currentSong',
            'playing',
            'currentIndex'
        ])
    },
    watch: {
        // 监听当前歌曲，当歌曲改变时，播放歌曲
        currentSong() {
            this.$nextTick(() => {
                this.$refs.audio.play()
            })
        },
        // 监听vuex中的playing的值，决定歌曲是否暂停
        playing(newPlaying) {
            const audio = this.$refs.audio
            this.$nextTick(() => {
                newPlaying ? audio.play() : audio.pause()
            })
        }
    },
    methods: {
        // 退出全屏
        back() {
            this.setFullScreen(false)
        },
        // 打开全屏
        open() {
            this.setFullScreen(true)
        },
        // vue transition组件内置钩子函数
        enter(el, done) {
            // 该函数用来获取下x,y轴和缩放的量
            const {x, y, scale} = this._getPosAndScale()

            let animation = {
                0: {
                    transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
                },
                60: {
                    transform: `translate3d(0, 0, 0) scale(1.1)`
                },
                100: {
                    transform: `translate3d(0, 0, 0) scale(1)`
                }
            }

            // 第三方库，动态加载动画，先注册
            animations.registerAnimation({
                name: 'move',
                animation,
                presets: {
                    duration: 400,
                    easing: 'linear'
                }
            })
            // 运行
            animations.runAnimation(this.$refs.cdWrapper, 'move', done)
        },
        afterEnter(el) {
            // 解绑
            animations.unregisterAnimation('move')
            // 将之前设置的animation置空
            this.$refs.cdWrapper.style.animation = ''
        },
        leave(el, done) {
            this.$refs.cdWrapper.style.transition = 'all 0.4s'
            const {x, y, scale} = this._getPosAndScale()
            this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
            this.$refs.cdWrapper.addEventListener('transitionend', done)
        },
        afterLeave() {
            this.$refs.cdWrapper.style.transition = ''
            this.$refs.cdWrapper.style.transform = ''
        },
        // 判断歌曲加载情况，决定是否改变歌曲播放状态
        togglePlaying() {
            if (!this.songReady) return
            this.setPlayingState(!this.playing)
        },
        // 下一曲
        next() {
            if (!this.songReady) return
            // 当最后一首的时候循环回去
            let index = this.currentIndex + 1
            if (index === this.playList.length) {
                index = 0
            }
            // 改变state中的currentIndex从而改变currentSong
            this.setCurrentIndex(index)
            this.setPlayingState(true)
            this.songReady = false
        },
        // 上一曲，逻辑同下一曲
        prev() {
            if (!this.songReady) return
            let index = this.currentIndex - 1
            if (index === -1) {
                index = this.playList.length - 1
            }
            this.setCurrentIndex(index)
            this.setPlayingState(true)
            this.songReady = false
        },
        // audio内置函数，判断是否加载完成
        ready() {
            this.songReady = true
        },
        // 防止报错后也无法点击按钮
        error() {
            this.songReady = true
        },
        // 获取歌曲当前播放时间情况
        updateTime(e) {
            this.currentTime = e.target.currentTime
        },
        // 用来将时间戳转换为分秒形式
        format(interVal) {
            interVal = interVal | 0
            const minute = interVal / 60 | 0
            const second = this._pad(interVal % 60)
            return `${minute}:${second}`
        },
        // 子组件出发时间，通知父组件进度条情况
        onProgressBarChange(percent) {
            this.$refs.audio.currentTime = this.currentSong.duration * percent
            this.setPlayingState(true)
        },
        // 用来补0
        _pad(num, n = 2) {
            let len = num.toString().length
            while (len < n) {
                num = '0' + num
                len++
            }
            return num
        },
        // 获取animation所需的便宜量
        _getPosAndScale() {
            const targetWidth = 40
            const paddingLeft = 40
            const paddingBottom = 30
            const paddingTop = 80
            const width = window.innerWidth * 0.8
            const scale = targetWidth / width
            const x = -(window.innerWidth / 2 - paddingLeft)
            const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
            return {
                x,
                y,
                scale
            }
        },
        ...mapMutations({
            setFullScreen: 'SET_FULL_SCREEN',
            setPlayingState: 'SET_PLAYING_STATE',
            setCurrentIndex: 'SET_CURRENT_INDEX'
        })
    }
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.player
    .normal-player
        position fixed
        left 0
        right 0
        top 0
        bottom 0
        z-index 150
        background-color $color-background
        .background
            position absolute
            left 0
            top 0
            width 100%
            height 100%
            z-index -1
            opacity 0.6
            filter blur(20px)
        .top
            position relative
            margin-bottom 25px
            .back
                position absolute
                top 0
                left 6px
                z-index 50
                .icon-back
                    display: block
                    padding: 9px
                    font-size: $font-size-large-x
                    color: $color-theme
                    transform: rotate(-90deg)
            .title
                width: 70%
                margin: 0 auto
                line-height: 40px
                text-align: center
                no-wrap()
                font-size: $font-size-large
                color: $color-text
            .subtitle
                line-height: 20px
                text-align: center
                font-size: $font-size-medium
                color: $color-text
        .middle
            position: fixed
            width: 100%
            top: 80px
            bottom: 170px
            white-space: nowrap
            font-size: 0
            .middle-l
                display: inline-block
                vertical-align: top
                position: relative
                width: 100%
                height: 0
                padding-top: 80%
                .cd-wrapper
                    position: absolute
                    left: 10%
                    top: 0
                    width: 80%
                    box-sizing: border-box
                    height: 100%
                    .cd
                        width: 100%
                        height: 100%
                        border-radius: 50%
                        .image
                            position: absolute
                            left: 0
                            top: 0
                            width: 100%
                            height: 100%
                            box-sizing: border-box
                            border-radius: 50%
                            border: 10px solid rgba(255, 255, 255, 0.1)
                        &.play
                            animation: rotate 20s linear infinite
                        &.pause
                            animation-play-state paused
                .playing-lyric-wrapper
                    width: 80%
                    margin: 30px auto 0 auto
                    overflow: hidden
                    text-align: center
                    .playing-lyric
                        height: 20px
                        line-height: 20px
                        font-size: $font-size-medium
                        color: $color-text-l
            .middle-r
                display: inline-block
                vertical-align: top
                width: 100%
                height: 100%
                overflow: hidden
                .lyric-wrapper
                    width: 80%
                    margin: 0 auto
                    overflow: hidden
                    text-align: center
                    .text
                        line-height: 32px
                        color: $color-text-l
                        font-size: $font-size-medium
                        &.current
                            color: $color-text
                    .pure-music
                        padding-top: 50%
                        line-height: 32px
                        color: $color-text-l
                        font-size: $font-size-medium
        .bottom
            position: absolute
            bottom: 50px
            width: 100%
            .dot-wrapper
                text-align: center
                font-size: 0
                .dot
                    display: inline-block
                    vertical-align: middle
                    margin: 0 4px
                    width: 8px
                    height: 8px
                    border-radius: 50%
                    background: $color-text-l
                    &.active
                        width: 20px
                        border-radius: 5px
                        background: $color-text-ll
            .progress-wrapper
                display: flex
                align-items: center
                width: 80%
                margin: 0px auto
                padding: 10px 0
                .time
                    color: $color-text
                    font-size: $font-size-small
                    flex: 0 0 30px
                    line-height: 30px
                    width: 30px
                    &.time-l
                        text-align: left
                    &.time-r
                        text-align: right
                .progress-bar-wrapper
                    flex: 1
            .operators
                display: flex
                align-items: center
                .icon
                    flex: 1
                    color: $color-theme
                    &.disable
                        color: $color-theme-d
                    i
                        font-size: 30px
                .i-left
                    text-align: right
                .i-center
                    padding: 0 20px
                    text-align: center
                    i
                        font-size: 40px
                .i-right
                    text-align: left
                .icon-favorite
                    color: $color-sub-theme
        &.normal-enter-active, &.normal-leave-active
            transition: all 0.4s
            .top, .bottom
                transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
        &.normal-enter, &.normal-leave-to
            opacity: 0
            .top
                transform: translate3d(0, -100px, 0)
            .bottom
                transform: translate3d(0, 100px, 0)
    .mini-player
        display: flex
        align-items: center
        position: fixed
        left: 0
        bottom: 0
        z-index: 180
        width: 100%
        height: 60px
        background: $color-highlight-background
        &.mini-enter-active, &.mini-leave-active
            transition: all 0.4s
        &.mini-enter, &.mini-leave-to
            opacity: 0
        .icon
            flex: 0 0 40px
            width: 40px
            height: 40px
            padding: 0 10px 0 20px
            .imgWrapper
                height: 100%
                width: 100%
                img
                    border-radius: 50%
                    &.play
                        animation: rotate 10s linear infinite
                    &.pause
                        animation-play-state: paused
        .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            .name
                margin-bottom: 2px
                no-wrap()
                font-size: $font-size-medium
                color: $color-text
            .desc
                no-wrap()
                font-size: $font-size-small
                color: $color-text-d
        .control
            flex: 0 0 30px
            width: 30px
            padding: 0 10px
            .icon-play-mini, .icon-pause-mini, .icon-playlist
                font-size: 30px
                color: $color-theme-d
            .icon-mini
                font-size: 32px
                position: absolute
                left: 0
                top: 0
@keyframes rotate
    0%
        transform: rotate(0)
    100%
        transform: rotate(360deg)
</style>
