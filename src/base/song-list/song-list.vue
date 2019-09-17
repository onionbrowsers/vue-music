<template>
    <!-- 某一歌手或者排行榜等页面的歌曲详情页，所以抽离成单独组件 -->
    <div class="song-list">
        <ul>
            <li @click="selectItem(song, index)" v-for="(song,index) in songs" :key="index" class="item">
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
        }
    },
    methods: {
        // 用来改变vuex，能获取当前点击的歌曲，item并无用处，是为了实现子组件自己的作用，无需关心外部，把自己能做的做了
        selectItem(item, index) {
            this.$emit('select', item, index)
        },
        getDesc(song) {
            return `${song.singer} - ${song.album}`
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