import Vue from 'vue'
import Router from 'vue-router'
import Recommend from '../components/recommend/recommend'
import Rank from '../components/rank/rank'
import Singer from '../components/singer/singer'
import Search from '../components/search/search'
import SingerDetail from '../components/singer-detail/singer-detail'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/recommend'
    },
    {
      path: '/recommend',
      component: Recommend
    },
    {
      path: '/singer',
      component: Singer,
      children: [
        {
          // 根据id不同动态加载路游
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/rank',
      component: Rank
    },
    {
      path: '/search',
      component: Search
    }
  ]
})
