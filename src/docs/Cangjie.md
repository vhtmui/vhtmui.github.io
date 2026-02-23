# Cangjie

## 安装

1. 安装windowsSDK
2. 安装vscode插件
3. 环境变量配置到C:\Program Files (x86)\Cangjie\tools\bin

## 新建项目

1. `ctrl + >`运行 `cangjie.project.create`，或命令行输入 `cjpm init`

## 配置修改

- 配置文件位于 `src\cjpm.toml`
- `[package]compile-option`项用于修改编译选项
  - 如优化编译可以输入 `compile-option = "-O2"`
