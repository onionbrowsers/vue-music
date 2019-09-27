<template>
    <!-- 搜索框组件 -->
    <div class="search-box">
        <i class="icon-search"></i>
        <input ref="query" v-model="query" :placeholder="placeholder" class="box">
        <i @click="clearQuery" v-show="query" class="icon-dismiss"></i>
    </div>
</template>

<script>
// 节流函数
import {debounce} from 'common/js/util'

export default {
    props: {
        placeholder: {
            type: String,
            default: '搜索歌曲、歌手'
        }
    },
    data() {
        return {
            // input value值
            query: ''
        }
    },
    methods: {
        clearQuery() {
            this.query = ''
        },
        setQuery(query) {
            this.query = query
        },
        // 根据父组件的监听事件，来判断是否把手机键盘收起
        blur() {
            this.$refs.query.blur()
        }
    },
    created() {
        // 监听query值，当query改变时，派发事件，且将输入值传出去, debounce节流函数，防止多次调用接口
        this.$watch('query', debounce((newQuery) => {
            this.$emit('query', newQuery)
        }, 200))
    }
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'

.search-box
    display flex
    align-items center
    box-sizing border-box
    width 100%
    padding 0 6px
    height 40px
    background-color $color-highlight-background
    border-radius 6px
    .icon-search
        font-size 24px
        color $color-background
    .box
        flex 1
        margin 0 5px
        line-height 25px
        background-color $color-highlight-background
        color $color-text
        font-size $font-size-medium
        &::placeholder
            color $color-text-d
    .icon-dismiss
        font-size 16px
        color $color-background
</style>
