// state对象即为存储所有变量的对象

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
    disc: {}
}

export default state