<template>
  <div id="app">
    <Mheader></Mheader>
    <tab></tab>
    <keep-alive>
      <router-view/>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
import Mheader from 'components/m-header/m-header'
import Tab from 'components/tab/tab'
// 因为播放器组件不属于任何路由内，所以需要放在总文件下
import player from 'components/player/player'

export default {
  name: 'App',
  components: {
    Mheader,
    Tab,
    player
  }
}
</script>

<style lang="stylus">
@import 'common/stylus/variable'
#app
  color $color-theme
</style>
