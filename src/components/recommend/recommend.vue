<template>
    <div class="recommend">
        <scroll ref="scroll" class="recommend-content" :data='discList.list'>
            <div>
                <div v-if="recommends.length" class="slider-wrapper">
                    <slider>
                        <!-- 下面即为显示在slot插槽中的内容 -->
                        <div v-for="item in recommends" :key="item.id">
                            <a :href="item.linkUrl">
                                <img :src="item.picUrl" @load='loadimg'>
                            </a>
                        </div>
                    </slider>
                </div>
                <div class="recommend-list">
                    <h1 class="list-title">热门歌单推荐</h1>
                    <ul>
                        <li class="item" v-for="item in discList.list" :key="item.dissid">
                            <div class="icon">
                                <img v-lazy="item.imgurl" alt="" width="60" height="60">
                            </div>
                            <div class="text">
                                <h2 class="name" v-html="item.creator.name"></h2>
                                <p class="desc" v-html="item.dissname"></p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="loading-container" v-show="!discList.list || !discList.list.length">
                <loading></loading>
            </div>
        </scroll>
    </div>
</template>
<script>
import {getRecommend, getDiscList} from '@/api/recommend'
import {ERR_OK} from '@/api/config'
import slider from '@/base/slider/slider'
// 封装的scroll组件
import scroll from '@/base/scroll/scroll'
import loading from '@/base/loading/loading'

export default {
    data() {
        return {
            recommends: [],
            discList: []
        }
    },
    created() {
        this._getRecommend()
        this._getDiscList()
    },
    methods: {
        _getRecommend() {
            getRecommend().then(res => {
                if (res.code === ERR_OK) {
                    this.recommends = res.data.slider
                }
            })
        },
        _getDiscList() {
            getDiscList().then(res => {
                console.log(res)
                if (res.code === ERR_OK) {
                    this.discList = res.data
                    console.log(this.discList)
                }
            })
        },
        // loadimg是为了确保轮播图的高度已经出现，防止scroll组件计算高度错误
        loadimg() {
            // this.checkloaded是当有一个图片已经加载后，无需多次调用scroll.refresh()
            if (!this.checkLoaded) {
                this.$refs.scroll.refresh()
                this.checkLoaded = true
            }
        }
    },
    components: {
        slider,
        scroll,
        loading
    }
}
</script>
<style lang="stylus">
    @import '~common/stylus/variable'

    .recommend
        position fixed
        width 100%
        top 88px
        bottom 0
        &-content
            height 100%
            overflow hidden
            .slider-wrapper
                position relative
                width 100%
                overflow hidden
            .recommend-list
                .list-title
                    height 65px
                    line-height 65px
                    text-align center
                    font-size $font-size-medium
                    color $color-theme
                .item
                    display flex
                    box-sizing border-box
                    align-items center
                    padding 0 20px 20px
                    .icon
                        flex 0 0 60px
                        width 60px
                        padding-right 20px
                    .text
                        display flex
                        flex 1
                        flex-direction column
                        justify-content center
                        line-height 20px
                        overflow hidden
                        font-size $font-size-medium
                        .name
                            margin-bottom 10px
                            color $color-text
                        .desc
                            color $color-text-d
            .loading-container
                position absolute
                width 100%
                top 50%
                transform translateY(-50%)
</style>