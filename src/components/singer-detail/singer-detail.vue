<template>
    <div class="singer-detail">

    </div>
</template>

<script>
// vuex获取vuex中state对象中的数据的语法糖
import {mapGetters} from 'vuex'

export default {
    created() {
        console.log(this.singer)
    },
    computed: {
        // 扩展运算符写法，获取数据传参为数组
        ...mapGetters([
            'singer'
        ])
    }
}
</script>

<style lang="stylus" scoped>
    @import "~common/stylus/variable";

    .singer-detail
        position fixed
        z-index 100
        top 0
        left 0
        bottom 0
        right 0
        background-color $color-background
</style>