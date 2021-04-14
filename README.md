# MWeb自定义PicGo图床

## 设计初衷 && 用途：

在MWeb中配置通过PicGo上传图片到图床

## 用法

1. `git clone https://github.com/gaop-0561/PicBed4MWeb.git ` 克隆项目
2. `yarn（or npm install）` 安装依赖
3. 修改config.json
4. `node index.js` 运行server
5. 在MWeb中添加发布服务（or 其他用途）

## `config.json` 说明

![](https://gitee.com/gaop_0561/images/raw/master/pics/20210414101510.png)

其中`interval`是为了防止连续上传文件导致重名而故意把第二张图片的上传设置的时间间隔

## 服务管理

`node index.js`可以启动服务进行调试，关闭终端后服务就停了，我想要一种`关闭终端后服务依然可以运行的方式`，这就是`nohup`，使用`nohup node index.js &`这个命令就可以保证服务在后台运行。这种方式启动服务后是不可以通过`CTRL+C`的方式关闭服务的，需要通过`ps | grep index.js`来查找服务的pid，输入的内容第一列就是pid，使用`kill -9`命令关闭服务。

![](https://gitee.com/gaop_0561/images/raw/master/pics/20210414101731.png)

## MWeb中的配置

在MWeb的偏好设置中，选择发布服务页面，在下方的图片上传服务中选择自定义，新弹出的配置页面中，名称自己定，API地址根据`config.json`中的配置，前面加上本地地址，POST文件名和图片URL路径固定为`file`和`url`。

![](https://gitee.com/gaop_0561/images/raw/master/pics/20210414102618.png)

## 开机启动

所有的调试都完成了之后我希望把这个服务加入到开机启动，新增一个文件`PicGo4MWeb.sh`，内容如下

```bash
#!/usr/bin/env bash

# 修改成自己的目录
nohup node /Users/xxx/PicGo4MWeb/index.js &
```

为文件增加权限

```bash
sudo chmod a+x PicGo4MWeb.sh
```

修改文件打开方式为终端

![](https://gitee.com/gaop_0561/images/raw/master/pics/20210414102723.png)

打开Mac的系统偏好设置，进入用户与群组的登录项Tab，添加`PicGo4MWeb.sh`

![](https://gitee.com/gaop_0561/images/raw/master/pics/20210414102852.png)

重启后可以直接使用MWeb上传图片了。
