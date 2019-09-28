<template>
    <div class="search">
        <div class="search-box-wrapper">
            <search-box ref="searchBox" @query='onQueryChange'></search-box>
        </div>
        <div class="shortcut-wrapper" v-show="!query">
            <div class="shortcut">
                <div class="hot-key">
                    <h1 class="title">热门搜索</h1>
                    <ul v-show="hotKey.length">
                        <li @click="addQuery(item.k)" class="item" v-for="(item, index) in hotKey" :key="index">
                            <span>{{item.k}}</span>
                        </li>
                    </ul>
                </div>
                <!-- 历史数据列表展示 -->
                <div class="search-history" v-show="searchHistory.length">
                    <h1 class="title">
                        <span class="text">搜索历史</span>
                        <span class="clear" @click="showConfirm">
                            <i class="icon-clear"></i>
                        </span>
                    </h1>
                    <searchList @delete='deleteOne' @select='addQuery' :searches='searchHistory'></searchList>
                </div>
            </div>
        </div>
        <div class="search-result" v-show="query">
            <suggest @select="saveSearch" @listScroll='blurInput' :query='query'></suggest>
        </div>
        <confirm @confirm='clearSearchHistory' ref="confirm" text='是否清空搜索历史记录'></confirm>
        <router-view></router-view>
    </div>
</template>
<script>
import searchBox from '@/base/search-box/search-box'
import confirm from '@/base/confirm/confirm'
import searchList from '@/base/search-list/search-list'
import suggest from '@/components/suggest/suggest'
import {getHotKey} from '@/api/search'
import {ERR_OK} from '@/api/config'
import {mapActions, mapGetters} from 'vuex'

export default {
    components: {
        searchBox,
        suggest,
        searchList,
        confirm
    },
    data() {
        return {
            hotKey: [],
            query: ''
        }
    },
    computed: {
        ...mapGetters([
            'searchHistory'
        ])
    },
    created() {
        this._getHotkey()
    },
    methods: {
        // 获取热门搜索关键词
        _getHotkey() {
            getHotKey().then(res => {
                if (res.code === ERR_OK) {
                    this.hotKey = res.data.hotkey.slice(0, 10)
                }
            })
        },
        // 调用子组件设置点击热门关键词的文本，传入到input中
        addQuery(query) {
            this.$refs.searchBox.setQuery(query)
        },
        // 接受改变的query值，传给suggest组件，来调用接口
        onQueryChange(query) {
            this.query = query
        },
        // 当监听到子组件事件后，调用子组件方法，收起键盘
        blurInput() {
            this.$refs.searchBox.blur()
        },
        // 调用Action派发mutation来改变显示的数据
        saveSearch() {
            this.saveSearchHistory(this.query)
        },
        deleteOne(item) {
            this.delectSearchHistory(item)
        },
        showConfirm() {
            this.$refs.confirm.show()
        },
        ...mapActions(['saveSearchHistory', 'delectSearchHistory', 'clearSearchHistory'])
    }
}
</script>
<style lang="stylus">
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.search
    .search-box-wrapper
        margin 20px
    .shortcut-wrapper
        position fixed
        top 178px
        bottom 0
        width 100%
        .shortcut
            height 100%
            overflow hidden
            .hot-key
                margin 0 20px 20px
                .title
                    margin-bottom 20px
                    font-size $font-size-medium
                    color $color-text-l
                .item
                    display inline-block
                    padding 5px 10px
                    margin 0 20px 10px 0
                    border-radius 6px
                    background-color $color-highlight-background
                    font-size $font-size-medium
                    color $color-text-d
            .search-history
                position relative
                margin 0 20px
                .title
                    display flex
                    align-items center
                    height 40px
                    font-size $font-size-medium
                    color $color-text-l
                    .text
                        flex 1
                    .clear
                        extend-click()
                        .icon-clear
                            font-size $font-size-medium
                            color $color-text-d
    .search-result
        position fixed
        width 100%
        top 178px
        bottom 0
</style>