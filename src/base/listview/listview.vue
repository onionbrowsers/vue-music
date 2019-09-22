<template>
    <scroll class="listview"
            :data='data'
            ref="listview"
            :listenScroll='listenScroll'
            :probeType='probeType'
            @scroll="scroll">
        <ul>
            <li v-for="group in data" :key="group.title" class="list-group" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <li @click='selectItem(item)' v-for="item in group.items" :key="item.id" class="list-group-item">
                        <img class="avatar" v-lazy="item.avatar" alt="">
                        <span class="name">{{item.name}}</span>
                    </li>
                </ul>
            </li>
        </ul>
        <div class="list-shortcut" @touchstart.stop.prevent='onShortcutTouchStart'
        @touchmove.stop.prevent='onShortcutTouchMove'>
            <ul>
                <li v-for="(item,index) in shortcutList"
                    :key="index"
                    class="item"
                    :class="{current: currentIndex === index}"
                    :data-index='index'>
                    {{item}}
                </li>
            </ul>
        </div>
        <div class="list-fixed" v-show="this.scrollY < 0" ref='fixed'>
            <h1 class="fixed-title">{{fixedTitle}}</h1>
        </div>
        <div v-show='!data.length' class='loading-container'>
            <loading></loading>
        </div>
    </scroll>
</template>
<script>
import scroll from '@/base/scroll/scroll'
import {getData} from 'common/js/dom.js'
import Loading from '@/base/loading/loading'

const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30

export default {
    props: {
        data: {
            type: Array,
            default() {
                return []
            }
        }
    },
    computed: {
        shortcutList() {
            // 获取右侧展示数组
            return this.data.map(group => {
                // 将热门截取为热
                return group.title.substr(0, 1)
            })
        },
        fixedTitle() {
            // 用来获取定位顶部的title的名称
            return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
        }
    },
    data() {
        return {
            scrollY: -1,
            currentIndex: 0,
            diff: 0
        }
    },
    created() {
        // 储存点击时的Y值和移动的Y值和点击的当前索引值
        this.touch = {}
        // 监听scroll事件，获取滚动Y值
        this.listenScroll = true
        // 计算所有高度，用来左右联动，计算推移量，获取滚动到哪个右侧索引
        this.listHeight = []
        // 监听swipe（快速滑动事件）
        this.probeType = 3
    },
    watch: {
        data() {
            // 20ms延迟，等到data加载完毕
            setTimeout(() => {
                this._calculateHeight()
            }, 20)
        },
        // 根据listheight所计算的说有上下限高度，来判断滚动到哪一个区间内，从而记录当前索引
        scrollY(newY) {
            const listHeight = this.listHeight
            // 当向上滚动滚出范围时，处理当前索引为0
            if (newY > 0) {
                this.currentIndex = 0
                return
            }
            // 当在listheight范围内滚动时，判断newY（因为向下滚为负）在哪个上下限的区间内
            // 减一是因为，listheight中多了最下方的height下限
            for (let i = 0; i < listHeight.length - 1; i++) {
                let height1 = listHeight[i]
                let height2 = listHeight[i + 1]
                if (((-newY) >= height1 && (-newY) < height2)) {
                    this.currentIndex = i
                    // diff为下限与滚动距离的差距，newY为负
                    this.diff = height2 + newY
                    return
                }
            }
            // 当list滚出最下方时，处理当前索引为最后一个
            // 减二是因为，多了1个listheight下限
            this.currentIndex = listHeight.length - 2
        },
        // diff用来计算滚动的title与顶部fix的title之前（加上fixtitle的高度）的高度差，实现推移功能
        diff(newVal) {
            // 判断滚动后的diff值是不是还有差距且不大于fixtitle的高度
            let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
            // 如果fixedtop和此处的fixedtop相等就不用滚动
            // this.fiexedTop意义不懂
            if (this.fixedTop === fixedTop) {
                return
            }
            this.fixedTop = fixedTop
            this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
        }
    },
    components: {
        scroll,
        Loading
    },
    methods: {
        // 给父组件暴露better-scroll方法
        refresh() {
            this.$refs.listview.refresh()
        },
        // 用来触发自定义事件将所点击的歌手数据传给父级
        selectItem(item) {
            this.$emit('select', item)
        },
        // 右侧导航touch事件
        onShortcutTouchStart(e) {
            // 根据dataSet属性获取当前的索引值
            let anchorIndex = getData(e.target, 'index')
            // 获取当前点击的Y值
            let firstTouch = e.touches[0]
            // 记录Y1和当前点击的索引
            this.touch.y1 = firstTouch.pageY
            this.touch.anchorIndex = anchorIndex
            this._scrollTo(anchorIndex)
        },
        // 右侧导航touchmove事件
        onShortcutTouchMove(e) {
            // 获取移动Y值
            let firstTouch = e.touches[0]
            // 记录移动Y值
            this.touch.y2 = firstTouch.pageY
            // 根据移动的两个Y值的插值与每个li的高度的比值判断加了几个索引  | 0是为了向下取整
            let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
            let anchorIndex = +this.touch.anchorIndex + delta
            this._scrollTo(anchorIndex)
        },
        // 根据自定义事件拿到滚动的Y值
        scroll(pos) {
            this.scrollY = pos.y
        },
        // 内置滚动方法，用来根据右侧导航滚动到左侧对应位置
        _scrollTo(index) {
            // 点击的位置或滑动的位置高出右侧导航所作的边界处理
            if (index < 0) {
                index = 0
            } else if (index > this.listHeight.length - 2) {
                index = this.listHeight.length - 2
            }
            if (!index && index !== 0) {
                return
            }
            // 点击右侧左侧跟随滚动
            this.scrollY = -this.listHeight[index]
            this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
        },
        // 获取左侧菜单所有的上下边界，会比li多加一个，因为所有li都被包含在内
        _calculateHeight() {
            this.listHeight = []
            const list = this.$refs.listGroup
            let height = 0
            this.listHeight = [0]
            for (let i = 0; i < list.length; i++) {
                let item = list[i]
                height += item.clientHeight
                this.listHeight.push(height)
            }
        }
    }
}
</script>
<style lang="stylus" scoped>
@import '~common/stylus/variable'
    .listview
        position relative
        width 100%
        height  100%
        overflow hidden
        background-color $color-background
        .list-group
            padding-bottom 30px
            .list-group-title
                height 30px
                line-height 30px
                padding-left 20px
                font-size $font-size-small
                color $color-text-l
                background-color $color-highlight-background
            .list-group-item
                display flex
                align-items center
                padding 20px 0 0 30px
                .avatar
                    width 50px
                    height 50px
                    border-radius 50%
                .name
                    margin-left 20px
                    color $color-text-l
                    font-size $font-size-medium
        .list-shortcut
            position absolute
            z-index 30
            right 0
            top 50%
            transform translateY(-50%)
            width 20px
            padding 20px 0
            border-radius 10px
            text-align center
            background-color $color-background-d
            font-family Arial, Helvetica, sans-serif
            .item
                padding 3px
                line-height 1
                color $color-text-l
                font-size: $font-size-small
                &.current
                    color $color-theme
        .list-fixed
            position absolute
            top -1px
            left 0
            width 100%
            .fixed-title
                height 30px
                line-height 30px
                padding-left 20px
                font-size $font-size-small
                color $color-theme
                background $color-highlight-background
            .loading-container
                position absolute
                width 100%
                top 50%
                transform translateY(-50%)
</style>
