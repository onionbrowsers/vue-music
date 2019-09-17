// import * as xxx from 'bbb' 即将bbb中所有export导出的变量导入到as后的xxx对象中
import * as types from './mutation-types'

// 只有mutations能改变state变化，形成闭环，对象里为函数写法
const mutations = {
    // 函数第一个参数为state对象，第二个参数为要为state赋值传入的对象
    [types.SET_SINGER](state, singer) {
        state.singer = singer
    },
    [types.SET_PLAYING_STATE](state, flag) {
        state.playing = flag
    },
    [types.SET_FULL_SCREEN](state, flag) {
        state.fullScreen = flag
    },
    [types.SET_PLAYLIST](state, list) {
        state.playList = list
    },
    [types.SET_SEQUENCE_LIST](state, list) {
        state.sequenceList = list
    },
    [types.SET_PLAY_MODE](state, mode) {
        state.mode = mode
    },
    [types.SET_CURRENT_INDEX](state, index) {
        state.currentIndex = index
    }
}

export default mutations