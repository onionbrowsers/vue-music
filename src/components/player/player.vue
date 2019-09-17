<template>
    <!-- 播放器控件，刚刚开始 -->
    <div class="player" v-show="playList.length > 0">
        <div class="normal-player" v-show="fullScreen">
            播放器
        </div>
        <div class="mini-player" v-show="!fullScreen"></div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
    computed: {
        ...mapGetters([
            'fullScreen',
            'playList'
        ])
    }
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.player
    .normal-player
        position fixed
        left 0
        right 0
        top 0
        bottom 0
        z-index 150
        background-color $color-background
        .background
            position absolute
            left 0
            top 0
            width 100%
            height 100%
            z-index -1
            opacity 0.6
            filter blur(20px)
        .top
            position relative
            margin-bottom 25px
            .back
                position absolute
                top 0
                left 6px
                z-index 50
</style>
