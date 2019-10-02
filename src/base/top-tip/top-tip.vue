<template>
    <!-- 提示框组件 -->
    <transition name="drop">
        <div class="top-tip" v-show="showFlag" @click.stop="hide">
            <slot></slot>
        </div>
    </transition>
</template>

<script>
export default {
    data() {
        return {
            showFlag: false
        }
    },
    methods: {
        show() {
            this.showFlag = true
            // 当展示头部提示框时，过2s延迟自动隐藏
            clearTimeout(this.timer)
            this.timer = setTimeout(() => {
                this.hide()
            }, 2000)
        },
        hide() {
            this.showFlag = false
        }
    }
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'

.top-tip
    position fixed
    top 0
    width 100%
    z-index 500
    background-color $color-dialog-background
    &.drop-enter-active, &.drop-leave-active
        transition all 0.3s
    &.drop-enter. &.drop-leave-to
        transform translate3d(0, -100%, 0)
</style>
