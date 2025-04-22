import { BaseObjectResult } from '../axios'

export interface CacheResult {
  commandStats: CommandStat[]
  info: Info
  dbSize: number
}

export interface CommandStat {
  name: string
  value: string
}

export interface Info {
  uptime_in_seconds: string
  maxmemory_human: string
  aof_last_cow_size: string
  master_replid2: string
  mem_replication_backlog: string
  aof_rewrite_scheduled: string
  total_net_input_bytes: string
  rss_overhead_ratio: string
  hz: string
  redis_build_id: string
  aof_last_bgrewrite_status: string
  multiplexing_api: string
  client_recent_max_output_buffer: string
  allocator_resident: string
  mem_fragmentation_bytes: string
  repl_backlog_first_byte_offset: string
  redis_mode: string
  redis_git_dirty: string
  allocator_rss_bytes: string
  repl_backlog_histlen: string
  rss_overhead_bytes: string
  total_system_memory: string
  loading: string
  evicted_keys: string
  cluster_enabled: string
  redis_version: string
  repl_backlog_active: string
  mem_aof_buffer: string
  allocator_frag_bytes: string
  instantaneous_ops_per_sec: string
  used_memory_human: string
  role: string
  maxmemory: string
  used_memory_lua: string
  rdb_current_bgsave_time_sec: string
  used_memory_startup: string
  lazyfree_pending_objects: string
  used_memory_dataset_perc: string
  allocator_frag_ratio: string
  arch_bits: string
  mem_clients_normal: string
  expired_time_cap_reached_count: string
  mem_fragmentation_ratio: string
  aof_last_rewrite_time_sec: string
  master_replid: string
  aof_rewrite_in_progress: string
  config_file: string
  lru_clock: string
  maxmemory_policy: string
  run_id: string
  latest_fork_usec: string
  total_commands_processed: string
  expired_keys: string
  used_memory: string
  mem_clients_slaves: string
  keyspace_misses: string
  executable: string
  db0: string
  used_memory_peak_human: string
  keyspace_hits: string
  rdb_last_cow_size: string
  used_memory_overhead: string
  active_defrag_hits: string
  tcp_port: string
  uptime_in_days: string
  used_memory_peak_perc: string
  blocked_clients: string
  sync_partial_err: string
  used_memory_scripts_human: string
  aof_current_rewrite_time_sec: string
  aof_enabled: string
  master_repl_offset: string
  used_memory_dataset: string
  used_cpu_user: string
  rdb_last_bgsave_status: string
  atomicvar_api: string
  allocator_rss_ratio: string
  client_recent_max_input_buffer: string
  aof_last_write_status: string
  mem_allocator: string
  used_memory_scripts: string
  used_memory_peak: string
  process_id: string
  used_cpu_sys: string
  repl_backlog_size: string
  connected_slaves: string
  total_system_memory_human: string
  sync_full: string
  connected_clients: string
  allocator_active: string
  total_net_output_bytes: string
  pubsub_channels: string
  active_defrag_key_hits: string
  rdb_changes_since_last_save: string
  instantaneous_input_kbps: string
  configured_hz: string
  used_memory_rss_human: string
  expired_stale_perc: string
  active_defrag_misses: string
  used_cpu_sys_children: string
  number_of_cached_scripts: string
  sync_partial_ok: string
  used_memory_lua_human: string
  rdb_last_save_time: string
  pubsub_patterns: string
  slave_expires_tracked_keys: string
  redis_git_sha1: string
  used_memory_rss: string
  rdb_last_bgsave_time_sec: string
  os: string
  mem_not_counted_for_evict: string
  active_defrag_running: string
  rejected_connections: string
  active_defrag_key_misses: string
  allocator_allocated: string
  instantaneous_output_kbps: string
  second_repl_offset: string
  rdb_bgsave_in_progress: string
  used_cpu_user_children: string
  total_connections_received: string
  migrate_cached_sockets: string
}

export type CacheInfoResult = BaseObjectResult<CacheResult>

export interface CacheNameResult {
  cacheName: string
  cacheKey: string
  cacheValue: string
  remark: string
}

export type CacheNameListResult = BaseArrayResult<CacheNameResult>
export type CacheNameInfoResult = BaseObjectResult<CacheNameResult>
