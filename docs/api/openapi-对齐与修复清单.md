# OpenAPI 对齐与修复清单

- 规范文件：`docs/api/qip-openapi-merged.json`
- 生成时间：2026-04-22 23:35
- OpenAPI 版本：3.0.1
- 全量接口数：334
- 代码中已封装请求调用数（request/authRequest/uploadFile）：117
- 需修复差异数：0

## 模块总览（按前三段路径）

| 模块 | 总数 | 已接入页面 | 已封装未调用 | 未封装 |
|---|---:|---:|---:|---:|
| /api/admin/admin | 39 | 0 | 0 | 39 |
| /api/user/enterprise | 24 | 7 | 2 | 15 |
| /api/trade/order | 23 | 6 | 13 | 4 |
| /api/base/diagnosis | 19 | 0 | 0 | 19 |
| /api/base/institution | 14 | 12 | 2 | 0 |
| /api/trade/stats | 13 | 0 | 0 | 13 |
| /api/trade/demand | 11 | 10 | 0 | 1 |
| /api/user/auth | 11 | 6 | 4 | 1 |
| /api/base/certification | 10 | 4 | 0 | 6 |
| /api/base/inspection-item | 10 | 3 | 0 | 7 |
| /api/user/user | 10 | 4 | 0 | 6 |
| /api/base/training | 9 | 0 | 0 | 9 |
| /api/base/standard | 8 | 0 | 1 | 7 |
| /api/community/article | 8 | 0 | 0 | 8 |
| /api/community/question | 8 | 0 | 0 | 8 |
| /api/trade/report | 8 | 4 | 0 | 4 |
| /api/user/role | 8 | 0 | 0 | 8 |
| /api/user/account | 7 | 7 | 0 | 0 |
| /api/user/invoice-info | 7 | 6 | 0 | 1 |
| /api/user/shipping-address | 7 | 6 | 0 | 1 |
| /api/admin/dict | 6 | 0 | 0 | 6 |
| /api/base/consultation | 6 | 3 | 0 | 3 |
| /api/base/knowledge | 5 | 1 | 0 | 4 |
| /api/base/measurement-instrument | 5 | 0 | 0 | 5 |
| /api/base/policy | 5 | 0 | 1 | 4 |
| /api/community/expert-appointment | 5 | 0 | 0 | 5 |
| /api/trade/refund | 5 | 0 | 0 | 5 |
| /api/user/file | 5 | 5 | 0 | 0 |
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
| /api/base/news | 1 | 0 | 0 | 1 |
| /api/trade/bid | 1 | 0 | 0 | 1 |

## 已封装接口逐条对齐结果

