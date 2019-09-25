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
            }, 20)
        }
    }
}
</script>
<style lang="stylus" scoped>

</style>
