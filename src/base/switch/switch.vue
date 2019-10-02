<template>
    <!-- 导航栏切换组件 -->
    <ul class="switches">
        <li
            @click="switchItem(index)"
            class="switch-item"
            :class="{'active': currentIndex === index}"
            v-for="(item,index) in switches"
            :key="index">
            <span>{{item.name}}</span>
        </li>
    </ul>
</template>

<script>
export default {
    props: {
        // 导航栏数量
        switches: {
            type: Array,
            default() {
                return []
            }
        },
        // 当前导航栏
        currentIndex: {
            type: Number,
            default: 0
        }
    },
    methods: {
        switchItem(index) {
            this.$emit('switch', index)
        }
    }
}
</script>

<style lang="stylus" scoped>
@import "~common/stylus/variable"
.switches
    display flex
    align-items center
    width 240px
    margin 0 auto
    border 1px solid $color-highlight-background
    border-radius 5px
    .switch-item
        flex 1
        padding 8px
        text-align center
        font-size $font-size-medium
        color $color-text-d
        &.active
            background $color-highlight-background
            color $color-text
</style>
