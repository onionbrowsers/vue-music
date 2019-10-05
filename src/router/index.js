import Vue from 'vue'
import Router from 'vue-router'
// import Recommend from '../components/recommend/recommend'
// import Rank from '../components/rank/rank'
// import Singer from '../components/singer/singer'
// import Search from '../components/search/search'
// import SingerDetail from '../components/singer-detail/singer-detail'
// import Disc from '../components/disc/disc'
// import TopList from '../components/top-list/top-list'
// import UserCenter from '../components/user-center/user-center'

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
      // 路由懒加载
      component: () => import('../components/recommend/recommend'),
      children: [
        {
          // 根据id不同动态加载路由
          path: ':id',
          component: () => import('../components/disc/disc')
        }
      ]
    },
    {
      path: '/singer',
      component: () => import('../components/singer/singer'),
      children: [
        {
          // 根据id不同动态加载路由
          path: ':id',
          component: () => import('../components/singer-detail/singer-detail')
        }
      ]
    },
    {
      path: '/rank',
      component: () => import('../components/rank/rank'),
      children: [
        {
          // 根据id不同动态加载路由
          path: ':id',
          component: () => import('../components/top-list/top-list')
        }
      ]
    },
    {
      path: '/search',
      component: () => import('../components/search/search'),
      children: [
        {
          // 根据id不同动态加载路由
          path: ':id',
          component: () => import('../components/singer-detail/singer-detail')
        }
      ]
    },
    {
      path: '/user',
      component: () => import('../components/user-center/user-center')
    }
  ]
})
