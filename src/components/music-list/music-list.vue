<template>
    <!-- 歌手或者某一榜单详情页 -->
    <div class="music-list">
        <div class="back" @click="back">
            <i class="icon-back"></i>
        </div>
        <h1 class="title" v-html="title"></h1>
        <div class="bg-image" :style="bgStyle" ref="bgImage">
            <div class="play-wrapper">
                <div class="play" @click='random' v-show="songs.length > 0" ref="play">
                    <i class="icon-play"></i>
                    <span class="text">随机播放全部</span>
                </div>
            </div>
            <div class="filter" ref="filter"></div>
        </div>
        <div class="bg-layer" ref="layer"></div>
        <scroll @scroll="scroll" :data='songs' :probe-type='probeType' :listen-scroll='listenScroll' class="list" ref="list">
            <div class="song-list-wrapper">
                <song-list @select="selectItem" :songs='songs'></song-list>
            </div>
            <div class="loading-container" v-show="!songs.length">
                <loading></loading>
            </div>
        </scroll>
    </div>
</template>

<script>
import scroll from '@/base/scroll/scroll'
import songList from '@/base/song-list/song-list'
import {prefixStyle} from 'common/js/dom'
import loading from '@/base/loading/loading'
import {mapActions} from 'vuex'
import {playlistMixin} from 'common/js/mixin'

// 设置歌曲滑动后留下的最小高度
const RESERVED_HEIGHT = 40
const transform = prefixStyle('transform')

export default {
    // 添加mixin
    mixins: [playlistMixin],
    components: {
        scroll,
        songList,
        loading
    },
    props: {
        bgImage: {
            type: String,
            default: ''
        },
        songs: {
            type: Array,
            default() {
                return []
            }
        },
        title: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            scrollY: 0
        }
    },
    // 监听滚动事件，不用写到data里是不需要用来更新dom或者改变，不用添加get，set
    created() {
        this.probeType = 3
        this.listenScroll = true
    },
    mounted() {
        // 用来获取背景图片高度
        this.imageHeight = this.$refs.bgImage.clientHeight
        // 获取背景（即layer）滚动的最高位置，不能滚出屏幕
        this.minTrasnlateY = -this.imageHeight + RESERVED_HEIGHT
        // 一开始歌曲列表的高度，不能高过背景图
        this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    computed: {
        bgStyle() {
            return `background-image: url(${this.bgImage})`
        }
    },
    watch: {
        scrollY(newY) {
            let zIndex = 0
            // 当开始滚动时，如果newY即滚动值比最小值还小时，背景固定不在滚动
            let translateY = Math.max(this.minTrasnlateY, newY)
            // 缩放
            let scale = 1
            // 模糊
            let blur = 0
            this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`
            // 绝对值，缩放比例
            const percent = Math.abs(newY / this.imageHeight)
            if (newY > 0) {
                // 即向下拉的时候，放大背景图片
                scale = 1 + percent
                zIndex = 1
            } else {
                // 向上滑的时候，背景图片模糊程度
                blur = Math.min(20 * percent, 20)
            }
            this.$refs.filter.style['filter'] = `blur(${blur}px)`
            this.$refs.filter.style['webkitFilter'] = `blur(${blur}px)`
            // 当newY<最小值的时候
            if (newY < this.minTrasnlateY) {
                zIndex = 10
                // 首先把背景图的padding取代为图片的横顶高度，即40px，随即按钮隐藏
                this.$refs.bgImage.style.paddingTop = 0
                this.$refs.bgImage.style.height = RESERVED_HEIGHT + 'px'
                this.$refs.play.style.display = 'none'
            } else {
                // 当滑动距离滑下来的时候，把padding-top设置回原来背景图的大小，其他都设置原来大小
                this.$refs.bgImage.style.paddingTop = '70%'
                this.$refs.bgImage.style.height = 0
                this.$refs.play.style.display = ''
            }
            this.$refs.bgImage.style.zIndex = zIndex
            this.$refs.bgImage.style[transform] = `scale(${scale})`
        }
    },
    methods: {
        // 覆盖mixin中的方法，来显示被挡住的dom
        handlePlaylist(playlist) {
            const bottom = playlist.length > 0 ? '60px' : ''
            this.$refs.list.$el.style.bottom = bottom
            this.$refs.list.refresh()
        },
        scroll(pos) {
            this.scrollY = pos.y
        },
        back() {
            this.$router.back()
        },
        // 触发action，改变state中的播放状态，全屏，播放列表等数据
        selectItem(item, index) {
            this.selectPlay({
                list: this.songs,
                index: index
            })
        },
        // 点击页面内的随机播放全部时触发action，改变多个mutataions，播放且得到随机数组
        random() {
            this.randomPlay({list: this.songs})
        },
        ...mapActions(['selectPlay', 'randomPlay'])
    }
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.music-list
    position fixed
    z-index 100
    top 0
    left 0
    bottom 0
    right 0
    background-color $color-background
    .back
        position absolute
        top 0
        left 6px
        z-index 50
        .icon-back
            display block
            padding 10px
            font-size $font-size-large-x
            color $color-theme
    .title
        position absolute
        top 0
        left 10%
        z-index 40
        width 80%
        no-wrap()
        text-align center
        line-height 40px
        font-size $font-size-large
        color $color-text
    .bg-image
        position relative
        width: 100%
        height 0
        padding-top 70%
        transform-origin top
        background-size cover
        .play-wrapper
            position absolute
            bottom 20px
            z-index 50
            width 100%
            .play
                box-sizing border-box
                width 135px
                padding 7px 0
                margin 0 auto
                text-align center
                border 1px solid $color-theme
                color $color-theme
                border-radius 10px
                font-size 0
                .icon-play
                    display inline-block
                    vertical-align middle
                    margin-right 6px
                    font-size $font-size-medium-x
                .text
                    display inline-block
                    vertical-align middle
                    font-size $font-size-small
        .filter
            position absolute
            top 0
            left 0
            width 100%
            height 100%
            background-color rgba(7,17,27,0.4)
    .bg-layer
        position: relative
        height: 100%
        background: $color-background
    .list
        position: absolute
        top: 0
        bottom: 0
        width: 100%
        background: $color-background
        .song-list-wrapper
            padding: 20px 30px
        .loading-container
            position: absolute
            width: 100%
            top: 50%
            transform: translateY(-50%)
</style>