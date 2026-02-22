export enum AdminValue {
  Reviewer  /**/ = 0b00000001,                            // 1: 允许发布
  R         /**/ = 0b00000010,                            // 2: 查看任意文件
  W         /**/ = 0b00000100,                            // 4: 编辑任意文件
  Gim       /**/ = 0b10000000,                            // 1: 允许发布
  WR        /**/ = AdminValue.R | AdminValue.W,           // 128
  All       /**/ = 0b11111111,
}
