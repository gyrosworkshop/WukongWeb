# WukongWeb

[![](https://travis-ci.org/GyrosWorkshop/WukongWeb.svg?branch=master)](https://travis-ci.org/GyrosWorkshop/WukongWeb)

## 依赖

```
npm install
```

## 开发

```
npm run start
```

启动本地服务器，会监听文件改动自动刷新。

### 环境变量

```
DEV_HOST=localhost
DEV_PORT=8080
WUKONG_SERVER=http://localhost:5000
```

可选配置，上述为默认值。

### 快捷键

* <kbd>Ctrl</kbd>+<kbd>H</kbd> 显示或隐藏开发工具
* <kbd>Ctrl</kbd>+<kbd>Q</kbd> 切换开发工具的位置

## 部署

```
npm run build
```

输出生产环境需要的文件到 `build` 目录下。
