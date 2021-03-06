<template>
    <div ref='wrapper'>
        <slot></slot>
    </div>
</template>
<script>
import BScroll from 'better-scroll'
export default {
    props: {
        // 实时获取滚动位置
        probeType: {
            type: Number,
            default: 1
        },
        click: {
            type: Boolean,
            default: true
        },
        data: {
            type: Array
        },
        listenScroll: {
            type: Boolean,
            default: false
        },
        // 是否有上拉加载
        pullup: {
            type: Boolean,
            default: false
        },
        // 当搜索结果展示后，监听滚动前事件，为了将移动端手机的键盘收起
        beforeScroll: {
            type: Boolean,
            default: false
        },
        // scroll组件延迟刷新时间，为了兼容transition-group动画的100ms时间
        refreshDelay: {
            type: Number,
            default: 20
        }
    },
    mounted() {
        setTimeout(() => {
            this._initScroll()
        }, 20)
    },
    methods: {
        _initScroll() {
            if (!this.$refs.wrapper) {
                return
            }
            this.scroll = new BScroll(this.$refs.wrapper, {
                probeType: this.probeType,
                click: this.click
            })
            // 用来监听scroll事件
            if (this.listenScroll) {
                let me = this
                this.scroll.on('scroll', (pos) => {
                    me.$emit('scroll', pos)
                })
            }
            // 判断是否上来加载
            if (this.pullup) {
                // 监听滑动结束事件
                this.scroll.on('scrollEnd', () => {
                    // 因为是负值，所以如果滑动距离小于底部上面50距离即可判定到达底部，派发到达底部事件
                    if (this.scroll.y <= this.scroll.maxScrollY + 50) {
                        this.$emit('scrollToEnd')
                    }
                })
            }

            // 当开始滚动前，派发给父组件事件
            if (this.beforeScroll) {
                this.scroll.on('beforeScollStart', () => {
                    this.$emit('beforeScroll')
                })
            }
        },
        // 二次封装scroll方法
        enable() {
            this.scroll && this.scroll.enable()
        },
        disable() {
            this.scroll && this.scroll.disable()
        },
        refresh() {
            this.scroll && this.scroll.refresh()
        },
        // 调到指定位置
        scrollTo() {
            this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
        },
        // 调到指定dom位置
        scrollToElement() {
            this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
        }
    },
    watch: {
        data() {
            setTimeout(() => {
                this.refresh()
            }, this.refreshDelay)
        }
    }
}
</script>
<style lang="stylus" scoped>

</style>
