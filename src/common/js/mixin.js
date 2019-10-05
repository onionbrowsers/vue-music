import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

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

// 播放器mixin
export const playerMixin = {
    computed: {
        // 改变播放模式的图标
        iconMode() {
            return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
        },
        ...mapGetters(['sequenceList', 'currentSong', 'playList', 'mode', 'favoriteList'])
    },
    methods: {
        // 当模式为随机时，要获取到当前歌曲的index并且将state中的index重新赋值，否则改变模式时会触发歌曲切换且重新播放
        _resetCurrentIndex(list) {
            let index = list.findIndex((item) => {
                return item.id === this.currentSong.id
            })
            this.setCurrentIndex(index)
        },
        // 改变播放模式
        changeMode() {
            // 取3的余数，来计算当前播放模式
            const mode = (this.mode + 1) % 3
            this.setPlayMode(mode)
            let list = null
            if (mode === playMode.random) {
                list = shuffle(this.sequenceList)
            } else {
                list = this.sequenceList
            }
            this._resetCurrentIndex(list)
            this.setPlayList(list)
        },
        // 点击收藏图标时，根据收藏情况判断从列表删除还是加入
        toggleFavortieIcon(song) {
            if (this.isFavortie(song)) {
                this.deleteFavoriteList(song)
            } else {
                this.saveFavoriteList(song)
            }
        },
        // 改变歌曲的收藏图标
        getFavoriteCls(song) {
            if (this.isFavortie(song)) {
                return 'icon-favorite'
            }
            return 'icon-not-favorite'
        },
        // 判断当前收藏列表内是否已经有该歌曲
        isFavortie(song) {
            const index = this.favoriteList.findIndex(item => {
                return item.id === song.id
            })
            return index > -1
        },
        ...mapMutations({
            setPlayingState: 'SET_PLAYING_STATE',
            setCurrentIndex: 'SET_CURRENT_INDEX',
            setPlayMode: 'SET_PLAY_MODE',
            setPlayList: 'SET_PLAYLIST'
        }),
        ...mapActions(['saveFavoriteList', 'deleteFavoriteList'])
    }
}

// 搜索minxin
export const searchMixin = {
    data() {
        return {
            query: ''
        }
    },
    computed: {
        ...mapGetters([
            'searchHistory'
        ])
    },
    methods: {
        // 调用子组件设置点击热门关键词的文本，传入到input中
        addQuery(query) {
            this.$refs.searchBox.setQuery(query)
        },
        // 当监听到子组件事件后，调用子组件方法，收起键盘
        blurInput() {
            this.$refs.searchBox.blur()
        },
        // 调用Action派发mutation来改变显示的数据
        saveSearch() {
            this.saveSearchHistory(this.query)
        },
        // 接受改变的query值，传给suggest组件，来调用接口
        onQueryChange(query) {
            this.query = query
        },
        deleteOne(item) {
            this.delectSearchHistory(item)
        },
        ...mapActions(['saveSearchHistory', 'delectSearchHistory'])
    }
}