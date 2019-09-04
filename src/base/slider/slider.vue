<template>
    <div class="slider" ref="slider">
        <div class="slider-group" ref="sliderGroup">
            <!-- slot插槽，为了将父级中的数据v-for放入子组件内 -->
            <slot></slot>
        </div>
        <div class="dots">
            <span class="dot" :class="{active: currentPageIndex === index}" v-for="(item,index) in dots" :key="index"></span>
        </div>
    </div>
</template>
<script>
import BScroll from 'better-scroll'
import {addClass} from 'common/js/dom'

export default {
    props: {
        loop: {
            type: Boolean,
            default: true
        },
        autoPlay: {
            type: Boolean,
            default: true
        },
        interval: {
            type: Number,
            default: 4000
        }
    },
    data() {
        return {
            dots: [],
            currentPageIndex: 0
        }
    },
    mounted() {
        setTimeout(() => {
            this._setSliderWidth()
            this._initSlider()
            this._initDots()

            if (this.autoPlay) {
                this._play()
            }
        }, 20)

        window.addEventListener('resize', () => {
            if (!this.slider || !this.slider.enabled) {
                return
            }
            clearTimeout(this.resizeTimer)
            this.resizeTimer = setTimeout(() => {
                if (this.slider.isInTransition) {
                    this._onScrollEnd()
                } else {
                    if (this.autoPlay) {
                        this._play()
                    }
                }
                this.refresh()
            }, 60)
        })
    },
    // keep-alive 组件激活时调用。 该钩子在服务器端渲染期间不被调用。在vue对象存活的情况下，进入当前存在activated()函数的页面时，一进入页面就触发；可用于初始化页面数据等
    activated() {
        // 启用scroll
        this._setSliderWidth(true)
        this.slider.enable()
        let pageIndex = this.slider.getCurrentPage().pageX
        this.slider.goToPage(pageIndex, 0, 0)
        this.currentPageIndex = pageIndex
        if (this.autoPlay) {
            this._play()
        }
    },
    // keep-alive组件停用时调用，清除定时器
    deactivated() {
        // 禁用better-scroll
        this.slider.disable()
        clearTimeout(this.timer)
    },
    methods: {
        refresh() {
            if (this.slider) {
                this._setSliderWidth(true)
                this.slider.refresh()
            }
        },
        // 计算需要轮播所有dom的尺寸将其包裹住以便父级实现better-scroll resize为了防止屏幕宽度改变时重复多加两个宽度
        _setSliderWidth(resize) {
            this.children = this.$refs.sliderGroup.children
            let width = 0
            let sliderWidth = this.$refs.slider.clientWidth
            for (let i = 0; i < this.children.length; i++) {
                let child = this.children[i]
                addClass(child, 'slider-item')
                child.style.width = sliderWidth + 'px'
                width += sliderWidth
            }
            if (this.loop && !resize) {
                // 多加两个图片宽度以便无缝滚动
                width += 2 * sliderWidth
            }
            this.$refs.sliderGroup.style.width = width + 'px'
        },
        // 初始化BScroll
        _initSlider() {
            this.slider = new BScroll(this.$refs.slider, {
                scrollX: true,
                scrollY: false,
                momentum: false,
                snap: {
                    loop: this.loop,
                    threshold: 0.3,
                    speed: 400
                },
                click: true
            })

            // 确定当前轮播图片的索引，以便添加active
            this.slider.on('scrollEnd', this._onScrollEnd)

            this.slider.on('touchend', () => {
                if (this.autoPlay) {
                    this._play()
                }
            })

            // 手操作时，清除timer
            this.slider.on('beforeScrollStart', () => {
                if (this.autoPlay) {
                    clearTimeout(this.timer)
                }
            })
        },
        // 获取多少张图片，有多少个小的dot
        _initDots() {
            this.dots = new Array(this.children.length - 2)
        },
        _onScrollEnd() {
            let pageIndex = this.slider.getCurrentPage().pageX
            this.currentPageIndex = pageIndex
            if (this.autoPlay) {
                this._play()
            }
        },
        // 实现自动轮播
        _play() {
            clearTimeout(this.timer)
            this.timer = setTimeout(() => {
                this.slider.next()
            }, this.interval)
        }
    },
    destroyed() {
        this.slider.disable()
        clearTimeout(this.timer)
    }
}
</script>
<style lang="stylus" scoped>
    @import '~common/stylus/variable'

    .slider
        min-height 1px
        .slider-group
            position relative
            overflow hidden
            white-space nowrap
            .slider-item
                float left
                box-sizing border-box
                overflow hidden
                text-align center
            a
                display block
                width 100%
                overflow hidden
                text-decoration none
            img
                display block
                width 100%
        .dots
            position absolute
            right 0
            left 0
            bottom 12px
            text-align center
            font-size 0
            .dot
                display inline-block
                margin 0 4px
                width 8px
                height 8px
                border-radius 50%
                background-color $color-text-l
                &.active
                    width 20px
                    border-radius 5px
                    background-color $color-text-l;
</style>
