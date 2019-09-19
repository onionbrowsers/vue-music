<template>
    <!-- 进度条组件 -->
    <div class="progress-bar" ref="progressBar" @click="progressClick">
        <div class="bar-inner">
            <div class="progress" ref="progress"></div>
            <div
                class="progress-btn-wrapper"
                @touchstart.prevent='progressTouchStart'
                @touchmove.prevent='progressTouchMove'
                @touchend='progressTouchEnd'
                ref="progressBtn">
                <div class="progress-btn"></div>
            </div>
        </div>
    </div>
</template>

<script>
import {prefixStyle} from 'common/js/dom'

// 按钮宽度
const progressBtnWidth = 16
const transform = prefixStyle('transform')

export default {
    props: {
        percent: {
            type: Number,
            default: 0
        }
    },
    watch: {
        // 监听百分比，从而改变按钮偏移和进度条进度情况
        percent(newPercent) {
            if (newPercent >= 0 && !this.touch.initiated) {
                const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
                const offsetWidth = newPercent * barWidth
                this._offset(offsetWidth)
            }
        }
    },
    created() {
        // 定义一个用来存储推拽距离，是否初始化拖拽情况的对象
        this.touch = {}
    },
    methods: {
        // 点击进度条的事件
        progressClick(e) {
            this._offset(e.offsetX)
            this._triggerPercent()
        },
        progressTouchStart(e) {
            this.touch.initiated = true
            this.touch.startX = e.touches[0].pageX
            // 获取点击时进度条的宽度
            this.touch.left = this.$refs.progress.clientWidth
        },
        progressTouchMove(e) {
            if (!this.touch.initiated) return
            // 获取拖拽了多长的距离
            const deltaX = e.touches[0].pageX - this.touch.startX
            const offsetWidth = Math.min(Math.max(0, this.touch.left + deltaX), this.$refs.progressBar.clientWidth)
            this._offset(offsetWidth)
        },
        progressTouchEnd() {
            this.touch.initiated = false
            this._triggerPercent()
        },
        // 根据所传的值，改变进度条宽度和按钮的偏移量，从而改变进度条
        _offset(offsetWidth) {
            this.$refs.progress.style.width = `${offsetWidth}px`
            this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        },
        // 获取点击或拖动的进度占整个进度条的百分比，触发自定义事件，告诉父级要播放的时间
        _triggerPercent() {
            const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
            const percent = this.$refs.progress.clientWidth / barWidth
            this.$emit('percentChange', percent)
        }
    }
}
</script>
<style lang="stylus" scoped>
    @import '~common/stylus/variable'

    .progress-bar
        height 30px
        .bar-inner
            position relative
            top 13px
            height 4px
            background rgba(0, 0, 0, 0.3)
            .progress
                position absolute
                height 100%
                background-color $color-theme
            .progress-btn-wrapper
                position absolute
                left -8px
                top -13px
                width 30px
                height 30px
                .progress-btn
                    position relative
                    top 7px
                    left 7px
                    box-sizing border-box
                    width 16px
                    height 16px
                    border 3px solid $color-text
                    border-radius 50%
                    background $color-theme
</style>
