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
                <div
                    class="middle"
                    @touchstart.prevent='middleTouchStart'
                    @touchmove.prevent='middleTouchMove'
                    @touchend.prevent.stop='middleTouchEnd'>
                    <div class="middle-l" ref="middleL">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <div class="cd" :class="cdCls">
                                <img :src="currentSong.image" alt="" class="image">
                            </div>
                        </div>
                        <!-- cd下歌词dom -->
                        <div class="playing-lyric-wrapper">
                            <div class="playing-lyri">
                                {{playingLyric}}
                            </div>
                        </div>
                    </div>
                    <!-- 所有歌词的dom -->
                    <scroll class="middle-r" ref="lyricList" :data='currentLyric && currentLyric.lines'>
                        <div class="lyric-wrapper">
                            <div v-if="currentLyric">
                                <p
                                    ref="lyricLine"
                                    class="text"
                                    :class="{'current': currentLineNum === index}"
                                    v-for="(line,index) in currentLyric.lines"
                                    :key="line.time">
                                    {{line.txt}}
                                </p>
                            </div>
                        </div>
                    </scroll>
                </div>
                <div class="bottom">
                    <div class="dot-wrapper">
                        <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
                        <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
                    </div>
                    <div class="progress-wrapper">
                        <span class="time time-l">{{format(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <progress-bar @percentChange='onProgressBarChange' :percent="percent"></progress-bar>
                        </div>
                        <span class="time time-r">{{format(currentSong.duration)}}</span>
                    </div>
                    <div class="operators">
                        <div class="icon i-left">
                            <i :class="iconMode" @click="changeMode"></i>
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
                    <progress-circle :percent='percent'>
                        <i @click.stop.prevent="togglePlaying" class="icon-mini" :class="miniIcon"></i>
                    </progress-circle>
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
            @timeupdate="updateTime"
            @ended="end">
        </audio>
    </div>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
// 用js动态写aniamtion的库
import animations from 'create-keyframe-animation'
import {prefixStyle} from 'common/js/dom'
import progressBar from '@/base/progress-bar/progress-bar'
import progressCircle from '@/base/progress-circle/progress-circle'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import Lyric from 'lyric-parser'
import scroll from '@/base/scroll/scroll'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')

export default {
    components: {
        progressBar,
        progressCircle,
        scroll
    },
    data() {
        return {
            // 判断当前歌曲是否缓存完整
            songReady: false,
            currentTime: 0,
            currentLyric: null,
            // 当前歌词播放行数
            currentLineNum: 0,
            // 左右滑动类名
            currentShow: 'cd',
            // cd下的歌词
            playingLyric: ''
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
        // 改变播放模式的图标
        iconMode() {
            return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
        },
        ...mapGetters([
            'fullScreen',
            'playList',
            'currentSong',
            'playing',
            'currentIndex',
            'mode',
            'sequenceList'
        ])
    },
    watch: {
        // 监听当前歌曲，当歌曲改变时，播放歌曲
        currentSong(newSong, oldSong) {
            // 如果切换歌曲后与当前歌曲是同一首歌曲，就直接返回，不触发重新播放
            if (newSong.id === oldSong.id) return
            if (this.currentLyric) {
                this.currentLyric.stop()
            }
            setTimeout(() => {
                this.$refs.audio.play()
                // 获取歌词
                this.getCurLyric()
            }, 1000)
        },
        // 监听vuex中的playing的值，决定歌曲是否暂停
        playing(newPlaying) {
            const audio = this.$refs.audio
            this.$nextTick(() => {
                newPlaying ? audio.play() : audio.pause()
            })
        }
    },
    created() {
        this.touch = {}
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
            // 当切换歌曲播放状态时，同时改变歌词播放状态
            if (this.currentLyric) {
                this.currentLyric.togglePlay()
            }
        },
        // 下一曲
        next() {
            if (!this.songReady) return
            // 处理边界条件，当歌曲列表为1的情况
            if (this.playList.length === 1) {
                this.loop()
            } else {
                // 当最后一首的时候循环回去
                let index = this.currentIndex + 1
                if (index === this.playList.length) {
                    index = 0
                }
                // 改变state中的currentIndex从而改变currentSong
                this.setCurrentIndex(index)
                this.setPlayingState(true)
                this.songReady = false
            }
        },
        // 上一曲，逻辑同下一曲
        prev() {
            if (!this.songReady) return
            if (this.playList.length === 1) {
                this.loop()
            } else {
                let index = this.currentIndex - 1
                if (index === -1) {
                    index = this.playList.length - 1
                }
                this.setCurrentIndex(index)
                this.setPlayingState(true)
                this.songReady = false
            }
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
            const currentTime = this.currentSong.duration * percent
            this.$refs.audio.currentTime = this.currentSong.duration * percent
            if (!this.playing) {
                this.togglePlaying()
            }
            // 点击进度条时，歌词随之定位到相应位置
            if (this.currentLyric) {
                this.currentLyric.seek(currentTime * 1000)
            }
        },
        // 改变播放模式
        changeMode() {
            // 取3的余数，来计算当前播放模式
            const mode = (this.mode + 1) % 3
            this.setPlayMode(mode)
            let list = null
            if (mode === playMode.random) {
                list = shuffle(this.sequenceList)
            } else {
                list = this.sequenceList
            }
            this._resetCurrentIndex(list)
            this.setPlayList(list)
        },
        // audio内置函数，监听歌曲结束
        end() {
            if (this.mode === playMode.loop) {
                this.loop()
            } else {
                this.next()
            }
        },
        // 单曲循环
        loop() {
            this.$refs.audio.currentTime = 0
            this.$refs.audio.play()
            if (this.currentLyric) {
                this.currentLyric.seek(0)
            }
        },
        // 获取歌词
        getCurLyric() {
            this.currentSong.getCurLyric().then(res => {
                // Lyric为第三方库，用来格式化歌词
                this.currentLyric = new Lyric(res, this.handleLyric)
                // 如果当前是播放，歌词随之一同播放
                if (this.playing) {
                    this.currentLyric.play()
                }
            }).catch(() => {
                // 没有歌词情况下，全部都置为初始状态
                this.currentLyric = null
                this.playingLyric = ''
                this.currentLineNum = 0
            })
        },
        // 格式化歌词的回调函数，参数是一个对象
        handleLyric({lineNum, txt}) {
            // 获取当前播放行数，用来高亮当前播放歌词
            this.currentLineNum = lineNum
            // 当歌词播放超过5行的时候，滚动歌词，使其一直在中间位置
            if (lineNum > 5) {
                // 获取当前歌词的dom节点
                let lineEl = this.$refs.lyricLine[lineNum - 5]
                this.$refs.lyricList.scrollToElement(lineEl, 1000)
            } else {
                this.$refs.lyricList.scrollTo(0, 0, 1000)
            }
            this.playingLyric = txt
        },
        // 触摸事件，用来改变cd和歌词页面互换
        middleTouchStart(e) {
            // 记录初始值
            this.touch.initiated = true
            const touch = e.touches[0]
            // 记录开始点击位置
            this.touch.startX = touch.pageX
            this.touch.startY = touch.pageY
        },
        middleTouchMove(e) {
            // 没初始值直接return
            if (!this.touch.initiated) return
            const touch = e.touches[0]
            // 获取滑动的x,y偏移量
            const detlaX = touch.pageX - this.touch.startX
            const detlaY = touch.pageY - this.touch.startY
            // 如果滑动Y的偏移量大于X即为滑动歌词，不切换页面
            if (Math.abs(detlaY) > Math.abs(detlaX)) return
            const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
            // 最大值不能超过0，即滑动到歌词已经出来贴在左边后，也不能在滑动了
            // 最小值不能超过负的屏幕宽度，即到了最右面，也不能在滑动出去
            const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + detlaX))
            // 获取滑动距离与整个宽度的比值
            this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
            this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
            this.$refs.lyricList.$el.style[transitionDuration] = 0
            this.$refs.middleL.style.opacity = 1 - this.touch.percent
            this.$refs.middleL.style[transitionDuration] = 0
        },
        middleTouchEnd(e) {
            let offsetWidth
            let opacity
            // 当前页面如果是cd，向左划的比值超过20%即判定到歌词页面下
            if (this.currentShow === 'cd') {
                if (this.touch.percent > 0.2) {
                    offsetWidth = -window.innerWidth
                    opacity = 0
                    this.currentShow = 'lyric'
                    // 滑动后清空percent值，防止点击触发该函数
                    this.$set(this.touch, 'percent', 1)
                } else {
                    opacity = 1
                    offsetWidth = 0
                }
            } else {
                // 反之右滑超过20%，回到cd页面
                if (this.touch.percent < 0.8) {
                    offsetWidth = 0
                    opacity = 1
                    this.currentShow = 'cd'
                    this.$set(this.touch, 'percent', 0)
                } else {
                    opacity = 0
                    offsetWidth = -window.innerWidth
                }
            }
            const time = 300
            this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
            this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
            this.$refs.middleL.style.opacity = opacity
            this.$refs.middleL.style[transitionDuration] = `${time}ms`
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
        // 当模式为随机时，要获取到当前歌曲的index并且将state中的index重新赋值，否则改变模式时会触发歌曲切换且重新播放
        _resetCurrentIndex(list) {
            let index = list.findIndex((item) => {
                return item.id === this.currentSong.id
            })
            this.setCurrentIndex(index)
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
            setCurrentIndex: 'SET_CURRENT_INDEX',
            setPlayMode: 'SET_PLAY_MODE',
            setPlayList: 'SET_PLAYLIST'
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
                top: 1px
@keyframes rotate
    0%
        transform: rotate(0)
    100%
        transform: rotate(360deg)
</style>
