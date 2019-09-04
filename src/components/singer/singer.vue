<template>
    <div class="singer">
        <listview @select="selectSinger" :data='singers'></listview>
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
import {mapMutations} from 'vuex'

const hotName = '热门'
// 热门歌手个数
const hotSingerLength = 10

export default {
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
        selectSinger(singer) {
            this.$router.push({
                path: `/singer/${singer.id}`
            })
            this.setSinger(singer)
        },
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