import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutation'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

// 用来判断是否为开发环境
const debug = process.env.NODE_ENV !== 'production'

// 导出vuex.store 更多信息看vuex笔记
export default new Vuex.Store({
    actions,
    getters,
    state,
    mutations,
    // 严格模式，保证只有mutation改变state
    strict: debug,
    // vuex插件，打印state数据改变前后的值,用来追踪
    plugins: debug ? [createLogger()] : []
})