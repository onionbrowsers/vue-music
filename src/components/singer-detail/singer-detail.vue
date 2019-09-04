<template>
    <div class="singer-detail">

    </div>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
    created() {
        console.log(this.singer)
    },
    computed: {
        ...mapGetters([
            'singer'
        ])
    }
}
</script>

<style lang="stylus" scoped>
    @import "~common/stylus/variable";

    .singer-detail
        position fixed
        z-index 100
        top 0
        left 0
        bottom 0
        right 0
        background-color $color-background
</style>