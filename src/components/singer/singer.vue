<template>
    <div class="singer" ref="singer">
        <listview @select="selectSinger" :data='singers' ref="list"></listview>
        <transition name="slide">
            <router-view></router-view>
        </transition>
    </div>
</template>
<script>
import {getSingerList} from '@/api/singer'
import {ERR_OK} from '@/api/config'
import Singer from 'common/js/singer'
import listview from '@/base/listview/listview'
// 调用mutations中的方法的语法糖，否则需要使用，store.mutation等链式调用（需要取看vuex文档）
import {mapMutations} from 'vuex'
import {playlistMixin} from 'common/js/mixin'

const hotName = '热门'
// 热门歌手个数
const hotSingerLength = 10

export default {
    mixins: [playlistMixin],
    created() {
        this._getSingerList()
    },
    data() {
        return {
            singers: []
        }
    },
    components: {
        listview
    },
    methods: {
        // 覆盖mixin的handlePlaylist，显示最下方dom
        handlePlaylist(playlist) {
            const bottom = playlist.length > 0 ? '60px' : ''
            this.$refs.singer.style.bottom = bottom
            this.$refs.list.refresh()
        },
        // 触发自定义事件后，将singer.id作为url跳转到歌手详情页页面
        selectSinger(singer) {
            this.$router.push({
                path: `/singer/${singer.id}`
            })
            // 根据vuex中mutation中的方法使用
            this.setSinger(singer)
        },
        // 同为扩展运算符，不一样的为参数为对象，是因为挂载函数到自定义的属性上面，以便于用来调用函数
        ...mapMutations({
            setSinger: 'SET_SINGER'
        }),
        _getSingerList() {
            getSingerList().then(res => {
                if (res.code === ERR_OK) {
                    this.singers = this._nomalizeSinger(res.data.list)
                }
            })
        },
        // 将调用接口后的数据处理成可以展示的数据格式
        _nomalizeSinger(list) {
            // 创建一个map对象，用来存放数据
            let map = {
                hot: {
                    title: hotName,
                    items: []
                }
            }
            // 该循环用来将热门填入数据并且将属于该字母的数据放入到其items数组中
            list.forEach((item, index) => {
                if (index < hotSingerLength) {
                    // 使用singer类的封装，得到一个包含singer数据的对象
                    map.hot.items.push(new Singer(item.Fsinger_mid, item.Fsinger_name))
                }
                const key = item.Findex
                if (!map[key]) {
                    if (key.match(/[a-zA-z]/)) {
                        map[key] = {
                            title: key,
                            items: []
                        }
                    } else {
                        map[key] = {
                            title: '#',
                            items: []
                        }
                    }
                }
                map[key].items.push(new Singer(item.Fsinger_mid, item.Fsinger_name))
            })

            // 为了得到有序列表，处理map
            // 将整个map对象中的数据拆分为两个数组，最后再合并为一个数组
            let hot = []
            let ret = []
            let ano = []
            for (let key in map) {
                let val = map[key]
                // 匹配字母
                if (val.title.match(/[a-zA-z]/)) {
                    ret.push(val)
                } else if (val.title === hotName) {
                    hot.push(val)
                } else {
                    ano.push(val)
                }
            }
            ret.sort((a, b) => {
                return a.title.charCodeAt(0) - b.title.charCodeAt(0)
            })
            return hot.concat(ret, ano)
        }
    }
}
</script>
<style lang="stylus" scoped>
    .singer
        position fixed
        top 88px
        bottom 0
        width 100%
    .slide-enter-active, .slide-leave-active
        transition: all .3s
    .slide-enter, .slide-leave-to
        transform: translate3d(100%, 0, 0)
</style>