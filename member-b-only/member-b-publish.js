(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function validatePublishData(data) {
    var errors = {};
    var date = String(data.date || "");
    if (!data.title) errors.title = "请输入物品名称";
    if (!data.category) errors.category = "请选择分类";
    if (!data.description) errors.description = "请填写特征描述";
    if (!date) errors.date = "请选择时间";
    else if (date > today()) errors.date = "日期不能晚于今天";
    if (!data.location) errors.location = "请选择地点";
    if (!data.contact) errors.contact = "请填写联系方式";
    return errors;
  }

  function publishFromData(data) {
    var errors = validatePublishData(data);
    if (Object.keys(errors).length) return { item: null, errors: errors };
    var item = window.MemberBData.createItem(data);
    window.MemberBStorage.addItem(item);
    return { item: item, errors: {} };
  }

  function renderPublishPage(locations) {
    var options = (locations || []).map(function (location) {
      return "<option value=\"" + escapeHtml(location.value || location) + "\">" + escapeHtml(location.label || location) + "</option>";
    }).join("");
    return "<section class=\"member-b-publish\"><h2>发布信息</h2><form id=\"member-b-publish-form\"><div class=\"member-b-type-switch\"><label><input type=\"radio\" name=\"type\" value=\"lost\" checked>寻物</label><label><input type=\"radio\" name=\"type\" value=\"found\">招领</label></div><label>物品名称 *<input name=\"title\" required placeholder=\"请输入物品名称\"></label><label>分类 *<select name=\"category\" required><option value=\"\">请选择</option><option>证件</option><option>数码</option><option>钥匙</option><option>生活用品</option><option>书籍</option><option>其他</option></select></label><label>物品图片<input name=\"image\" type=\"file\" accept=\"image/*\" multiple></label><label>特征描述 *<textarea name=\"description\" required placeholder=\"描述颜色、品牌、明显特征等\"></textarea></label><label>时间 *<input name=\"date\" type=\"date\" max=\"" + today() + "\" required></label><label>地点 *<select name=\"location\" required><option value=\"\">填写校内地点</option>" + options + "</select></label><label>联系方式 *<input name=\"contact\" required placeholder=\"手机号 / 微信号（仅对联系者显示）\"></label><button type=\"submit\">发布信息</button></form></section>";
  }

  function renderSuccessPage(item) {
    var typeLabel = item.type === "found" ? "招领" : "寻物";
    return "<section class=\"member-b-success\"><div class=\"success-mark\">✓</div><h2>发布成功</h2><p>你的" + typeLabel + "信息已发布，我们会帮你持续留意。</p><div class=\"success-summary\"><span>发布类型<strong>" + typeLabel + "</strong></span><span>物品名称<strong>" + escapeHtml(item.title) + "</strong></span><span>当前状态<strong>" + window.MemberBData.statuses[item.status] + "</strong></span></div><button type=\"button\" data-member-b-action=\"view-published\" data-id=\"" + escapeHtml(item.id) + "\">查看详情</button></section>";
  }

  window.MemberBPublish = {
    today: today,
    validatePublishData: validatePublishData,
    publishFromData: publishFromData,
    renderPublishPage: renderPublishPage,
    renderSuccessPage: renderSuccessPage
  };
})();
