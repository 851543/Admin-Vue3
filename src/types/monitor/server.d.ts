import { BaseObjectResult } from '../axios'
export interface ServerResult {
  cpu: Cpu
  mem: Mem
  jvm: Jvm
  sys: Sys
  sysFiles: SysFile[]
}

export interface Cpu {
  cpuNum: number
  total: number
  sys: number
  used: number
  wait: number
  free: number
}
export interface Mem {
  total: number
  used: number
  free: number
  usage: number
}

export interface Jvm {
  total: number
  max: number
  free: number
  version: string
  home: string
  startTime: string
  usage: number
  used: number
  name: string
  inputArgs: string
  runTime: string
}

export interface Sys {
  computerName: string
  computerIp: string
  userDir: string
  osName: string
  osArch: string
}

export interface SysFile {
  dirName: string
  sysTypeName: string
  typeName: string
  total: string
  free: string
  used: string
  usage: number
}

export type ServerInfoResult = BaseObjectResult<ServerResult>
