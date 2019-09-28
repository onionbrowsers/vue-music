// state对象即为存储所有变量的对象
import {localSearch} from 'common/js/cache'
import {playMode} from 'common/js/config'
const state = {
    singer: {},
    playing: false,
    fullScreen: false,
    // 两个list是因为判断是什么模式展示什么list
    playList: [],
    sequenceList: [],
    mode: playMode.sequence,
    currentIndex: -1,
    // 添加推荐详情歌单
    disc: {},
    // 添加排行榜歌单
    topList: {},
    // 搜索历史数据
    searchHistory: localSearch()
}

export default state