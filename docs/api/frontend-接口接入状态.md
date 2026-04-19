# 前端接口接入状态（全量 OpenAPI）

- 规范文件：`/Users/lizehang/Library/Containers/com.tencent.xinWeChat/Data/Library/Caches/com.tencent.xinWeChat/2.0b4.0.9/80165ed109febb37e410f5274ebe124f/SaveTemp/68d83b415af683bddba84c3cf5a26075/qip-openapi-merged.json`
- 生成时间：2026-04-19 13:07

- 统计口径：`已接`=页面/store 已实际调用；`已封装未调用`=services/api 已封装但页面/store 未调用；`未封装`=OpenAPI 存在但 services/api 未封装。

## 总览

- 全量接口：322
- 已接入页面：88
- 已封装未调用：16
- 未封装：218

## 模块统计

| 模块 | 总数 | 已接入页面 | 已封装未调用 | 未封装 |
|---|---:|---:|---:|---:|
| /api/admin/admin | 39 | 0 | 0 | 39 |
| /api/user/enterprise | 24 | 6 | 3 | 15 |
| /api/trade/order | 21 | 12 | 7 | 2 |
| /api/base/diagnosis | 19 | 0 | 0 | 19 |
| /api/trade/stats | 13 | 0 | 0 | 13 |
| /api/trade/demand | 11 | 10 | 0 | 1 |
| /api/user/auth | 11 | 8 | 2 | 1 |
| /api/base/certification | 10 | 4 | 0 | 6 |
| /api/base/inspection-item | 10 | 3 | 0 | 7 |
| /api/user/user | 10 | 4 | 0 | 6 |
| /api/base/training | 9 | 0 | 0 | 9 |
| /api/base/standard | 8 | 1 | 0 | 7 |
| /api/community/article | 8 | 0 | 0 | 8 |
| /api/community/question | 8 | 0 | 0 | 8 |
| /api/trade/report | 8 | 3 | 1 | 4 |
| /api/user/role | 8 | 0 | 0 | 8 |
| /api/user/account | 7 | 7 | 0 | 0 |
| /api/user/invoice-info | 7 | 6 | 0 | 1 |
| /api/user/shipping-address | 7 | 6 | 0 | 1 |
| /api/admin/dict | 6 | 0 | 0 | 6 |
| /api/base/consultation | 6 | 3 | 0 | 3 |
| /api/base/institution | 5 | 4 | 1 | 0 |
| /api/base/knowledge | 5 | 1 | 0 | 4 |
| /api/base/measurement-instrument | 5 | 0 | 0 | 5 |
| /api/base/policy | 5 | 1 | 0 | 4 |
| /api/community/expert-appointment | 5 | 0 | 0 | 5 |
| /api/trade/refund | 5 | 0 | 0 | 5 |
| /api/user/file | 5 | 4 | 1 | 0 |
| /api/user/points | 5 | 3 | 1 | 1 |
| /api/community/comment | 4 | 0 | 0 | 4 |
| /api/user/stats | 4 | 0 | 0 | 4 |
| /api/community/expert | 3 | 0 | 0 | 3 |
| /api/community/favorite | 3 | 0 | 0 | 3 |
| /api/community/follow | 3 | 0 | 0 | 3 |
| /api/community/like | 3 | 0 | 0 | 3 |
| /api/trade/invoice | 3 | 0 | 0 | 3 |
| /api/base/measurement | 2 | 0 | 0 | 2 |
| /api/community/stats | 2 | 0 | 0 | 2 |
| /api/trade/bid-fee | 2 | 0 | 0 | 2 |
| /api/trade/order-progress | 2 | 2 | 0 | 0 |
| /api/trade/bid | 1 | 0 | 0 | 1 |

## 全量接口明细（322）

