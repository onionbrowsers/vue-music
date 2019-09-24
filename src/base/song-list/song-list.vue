<template>
    <!-- 某一歌手或者排行榜等页面的歌曲详情页，所以抽离成单独组件 -->
    <div class="song-list">
        <ul>
            <li @click="selectItem(song, index)" v-for="(song,index) in songs" :key="index" class="item">
                <div class="rank" v-show="rank">
                    <span :class="getRankCls(index)">{{getRankText(index)}}</span>
                </div>
                <div class="content">
                    <h2 class="name">{{song.name}}</h2>
                    <p class="desc" v-text="getDesc(song)"></p>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        // 某一歌手或者排行榜的所有歌曲
        songs: {
            type: Array,
            default() {
                return []
            }
        },
        // 是否展示歌单索引，针对排行榜
        rank: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        // 用来改变vuex，能获取当前点击的歌曲，item并无用处，是为了实现子组件自己的作用，无需关心外部，把自己能做的做了
        selectItem(item, index) {
            this.$emit('select', item, index)
        },
        getDesc(song) {
            return `${song.singer} - ${song.album}`
        },
        // 根据是否有rank来给标签动态添加类名
        getRankCls(index) {
            // 判断是否为前三，前三为icon
            if (index <= 2) {
                return `icon icon${index}`
            } else {
                return 'text'
            }
        },
        // 同上
        getRankText(index) {
            // 大于前三的话，展示索引
            if (index > 2) {
                return index + 1
            }
        }
    }
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.song-list
    .item
        display flex
        align-items center
        box-sizing border-box
        height 64px
        font-size $font-size-medium
        .rank
            flex 0 0 25px
            width 25px
            margin-right 30px
            text-align center
            .icon
                display inline-block
                width 25px
                height 24px
                background-size 25px 24px
                &.icon0
                    bg-image('first')
                &.icon1
                    bg-image('second')
                &.icon2
                    bg-image('third')
            .text
                color $color-t
                font-size $font-size-large
        .content
            flex 1
            line-height 20px
            overflow hidden
            .name
                no-wrap()
                color $color-text
            .desc
                no-wrap()
                color $color-text-d
                margin-top 4px
</style>