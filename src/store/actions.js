import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import { shuffle } from '../common/js/util'

// 如之前所写，当改变列表的时候需要找到对应的当前歌曲的索引
function findIndex(list, song) {
    return list.findIndex(item => {
        return item.id === song.id
    })
}

// 当点击随机播放时调用
export const selectPlay = function ({commit, state}, {list, index}) {
    commit(types.SET_SEQUENCE_LIST, list)
    if (state.mode === playMode.random) {
        let randomList = shuffle(list)
        commit(types.SET_PLAYLIST, randomList)
        index = findIndex(randomList, list[index])
    } else {
        commit(types.SET_PLAYLIST, list)
    }
    commit(types.SET_CURRENT_INDEX, index)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

export const randomPlay = function ({commit}, {list}) {
    commit(types.SET_PLAY_MODE, playMode.random)
    commit(types.SET_SEQUENCE_LIST, list)
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    commit(types.SET_CURRENT_INDEX, 0)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

// 当点击搜索的歌曲时，将其插入到当前队列当前歌曲的下一个
export const insertSong = function ({commit, state}, song) {
    // 引用值的副本，防止直接改动
    let playList = state.playList.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex

    // 获取当前歌曲
    let currentSong = playList[currentIndex]

    // 判断是否队列已经有了该歌曲
    let fpIndex = findIndex(playList, song)

    // 先将歌曲插入到队列中
    currentIndex++
    playList.splice(currentIndex, 0, song)

    // 如果有该歌曲的情况
    if (fpIndex > -1) {
        // 如果插入歌曲在已有歌曲后面，直接删除原来歌曲即可
        if (currentIndex > fpIndex) {
            playList.splice(fpIndex, 1)
            currentIndex--
        } else {
            // 如果在前面，则需在所找到的索引前+1，因为插入了歌曲，数组边长
            playList.splice(fpIndex + 1, 1)
        }
    }

    // sequence队列，与playList队列相似
    let currentSIndex = findIndex(sequenceList, currentSong) + 1

    let fsIndex = findIndex(sequenceList, song)

    sequenceList.splice(currentSIndex, 0, song)
    if (fsIndex > -1) {
        if (currentSIndex > fsIndex) {
            sequenceList.splice(fsIndex, 1)
        } else {
            playList.splice(fsIndex + 1, 1)
        }
    }

    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_PLAYLIST, playList)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}