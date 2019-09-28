<template>
    <!-- 搜索历史展示组件 -->
    <div class="search-list" v-show="searches.length">
        <ul>
            <li @click="selectItem(item)" class="search-item" v-for="(item,index) in searches" :key="index">
                <span class="text">{{item}}</span>
                <span class="icon" @click.stop="deleteOne(item)">
                    <span class="icon-delete"></span>
                </span>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        // 存储搜索历史数据
        searches: {
            type: Array,
            default() {
                return []
            }
        }
    },
    methods: {
        selectItem(item) {
            this.$emit('select', item)
        },
        deleteOne(item) {
            this.$emit('delete', item)
        }
    }
}
</script>
<style lang="stylus" scoped>
    @import '~common/stylus/variable'

    .search-list
        .search-item
            display flex
            align-items center
            height 40px
            .text
                flex 1
                color $color-text-l
            .icon
                extend-click()
                .icon-delete
                    font-size $font-size-small
                    color $color-text-d
</style>