| 状态 | METHOD | PATH | path/query 参数 | requestBody | 对应函数 | 调用入口示例 |
|---|---|---|---|---|---|---|
| 未封装 | DELETE | `/api/admin/admin/content/article/{id}` | path:id* | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/content/article/{id}` | path:id* | 否 | - | - |
| 未封装 | PUT | `/api/admin/admin/content/article/{id}/status` | path:id*；query:status* | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/content/articles` | query:page,size,status | 否 | - | - |
| 未封装 | DELETE | `/api/admin/admin/content/comment/{id}` | path:id* | 否 | - | - |
| 未封装 | DELETE | `/api/admin/admin/content/question/{id}` | path:id* | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/content/question/{id}` | path:id* | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/content/questions` | query:page,size | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/dashboard/overview` | - | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/dashboard/workbench/business-trend` | query:days | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/dashboard/workbench/category-cloud` | query:days,limit | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/dashboard/workbench/online-stats` | - | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/dashboard/workbench/pending-audits` | - | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/dashboard/workbench/service-distribution` | - | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/dashboard/workbench/summary` | - | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/dashboard/workbench/trade-trend` | query:days | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/enterprise/{enterpriseId}` | path:enterpriseId* | 否 | - | - |
| 未封装 | PUT | `/api/admin/admin/enterprise/{enterpriseId}/audit` | path:enterpriseId*；query:passed*,rejectReason | 否 | - | - |
| 未封装 | PUT | `/api/admin/admin/enterprise/{enterpriseId}/disable` | path:enterpriseId* | 否 | - | - |
| 未封装 | PUT | `/api/admin/admin/enterprise/{enterpriseId}/enable` | path:enterpriseId* | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/enterprise/list` | query:certStatus,keyword,page,size | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/enterprise/pending` | query:page,size | 否 | - | - |
| 未封装 | DELETE | `/api/admin/admin/evaluation/{evaluationId}` | path:evaluationId* | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/evaluation/list` | query:page,size | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/evaluation/order/{orderId}` | path:orderId* | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/order/{orderId}` | path:orderId* | 否 | - | - |
| 未封装 | PUT | `/api/admin/admin/order/{orderId}/force-close` | path:orderId*；query:reason | 否 | - | - |
| 未封装 | DELETE | `/api/admin/admin/order/demand/{demandId}` | path:demandId* | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/order/demand/{demandId}` | path:demandId* | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/order/demands` | query:page,size | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/order/list` | query:status,page,size | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/report/{reportId}` | path:reportId* | 否 | - | - |
| 未封装 | PUT | `/api/admin/admin/report/{reportId}/invalidate` | path:reportId* | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/report/list` | query:status,page,size | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/system/audit-log` | query:module,operatorId,page,size | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/user/{userId}` | path:userId* | 否 | - | - |
| 未封装 | PUT | `/api/admin/admin/user/{userId}/disable` | path:userId* | 否 | - | - |
| 未封装 | PUT | `/api/admin/admin/user/{userId}/enable` | path:userId* | 否 | - | - |
| 未封装 | GET | `/api/admin/admin/user/list` | query:status,keyword,page,size | 否 | - | - |
| 未封装 | POST | `/api/admin/dict` | - | 是 | - | - |
| 未封装 | DELETE | `/api/admin/dict/{id}` | path:id* | 否 | - | - |
| 未封装 | PUT | `/api/admin/dict/{id}` | path:id* | 是 | - | - |
| 未封装 | PUT | `/api/admin/dict/{id}/status` | path:id*；query:status* | 否 | - | - |
| 未封装 | GET | `/api/admin/dict/list/{dictType}` | path:dictType* | 否 | - | - |
| 未封装 | GET | `/api/admin/dict/types` | - | 否 | - | - |
| 未封装 | POST | `/api/base/certification/agency` | - | 是 | - | - |
| 未封装 | DELETE | `/api/base/certification/agency/{id}` | path:id* | 否 | - | - |
| 已接入页面 | GET | `/api/base/certification/agency/{id}` | path:id* | 否 | `certification.getCertificationAgencyDetail` | `src/pages/certification/index.vue` |
| 未封装 | PUT | `/api/base/certification/agency/{id}` | path:id* | 是 | - | - |
| 已接入页面 | GET | `/api/base/certification/agency/list` | query:region,keyword,page,size | 否 | `certification.getCertificationAgencyList` | `src/pages/certification/index.vue` |
| 未封装 | POST | `/api/base/certification/guide` | - | 是 | - | - |
| 未封装 | DELETE | `/api/base/certification/guide/{id}` | path:id* | 否 | - | - |
| 已接入页面 | GET | `/api/base/certification/guide/{id}` | path:id* | 否 | `certification.getCertificationGuideDetail` | `src/pages/certification/index.vue` |
| 未封装 | PUT | `/api/base/certification/guide/{id}` | path:id* | 是 | - | - |
| 已接入页面 | GET | `/api/base/certification/guide/list` | query:certType | 否 | `certification.getCertificationGuideList` | `src/pages/certification/index.vue` |
| 已接入页面 | GET | `/api/base/consultation/{id}` | path:id* | 否 | `consultation.getDetail` | `src/pages/institution/consult.vue` |
| 未封装 | PUT | `/api/base/consultation/admin/{id}/close` | path:id* | 否 | - | - |
| 未封装 | PUT | `/api/base/consultation/admin/{id}/reply` | path:id*；query:replyContent* | 否 | - | - |
| 未封装 | GET | `/api/base/consultation/admin/list` | query:reqType,status,page,size | 否 | - | - |
| 已接入页面 | GET | `/api/base/consultation/my` | - | 否 | `consultation.getMyList` | `src/pages/institution/consult.vue` |
| 已接入页面 | POST | `/api/base/consultation/submit` | - | 是 | `consultation.submit` | `src/pages/institution/consult.vue` |
| 未封装 | POST | `/api/base/diagnosis/agency` | - | 是 | - | - |
| 未封装 | DELETE | `/api/base/diagnosis/agency/{id}` | path:id* | 否 | - | - |
| 未封装 | GET | `/api/base/diagnosis/agency/{id}` | path:id* | 否 | - | - |
| 未封装 | PUT | `/api/base/diagnosis/agency/{id}` | path:id* | 是 | - | - |
| 未封装 | GET | `/api/base/diagnosis/agency/list` | query:region,keyword,page,size | 否 | - | - |
| 未封装 | POST | `/api/base/diagnosis/case` | - | 是 | - | - |
| 未封装 | DELETE | `/api/base/diagnosis/case/{id}` | path:id* | 否 | - | - |
| 未封装 | GET | `/api/base/diagnosis/case/{id}` | path:id* | 否 | - | - |
| 未封装 | PUT | `/api/base/diagnosis/case/{id}` | path:id* | 是 | - | - |
| 未封装 | GET | `/api/base/diagnosis/case/list` | query:industry,keyword,page,size | 否 | - | - |
| 未封装 | POST | `/api/base/diagnosis/tool` | - | 是 | - | - |
| 未封装 | GET | `/api/base/diagnosis/tool/{id}` | path:id* | 否 | - | - |
| 未封装 | PUT | `/api/base/diagnosis/tool/{id}` | path:id* | 是 | - | - |
| 未封装 | PUT | `/api/base/diagnosis/tool/{id}/status` | path:id*；query:status* | 否 | - | - |
| 未封装 | POST | `/api/base/diagnosis/tool/{id}/submit` | path:id* | 是 | - | - |
| 未封装 | POST | `/api/base/diagnosis/tool/{questionnaireId}/question` | path:questionnaireId* | 是 | - | - |
| 未封装 | GET | `/api/base/diagnosis/tool/list` | query:industry,page,size | 否 | - | - |
| 未封装 | DELETE | `/api/base/diagnosis/tool/question/{questionId}` | path:questionId* | 否 | - | - |
| 未封装 | PUT | `/api/base/diagnosis/tool/question/{questionId}` | path:questionId* | 是 | - | - |
| 未封装 | POST | `/api/base/inspection-item` | - | 是 | - | - |
| 未封装 | DELETE | `/api/base/inspection-item/{id}` | path:id* | 否 | - | - |
| 已接入页面 | GET | `/api/base/inspection-item/{id}` | path:id* | 否 | `inspectionItem.getInspectionItemDetail` | `src/pages/detection/index.vue` |
| 未封装 | PUT | `/api/base/inspection-item/{id}` | path:id* | 是 | - | - |
| 未封装 | POST | `/api/base/inspection-item/apply` | - | 是 | - | - |
| 未封装 | PUT | `/api/base/inspection-item/apply/{id}/audit` | path:id*；query:passed*,auditRemark | 否 | - | - |
| 未封装 | GET | `/api/base/inspection-item/apply/admin/list` | query:status,page,size | 否 | - | - |
| 未封装 | GET | `/api/base/inspection-item/apply/my` | query:status,page,size | 否 | - | - |
| 已接入页面 | GET | `/api/base/inspection-item/by-category` | query:category | 否 | `inspectionItem.getInspectionItemByCategory` | `src/pages/detection/index.vue` |
| 已接入页面 | GET | `/api/base/inspection-item/list` | query:category,keyword,page,size | 否 | `inspectionItem.getInspectionItemList` | `src/pages/detection/index.vue` |
| 已接入页面 | GET | `/api/base/institution/{id}` | path:id* | 否 | `institution.getDetail` | `src/pages/institution/detail.vue` |
| 已封装未调用 | PUT | `/api/base/institution/{id}/admin` | path:id*；query:serviceRange,introduction,contactPhone,status | 否 | `institution.updateAdmin` | - |
| 已接入页面 | PUT | `/api/base/institution/{id}/service` | path:id*；query:serviceRange,introduction,contactPhone | 否 | `institution.updateService` | `src/pages/institution/services.vue` |
| 已接入页面 | GET | `/api/base/institution/list` | query:type,region,keyword,page,size | 否 | `institution.getList` | `src/pages/institution/list.vue` |
| 已接入页面 | GET | `/api/base/institution/search` | query:keyword,type,region,page,size | 否 | `institution.search` | `src/pages/institution/list.vue` |
| 未封装 | POST | `/api/base/knowledge` | - | 是 | - | - |
| 未封装 | DELETE | `/api/base/knowledge/{id}` | path:id* | 否 | - | - |
| 已接入页面 | GET | `/api/base/knowledge/{id}` | path:id* | 否 | `content.getKnowledgeDetail` | `src/pages/index/index.vue` |
| 未封装 | PUT | `/api/base/knowledge/{id}` | path:id* | 是 | - | - |
| 未封装 | GET | `/api/base/knowledge/list` | query:category,keyword,contentType,page,size | 否 | - | - |
| 未封装 | POST | `/api/base/measurement-instrument` | - | 是 | - | - |
| 未封装 | DELETE | `/api/base/measurement-instrument/{id}` | path:id* | 否 | - | - |
| 未封装 | GET | `/api/base/measurement-instrument/{id}` | path:id* | 否 | - | - |
| 未封装 | PUT | `/api/base/measurement-instrument/{id}` | path:id* | 是 | - | - |
| 未封装 | GET | `/api/base/measurement-instrument/list` | query:category,keyword,page,size | 否 | - | - |
| 未封装 | GET | `/api/base/measurement/{id}` | path:id* | 否 | - | - |
| 未封装 | GET | `/api/base/measurement/list` | query:region,keyword,page,size | 否 | - | - |
| 未封装 | POST | `/api/base/policy` | - | 是 | - | - |
| 未封装 | DELETE | `/api/base/policy/{id}` | path:id* | 否 | - | - |
| 已接入页面 | GET | `/api/base/policy/{id}` | path:id* | 否 | `content.getPolicyDetail` | `src/pages/index/index.vue` |
| 未封装 | PUT | `/api/base/policy/{id}` | path:id* | 是 | - | - |
| 未封装 | GET | `/api/base/policy/list` | query:category,region,keyword,page,size | 否 | - | - |
| 未封装 | POST | `/api/base/standard` | - | 是 | - | - |
| 未封装 | DELETE | `/api/base/standard/{id}` | path:id* | 否 | - | - |
| 已接入页面 | GET | `/api/base/standard/{id}` | path:id* | 否 | `content.getStandardDetail` | `src/pages/index/index.vue` |
| 未封装 | PUT | `/api/base/standard/{id}` | path:id* | 是 | - | - |
| 未封装 | GET | `/api/base/standard/follow/my` | query:page,size | 否 | - | - |
| 未封装 | GET | `/api/base/standard/follow/status/{standardId}` | path:standardId* | 否 | - | - |
| 未封装 | POST | `/api/base/standard/follow/toggle/{standardId}` | path:standardId* | 否 | - | - |
| 未封装 | GET | `/api/base/standard/list` | query:standardType,category,keyword,page,size | 否 | - | - |
| 未封装 | POST | `/api/base/training/course` | - | 是 | - | - |
| 未封装 | POST | `/api/base/training/course/{courseId}/enroll` | path:courseId* | 是 | - | - |
| 未封装 | GET | `/api/base/training/course/{courseId}/enrollments` | path:courseId* | 否 | - | - |
| 未封装 | DELETE | `/api/base/training/course/{id}` | path:id* | 否 | - | - |
| 未封装 | GET | `/api/base/training/course/{id}` | path:id* | 否 | - | - |
| 未封装 | PUT | `/api/base/training/course/{id}` | path:id* | 是 | - | - |
| 未封装 | GET | `/api/base/training/course/list` | query:category,status,page,size | 否 | - | - |
| 未封装 | PUT | `/api/base/training/enrollment/{id}/cancel` | path:id* | 否 | - | - |
| 未封装 | GET | `/api/base/training/enrollment/my` | - | 否 | - | - |
| 未封装 | POST | `/api/community/article` | - | 是 | - | - |
| 未封装 | DELETE | `/api/community/article/{id}` | path:id* | 否 | - | - |
| 未封装 | GET | `/api/community/article/{id}` | path:id* | 否 | - | - |
| 未封装 | PUT | `/api/community/article/{id}` | path:id* | 是 | - | - |
| 未封装 | PUT | `/api/community/article/{id}/status` | path:id*；query:status* | 否 | - | - |
| 未封装 | GET | `/api/community/article/by-standard/{standardId}` | path:standardId*；query:page,size | 否 | - | - |
| 未封装 | GET | `/api/community/article/list` | query:category,keyword,page,size | 否 | - | - |
| 未封装 | GET | `/api/community/article/my` | query:page,size | 否 | - | - |
| 未封装 | POST | `/api/community/comment` | query:targetType*,targetId*,content*,parentId | 否 | - | - |
| 未封装 | DELETE | `/api/community/comment/{id}` | path:id* | 否 | - | - |
| 未封装 | DELETE | `/api/community/comment/admin/{id}` | path:id* | 否 | - | - |
| 未封装 | GET | `/api/community/comment/list` | query:targetType*,targetId* | 否 | - | - |
| 未封装 | POST | `/api/community/expert` | - | 是 | - | - |
| 未封装 | POST | `/api/community/expert-appointment` | - | 是 | - | - |
| 未封装 | PUT | `/api/community/expert-appointment/{id}/cancel` | path:id* | 否 | - | - |
| 未封装 | PUT | `/api/community/expert-appointment/{id}/confirm` | path:id* | 否 | - | - |
| 未封装 | GET | `/api/community/expert-appointment/admin/list` | query:status,page,size | 否 | - | - |
| 未封装 | GET | `/api/community/expert-appointment/my` | - | 否 | - | - |
| 未封装 | GET | `/api/community/expert/{id}` | path:id* | 否 | - | - |
| 未封装 | GET | `/api/community/expert/list` | query:expertise,page,size | 否 | - | - |
| 未封装 | GET | `/api/community/favorite/my` | query:targetType,page,size | 否 | - | - |
| 未封装 | GET | `/api/community/favorite/status` | query:targetType*,targetId* | 否 | - | - |
| 未封装 | POST | `/api/community/favorite/toggle` | query:targetType*,targetId* | 否 | - | - |
| 未封装 | GET | `/api/community/follow/my` | - | 否 | - | - |
| 未封装 | GET | `/api/community/follow/question/status` | query:questionId* | 否 | - | - |
| 未封装 | POST | `/api/community/follow/question/toggle` | query:questionId* | 否 | - | - |
| 未封装 | GET | `/api/community/like/count` | query:targetType*,targetId* | 否 | - | - |
| 未封装 | GET | `/api/community/like/status` | query:targetType*,targetId* | 否 | - | - |
| 未封装 | POST | `/api/community/like/toggle` | query:targetType*,targetId* | 否 | - | - |
| 未封装 | POST | `/api/community/question` | - | 是 | - | - |
| 未封装 | DELETE | `/api/community/question/{id}` | path:id* | 否 | - | - |
| 未封装 | GET | `/api/community/question/{id}` | path:id* | 否 | - | - |
| 未封装 | POST | `/api/community/question/{id}/answer` | path:id* | 是 | - | - |
| 未封装 | GET | `/api/community/question/{id}/answers` | path:id* | 否 | - | - |
| 未封装 | PUT | `/api/community/question/{questionId}/accept/{answerId}` | path:questionId*,answerId* | 否 | - | - |
| 未封装 | GET | `/api/community/question/list` | query:category,keyword,page,size | 否 | - | - |
| 未封装 | GET | `/api/community/question/my` | query:page,size | 否 | - | - |
| 未封装 | GET | `/api/community/stats/admin/pending-counts` | - | 否 | - | - |
| 未封装 | GET | `/api/community/stats/enterprise/{enterpriseId}/consultation-pending` | path:enterpriseId* | 否 | - | - |
| 未封装 | GET | `/api/trade/bid-fee/{bidId}` | path:bidId* | 否 | - | - |
| 未封装 | POST | `/api/trade/bid-fee/{bidId}` | path:bidId* | 是 | - | - |
| 未封装 | POST | `/api/trade/bid/auto-quote/calculate` | - | 是 | - | - |
| 未封装 | DELETE | `/api/trade/demand/{demandId}` | path:demandId* | 否 | - | - |
| 已接入页面 | GET | `/api/trade/demand/{demandId}` | path:demandId* | 否 | `tradeDemand.getDemand` | `src/pages/demand/detail.vue` |
| 已接入页面 | GET | `/api/trade/demand/{demandId}/bids` | path:demandId* | 否 | `tradeDemand.getDemandBids` | `src/pages/demand/detail.vue` |
| 已接入页面 | PUT | `/api/trade/demand/{demandId}/close` | path:demandId* | 否 | `tradeDemand.closeDemand` | `src/pages/demand/detail.vue` |
| 已接入页面 | PUT | `/api/trade/demand/{demandId}/draft` | path:demandId* | 是 | `tradeDemand.updateDraft` | `src/pages/demand/publish.vue` |
| 已接入页面 | PUT | `/api/trade/demand/{demandId}/publish` | path:demandId* | 否 | `tradeDemand.publishDraft` | `src/pages/demand/publish.vue` |
| 已接入页面 | POST | `/api/trade/demand/bid` | - | 是 | `tradeDemand.submitBid` | `src/pages/demand/detail.vue` |
| 已接入页面 | POST | `/api/trade/demand/draft` | - | 是 | `tradeDemand.saveDraft` | `src/pages/demand/publish.vue` |
| 已接入页面 | GET | `/api/trade/demand/hall` | query:category,region,page,size | 否 | `tradeDemand.getDemandHall` | `src/pages/demand/detail.vue` |
| 已接入页面 | GET | `/api/trade/demand/my` | query:status,page,size | 否 | `tradeDemand.getMyDemands` | `src/pages/mine/index.vue` |
| 已接入页面 | POST | `/api/trade/demand/publish` | - | 是 | `tradeDemand.publishDemand` | `src/pages/demand/publish.vue` |
| 未封装 | PUT | `/api/trade/invoice/{applyId}/handle` | path:applyId*；query:status*,remark | 否 | - | - |
| 未封装 | POST | `/api/trade/invoice/apply` | - | 是 | - | - |
| 未封装 | GET | `/api/trade/invoice/my` | - | 否 | - | - |
| 已接入页面 | GET | `/api/trade/order-progress/{orderId}` | path:orderId* | 否 | `orderProgress.getOrderProgressList` | `src/pages/order/detail.vue` |
| 已接入页面 | POST | `/api/trade/order-progress/{orderId}/add` | path:orderId*；query:node*,remark,photos | 否 | `orderProgress.addOrderProgressNode` | `src/pages/order/detail.vue` |
| 已接入页面 | GET | `/api/trade/order/{orderId}` | path:orderId* | 否 | `order.confirmEntrust / order.getDetail / tradeOrder.getDetail` | `src/pages/order/create.vue` |
| 已接入页面 | PUT | `/api/trade/order/{orderId}/amend-entrust` | path:orderId*；query:testProject,testStandard,remark | 否 | `order.amendEntrust / tradeOrder.amendEntrust` | `src/pages/order/detail.vue` |
| 已接入页面 | PUT | `/api/trade/order/{orderId}/cancel` | path:orderId*；query:reason | 否 | `order.cancelOrder / tradeOrder.cancelOrder` | `src/pages/order/detail.vue` |
| 已封装未调用 | PUT | `/api/trade/order/{orderId}/confirm-offline-payment` | path:orderId* | 否 | `tradeOrder.confirmOfflinePayment` | - |
| 已封装未调用 | PUT | `/api/trade/order/{orderId}/confirm-report` | path:orderId* | 否 | `tradeOrder.confirmReport` | - |
| 已封装未调用 | PUT | `/api/trade/order/{orderId}/offline-payment` | path:orderId*；query:voucherUrl* | 否 | `tradeOrder.uploadOfflinePaymentVoucher` | - |
| 已封装未调用 | PUT | `/api/trade/order/{orderId}/pay-callback` | path:orderId*；query:payChannel,outTradeNo | 否 | `tradeOrder.payCallback` | - |
| 已封装未调用 | PUT | `/api/trade/order/{orderId}/release-escrow` | path:orderId* | 否 | `tradeOrder.releaseEscrow` | - |
| 已接入页面 | POST | `/api/trade/order/{orderId}/sample-return` | path:orderId*；query:reason | 否 | `order.applySampleReturn / tradeOrder.applySampleReturn` | `src/pages/order/detail.vue` |
| 已接入页面 | POST | `/api/trade/order/{orderId}/sample-supplement` | path:orderId*；query:expressNo*,expressCompany | 否 | `order.submitSampleSupplement / tradeOrder.submitSampleSupplement` | `src/pages/order/detail.vue` |
| 未封装 | GET | `/api/trade/order/admin/list` | query:status,page,size | 否 | - | - |
| 已接入页面 | POST | `/api/trade/order/confirm` | - | 是 | `order.confirmOrder / tradeOrder.confirmOrder` | `src/pages/order/create.vue` |
| 已封装未调用 | POST | `/api/trade/order/confirm/{bidId}` | path:bidId* | 否 | `tradeOrder.confirmBid` | - |
| 已接入页面 | POST | `/api/trade/order/direct` | - | 是 | `order.createDirectOrder / tradeOrder.createDirectOrder` | `src/pages/order/create.vue` |
| 已接入页面 | POST | `/api/trade/order/evaluate` | - | 是 | `order.createEvaluation / tradeOrder.createEvaluation` | `src/pages/order/detail.vue` |
| 已封装未调用 | DELETE | `/api/trade/order/evaluate/{evaluationId}` | path:evaluationId* | 否 | `order.deleteEvaluation / tradeOrder.deleteEvaluation` | - |
| 已接入页面 | GET | `/api/trade/order/evaluate/{orderId}` | path:orderId* | 否 | `order.getEvaluationByOrder / tradeOrder.getEvaluationByOrder` | `src/pages/order/detail.vue` |
| 未封装 | GET | `/api/trade/order/evaluate/admin/list` | query:page,size | 否 | - | - |
| 已接入页面 | GET | `/api/trade/order/my` | query:status,page,size | 否 | `order.getList / tradeOrder.getMyList` | `src/pages/order/list.vue` |
| 已接入页面 | POST | `/api/trade/order/receive-confirm` | - | 是 | `order.confirmReceive / tradeOrder.confirmReceive` | `src/pages/order/detail.vue` |
| 已接入页面 | POST | `/api/trade/order/shipping` | - | 是 | `order.confirmEntrust / tradeOrder.submitShipping` | `src/pages/order/create.vue` |
| 未封装 | PUT | `/api/trade/refund/{id}/audit` | path:id*；query:passed*,remark | 否 | - | - |
| 未封装 | PUT | `/api/trade/refund/{id}/institution-confirm` | path:id*；query:refundVoucherUrl | 否 | - | - |
| 未封装 | GET | `/api/trade/refund/admin/list` | query:status,page,size | 否 | - | - |
| 未封装 | POST | `/api/trade/refund/apply` | - | 是 | - | - |
| 未封装 | GET | `/api/trade/refund/my` | - | 否 | - | - |
| 已接入页面 | GET | `/api/trade/report/{reportId}` | path:reportId* | 否 | `report.getDetail` | `src/pages/report/detail.vue` |
| 已接入页面 | GET | `/api/trade/report/{reportId}/download` | path:reportId* | 否 | `report.getDownloadUrl` | `src/pages/report/detail.vue` |
| 未封装 | POST | `/api/trade/report/{reportId}/generate` | path:reportId* | 否 | - | - |
| 未封装 | PUT | `/api/trade/report/{reportId}/invalidate` | path:reportId* | 否 | - | - |
| 未封装 | GET | `/api/trade/report/admin/list` | query:status,page,size | 否 | - | - |
| 已封装未调用 | GET | `/api/trade/report/order/{orderId}` | path:orderId* | 否 | `report.getByOrderId` | - |
| 未封装 | POST | `/api/trade/report/upload` | - | 是 | - | - |
| 已接入页面 | GET | `/api/trade/report/verify/{reportNo}` | path:reportNo* | 否 | `report.verifyByReportNo` | `src/pages/report/verify.vue` |
| 未封装 | GET | `/api/trade/stats/admin/business-trend` | query:days | 否 | - | - |
| 未封装 | GET | `/api/trade/stats/admin/category-cloud` | query:days,limit | 否 | - | - |
| 未封装 | GET | `/api/trade/stats/admin/pending-counts` | - | 否 | - | - |
| 未封装 | GET | `/api/trade/stats/admin/service-distribution` | - | 否 | - | - |
| 未封装 | GET | `/api/trade/stats/admin/summary` | - | 否 | - | - |
| 未封装 | GET | `/api/trade/stats/admin/trade-trend` | query:days | 否 | - | - |
| 未封装 | GET | `/api/trade/stats/enterprise/{enterpriseId}/business-overview` | path:enterpriseId* | 否 | - | - |
| 未封装 | GET | `/api/trade/stats/enterprise/{enterpriseId}/delivery-trend` | path:enterpriseId*；query:days | 否 | - | - |
| 未封装 | GET | `/api/trade/stats/enterprise/{enterpriseId}/income` | path:enterpriseId* | 否 | - | - |
| 未封装 | GET | `/api/trade/stats/enterprise/{enterpriseId}/order-trend` | path:enterpriseId*；query:days | 否 | - | - |
| 未封装 | GET | `/api/trade/stats/enterprise/{enterpriseId}/service-distribution` | path:enterpriseId* | 否 | - | - |
| 未封装 | GET | `/api/trade/stats/enterprise/{enterpriseId}/summary` | path:enterpriseId* | 否 | - | - |
| 未封装 | GET | `/api/trade/stats/enterprise/{enterpriseId}/todo` | path:enterpriseId* | 否 | - | - |
| 已接入页面 | PUT | `/api/user/account/email` | - | 是 | `account.changeEmail` | `src/pages/settings/account.vue` |
| 已接入页面 | PUT | `/api/user/account/password` | - | 是 | `account.changePassword` | `src/pages/settings/account.vue` |
| 已接入页面 | PUT | `/api/user/account/phone` | - | 是 | `account.changePhone` | `src/pages/settings/account.vue` |
| 已接入页面 | PUT | `/api/user/account/profile` | - | 是 | `account.updateProfile` | `src/pages/auth/wechat-profile.vue` |
| 已接入页面 | GET | `/api/user/account/real-name` | - | 否 | `account.getRealNameStatus` | `src/pages/settings/account.vue` |
| 已接入页面 | POST | `/api/user/account/real-name` | - | 是 | `account.submitRealName` | `src/pages/settings/account.vue` |
| 已接入页面 | PUT | `/api/user/account/username` | query:username* | 否 | `account.setUsername` | `src/pages/settings/account.vue` |
| 已接入页面 | POST | `/api/user/auth/login` | - | 是 | `auth.loginBySms` | `src/pages/auth/login.vue` |
| 已接入页面 | POST | `/api/user/auth/login/password` | - | 是 | `auth.loginByPassword` | `src/pages/auth/login.vue` |
| 已接入页面 | POST | `/api/user/auth/logout` | - | 否 | `auth.logout` | `src/pages/settings/index.vue` |
| 已封装未调用 | POST | `/api/user/auth/refresh` | query:refreshToken* | 否 | `auth.refreshAuthToken` | - |
| 已接入页面 | POST | `/api/user/auth/register` | - | 是 | `auth.registerAccount` | `src/pages/auth/register-form.vue` |
| 未封装 | POST | `/api/user/auth/reset-password` | - | 是 | - | - |
| 已接入页面 | POST | `/api/user/auth/sms/send` | - | 是 | `auth.sendSmsCode` | `src/pages/auth/login.vue` |
| 已接入页面 | POST | `/api/user/auth/wechat/bind` | - | 是 | `auth.bindWechat` | `src/pages/settings/account.vue` |
| 已接入页面 | POST | `/api/user/auth/wechat/mini/bindPhone` | - | 是 | `auth.bindWechatMiniPhone` | `src/pages/settings/account.vue` |
| 已接入页面 | POST | `/api/user/auth/wechat/mini/login` | - | 是 | `auth.loginByWechatMini` | `src/pages/auth/login.vue` |
| 已封装未调用 | POST | `/api/user/auth/wechat/qr/login` | - | 是 | `auth.loginByWechatQr` | - |
| 已封装未调用 | GET | `/api/user/enterprise/{enterpriseId}` | path:enterpriseId* | 否 | `enterprise.getDetail` | - |
| 已封装未调用 | PUT | `/api/user/enterprise/{enterpriseId}` | path:enterpriseId* | 是 | `enterprise.update` | - |
| 未封装 | PUT | `/api/user/enterprise/{enterpriseId}/audit` | path:enterpriseId*；query:passed*,rejectReason | 否 | - | - |
| 已接入页面 | GET | `/api/user/enterprise/{enterpriseId}/cert` | path:enterpriseId* | 否 | `enterprise.getCertList` | `src/pages/enterprise/certs.vue` |
| 已接入页面 | POST | `/api/user/enterprise/{enterpriseId}/cert` | path:enterpriseId* | 是 | `enterprise.createCert` | `src/pages/enterprise/certs.vue` |
| 已接入页面 | DELETE | `/api/user/enterprise/{enterpriseId}/cert/{certId}` | path:enterpriseId*,certId* | 否 | `enterprise.deleteCert` | `src/pages/enterprise/certs.vue` |
| 未封装 | PUT | `/api/user/enterprise/{enterpriseId}/disable` | path:enterpriseId* | 否 | - | - |
| 未封装 | PUT | `/api/user/enterprise/{enterpriseId}/enable` | path:enterpriseId* | 否 | - | - |
| 未封装 | GET | `/api/user/enterprise/{enterpriseId}/institution-user-id` | path:enterpriseId* | 否 | - | - |
| 未封装 | PUT | `/api/user/enterprise/{enterpriseId}/upgrade-provider` | path:enterpriseId*；query:certFileUrl*,certNo*,certExpiry*,certScope | 否 | - | - |
| 未封装 | GET | `/api/user/enterprise/all` | query:certStatus,keyword,page,size | 否 | - | - |
| 已接入页面 | GET | `/api/user/enterprise/list` | query:enterpriseType,region,page,size | 否 | `enterprise.getList` | `src/pages/detection/index.vue` |
| 已接入页面 | GET | `/api/user/enterprise/my` | - | 否 | `enterprise.getMy` | `src/pages/auth/login.vue` |
| 已封装未调用 | POST | `/api/user/enterprise/ocr/business-license` | - | 是 | `enterprise.ocrBusinessLicense` | - |
| 未封装 | GET | `/api/user/enterprise/pending` | query:page,size | 否 | - | - |
| 已接入页面 | POST | `/api/user/enterprise/register` | - | 是 | `enterprise.register` | `src/pages/auth/register-form.vue` |
| 未封装 | GET | `/api/user/enterprise/workbench/customer-trend` | query:days | 否 | - | - |
| 未封装 | GET | `/api/user/enterprise/workbench/delivery-trend` | query:days | 否 | - | - |
| 未封装 | GET | `/api/user/enterprise/workbench/income-structure` | - | 否 | - | - |
| 未封装 | GET | `/api/user/enterprise/workbench/order-trend` | query:days | 否 | - | - |
| 未封装 | GET | `/api/user/enterprise/workbench/service-distribution` | - | 否 | - | - |
| 未封装 | GET | `/api/user/enterprise/workbench/service-overview` | - | 否 | - | - |
| 未封装 | GET | `/api/user/enterprise/workbench/summary` | - | 否 | - | - |
| 未封装 | GET | `/api/user/enterprise/workbench/todo` | - | 否 | - | - |
| 已封装未调用 | POST | `/api/user/file/upload` | query:dir | 是 | `file.uploadCommon` | - |
| 已接入页面 | POST | `/api/user/file/upload/cert` | - | 是 | `enterprise.uploadCert` | `src/pages/auth/register-form.vue` |
| 已接入页面 | POST | `/api/user/file/upload/id-card` | - | 是 | `account.uploadIdCard` | `src/pages/settings/account.vue` |
| 已接入页面 | POST | `/api/user/file/upload/license` | - | 是 | `enterprise.uploadLicense` | `src/pages/auth/register-form.vue` |
| 已接入页面 | POST | `/api/user/file/upload/wx-avatar` | - | 是 | `file.uploadWxAvatar` | `src/pages/auth/wechat-profile.vue` |
| 已接入页面 | GET | `/api/user/invoice-info` | - | 否 | `profile.getInvoices` | `src/pages/profile/enterprise.vue` |
| 已接入页面 | POST | `/api/user/invoice-info` | - | 是 | `profile.saveInvoice` | `src/pages/profile/invoices.vue` |
| 已接入页面 | DELETE | `/api/user/invoice-info/{id}` | path:id* | 否 | `profile.deleteInvoice` | `src/pages/profile/invoices.vue` |
| 未封装 | GET | `/api/user/invoice-info/{id}` | path:id* | 否 | - | - |
| 已接入页面 | PUT | `/api/user/invoice-info/{id}` | path:id* | 是 | `profile.saveInvoice` | `src/pages/profile/invoices.vue` |
| 已接入页面 | PUT | `/api/user/invoice-info/{id}/default` | path:id* | 否 | `profile.setDefaultInvoice` | `src/pages/profile/invoices.vue` |
| 已接入页面 | GET | `/api/user/invoice-info/default` | - | 否 | `profile.getDefaultInvoice` | `src/pages/order/create.vue` |
| 未封装 | POST | `/api/user/points/admin/adjust` | query:userId*,points*,ruleCode,remark | 否 | - | - |
| 已接入页面 | GET | `/api/user/points/my` | - | 否 | `points.getMy` | `src/pages/member/vip.vue` |
| 已接入页面 | GET | `/api/user/points/my/history` | query:page,size | 否 | `points.getMyHistory` | `src/pages/member/vip.vue` |
| 已接入页面 | GET | `/api/user/points/rules` | - | 否 | `points.getRules` | `src/pages/member/vip.vue` |
| 已封装未调用 | GET | `/api/user/points/user/{userId}` | path:userId* | 否 | `points.getUserPoints` | - |
| 未封装 | POST | `/api/user/role` | - | 是 | - | - |
| 未封装 | DELETE | `/api/user/role/{id}` | path:id* | 否 | - | - |
| 未封装 | PUT | `/api/user/role/{id}` | path:id* | 是 | - | - |
| 未封装 | GET | `/api/user/role/list` | - | 否 | - | - |
| 未封装 | GET | `/api/user/role/user/{userId}` | path:userId* | 否 | - | - |
| 未封装 | PUT | `/api/user/role/user/{userId}` | path:userId* | 是 | - | - |
| 未封装 | POST | `/api/user/role/user/{userId}/add` | path:userId*；query:roleCode* | 否 | - | - |
| 未封装 | DELETE | `/api/user/role/user/{userId}/remove` | path:userId*；query:roleCode* | 否 | - | - |
| 已接入页面 | GET | `/api/user/shipping-address` | - | 否 | `profile.getSampleAddresses` | `src/pages/profile/addresses.vue` |
| 已接入页面 | POST | `/api/user/shipping-address` | - | 是 | `profile.saveSampleAddress` | `src/pages/profile/addresses.vue` |
| 已接入页面 | DELETE | `/api/user/shipping-address/{id}` | path:id* | 否 | `profile.deleteSampleAddress` | `src/pages/profile/addresses.vue` |
| 未封装 | GET | `/api/user/shipping-address/{id}` | path:id* | 否 | - | - |
| 已接入页面 | PUT | `/api/user/shipping-address/{id}` | path:id* | 是 | `profile.saveSampleAddress` | `src/pages/profile/addresses.vue` |
| 已接入页面 | PUT | `/api/user/shipping-address/{id}/default` | path:id* | 否 | `profile.setDefaultSampleAddress` | `src/pages/profile/addresses.vue` |
| 已接入页面 | GET | `/api/user/shipping-address/default` | - | 否 | `profile.getDefaultSampleAddress` | `src/pages/order/create.vue` |
| 未封装 | GET | `/api/user/stats/admin/online` | - | 否 | - | - |
| 未封装 | GET | `/api/user/stats/admin/pending-counts` | - | 否 | - | - |
| 未封装 | GET | `/api/user/stats/admin/summary` | - | 否 | - | - |
| 未封装 | GET | `/api/user/stats/enterprise/{enterpriseId}/customer-trend` | path:enterpriseId*；query:days | 否 | - | - |
| 未封装 | GET | `/api/user/user/{userId}` | path:userId* | 否 | - | - |
| 未封装 | PUT | `/api/user/user/{userId}/member-level` | path:userId*；query:memberLevel* | 否 | - | - |
| 未封装 | PUT | `/api/user/user/{userId}/real-name/audit` | path:userId*；query:passed*,rejectReason | 否 | - | - |
| 未封装 | PUT | `/api/user/user/{userId}/status` | path:userId*；query:status* | 否 | - | - |
| 已接入页面 | PUT | `/api/user/user/avatar` | query:avatarUrl* | 否 | `user.updateAvatar` | `src/pages/settings/account.vue` |
| 已接入页面 | GET | `/api/user/user/current` | - | 否 | `user.getCurrentUser` | `src/pages/auth/login.vue` |
| 未封装 | GET | `/api/user/user/list` | query:status,keyword,page,size | 否 | - | - |
| 已接入页面 | GET | `/api/user/user/me` | - | 否 | `user.getCurrentUser` | `src/pages/auth/login.vue` |
| 已接入页面 | PUT | `/api/user/user/nickname` | query:nickname* | 否 | `user.updateNickname` | `src/pages/settings/account.vue` |
| 未封装 | GET | `/api/user/user/real-name/pending` | query:page,size | 否 | - | - |
