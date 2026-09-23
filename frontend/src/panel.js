/**
 * HA Share 管理面板（panel_custom + Lit）
 *
 * 视图：分享管理 / 审计日志 / 全局设置 + 分享编辑表单
 * 所有后端交互走 hass.callWS（ha_share/* websocket 命令，仅管理员可用）
 */
import { LitElement, html, css } from "lit";

const EMOJI = {
  light: "💡", switch: "🔌", lock: "🔒", cover: "🪟", climate: "🌡️",
  media_player: "🔊", fan: "🌀", sensor: "📟", binary_sensor: "🔎",
  humidifier: "💨", water_heater: "🚿", vacuum: "🤖", button: "🔘",
  scene: "🎬", script: "📜", automation: "⚙️", input_boolean: "🔲",
  input_button: "🔘", input_number: "🔢", input_select: "📋", input_text: "✍️",
  number: "🔢", select: "📋", text: "✍️", siren: "📢", valve: "🔧",
  alarm_control_panel: "🛡️", camera: "📷", weather: "⛅", person: "👤",
  device_tracker: "📍", update: "⬆️", todo: "📝", calendar: "📅",
  air_quality: "🌫️",
};
const domainOf = (eid) => eid.split(".", 1)[0];
const iconOf = (eid) => EMOJI[domainOf(eid)] || "⚡";

const EVENT_TEXT = {
  page_view: "访问页面", password_ok: "密码正确", password_fail: "密码错误",
  call_ok: "控制成功", call_fail: "控制失败", blocked: "被拦截",
};

const fmtTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString("zh-CN", { hour12: false });
};
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const esc = (s) => String(s ?? "");

class HaSharePanel extends LitElement {
  static properties = {
    hass: { attribute: false },
    narrow: { type: Boolean, reflect: false },
    _view: { state: true },
    _shares: { state: true },
    _settings: { state: true },
    _effBase: { state: true },
    _draft: { state: true },
    _pickerQuery: { state: true },
    _qrData: { state: true },
    _confirm: { state: true },
    _toastMsg: { state: true },
    _busy: { state: true },
    _settingsDraft: { state: true },
    _logs: { state: true },
    _pwVisible: { state: true },
    _logTotal: { state: true },
    _logFilter: { state: true },
  };

  constructor() {
    super();
    this.narrow = false;
    this._view = "list";
    this._shares = [];
    this._settings = null;
    this._effBase = "";
    this._draft = null;
    this._pickerQuery = "";
    this._qrData = null;
    this._confirm = null;
    this._toastMsg = null;
    this._busy = false;
    this._settingsDraft = null;
    this._logs = [];
    this._pwVisible = false;
    this._logTotal = 0;
    this._logFilter = { share_id: "", start: "", end: "" };
    this._toastTimer = null;
  }

  firstUpdated() {
    this._loadAll();
  }

  async _loadAll() {
    if (!this.hass) return;
    try {
      const [s, l] = await Promise.all([
        this.hass.callWS({ type: "ha_share/settings/get" }),
        this.hass.callWS({ type: "ha_share/shares/list" }),
      ]);
      this._settings = s.settings;
      this._effBase = s.effective_base_url || "";
      this._shares = l.shares;
    } catch (err) {
      this._toast("加载失败：" + esc(err), "error");
    }
  }

