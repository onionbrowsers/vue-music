import {mapGetters} from 'vuex'

// 多个组件复用mixin，将mini播放器挡住的底部dom显示出来
export const playlistMixin = {
    computed: {
        ...mapGetters([
            'playList'
        ])
    },
    mounted() {
        this.handlePlaylist(this.playList)
    },
    activated() {
        this.handlePlaylist(this.playList)
    },
    watch: {
        playList(newVal) {
            this.handlePlaylist(newVal)
        }
    },
    methods: {
        // 当组件内没有此方法名的时候，就不会覆盖该方法，将会抛出一个错误
        handlePlaylist() {
            throw new Error('component must implement handlePlaylist method')
        }
    }
}