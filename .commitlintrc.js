module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复bug
        'docs', // 文档更新
        'style', // 代码格式调整，不影响功能
        'refactor', // 代码重构
        'test', // 测试相关
        'chore', // 构建过程或辅助工具的变动
        'perf', // 性能优化
        'ci', // CI/CD相关
        'build', // 构建系统或外部依赖的更改
      ],
    ],
    'subject-case': [0], // 不限制subject的大小写
    'header-max-length': [2, 'always', 100], // header最大长度100
  },
};