  /* ============================== 工具 ============================== */
  _toast(text, type) {
    this._toastMsg = { text, type: type || "" };
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { this._toastMsg = null; }, 2600);
  }

  async _copy(text) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      this._toast("已复制到剪贴板", "ok");
    } catch (e) {
      // 非安全上下文回退
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); this._toast("已复制到剪贴板", "ok"); }
      catch (e2) { this._toast("复制失败，请手动复制", "error"); }
      ta.remove();
    }
  }

  _askConfirm(title, text, okLabel, onOk) {
    this._confirm = { title, text, okLabel, onOk };
  }

  _statusOf(share) {
    if (!share.enabled) return { text: "已停用", cls: "st-gray" };
    const now = new Date();
    if (share.start_time && new Date(share.start_time) > now) return { text: "未开始", cls: "st-warn" };
    if (share.end_time && new Date(share.end_time) < now) return { text: "已过期", cls: "st-err" };
    return { text: "进行中", cls: "st-ok" };
  }

  /* ============================== 数据操作 ============================== */
  async _toggleShare(share) {
    try {
      const res = await this.hass.callWS({
        type: "ha_share/shares/toggle", share_id: share.id, enabled: !share.enabled,
      });
      this._replaceShare(res.share);
      this._toast(share.enabled ? "已停用该分享" : "已启用该分享", "ok");
    } catch (err) { this._toast("操作失败：" + esc(err), "error"); }
  }

  async _deleteShare(share) {
    this._askConfirm("删除分享", `确定删除「${share.name}」？该操作不可恢复，链接立即失效。`, "删除", async () => {
      try {
        await this.hass.callWS({ type: "ha_share/shares/delete", share_id: share.id });
        this._shares = this._shares.filter((s) => s.id !== share.id);
        this._toast("已删除", "ok");
      } catch (err) { this._toast("删除失败：" + esc(err), "error"); }
    });
  }

  async _resetCounters(share) {
    this._askConfirm("重置操作次数", `将「${share.name}」内所有可控实体的剩余次数恢复为上限。`, "重置", async () => {
      try {
        const res = await this.hass.callWS({ type: "ha_share/shares/reset_counters", share_id: share.id });
        this._replaceShare(res.share);
        this._toast("已重置全部计数", "ok");
      } catch (err) { this._toast("操作失败：" + esc(err), "error"); }
    });
  }

  _replaceShare(share) {
    const idx = this._shares.findIndex((s) => s.id === share.id);
    if (idx >= 0) this._shares[idx] = share;
    else this._shares.push(share);
    this._shares = [...this._shares];
  }

  async _showQr(share) {
    try {
      const res = await this.hass.callWS({ type: "ha_share/qr", share_id: share.id });
      this._qrData = { name: share.name, url: res.url, png: res.png };
    } catch (err) {
      this._qrData = { name: share.name, url: share.url || null, png: null, error: String(err) };
    }
  }

  /* ============================== 编辑：草稿 ============================== */
  _newDraft() {
    return {
      id: null, name: "", description: "",
      start: "", end: "", poll: "",
      entities: [],
      hasPassword: false, newPassword: "", clearPassword: false,
      ui: { theme: "light", card_bg: "", text_color: "", accent: "", title: "", footer: "" },
    };
  }

  _draftFromShare(share) {
    return {
      id: share.id,
      name: share.name || "",
      description: share.description || "",
      start: toLocalInput(share.start_time),
      end: toLocalInput(share.end_time),
      poll: share.poll_interval != null ? String(share.poll_interval) : "",
      entities: (share.entities || []).map((e) => ({
        entity_id: e.entity_id,
        name: e.name || e.entity_id,
        icon: e.icon || "",
        mode: e.mode || "read",
        limitMode: e.limit == null ? "unlimited" : (e.limit === 1 ? "once" : "n"),
        limit: e.limit != null ? String(e.limit) : "3",
        show_attrs: e.show_attrs !== false,
        remaining: e.remaining,
      })),
      hasPassword: !!share.has_password,
      newPassword: "", clearPassword: false,
      ui: {
        theme: (share.ui && share.ui.theme) || "light",
        card_bg: (share.ui && share.ui.card_bg) || "",
        text_color: (share.ui && share.ui.text_color) || "",
        accent: (share.ui && share.ui.accent) || "",
        title: (share.ui && share.ui.title) || "",
        footer: (share.ui && share.ui.footer) || "",
      },
    };
  }

  _pickerResults() {
    if (!this.hass || !this.hass.states) return [];
    const q = this._pickerQuery.trim().toLowerCase();
    const all = Object.keys(this.hass.states);
    const filtered = q
      ? all.filter((eid) =>
          eid.toLowerCase().includes(q) ||
          String(this.hass.states[eid].attributes?.friendly_name || "").toLowerCase().includes(q))
      : all;
    filtered.sort();
    return filtered.slice(0, 80);
  }

  _togglePick(entityId) {
    const d = this._draft;
    const idx = d.entities.findIndex((e) => e.entity_id === entityId);
    if (idx >= 0) {
      d.entities.splice(idx, 1);
    } else {
      const st = this.hass.states[entityId];
      d.entities.push({
        entity_id: entityId,
        name: st?.attributes?.friendly_name || entityId,
        icon: "", mode: "read", limitMode: "unlimited", limit: "3",
        show_attrs: true, remaining: null,
      });
    }
    this.requestUpdate();
  }

  async _saveShare() {
    const d = this._draft;
    if (!d.name.trim()) { this._toast("请填写分享名称", "error"); return; }
    if (!d.entities.length) { this._toast("请至少选择一个实体", "error"); return; }
    if (d.start && d.end && new Date(d.start) > new Date(d.end)) {
      this._toast("开始时间不能晚于结束时间", "error"); return;
    }
    const entities = d.entities.map((e) => ({
      entity_id: e.entity_id,
      mode: e.mode,
      limit: e.limitMode === "unlimited" ? null
        : (e.limitMode === "once" ? 1 : Math.max(1, parseInt(e.limit, 10) || 1)),
      icon: e.icon || null,
      show_attrs: !!e.show_attrs,
    }));
    const payload = {
      name: d.name.trim(),
      description: d.description.trim(),
      start_time: d.start || null,
      end_time: d.end || null,
      poll_interval: d.poll ? Math.max(2, Math.min(10, parseInt(d.poll, 10) || 5)) : null,
      entities,
      ui: d.ui,
    };
    if (d.id) payload.id = d.id;
    if (d.newPassword) payload.password = d.newPassword;
    if (d.clearPassword) payload.clear_password = true;

    this._busy = true;
    try {
      const res = await this.hass.callWS({ type: "ha_share/shares/save", share: payload });
      this._replaceShare(res.share);
      this._toast("已保存", "ok");
      let qr = { url: res.share.url, png: null };
      try {
        qr = await this.hass.callWS({ type: "ha_share/qr", share_id: res.share.id });
      } catch (e) { /* 未配置 base_url 时仍显示链接信息 */ }
      this._draft = null;
      this._view = "list";
      this._qrData = { name: res.share.name, url: qr.url || res.share.url, png: qr.png };
    } catch (err) {
      this._toast("保存失败：" + esc(err), "error");
    } finally {
      this._busy = false;
    }
  }

  /* ============================== 设置 ============================== */
  _startEditSettings() {
    this._settingsDraft = { ...this._settings };
  }

  async _saveSettings() {
    const d = this._settingsDraft;
    this._busy = true;
    try {
      const res = await this.hass.callWS({ type: "ha_share/settings/save", settings: d });
      this._settings = res.settings;
      this._effBase = res.effective_base_url || "";
      this._toast("设置已保存", "ok");
    } catch (err) {
      this._toast("保存失败：" + esc(err), "error");
    } finally {
      this._busy = false;
    }
  }

  async _checkUrl() {
    const url = (this._settingsDraft.base_url || this._effBase || "").trim();
    if (!url) { this._toast("请先填写外网基础地址", "error"); return; }
    this._busy = true;
    try {
      const res = await this.hass.callWS({ type: "ha_share/check_url", url });
      if (res.ok) this._toast(`连通正常（HTTP ${res.status}）`, "ok");
      else this._toast("自检失败：" + esc(res.error), "error");
    } catch (err) {
      this._toast("自检失败：" + esc(err), "error");
    } finally {
      this._busy = false;
    }
  }

  /* ============================== 日志 ============================== */
  async _queryLogs() {
    const f = this._logFilter;
    this._busy = true;
    try {
      const res = await this.hass.callWS({
        type: "ha_share/logs/query",
        share_id: f.share_id || undefined,
        start: f.start ? f.start + "T00:00:00" : undefined,
        end: f.end ? f.end + "T23:59:59" : undefined,
        limit: 500,
      });
      this._logs = res.logs;
      this._logTotal = res.total;
    } catch (err) {
      this._toast("查询失败：" + esc(err), "error");
    } finally {
      this._busy = false;
    }
  }

  _exportCsv() {
    if (!this._logs.length) { this._toast("当前没有可导出的日志", "error"); return; }
    const head = ["时间", "IP", "分享", "事件", "实体", "动作", "操作前剩余次数", "详情"];
    const rows = this._logs.map((l) => [
      l.t || "", l.ip || "", l.share_name || "", EVENT_TEXT[l.event] || l.event || "",
      l.entity_id || "", l.action || "",
      l.remaining_before != null ? String(l.remaining_before) : "", l.detail || "",
    ]);
    const csv = [head, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ha_share_logs.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }

  /* ============================== 样式 ============================== */
  static styles = css`
    :host {
      --hs-primary: var(--primary-color, #03a9f4);
      --hs-text: var(--primary-text-color, #212121);
      --hs-muted: var(--secondary-text-color, #727272);
      --hs-card: var(--card-background-color, #fff);
      --hs-bg: var(--primary-background-color, #fafafa);
      --hs-line: var(--divider-color, #e0e0e0);
      --hs-err: var(--error-color, #db4437);
      display: block;
      color: var(--hs-text);
      -webkit-font-smoothing: antialiased;
    }
    .wrap { max-width: 960px; margin: 0 auto; padding: 16px 16px 40px; }
    h1 { font-size: 22px; margin: 8px 0 4px; display: flex; align-items: center; gap: 10px; }
    .sub { color: var(--hs-muted); font-size: 13px; margin: 0 0 12px; }

    .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--hs-line); margin-bottom: 16px; }
    .tab {
      appearance: none; background: none; border: none; border-bottom: 2px solid transparent;
      padding: 10px 16px; font-size: 14px; font-weight: 500; color: var(--hs-muted);
      cursor: pointer;
    }
    .tab.active { color: var(--hs-primary); border-bottom-color: var(--hs-primary); }

    .card {
      background: var(--hs-card); border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,.06));
      border: 1px solid var(--hs-line);
      padding: 16px; margin-bottom: 14px;
    }
    .row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .grow { flex: 1; }

    button.btn {
      appearance: none; border: 1px solid var(--hs-line); background: var(--hs-card); color: var(--hs-text);
      border-radius: 10px; padding: 8px 14px; font-size: 13px; font-weight: 500; cursor: pointer;
    }
    button.btn:hover { filter: brightness(1.05); }
    button.btn:disabled { opacity: .5; cursor: default; }
    button.btn.primary { background: var(--hs-primary); border-color: var(--hs-primary); color: #fff; }
    button.btn.danger { color: var(--hs-err); border-color: var(--hs-err); }
    button.btn.small { padding: 4px 10px; font-size: 12px; border-radius: 8px; }

    label.f { display: block; font-size: 12px; color: var(--hs-muted); margin: 12px 0 4px; }
    label.f:first-child { margin-top: 0; }
    input[type=text], input[type=number], input[type=password], input[type=datetime-local], select, textarea {
      width: 100%; padding: 9px 12px; border-radius: 10px; border: 1px solid var(--hs-line);
      background: var(--hs-card); color: var(--hs-text); font-size: 14px; box-sizing: border-box;
      font-family: inherit;
    }
    textarea { resize: vertical; min-height: 56px; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--hs-primary); }
    input[type=color] { width: 40px; height: 34px; padding: 2px; border: 1px solid var(--hs-line);
      border-radius: 8px; background: var(--hs-card); cursor: pointer; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; }
    .hint { font-size: 12px; color: var(--hs-muted); margin-top: 4px; line-height: 1.5; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
    .color-row { display: flex; align-items: center; gap: 10px; }
    .color-row .mono { flex: 1; }

    /* 状态徽标 */
    .st { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .st-ok { background: rgba(48,145,80,.14); color: #2e9e5b; }
    .st-warn { background: rgba(240,160,20,.16); color: #c07a0a; }
    .st-err { background: rgba(219,68,55,.13); color: var(--hs-err); }
    .st-gray { background: rgba(128,128,128,.15); color: var(--hs-muted); }

    /* 分享列表卡片 */
    .share-head { display: flex; align-items: flex-start; gap: 10px; }
    .share-name { font-size: 16px; font-weight: 600; margin: 0; word-break: break-all; }
    .share-meta { font-size: 12px; color: var(--hs-muted); margin-top: 4px; line-height: 1.7; }
    .share-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
    .url-row { display: flex; align-items: center; gap: 6px; margin-top: 8px; }
    .url-row .mono { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* 实体选择器 */
    .picker-list {
      max-height: 260px; overflow-y: auto; border: 1px solid var(--hs-line);
      border-radius: 10px; margin-top: 8px;
    }
    .pick-row {
      display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer;
      border-bottom: 1px solid var(--hs-line); font-size: 14px;
    }
    .pick-row:last-child { border-bottom: none; }
    .pick-row:hover { background: rgba(0,0,0,.03); }
    .pick-row .eid { color: var(--hs-muted); font-size: 12px; }
    .pick-ic { width: 22px; text-align: center; }
    input.cb { width: 16px; height: 16px; flex: none; }

    /* 已选实体配置表 */
    table.etab { width: 100%; border-collapse: collapse; font-size: 13px; }
    table.etab th {
      text-align: left; font-size: 12px; color: var(--hs-muted); font-weight: 500;
      padding: 6px 8px; border-bottom: 1px solid var(--hs-line); white-space: nowrap;
    }
    table.etab td { padding: 8px; border-bottom: 1px solid var(--hs-line); vertical-align: middle; }
    .etab-wrap { overflow-x: auto; }
    .ent-name { font-weight: 500; white-space: nowrap; }
    .ent-eid { color: var(--hs-muted); font-size: 11px; }
    .rem { font-size: 11px; color: var(--hs-muted); white-space: nowrap; }
    .etab input[type=text] { width: 90px; padding: 5px 8px; font-size: 12px; }
    .etab input[type=number] { width: 70px; padding: 5px 8px; font-size: 12px; }
    .etab select { width: auto; padding: 5px 8px; font-size: 12px; }

    /* 日志表 */
    table.ltab { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    table.ltab th { text-align: left; color: var(--hs-muted); font-weight: 500; padding: 6px 8px;
      border-bottom: 1px solid var(--hs-line); white-space: nowrap; }
    table.ltab td { padding: 6px 8px; border-bottom: 1px solid var(--hs-line); word-break: break-all; }
    .ev-ok { color: #2e9e5b; font-weight: 600; }
    .ev-err { color: var(--hs-err); font-weight: 600; }
    .ev-mut { color: var(--hs-muted); }

    /* 弹层 */
    .mask { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 100;
      display: flex; align-items: center; justify-content: center; padding: 20px; }
    .dlg { background: var(--hs-card); border-radius: 14px; padding: 20px; width: 100%;
      max-width: 380px; box-shadow: 0 12px 40px rgba(0,0,0,.3); }
    .dlg h3 { margin: 0 0 10px; font-size: 16px; }
    .dlg p { margin: 0 0 14px; font-size: 13px; color: var(--hs-muted); line-height: 1.6; }
    .dlg .row { margin-top: 12px; }
    .qr-img { display: block; margin: 8px auto; max-width: 240px; width: 100%; }

    .toast { position: fixed; left: 50%; bottom: 34px; transform: translateX(-50%) translateY(12px);
      background: rgba(20,26,34,.92); color: #fff; padding: 10px 20px; border-radius: 999px;
      font-size: 13px; opacity: 0; pointer-events: none; transition: all .2s; z-index: 120; max-width: 84vw; }
    .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    .toast.ok { background: rgba(38,132,84,.95); }
    .toast.error { background: rgba(186,48,44,.95); }

    .empty { text-align: center; color: var(--hs-muted); padding: 36px 0; font-size: 14px; }
    .back { margin-bottom: 4px; }
  `;

  /* ============================== 渲染 ============================== */
  render() {
    if (!this.hass) return html`<div class="wrap"><div class="empty">正在加载…</div></div>`;
    return html`
      <div class="wrap">
        ${this._view === "edit" ? this._renderEdit() : this._renderTabs()}
        ${this._view === "list" ? this._renderList() : ""}
        ${this._view === "logs" ? this._renderLogs() : ""}
        ${this._view === "settings" ? this._renderSettings() : ""}
      </div>
      ${this._qrData ? this._renderQrDialog() : ""}
      ${this._confirm ? this._renderConfirm() : ""}
      ${this._toastMsg ? this._renderToast() : ""}
    `;
  }

  _renderTabs() {
    const tabs = [
      ["list", "分享管理"], ["logs", "审计日志"], ["settings", "全局设置"],
    ];
    return html`
      <h1>🔗 HA Share</h1>
      <p class="sub">实体临时分享网关 · 外网基础地址：${this._effBase || "未配置（在全局设置中填写）"}</p>
      <div class="tabs">
        ${tabs.map(([v, label]) => html`
          <button class="tab ${this._view === v ? "active" : ""}" @click=${() => { this._view = v; if (v === "settings" && !this._settingsDraft) this._startEditSettings(); }}>
            ${label}
          </button>`)}
      </div>
    `;
  }

  /* ---------- 分享列表 ---------- */
  _renderList() {
    return html`
      <div class="row" style="justify-content:flex-end;margin-bottom:12px">
        <button class="btn primary" @click=${() => { this._draft = this._newDraft(); this._view = "edit"; }}>＋ 新建分享</button>
      </div>
      ${this._shares.length === 0 ? html`<div class="card"><div class="empty">还没有分享任务，点击右上角「新建分享」创建</div></div>` : ""}
      ${this._shares.map((s) => this._renderShareCard(s))}
    `;
  }

  _renderShareCard(s) {
    const st = this._statusOf(s);
    const ctrl = (s.entities || []).filter((e) => e.mode === "control");
    const counters = ctrl.map((e) =>
      e.limit == null ? "∞" : `${e.remaining ?? e.limit}/${e.limit}`).join(" · ");
    const timeText = s.start_time || s.end_time
      ? `${s.start_time ? fmtTime(s.start_time) : "不限"} ~ ${s.end_time ? fmtTime(s.end_time) : "不限"}`
      : "永久有效";
    return html`
      <div class="card">
        <div class="share-head">
          <div class="grow">
            <p class="share-name">${s.name}</p>
            <div class="share-meta">
              ${s.entities.length} 个实体（${ctrl.length} 个可控制） · 创建于 ${fmtTime(s.created_at)}<br>
              有效期：${timeText}${s.has_password ? " · 🔐 密码保护" : ""}${counters ? html`<br>剩余次数：${counters}` : ""}
            </div>
            ${s.url ? html`
              <div class="url-row">
                <span class="mono" title=${s.url}>${s.url}</span>
                <button class="btn small" @click=${() => this._copy(s.url)}>复制</button>
              </div>` : html`<div class="hint">⚠️ 未配置外网基础地址，暂无法生成链接</div>`}
          </div>
          <span class="st ${st.cls}">${st.text}</span>
        </div>
        <div class="share-actions">
          <button class="btn small" @click=${() => { this._draft = this._draftFromShare(s); this._view = "edit"; }}>编辑</button>
          <button class="btn small" @click=${() => this._showQr(s)}>二维码</button>
          ${s.url ? html`<button class="btn small" @click=${() => window.open(s.url, "_blank")}>预览</button>` : ""}
          <button class="btn small" @click=${() => this._toggleShare(s)}>${s.enabled ? "停用" : "启用"}</button>
          ${ctrl.length ? html`<button class="btn small" @click=${() => this._resetCounters(s)}>重置计数</button>` : ""}
          <button class="btn small danger" @click=${() => this._deleteShare(s)}>删除</button>
        </div>
      </div>
    `;
  }

  /* ---------- 编辑表单 ---------- */
  _renderEdit() {
    const d = this._draft;
    if (!d) return html``;
    return html`
      <div class="back"><button class="btn small" @click=${() => { this._draft = null; this._view = "list"; }}>← 返回列表</button></div>
      <h1>${d.id ? "编辑分享" : "新建分享"}</h1>

      <div class="card">
        <label class="f">分享名称 *</label>
        <input type="text" placeholder="例如：给保洁的临时门锁权限" .value=${d.name}
          @input=${(e) => { d.name = e.target.value; }} />
        <label class="f">分享描述（展示在访客页面顶部）</label>
        <textarea .value=${d.description} @input=${(e) => { d.description = e.target.value; }}
          placeholder="例如：周一上门清洁期间可开灯与门锁，用完即止"></textarea>
      </div>

      <div class="card">
        <label class="f">选择实体（支持全部 HA 实体）</label>
        <input type="text" placeholder="搜索实体名称或 ID…" .value=${this._pickerQuery}
          @input=${(e) => { this._pickerQuery = e.target.value; }} />
        <div class="picker-list">
          ${this._pickerResults().map((eid) => {
            const st = this.hass.states[eid];
            const picked = d.entities.some((x) => x.entity_id === eid);
            return html`
              <div class="pick-row" @click=${() => this._togglePick(eid)}>
                <input type="checkbox" class="cb" .checked=${picked} @click=${(e) => e.stopPropagation()} @change=${() => this._togglePick(eid)} />
                <span class="pick-ic">${iconOf(eid)}</span>
                <span class="grow">${st?.attributes?.friendly_name || eid}</span>
                <span class="eid mono">${eid}</span>
              </div>`;
          })}
          ${this._pickerResults().length === 0 ? html`<div class="pick-row" style="color:var(--hs-muted)">没有匹配的实体</div>` : ""}
        </div>

        ${d.entities.length ? html`
          <label class="f">已选实体（每个实体独立配置权限与次数）</label>
          <div class="etab-wrap">
            <table class="etab">
              <thead><tr>
                <th>实体</th><th>权限</th><th>次数上限</th><th title="访客页卡片左侧图标：可填 emoji（如 💡），留空使用该类型设备的默认图标">图标</th><th>属性</th><th></th>
              </tr></thead>
              <tbody>
                ${d.entities.map((e) => html`
                  <tr>
                    <td>
                      <div class="ent-name">${iconOf(e.entity_id)} ${e.name}</div>
                      <div class="ent-eid mono">${e.entity_id}</div>
                      ${e.remaining != null ? html`<div class="rem">剩余 ${e.remaining} 次</div>` : ""}
                    </td>
                    <td>
                      <select .value=${e.mode} @change=${(ev) => { e.mode = ev.target.value; this.requestUpdate(); }}>
                        <option value="read">只读</option>
                        <option value="control">允许控制</option>
                      </select>
                    </td>
                    <td>
                      ${e.mode === "control" ? html`
                        <select .value=${e.limitMode} @change=${(ev) => { e.limitMode = ev.target.value; this.requestUpdate(); }}>
                          <option value="unlimited">不限次数</option>
                          <option value="once">仅 1 次</option>
                          <option value="n">限定 N 次</option>
                        </select>
                        ${e.limitMode === "n" ? html`
                          <input type="number" min="1" max="999" .value=${e.limit}
                            @input=${(ev) => { e.limit = ev.target.value; }} />` : ""}` : "—"}
                    </td>
                    <td><input type="text" placeholder="留空用默认" .value=${e.icon}
                      @input=${(ev) => { e.icon = ev.target.value; }} /></td>
                    <td><input type="checkbox" class="cb" .checked=${e.show_attrs}
                      @change=${(ev) => { e.show_attrs = ev.target.checked; }} /></td>
                    <td><button class="btn small danger" @click=${() => this._togglePick(e.entity_id)}>✕</button></td>
                  </tr>`)}
              </tbody>
            </table>
          </div>
          <div class="hint">仅成功执行控制动作才扣减对应实体自身的次数；查看与刷新不计。</div>` : ""}
      </div>

      <div class="card">
        <label class="f">全局策略（作用于整条链接）</label>
        <div class="grid2">
          <div>
            <label class="f">开始时间（留空 = 立即生效）</label>
            <input type="datetime-local" .value=${d.start}
              @input=${(e) => { d.start = e.target.value; }} />
          </div>
          <div>
            <label class="f">结束时间（留空 = 永久有效）</label>
            <input type="datetime-local" .value=${d.end}
              @input=${(e) => { d.end = e.target.value; }} />
          </div>
        </div>
        <label class="f">访问密码 ${d.id && d.hasPassword && !d.clearPassword ? "（已设置；留空保持不变）" : ""}</label>
        <div class="row">
          <input type="${this._pwVisible ? "text" : "password"}" style="flex:1"
            autocomplete="new-password"
            placeholder="${d.clearPassword ? "保存后清除密码" : d.id && d.hasPassword ? "留空保持现有密码" : "可选，留空则无需密码"}"
            .value=${d.clearPassword ? "" : d.newPassword}
            ?disabled=${d.clearPassword}
            @input=${(e) => { d.newPassword = e.target.value; }} />
          <button class="btn" title="显示/隐藏明文" @click=${() => { this._pwVisible = !this._pwVisible; this.requestUpdate(); }}>${this._pwVisible ? "🙈 隐藏" : "👁 显示"}</button>
          <button class="btn" @click=${async () => {
            try {
              const res = await this.hass.callWS({ type: "ha_share/generate_password" });
              d.clearPassword = false;
              d.newPassword = res.password;
              this._pwVisible = true;
              this.requestUpdate();
            } catch (err) { this._toast("生成失败", "error"); }
          }}>🎲 随机</button>
          ${d.id && d.hasPassword && !d.clearPassword ? html`
            <button class="btn danger" @click=${() => { d.clearPassword = true; d.newPassword = ""; this.requestUpdate(); }}>清除密码</button>` : ""}
          ${d.clearPassword ? html`
            <button class="btn" @click=${() => { d.clearPassword = false; this.requestUpdate(); }}>撤销清除</button>` : ""}
        </div>
        ${d.clearPassword ? html`<div class="hint">保存后该分享将不再需要密码即可访问。</div>` : ""}
        <label class="f">状态轮询间隔（秒，留空用全局默认）</label>
        <input type="number" min="2" max="10" .value=${d.poll}
          @input=${(e) => { d.poll = e.target.value; }} />
      </div>

      <div class="card">
        <label class="f">访客页面 UI 自定义</label>
        <div class="grid2">
          <div>
            <label class="f">主题</label>
            <select .value=${d.ui.theme} @change=${(e) => { d.ui.theme = e.target.value; this.requestUpdate(); }}>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
          <div>
            <label class="f">页面标题（留空用分享名称）</label>
            <input type="text" .value=${d.ui.title} @input=${(e) => { d.ui.title = e.target.value; }} />
          </div>
        </div>
        <div class="grid2">
          <div>
            <label class="f">卡片背景色</label>
            ${this._renderColor(d.ui, "card_bg")}
          </div>
          <div>
            <label class="f">正文文字颜色</label>
            ${this._renderColor(d.ui, "text_color")}
          </div>
        </div>
        <label class="f">操作按钮强调色</label>
        ${this._renderColor(d.ui, "accent")}
        <label class="f">底部备注文字</label>
        <input type="text" .value=${d.ui.footer} @input=${(e) => { d.ui.footer = e.target.value; }} />
      </div>

      <div class="row" style="justify-content:flex-end">
        <button class="btn" @click=${() => { this._draft = null; this._view = "list"; }}>取消</button>
        <button class="btn primary" ?disabled=${this._busy} @click=${() => this._saveShare()}>
          ${this._busy ? "保存中…" : "保存并生成链接"}
        </button>
      </div>
    `;
  }

  _renderColor(ui, key) {
    return html`
      <div class="color-row">
        <input type="color" .value=${ui[key] || "#4f6ef7"}
          @input=${(e) => { ui[key] = e.target.value; this.requestUpdate(); }} />
        <span class="mono">${ui[key] || "主题默认"}</span>
        ${ui[key] ? html`<button class="btn small" @click=${() => { ui[key] = ""; this.requestUpdate(); }}>清除</button>` : ""}
      </div>
    `;
  }

  /* ---------- 全局设置 ---------- */
  _renderSettings() {
    const d = this._settingsDraft;
    if (!d) return html`<div class="card"><div class="empty">加载中…</div></div>`;
    return html`
      <h1>全局设置</h1>
      <div class="card">
        <label class="f">外网基础地址（生成分享链接时拼接，如 https://ha.example.com）</label>
        <div class="row">
          <input type="text" style="flex:1" placeholder="https://你的HA外网域名" .value=${d.base_url || ""}
            @input=${(e) => { d.base_url = e.target.value; }} />
          <button class="btn" ?disabled=${this._busy} @click=${() => this._checkUrl()}>自检</button>
        </div>
        ${this._effBase && !d.base_url ? html`<div class="hint">当前回退使用 HA 外部地址：${this._effBase}</div>` : ""}
        <div class="grid2">
          <div>
            <label class="f">默认状态轮询间隔（2-10 秒）</label>
            <input type="number" min="2" max="10" .value=${d.poll_interval}
              @input=${(e) => { d.poll_interval = parseInt(e.target.value, 10) || 5; }} />
          </div>
          <div>
            <label class="f">日志保留天数</label>
            <input type="number" min="1" max="3650" .value=${d.log_retention_days}
              @input=${(e) => { d.log_retention_days = parseInt(e.target.value, 10) || 90; }} />
          </div>
        </div>
        <div class="grid2">
          <div>
            <label class="f">密码错误最大重试次数</label>
            <input type="number" min="1" max="100" .value=${d.max_password_retries}
              @input=${(e) => { d.max_password_retries = parseInt(e.target.value, 10) || 5; }} />
          </div>
          <div>
            <label class="f">达到上限后锁定时长（分钟）</label>
            <input type="number" min="1" max="1440" .value=${d.lockout_minutes}
              @input=${(e) => { d.lockout_minutes = parseInt(e.target.value, 10) || 10; }} />
          </div>
        </div>
        <div class="row" style="justify-content:flex-end;margin-top:14px">
          <button class="btn primary" ?disabled=${this._busy} @click=${() => this._saveSettings()}>
            ${this._busy ? "保存中…" : "保存设置"}
          </button>
        </div>
      </div>
    `;
  }

  /* ---------- 审计日志 ---------- */
  _renderLogs() {
    const f = this._logFilter;
    return html`
      <h1>审计日志</h1>
      <div class="card">
        <div class="row">
          <select style="width:auto" .value=${f.share_id}
            @change=${(e) => { f.share_id = e.target.value; this.requestUpdate(); }}>
            <option value="">全部分享</option>
            ${this._shares.map((s) => html`<option value=${s.id}>${s.name}</option>`)}
          </select>
          <input type="date" .value=${f.start} @input=${(e) => { f.start = e.target.value; }} />
          <span style="color:var(--hs-muted)">至</span>
          <input type="date" .value=${f.end} @input=${(e) => { f.end = e.target.value; }} />
          <button class="btn primary" ?disabled=${this._busy} @click=${() => this._queryLogs()}>查询</button>
          <button class="btn" @click=${() => this._exportCsv()}>导出 CSV</button>
        </div>
        <div class="hint">共 ${this._logTotal} 条记录${this._logTotal > 500 ? "（仅显示最近 500 条）" : ""}</div>
      </div>
      <div class="card">
        ${this._logs.length === 0 ? html`<div class="empty">暂无日志，点击「查询」加载</div>` : html`
          <div class="etab-wrap">
            <table class="ltab">
              <thead><tr>
                <th>时间</th><th>IP</th><th>分享</th><th>事件</th><th>实体</th><th>动作</th><th>剩余</th><th>详情</th>
              </tr></thead>
              <tbody>
                ${this._logs.map((l) => html`
                  <tr>
                    <td class="mono">${fmtTime(l.t)}</td>
                    <td class="mono">${l.ip || "—"}</td>
                    <td>${l.share_name || "—"}</td>
                    <td class=${l.event === "call_ok" || l.event === "password_ok" ? "ev-ok"
                      : (l.event === "blocked" || l.event === "call_fail" || l.event === "password_fail" ? "ev-err" : "ev-mut")}>
                      ${EVENT_TEXT[l.event] || l.event}</td>
                    <td class="mono">${l.entity_id || "—"}</td>
                    <td class="mono">${l.action || "—"}</td>
                    <td>${l.remaining_before != null ? l.remaining_before : "—"}</td>
                    <td>${l.detail || "—"}</td>
                  </tr>`)}
              </tbody>
            </table>
          </div>`}
      </div>
    `;
  }

  /* ---------- 弹层 ---------- */
  _renderQrDialog() {
    const q = this._qrData;
    return html`
      <div class="mask" @click=${() => { this._qrData = null; }}>
        <div class="dlg" @click=${(e) => e.stopPropagation()}>
          <h3>${q.name || "分享链接"}</h3>
          ${q.png ? html`<img class="qr-img" alt="二维码" src=${q.png} />`
            : html`<p>${q.error ? "二维码生成失败：" + esc(q.error) : "二维码生成失败"}</p>`}
          ${q.url ? html`
            <p class="mono" style="word-break:break-all">${q.url}</p>
            <div class="row">
              <button class="btn grow" @click=${() => this._copy(q.url)}>复制链接</button>
              ${q.png ? html`
                <a class="btn grow" style="text-decoration:none;text-align:center" download="ha_share_qr.png" href=${q.png}>下载二维码</a>` : ""}
              <button class="btn grow" @click=${() => window.open(q.url, "_blank")}>预览</button>
            </div>` : html`<p>未配置外网基础地址，请到「全局设置」填写后重试。</p>`}
          <div class="row"><button class="btn grow" @click=${() => { this._qrData = null; }}>关闭</button></div>
        </div>
      </div>
    `;
  }

  _renderConfirm() {
    const c = this._confirm;
    return html`
      <div class="mask" @click=${() => { this._confirm = null; }}>
        <div class="dlg" @click=${(e) => e.stopPropagation()}>
          <h3>${c.title}</h3>
          <p>${c.text}</p>
          <div class="row">
            <button class="btn grow" @click=${() => { this._confirm = null; }}>取消</button>
            <button class="btn grow danger" @click=${() => { const cb = c.onOk; this._confirm = null; cb && cb(); }}>${c.okLabel || "确认"}</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderToast() {
    const t = this._toastMsg;
    return html`<div class="toast show ${t.type}">${t.text}</div>`;
  }
}

customElements.define("ha-share-panel", HaSharePanel);
