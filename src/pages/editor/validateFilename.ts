/**
 * 文件名有效性校验的自定义配置项
 */
interface FilenameValidateOptions {
  /** 是否允许 Windows 系统保留名（如 con、prn 等），默认 false */
  allowWindowsReserved?: boolean;
  /** 是否允许文件名末尾是点（.）或空格，默认 false */
  allowEndWithDot?: boolean;
  /** 文件名最大长度，默认 255（符合主流文件系统限制） */
  maxLength?: number;
  /** 是否允许空字符串/全空格文件名，默认 false */
  allowEmpty?: boolean;
}

/**
 * 文件名有效性校验返回结果
 */
interface FilenameValidateResult {
  /** 文件名是否有效 */
  valid: boolean;
  /** 错误信息（null 表示无错误） */
  error: string | null;
}

/**
 * 进阶版文件名校验（TypeScript 版）
 * @param filename 待校验的文件名（不含路径，如 "demo.jpg"）
 * @param options 自定义校验规则
 * @returns 校验结果（包含是否有效 + 错误信息）
 */
function validateFilename(
  filename: string,
  options: FilenameValidateOptions = {}
): FilenameValidateResult {
  // 解构配置项并设置默认值
  const {
    allowWindowsReserved = false,
    allowEndWithDot = false,
    maxLength = 255,
    allowEmpty = false
  } = options;

  // 1. 空值/全空格校验（可通过配置关闭）
  if (!allowEmpty) {
    if (typeof filename !== 'string' || filename.trim() === '') {
      return {
        valid: false,
        error: '文件名不能为空或仅包含空格'
      };
    }
  }

  // 2. 长度校验
  if (filename.length > maxLength) {
    return {
      valid: false,
      error: `文件名长度不能超过 ${maxLength} 个字符`
    };
  }

  // 3. 非法字符校验（通用非法字符 + ASCII 控制字符）
  // eslint-disable-next-line no-control-regex
  const illegalCharRegex = /[<>:"/\\|?*\x00-\x1F]/;
  if (illegalCharRegex.test(filename)) {
    return {
      valid: false,
      error: '文件名包含非法字符（< > : " / \\ | ? * 或不可见控制字符）'
    };
  }

  // 4. Windows 系统保留名校验（可通过配置关闭）
  if (!allowWindowsReserved) {
    const windowsReservedNames = [
      'con', 'prn', 'aux', 'nul',
      'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9',
      'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9'
    ];
    // 提取不带扩展名的文件名（如 "con.txt" → "con"），并转小写判断
    const nameWithoutExt = filename.split('.')[0].toLowerCase();
    if (windowsReservedNames.includes(nameWithoutExt)) {
      return {
        valid: false,
        error: `文件名不能为系统保留名称（${windowsReservedNames.join('、')}）`
      };
    }
  }

  // 5. 末尾点/空格校验（可通过配置关闭）
  if (!allowEndWithDot) {
    if (filename.endsWith('.') || filename.endsWith(' ')) {
      return {
        valid: false,
        error: '文件名末尾不能是点（.）或空格'
      };
    }
  }

  // 所有校验通过
  return {
    valid: true,
    error: null
  };
}

export function test_validateFilenameAdvanced() {
  // ------------------- 测试用例 -------------------
  // 1. 正常文件名
  console.log(validateFilename('文档.pdf'));
  // { valid: true, error: null }

  // 2. 允许 Windows 保留名（适配 Linux/macOS）
  console.log(validateFilename('con.txt', { allowWindowsReserved: true }));
  // { valid: true, error: null }

  // 3. 自定义最大长度
  console.log(validateFilename('超长文件名'.repeat(10), { maxLength: 50 }));
  // { valid: false, error: '文件名长度不能超过 50 个字符' }

  // 4. 包含非法字符
  console.log(validateFilename('test|file.txt'));
  // { valid: false, error: '文件名包含非法字符（< > : " / \ | ? * 或不可见控制字符）' }
}
export default validateFilename;