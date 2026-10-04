# 成员 B 专用源码包

这个包只包含成员 B 的分工，不包含成员 A 的首页浏览、搜索、筛选、详情、收藏等功能。

## 文件对应分工

- `member-b-data.js`：失物招领数据结构、状态枚举和示例数据。
- `member-b-storage.js`：仅负责失物信息的 `localStorage` 读写、新增和状态更新，不包含收藏存储。
- `member-b-publish.js`：发布信息页面、日期/必填项校验、发布保存、发布成功页面。
- `member-b-mine.js`：我的发布列表、信息状态显示、标记“已找到”和“已归还”。
- `member-b.css`：以上成员 B 页面所需的独立样式。

## 使用说明

这些文件是从完整项目中拆出的成员 B 模块源码，交给整合项目时由主项目负责页面路由和容器挂载。包内没有首页、搜索、筛选、详情、收藏等成员 A 功能。

加载顺序：

```html
<script src="member-b-data.js"></script>
<script src="member-b-storage.js"></script>
<script src="member-b-publish.js"></script>
<script src="member-b-mine.js"></script>
```

当前按要求未加入单元测试。