| 函数 | METHOD | PATH | 规范匹配 | 参数位置匹配 | 说明 |
|---|---|---|---|---|---|
| `account.changeEmail` | PUT | `/api/user/account/email` | 是 | 是 | 通过 |
| `account.changePassword` | PUT | `/api/user/account/password` | 是 | 是 | 通过 |
| `account.changePhone` | PUT | `/api/user/account/phone` | 是 | 是 | 通过 |
| `account.getRealNameStatus` | GET | `/api/user/account/real-name` | 是 | 是 | 通过 |
| `account.setUsername` | PUT | `/api/user/account/username` | 是 | 是 | 通过 |
| `account.submitRealName` | POST | `/api/user/account/real-name` | 是 | 是 | 通过 |
| `account.updateProfile` | PUT | `/api/user/account/profile` | 是 | 是 | 通过 |
| `account.uploadIdCard` | POST | `/api/user/file/upload/id-card` | 是 | 是 | 通过 |
| `auth.bindWechat` | POST | `/api/user/auth/wechat/bind` | 是 | 是 | 通过 |
| `auth.bindWechatMiniPhone` | POST | `/api/user/auth/wechat/mini/bindPhone` | 是 | 是 | 通过 |
| `auth.loginByPassword` | POST | `/api/user/auth/login/password` | 是 | 是 | 通过 |
| `auth.loginBySms` | POST | `/api/user/auth/login` | 是 | 是 | 通过 |
| `auth.loginByWechatMini` | POST | `/api/user/auth/wechat/mini/login` | 是 | 是 | 通过 |
| `auth.loginByWechatQr` | POST | `/api/user/auth/wechat/qr/login` | 是 | 是 | 通过 |
| `auth.logout` | POST | `/api/user/auth/logout` | 是 | 是 | 通过 |
| `auth.refreshAuthToken` | POST | `/api/user/auth/refresh` | 是 | 是 | 通过 |
| `auth.registerAccount` | POST | `/api/user/auth/register` | 是 | 是 | 通过 |
| `auth.sendSmsCode` | POST | `/api/user/auth/sms/send` | 是 | 是 | 通过 |
| `certification.getCertificationAgencyDetail` | GET | `/api/base/certification/agency/{id}` | 是 | 是 | 通过 |
| `certification.getCertificationAgencyList` | GET | `/api/base/certification/agency/list` | 是 | 是 | 通过 |
| `certification.getCertificationGuideDetail` | GET | `/api/base/certification/guide/{id}` | 是 | 是 | 通过 |
| `certification.getCertificationGuideList` | GET | `/api/base/certification/guide/list` | 是 | 是 | 通过 |
| `consultation.getDetail` | GET | `/api/base/consultation/{id}` | 是 | 是 | 通过 |
| `consultation.getMyList` | GET | `/api/base/consultation/my` | 是 | 是 | 通过 |
| `consultation.submit` | POST | `/api/base/consultation/submit` | 是 | 是 | 通过 |
| `content.getKnowledgeDetail` | GET | `/api/base/knowledge/{id}` | 是 | 是 | 通过 |
| `content.getPolicyDetail` | GET | `/api/base/policy/{id}` | 是 | 是 | 通过 |
| `content.getStandardDetail` | GET | `/api/base/standard/{id}` | 是 | 是 | 通过 |
| `enterprise.createCert` | POST | `/api/user/enterprise/{enterpriseId}/cert` | 是 | 是 | 通过 |
| `enterprise.deleteCert` | DELETE | `/api/user/enterprise/{enterpriseId}/cert/{certId}` | 是 | 是 | 通过 |
| `enterprise.getCertList` | GET | `/api/user/enterprise/{enterpriseId}/cert` | 是 | 是 | 通过 |
| `enterprise.getDetail` | GET | `/api/user/enterprise/{enterpriseId}` | 是 | 是 | 通过 |
| `enterprise.getList` | GET | `/api/user/enterprise/list` | 是 | 是 | 通过 |
| `enterprise.getMy` | GET | `/api/user/enterprise/my` | 是 | 是 | 通过 |
| `enterprise.ocrBusinessLicense` | POST | `/api/user/enterprise/ocr/business-license` | 是 | 是 | 通过 |
| `enterprise.register` | POST | `/api/user/enterprise/register` | 是 | 是 | 通过 |
| `enterprise.update` | PUT | `/api/user/enterprise/{enterpriseId}` | 是 | 是 | 通过 |
| `enterprise.uploadCert` | POST | `/api/user/file/upload/cert` | 是 | 是 | 通过 |
| `enterprise.uploadLicense` | POST | `/api/user/file/upload/license` | 是 | 是 | 通过 |
| `file.uploadCommon` | POST | `/api/user/file/upload` | 是 | 是 | 通过 |
| `file.uploadWxAvatar` | POST | `/api/user/file/upload/wx-avatar` | 是 | 是 | 通过 |
| `inspectionItem.getInspectionItemByCategory` | GET | `/api/base/inspection-item/by-category` | 是 | 是 | 通过 |
| `inspectionItem.getInspectionItemDetail` | GET | `/api/base/inspection-item/{id}` | 是 | 是 | 通过 |
| `inspectionItem.getInspectionItemList` | GET | `/api/base/inspection-item/list` | 是 | 是 | 通过 |
| `institution.enroll` | POST | `/api/base/institution/enroll` | 是 | 是 | 通过 |
| `institution.getDetail` | GET | `/api/base/institution/{id}` | 是 | 是 | 通过 |
| `institution.getList` | GET | `/api/base/institution/list` | 是 | 是 | 通过 |
| `institution.search` | GET | `/api/base/institution/search` | 是 | 是 | 通过 |
| `institution.updateAdmin` | PUT | `/api/base/institution/{id}/admin` | 是 | 是 | 通过 |
| `institution.updateService` | PUT | `/api/base/institution/{id}/service` | 是 | 是 | 通过 |
| `orderProgress.addOrderProgressNode` | POST | `/api/trade/order-progress/{orderId}/add` | 是 | 是 | 通过 |
| `orderProgress.getOrderProgressList` | GET | `/api/trade/order-progress/{orderId}` | 是 | 是 | 通过 |
| `points.getMy` | GET | `/api/user/points/my` | 是 | 是 | 通过 |
| `points.getMyHistory` | GET | `/api/user/points/my/history` | 是 | 是 | 通过 |
| `points.getRules` | GET | `/api/user/points/rules` | 是 | 是 | 通过 |
| `points.getUserPoints` | GET | `/api/user/points/user/{userId}` | 是 | 是 | 通过 |
| `profile.deleteInvoice` | DELETE | `/api/user/invoice-info/{id}` | 是 | 是 | 通过 |
| `profile.deleteSampleAddress` | DELETE | `/api/user/shipping-address/{id}` | 是 | 是 | 通过 |
| `profile.getDefaultInvoice` | GET | `/api/user/invoice-info/default` | 是 | 是 | 通过 |
| `profile.getDefaultSampleAddress` | GET | `/api/user/shipping-address/default` | 是 | 是 | 通过 |
| `profile.getEnterpriseProfile` | GET | `/api/user/enterprise/my` | 是 | 是 | 通过 |
| `profile.getInvoices` | GET | `/api/user/invoice-info` | 是 | 是 | 通过 |
| `profile.getSampleAddresses` | GET | `/api/user/shipping-address` | 是 | 是 | 通过 |
| `profile.saveEnterpriseProfile` | PUT | `/api/user/enterprise/{enterpriseId}` | 是 | 是 | 通过 |
| `profile.saveEnterpriseProfile` | GET | `/api/user/enterprise/my` | 是 | 是 | 通过 |
| `profile.saveInvoice` | POST | `/api/user/invoice-info` | 是 | 是 | 通过 |
| `profile.saveInvoice` | PUT | `/api/user/invoice-info/{id}` | 是 | 是 | 通过 |
| `profile.saveSampleAddress` | POST | `/api/user/shipping-address` | 是 | 是 | 通过 |
| `profile.saveSampleAddress` | PUT | `/api/user/shipping-address/{id}` | 是 | 是 | 通过 |
| `profile.setDefaultInvoice` | PUT | `/api/user/invoice-info/{id}/default` | 是 | 是 | 通过 |
| `profile.setDefaultSampleAddress` | PUT | `/api/user/shipping-address/{id}/default` | 是 | 是 | 通过 |
| `report.getByOrderId` | GET | `/api/trade/report/order/{orderId}` | 是 | 是 | 通过 |
| `report.getDetail` | GET | `/api/trade/report/{reportId}` | 是 | 是 | 通过 |
| `report.getDownloadUrl` | GET | `/api/trade/report/{reportId}/download` | 是 | 是 | 通过 |
| `report.verifyByReportNo` | GET | `/api/trade/report/verify/{reportNo}` | 是 | 是 | 通过 |
| `serviceManage.create` | POST | `/api/base/institution/service` | 是 | 是 | 通过 |
| `serviceManage.getDetail` | GET | `/api/base/institution/service/{id}` | 是 | 是 | 通过 |
| `serviceManage.getMyList` | GET | `/api/base/institution/service/my` | 是 | 是 | 通过 |
| `serviceManage.getPublicDetail` | GET | `/api/base/institution/service/{id}` | 是 | 是 | 通过 |
| `serviceManage.listByInstitution` | GET | `/api/base/institution/{institutionId}/service/list` | 是 | 是 | 通过 |
| `serviceManage.remove` | DELETE | `/api/base/institution/service/{id}` | 是 | 是 | 通过 |
| `serviceManage.shelve` | PUT | `/api/base/institution/service/{id}/shelve` | 是 | 是 | 通过 |
| `serviceManage.unshelve` | PUT | `/api/base/institution/service/{id}/unshelve` | 是 | 是 | 通过 |
| `serviceManage.update` | PUT | `/api/base/institution/service/{id}` | 是 | 是 | 通过 |
| `tradeDemand.closeDemand` | PUT | `/api/trade/demand/{demandId}/close` | 是 | 是 | 通过 |
| `tradeDemand.getDemand` | GET | `/api/trade/demand/{demandId}` | 是 | 是 | 通过 |
| `tradeDemand.getDemandBids` | GET | `/api/trade/demand/{demandId}/bids` | 是 | 是 | 通过 |
| `tradeDemand.getDemandHall` | GET | `/api/trade/demand/hall` | 是 | 是 | 通过 |
| `tradeDemand.getMyDemands` | GET | `/api/trade/demand/my` | 是 | 是 | 通过 |
| `tradeDemand.publishDemand` | POST | `/api/trade/demand/publish` | 是 | 是 | 通过 |
| `tradeDemand.publishDraft` | PUT | `/api/trade/demand/{demandId}/publish` | 是 | 是 | 通过 |
| `tradeDemand.saveDraft` | POST | `/api/trade/demand/draft` | 是 | 是 | 通过 |
| `tradeDemand.submitBid` | POST | `/api/trade/demand/bid` | 是 | 是 | 通过 |
| `tradeDemand.updateDraft` | PUT | `/api/trade/demand/{demandId}/draft` | 是 | 是 | 通过 |
| `tradeOrder.amendEntrust` | PUT | `/api/trade/order/{orderId}/amend-entrust` | 是 | 是 | 通过 |
| `tradeOrder.applySampleReturn` | POST | `/api/trade/order/{orderId}/sample-return` | 是 | 是 | 通过 |
| `tradeOrder.cancelOrder` | PUT | `/api/trade/order/{orderId}/cancel` | 是 | 是 | 通过 |
| `tradeOrder.confirmBid` | POST | `/api/trade/order/confirm/{bidId}` | 是 | 是 | 通过 |
| `tradeOrder.confirmOfflinePayment` | PUT | `/api/trade/order/{orderId}/confirm-offline-payment` | 是 | 是 | 通过 |
| `tradeOrder.confirmOrder` | POST | `/api/trade/order/confirm` | 是 | 是 | 通过 |
| `tradeOrder.confirmReceive` | POST | `/api/trade/order/receive-confirm` | 是 | 是 | 通过 |
| `tradeOrder.confirmReport` | PUT | `/api/trade/order/{orderId}/confirm-report` | 是 | 是 | 通过 |
| `tradeOrder.createDirectOrder` | POST | `/api/trade/order/direct` | 是 | 是 | 通过 |
| `tradeOrder.createEvaluation` | POST | `/api/trade/order/evaluate` | 是 | 是 | 通过 |
| `tradeOrder.deleteEvaluation` | DELETE | `/api/trade/order/evaluate/{evaluationId}` | 是 | 是 | 通过 |
| `tradeOrder.getDetail` | GET | `/api/trade/order/{orderId}` | 是 | 是 | 通过 |
| `tradeOrder.getEvaluationByOrder` | GET | `/api/trade/order/evaluate/{orderId}` | 是 | 是 | 通过 |
| `tradeOrder.getMyList` | GET | `/api/trade/order/my` | 是 | 是 | 通过 |
| `tradeOrder.payCallback` | PUT | `/api/trade/order/{orderId}/pay-callback` | 是 | 是 | 通过 |
| `tradeOrder.releaseEscrow` | PUT | `/api/trade/order/{orderId}/release-escrow` | 是 | 是 | 通过 |
| `tradeOrder.submitSampleSupplement` | POST | `/api/trade/order/{orderId}/sample-supplement` | 是 | 是 | 通过 |
| `tradeOrder.submitShipping` | POST | `/api/trade/order/shipping` | 是 | 是 | 通过 |
| `tradeOrder.uploadOfflinePaymentVoucher` | PUT | `/api/trade/order/{orderId}/offline-payment` | 是 | 是 | 通过 |
| `user.getCurrentUser` | GET | `/api/user/user/current` | 是 | 是 | 通过 |
| `user.getCurrentUser` | GET | `/api/user/user/me` | 是 | 是 | 通过 |
| `user.updateAvatar` | PUT | `/api/user/user/avatar` | 是 | 是 | 通过 |
| `user.updateNickname` | PUT | `/api/user/user/nickname` | 是 | 是 | 通过 |

## 修改清单

- 本文档由 `scripts/generate-openapi-docs.mjs` 自动生成。
- 逐条对齐结果仅校验 `method/path` 与 `path/query/body` 参数位置，不校验字段语义与业务规则。
- 建议在核心链路变更后（下单、登录、资料中心等）重新执行一次生成脚本。
- 结论：当前已封装接口在 `method/path/query-path-body 参数位置` 层面与 OpenAPI 一致。
