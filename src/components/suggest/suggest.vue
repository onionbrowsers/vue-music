<template>
    <!-- 接受父组件query来调用接口展示搜索的数据 -->
    <scroll
        class="suggest"
        :data='result'
        :pullup='pullup'
        :beforeScroll='beforeScroll'
        @scrollToEnd='searchMore'
        @beforeScroll='listScroll'
        ref="suggest">
        <ul class="suggest-list">
            <li @click="selectItem(item)" class="suggest-item" v-for="(item,index) in result" :key="index">
                <div class="icon">
                    <i :class="getIconCls(item)"></i>
                </div>
                <div class="name">
                    <p class="text" v-html="getDisplayName(item)"></p>
                </div>
            </li>
            <loading v-show="hasMore" title=""></loading>
        </ul>
        <div v-show="!hasMore && !result.length" class="no-result-wrapper">
            <no-result title="暂无搜索结果"></no-result>
        </div>
    </scroll>
</template>

<script>
import {search} from '@/api/search'
import {ERR_OK} from '@/api/config'
import { createSong, isValidMusic, processSongsUrl } from '@/common/js/song'
import scroll from '@/base/scroll/scroll'
import loading from '@/base/loading/loading'
import Singer from 'common/js/singer'
import {mapMutations, mapActions} from 'vuex'
import noResult from '@/base/no-result/no-result'

const TYPE_SINGER = 'singer'

export default {
    components: {
        scroll,
        loading,
        noResult
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
            hasMore: true,
            beforeScroll: true
        }
    },
    methods: {
        // 监听滚动前事件
        listScroll() {
            this.$emit('listScroll')
        },
        // 当点击搜索后的歌曲时，如果是歌手，跳转到当前歌手页面，如果是歌曲插入到队列中
        selectItem(item) {
            this.$emit('listScroll')
            if (item.type === TYPE_SINGER) {
                const singer = new Singer(item.singermid, item.singername)
                this.$router.push({
                    path: `search/${singer.id}`
                })
                this.setSinger(singer)
            } else {
                this.insertSong(item)
            }
        },
        // 用来接收调用接口返回的数据
        search() {
            // 第一次调用初始化
            this.hasMore = true
            this.page = 1
            this.$refs.suggest.scrollTo(0, 0)
            search(this.query, this.page, this.showSinger, this.perpage).then(res => {
                if (res.code === ERR_OK) {
                    // 因为返回的数据没有歌曲url，所以需要去调用获取歌曲接口的函数
                    this._genResult(res.data).then((result) => {
                        result = result.filter(item => {
                            return item !== '暂无歌曲数据'
                        })
                        if (typeof result[0] !== 'string') {
                            this.result = result
                        }
                    })
                    // 用来判断是否已经加载了所有数据
                    this._checkMore(res.data)
                }
            })
        },
        // 滚动底部调用的回调函数，当hasmore为true时，继续加载数据连在result底部
        searchMore() {
            if (!this.hasMore) return
            this.page++
            search(this.query, this.page, this.showSinger, this.perpage).then(res => {
                if (res.code === ERR_OK) {
                    // this.result = this.result.concat(this._genResult(res.data))
                    this._genResult(res.data).then((result) => {
                        this.result = this.result.concat(result)
                    })
                    this._checkMore(res.data)
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
        _checkMore(data) {
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
            // 调用接口，获取歌曲的url
            return processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
                ret = ret.concat(songs)
                return ret
            })
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
        },
        ...mapMutations({
            setSinger: 'SET_SINGER'
        }),
        ...mapActions(['insertSong'])
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
