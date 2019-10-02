<template>
    <div class="search">
        <div class="search-box-wrapper">
            <search-box ref="searchBox" @query='onQueryChange'></search-box>
        </div>
        <div ref="shortCutWrapper" class="shortcut-wrapper" v-show="!query">
            <scroll :refreshDelay='100' class="shortcut" ref="shortCut" :data='shortCut'>
                <div>
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
            </scroll>
        </div>
        <div ref="searchResult" class="search-result" v-show="query">
            <suggest ref="suggest" @select="saveSearch" @listScroll='blurInput' :query='query'></suggest>
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
import {mapActions} from 'vuex'
import scroll from '@/base/scroll/scroll'
import {playlistMixin, searchMixin} from 'common/js/mixin'

export default {
    mixins: [playlistMixin, searchMixin],
    components: {
        searchBox,
        suggest,
        searchList,
        confirm,
        scroll
    },
    data() {
        return {
            hotKey: []
        }
    },
    computed: {
        shortCut() {
            return this.hotKey.concat(this.searchHistory)
        }
    },
    watch: {
        // 当搜索框里改变时，如果清空，重新刷新滚动组件
        query(newQuery) {
            if (!newQuery) {
                setTimeout(() => {
                    this.$refs.shortCut.refresh()
                }, 20)
            }
        }
    },
    created() {
        this._getHotkey()
    },
    methods: {
        // 当底部有mini播放器时，将bottom设为60露出底层的数据
        handlePlaylist(playlist) {
            const bottom = playlist.length > 0 ? '60px' : 0
            this.$refs.shortCutWrapper.style.bottom = bottom
            this.$refs.shortCut.refresh()
            this.$refs.searchResult.style.bottom = bottom
            this.$refs.suggest.refresh()
        },
        // 获取热门搜索关键词
        _getHotkey() {
            getHotKey().then(res => {
                if (res.code === ERR_OK) {
                    this.hotKey = res.data.hotkey.slice(0, 10)
                }
            })
        },
        showConfirm() {
            this.$refs.confirm.show()
        },
        ...mapActions(['clearSearchHistory'])
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