export function filename_ok(filename: string) {
  // 1. 空值/纯空白校验
  if (!filename || filename.trim() === '') {
    return false;
  }

  // 2. 长度校验（Windows文件名建议不超过255个字符）
  if (filename.length > 255) {
    return false;
  }

  // 3. 非法字符校验：包含 < > : " / \ | ? * 均为非法
  const illegalCharRegex = /[<>:"/\\|?*]/;
  if (illegalCharRegex.test(filename)) {
    return false;
  }

  // 5. 排除Windows保留设备名（不区分大小写，且不能是纯保留名，如"CON.txt"是合法的）
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];
  const pureFilename = filename.split('.')[0].toUpperCase(); // 取无扩展名的纯文件名并转大写
  if (reservedNames.includes(pureFilename)) {
    return false;
  }

  return true;
}
