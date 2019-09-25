<template>
    <!-- 接受父组件query来调用接口展示搜索的数据 -->
    <scroll
        class="suggest"
        :data='result'
        :pullup='pullup'
        @scrollToEnd='searchMore'
        ref="suggest">
        <ul class="suggest-list">
            <li class="suggest-item" v-for="(item,index) in result" :key="index">
                <div class="icon">
                    <i :class="getIconCls(item)"></i>
                </div>
                <div class="name">
                    <p class="text" v-html="getDisplayName(item)"></p>
                </div>
            </li>
            <loading v-show="hasMore" title=""></loading>
        </ul>
    </scroll>
</template>

<script>
import {search} from '@/api/search'
import {ERR_OK} from '@/api/config'
import { createSong, isValidMusic } from '@/common/js/song'
import scroll from '@/base/scroll/scroll'
import loading from '@/base/loading/loading'

const TYPE_SINGER = 'singer'

export default {
    components: {
        scroll,
        loading
    },
    props: {
        query: {
            type: String,
            default: ''
        },
        // 搜索情况下，是否展示歌手名
        showSinger: {
            type: Boolean,
            default: true
        },
        // 接口每一次搜索返回的列表数量
        perpage: {
            type: Number,
            default: 20
        }
    },
    data() {
        return {
            page: 1,
            result: [],
            pullup: true,
            // 是否还可以下拉刷新，是否达到搜索的最大值
            hasMore: true
        }
    },
    methods: {
        // 用来接收调用接口返回的数据
        search() {
            // 第一次调用初始化
            this.hasMore = true
            this.page = 1
            this.$refs.suggest.scrollTo(0, 0)
            search(this.query, this.page, this.showSinger, this.perpage).then(res => {
                if (res.code === ERR_OK) {
                    this.result = this._genResult(res.data)
                    console.log(this.result)
                    // 用来判断是否已经加载了所有数据
                    this._chcekMore(res.data)
                    // processSongsUrl(this._genResult(res.data)).then(songs => {
                    //     if (typeof songs === 'string') {
                    //         this.result = []
                    //     } else {
                    //         this.result = songs
                    //     }
                    //     console.log(this.result)
                    // })
                }
            })
        },
        // 滚动底部调用的回调函数，当hasmore为true时，继续加载数据连在result底部
        searchMore() {
            if (!this.hasMore) return
            this.page++
            search(this.query, this.page, this.showSinger, this.perpage).then(res => {
                if (res.code === ERR_OK) {
                    this.result = this.result.concat(this._genResult(res.data))
                    this._chcekMore(res.data)
                    // processSongsUrl(this._genResult(res.data)).then(songs => {
                    //     if (typeof songs === 'string') {
                    //         this.result = []
                    //     } else {
                    //         this.result = songs
                    //     }
                    //     console.log(this.result)
                    // })
                }
            })
        },
        // 判断是否搜索的是歌手还是歌名展示不同类名
        getIconCls(item) {
            if (item.type === TYPE_SINGER) {
                return `icon-mine`
            } else {
                return 'icon-music'
            }
        },
        // 判断是否搜索的是歌手还是歌名展示不同文本
        getDisplayName(item) {
            if (item.type === TYPE_SINGER) {
                return item.singername
            } else {
                return `${item.name}-${item.singer}`
            }
        },
        // 判断是否已加载所有数据
        _chcekMore(data) {
            const song = data.song
            // 当list length为0时或者，当前页数和每页返回的歌曲数的值大于总数时，即没更多数据加载，将hasmore变false
            if (!song.list.length || (song.curnum + song.curpage * this.perpage) >= song.totalnum) {
                this.hasMore = false
            }
        },
        // 格式化数据
        _genResult(data) {
            let ret = []
            if (data.zhida && data.zhida.singerid) {
                ret.push({...data.zhida, ...{type: TYPE_SINGER}})
            }
            if (data.song) {
                ret = ret.concat(this._normalizeSongs(data.song.list))
            }
            return ret
        },
        _normalizeSongs(list) {
            let ret = []
            list.forEach((item) => {
                // isValidMusic函数用来判断是否有必须的参数，判断是否有必要创建song类
                if (isValidMusic(item)) {
                    ret.push(createSong(item))
                }
            })
            return ret
        }
    },
    watch: {
        // 监听query改变调用search函数
        query() {
            this.search()
        }
    }
}
</script>
<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.suggest
    height 100%
    overflow hidden
    .suggest-list
        padding 0 30px
        .suggest-item
            display flex
            align-items center
            padding-bottom 20px
        .icon
            flex 0 0 30px
            width 30px
            [class^="icon-"]
                font-size 14px
                color $color-text-d
        .name
            flex 1
            font-size $font-size-medium
            color $color-text-d
            overflow hidden
            .text
                no-wrap()
    .no-result-wrapper
        position absolute
        width 100%
        top 50%
        transform translateY(-50%)
</style>
