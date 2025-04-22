<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" class="header-card-box">
        <el-card>
          <template #header
            ><Monitor style="width: 1em; height: 1em; vertical-align: middle" />
            <span style="vertical-align: middle">基本信息</span></template
          >
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">Redis版本</div></td>
                  <td class="el-table__cell is-leaf"
                    ><div class="cell" v-if="cache.info">{{ cache.info.redis_version }}</div></td
                  >
                  <td class="el-table__cell is-leaf"><div class="cell">运行模式</div></td>
                  <td class="el-table__cell is-leaf"
                    ><div class="cell" v-if="cache.info">{{
                      cache.info.redis_mode == 'standalone' ? '单机' : '集群'
                    }}</div></td
                  >
                  <td class="el-table__cell is-leaf"><div class="cell">端口</div></td>
                  <td class="el-table__cell is-leaf"
                    ><div class="cell" v-if="cache.info">{{ cache.info.tcp_port }}</div></td
                  >
                  <td class="el-table__cell is-leaf"><div class="cell">客户端数</div></td>
                  <td class="el-table__cell is-leaf"
                    ><div class="cell" v-if="cache.info">{{
                      cache.info.connected_clients
                    }}</div></td
                  >
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">运行时间(天)</div></td>
                  <td class="el-table__cell is-leaf"
                    ><div class="cell" v-if="cache.info">{{ cache.info.uptime_in_days }}</div></td
                  >
                  <td class="el-table__cell is-leaf"><div class="cell">使用内存</div></td>
                  <td class="el-table__cell is-leaf"
                    ><div class="cell" v-if="cache.info">{{
                      cache.info.used_memory_human
                    }}</div></td
                  >
                  <td class="el-table__cell is-leaf"><div class="cell">使用CPU</div></td>
                  <td class="el-table__cell is-leaf"
                    ><div class="cell" v-if="cache.info">{{
                      parseFloat(cache.info.used_cpu_user_children).toFixed(2)
                    }}</div></td
                  >
                  <td class="el-table__cell is-leaf"><div class="cell">内存配置</div></td>
                  <td class="el-table__cell is-leaf"
                    ><div class="cell" v-if="cache.info">{{ cache.info.maxmemory_human }}</div></td
                  >
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">AOF是否开启</div></td>
                  <td class="el-table__cell is-leaf"
                    ><div class="cell" v-if="cache.info">{{
                      cache.info.aof_enabled == '0' ? '否' : '是'
                    }}</div></td
                  >
                  <td class="el-table__cell is-leaf"><div class="cell">RDB是否成功</div></td>
                  <td class="el-table__cell is-leaf"
                    ><div class="cell" v-if="cache.info">{{
                      cache.info.rdb_last_bgsave_status
                    }}</div></td
                  >
                  <td class="el-table__cell is-leaf"><div class="cell">Key数量</div></td>
                  <td class="el-table__cell is-leaf"
                    ><div class="cell" v-if="cache.dbSize">{{ cache.dbSize }} </div></td
                  >
                  <td class="el-table__cell is-leaf"><div class="cell">网络入口/出口</div></td>
                  <td class="el-table__cell is-leaf"
                    ><div class="cell" v-if="cache.info"
                      >{{ cache.info.instantaneous_input_kbps }}kps/{{
                        cache.info.instantaneous_output_kbps
                      }}kps</div
                    ></td
                  >
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header
            ><PieChart style="width: 1em; height: 1em; vertical-align: middle" />
            <span style="vertical-align: middle">命令统计</span></template
          >
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="commandstats" style="height: 420px" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header
            ><Odometer style="width: 1em; height: 1em; vertical-align: middle" />
            <span style="vertical-align: middle">内存信息</span></template
          >
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="usedmemory" style="height: 420px" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import { CacheApi } from '@/api/monitor/cacheApi'
  import { loadingAction } from '@/utils/utils'
  import * as echarts from 'echarts'
  import { CacheResult } from '@/types/monitor/cache'

  const cache = ref<CacheResult>({
    commandStats: [],
    info: {
      uptime_in_seconds: '',
      maxmemory_human: '',
      aof_last_cow_size: '',
      master_replid2: '',
      mem_replication_backlog: '',
      aof_rewrite_scheduled: '',
      total_net_input_bytes: '',
      rss_overhead_ratio: '',
      hz: '',
      redis_build_id: '',
      aof_last_bgrewrite_status: '',
      multiplexing_api: '',
      client_recent_max_output_buffer: '',
      allocator_resident: '',
      mem_fragmentation_bytes: '',
      repl_backlog_first_byte_offset: '',
      redis_mode: '',
      redis_git_dirty: '',
      allocator_rss_bytes: '',
      repl_backlog_histlen: '',
      rss_overhead_bytes: '',
      total_system_memory: '',
      loading: '',
      evicted_keys: '',
      cluster_enabled: '',
      redis_version: '',
      repl_backlog_active: '',
      mem_aof_buffer: '',
      allocator_frag_bytes: '',
      instantaneous_ops_per_sec: '',
      used_memory_human: '',
      role: '',
      maxmemory: '',
      used_memory_lua: '',
      rdb_current_bgsave_time_sec: '',
      used_memory_startup: '',
      lazyfree_pending_objects: '',
      used_memory_dataset_perc: '',
      allocator_frag_ratio: '',
      arch_bits: '',
      mem_clients_normal: '',
      expired_time_cap_reached_count: '',
      mem_fragmentation_ratio: '',
      aof_last_rewrite_time_sec: '',
      master_replid: '',
      aof_rewrite_in_progress: '',
      config_file: '',
      lru_clock: '',
      maxmemory_policy: '',
      run_id: '',
      latest_fork_usec: '',
      total_commands_processed: '',
      expired_keys: '',
      used_memory: '',
      mem_clients_slaves: '',
      keyspace_misses: '',
      executable: '',
      db0: '',
      used_memory_peak_human: '',
      keyspace_hits: '',
      rdb_last_cow_size: '',
      used_memory_overhead: '',
      active_defrag_hits: '',
      tcp_port: '',
      uptime_in_days: '',
      used_memory_peak_perc: '',
      blocked_clients: '',
      sync_partial_err: '',
      used_memory_scripts_human: '',
      aof_current_rewrite_time_sec: '',
      aof_enabled: '',
      master_repl_offset: '',
      used_memory_dataset: '',
      used_cpu_user: '',
      rdb_last_bgsave_status: '',
      atomicvar_api: '',
      allocator_rss_ratio: '',
      client_recent_max_input_buffer: '',
      aof_last_write_status: '',
      mem_allocator: '',
      used_memory_scripts: '',
      used_memory_peak: '',
      process_id: '',
      used_cpu_sys: '',
      repl_backlog_size: '',
      connected_slaves: '',
      total_system_memory_human: '',
      sync_full: '',
      connected_clients: '',
      allocator_active: '',
      total_net_output_bytes: '',
      pubsub_channels: '',
      active_defrag_key_hits: '',
      rdb_changes_since_last_save: '',
      instantaneous_input_kbps: '',
      configured_hz: '',
      used_memory_rss_human: '',
      expired_stale_perc: '',
      active_defrag_misses: '',
      used_cpu_sys_children: '',
      number_of_cached_scripts: '',
      sync_partial_ok: '',
      used_memory_lua_human: '',
      rdb_last_save_time: '',
      pubsub_patterns: '',
      slave_expires_tracked_keys: '',
      redis_git_sha1: '',
      used_memory_rss: '',
      rdb_last_bgsave_time_sec: '',
      os: '',
      mem_not_counted_for_evict: '',
      active_defrag_running: '',
      rejected_connections: '',
      active_defrag_key_misses: '',
      allocator_allocated: '',
      instantaneous_output_kbps: '',
      second_repl_offset: '',
      rdb_bgsave_in_progress: '',
      used_cpu_user_children: '',
      total_connections_received: '',
      migrate_cached_sockets: ''
    },
    dbSize: 0
  })
  const commandstats = ref(null)
  const usedmemory = ref(null)

  const getList = async () => {
    const loading = loadingAction('正在加载缓存监控数据，请稍候！')
    const res = await CacheApi.getCache()
    if (res.code == 200) {
      loading.close()
      cache.value = res.data
      const commandstatsIntance = echarts.init(commandstats.value, 'macarons')
      commandstatsIntance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        series: [
          {
            name: '命令',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            center: ['50%', '38%'],
            data: res.data.commandStats,
            animationEasing: 'cubicInOut',
            animationDuration: 1000
          }
        ]
      })
      const usedmemoryInstance = echarts.init(usedmemory.value, 'macarons')
      usedmemoryInstance.setOption({
        tooltip: {
          formatter: '{b} <br/>{a} : ' + cache.value.info.used_memory_human
        },
        series: [
          {
            name: '峰值',
            type: 'gauge',
            min: 0,
            max: 1000,
            detail: {
              formatter: cache.value.info.used_memory_human
            },
            data: [
              {
                value: parseFloat(cache.value.info.used_memory_human),
                name: '内存消耗'
              }
            ]
          }
        ]
      })
      window.addEventListener('resize', () => {
        commandstatsIntance.resize()
        usedmemoryInstance.resize()
      })
    }
  }

  getList()
</script>
<style lang="scss" scoped>
  .app-container {
    margin: 10px 0px 0px 0px;
    .header-card-box {
      margin-bottom: 20px;
    }
    span {
      margin-left: 10px;
    }
  }
</style>
