// node_modules/@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js
var EffectType;
(function(EffectType2) {
  EffectType2[EffectType2["EFFECT_REALTIME_SUB"] = 0] = "EFFECT_REALTIME_SUB";
  EffectType2[EffectType2["EFFECT_RERENDER_UI"] = 1] = "EFFECT_RERENDER_UI";
  EffectType2[EffectType2["EFFECT_RELOAD_PART"] = 2] = "EFFECT_RELOAD_PART";
  EffectType2[EffectType2["EFFECT_SHOW_FORM"] = 3] = "EFFECT_SHOW_FORM";
  EffectType2[EffectType2["EFFECT_SHOW_TOAST"] = 4] = "EFFECT_SHOW_TOAST";
  EffectType2[EffectType2["EFFECT_NAVIGATE_TO_URL"] = 5] = "EFFECT_NAVIGATE_TO_URL";
  EffectType2[EffectType2["EFFECT_SET_INTERVALS"] = 7] = "EFFECT_SET_INTERVALS";
  EffectType2[EffectType2["EFFECT_CREATE_ORDER"] = 8] = "EFFECT_CREATE_ORDER";
  EffectType2[EffectType2["EFFECT_WEB_VIEW"] = 9] = "EFFECT_WEB_VIEW";
  EffectType2[EffectType2["EFFECT_CAN_RUN_AS_USER"] = 11] = "EFFECT_CAN_RUN_AS_USER";
  EffectType2[EffectType2["EFFECT_TELEMETRY"] = 12] = "EFFECT_TELEMETRY";
  EffectType2[EffectType2["EFFECT_UPDATE_REQUEST_CONTEXT"] = 13] = "EFFECT_UPDATE_REQUEST_CONTEXT";
  EffectType2[EffectType2["EFFECT_SCREENSHOT_RESPONSE"] = 14] = "EFFECT_SCREENSHOT_RESPONSE";
  EffectType2[EffectType2["EFFECT_LOGIN_PROMPT"] = 15] = "EFFECT_LOGIN_PROMPT";
  EffectType2[EffectType2["EFFECT_PROMOTED_TELEMETRY"] = 16] = "EFFECT_PROMOTED_TELEMETRY";
  EffectType2[EffectType2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(EffectType || (EffectType = {}));

// node_modules/@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/immersive_mode.js
var WebViewImmersiveMode;
(function(WebViewImmersiveMode2) {
  WebViewImmersiveMode2[WebViewImmersiveMode2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  WebViewImmersiveMode2[WebViewImmersiveMode2["INLINE_MODE"] = 1] = "INLINE_MODE";
  WebViewImmersiveMode2[WebViewImmersiveMode2["IMMERSIVE_MODE"] = 2] = "IMMERSIVE_MODE";
  WebViewImmersiveMode2[WebViewImmersiveMode2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(WebViewImmersiveMode || (WebViewImmersiveMode = {}));

// node_modules/@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/post_message.js
var WebViewInternalMessageScope;
(function(WebViewInternalMessageScope2) {
  WebViewInternalMessageScope2[WebViewInternalMessageScope2["CLIENT"] = 0] = "CLIENT";
  WebViewInternalMessageScope2[WebViewInternalMessageScope2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(WebViewInternalMessageScope || (WebViewInternalMessageScope = {}));

// node_modules/@devvit/shared-types/client/emit-effect.js
var webViewInternalMessageType = "devvit-internal";
var emitEffect = (effect, requestId) => {
  const message = {
    ...effect,
    realtimeEffect: effect.realtime,
    // to-do: remove deprecated field.
    id: requestId,
    scope: WebViewInternalMessageScope.CLIENT,
    type: webViewInternalMessageType
  };
  if (effect.showToast || effect.navigateToUrl) {
    message.effect = effect;
  }
  parent.postMessage(message, "*");
};

// node_modules/@devvit/shared-types/client/telemetry.js
function emitTelemetryClickEffect(event) {
  const click = TelemetryClickPayload(event.target, event.isTrusted);
  void emitEffect({
    type: EffectType.EFFECT_TELEMETRY,
    telemetry: { event: click.event, click },
    // to-do: remove once all clients support `telemetry`. Deprecated on
    //        2025-11-24.
    analytics: click
  });
}
function TelemetryClickPayload(eventTarget, isTrusted) {
  const { definition, elemTrackId } = analyzeClickTarget(eventTarget, isTrusted);
  return { event: "click", definition, elemTrackId };
}
function analyzeClickTarget(eventTarget, isTrusted) {
  const targetElement = getTargetElement(eventTarget);
  if (!targetElement) {
    return { definition: "default", elemTrackId: void 0 };
  }
  let definition = "default";
  if (isTrusted) {
    const computedStyles = globalThis.window.getComputedStyle(targetElement);
    if (computedStyles?.getPropertyValue("cursor") === "pointer") {
      definition = "strict";
    }
  }
  let elemTrackId;
  let currentElement = targetElement;
  while (currentElement) {
    if (elemTrackId === void 0) {
      const dataTrackId = currentElement.getAttribute("data-track-id");
      if (dataTrackId) {
        elemTrackId = dataTrackId;
      } else if (currentElement.id) {
        elemTrackId = currentElement.id;
      }
    }
    if (isTrusted && definition === "default" && elementIsStrictClickTarget(currentElement)) {
      definition = "strict";
    }
    if (elemTrackId !== void 0 && (!isTrusted || definition === "strict")) {
      break;
    }
    currentElement = currentElement.parentElement;
  }
  return { definition, elemTrackId };
}
function getTargetElement(eventTarget) {
  if (!eventTarget || typeof eventTarget !== "object" || !("nodeType" in eventTarget)) {
    return void 0;
  }
  const node = eventTarget;
  return node.nodeType === 1 ? node : node.parentElement ?? void 0;
}
function elementIsStrictClickTarget(element) {
  const STRICT_CLICK_TAGNAMES = ["A", "BUTTON", "CANVAS", "INPUT", "SELECT", "TEXTAREA", "LABEL"];
  return STRICT_CLICK_TAGNAMES.includes(element.tagName) || ["true", "plaintext-only"].includes(element.getAttribute("contenteditable") ?? "");
}

// node_modules/@devvit/shared-types/constants.js
var apiPathPrefix = "/api/";

// node_modules/@devvit/shared-types/webbit.js
var tokenParam = "token";

// node_modules/@devvit/client/effects/web-view-mode.js
var modeListeners = /* @__PURE__ */ new Set();
function getWebViewMode() {
  return webViewMode(devvit.webViewMode);
}
function requestExpandedMode(event, entry) {
  if (devvit.webViewMode === WebViewImmersiveMode.IMMERSIVE_MODE)
    throw Error("web view is already expanded");
  emitTelemetryClickEffect(event);
  emitModeEffect(WebViewImmersiveMode.IMMERSIVE_MODE, event, entry);
}
function emitModeEffect(mode, event, entry) {
  if (!event.isTrusted || event.type !== "click") {
    console.error("Expanded mode effect ignored due to untrusted event");
    throw new Error("Untrusted event");
  }
  if (entry != null && !devvit.entrypoints[entry])
    throw Error(`no entrypoint named "${entry}"; all entrypoints must appear in \`devvit.json\` \`post.entrypoints\``);
  let entryUrl;
  if (entry) {
    const url = new URL(devvit.entrypoints[entry]);
    if (url.pathname.startsWith(apiPathPrefix))
      url.searchParams.set(tokenParam, devvit.token);
    entryUrl = `${url}`;
  }
  emitEffect({
    type: EffectType.EFFECT_WEB_VIEW,
    immersiveMode: { entryUrl, immersiveMode: mode }
  });
}
function initWebViewMode() {
  addEventListener("message", onWebViewMessage);
}
function onWebViewMessage(ev) {
  if (ev.data?.type !== "devvit-message")
    return;
  if (!ev.data?.data?.immersiveModeEvent)
    return;
  const mode = getWebViewMode();
  for (const listener of modeListeners)
    listener(mode);
}
function webViewMode(mode) {
  switch (mode) {
    case WebViewImmersiveMode.IMMERSIVE_MODE:
      return "expanded";
    case WebViewImmersiveMode.INLINE_MODE:
    case WebViewImmersiveMode.UNRECOGNIZED:
    case WebViewImmersiveMode.UNSPECIFIED:
    case void 0:
      return "inline";
    default:
      mode;
      throw Error(`${mode} not a WebViewImmersiveMode`);
  }
}

// node_modules/@devvit/client/clientContext.js
var context = globalThis.devvit?.context;

// node_modules/@devvit/shared-types/thing-navigation.js
function resolveNavigationInput(thingOrUrl) {
  if (typeof thingOrUrl === "string") {
    return thingOrUrl;
  }
  const { url, permalink } = thingOrUrl;
  if (permalink === void 0) {
    return url;
  }
  try {
    if (new URL(url).pathname !== permalink) {
      return new URL(permalink, "https://www.reddit.com").toString();
    }
  } catch {
    return new URL(permalink, "https://www.reddit.com").toString();
  }
  return url;
}

// node_modules/@devvit/client/effects/navigate-to.js
function navigateTo(url) {
  const inputUrl = resolveNavigationInput(url);
  let normalizedUrl;
  try {
    normalizedUrl = new URL(inputUrl).toString();
  } catch {
    throw new TypeError(`Invalid URL: ${inputUrl}`);
  }
  void emitEffect({
    navigateToUrl: {
      url: normalizedUrl
    },
    type: 5
  });
}

// node_modules/@devvit/protos/json/reddit/devvit/app_permission/v1/app_permission.js
var ConsentStatus;
(function(ConsentStatus2) {
  ConsentStatus2[ConsentStatus2["CONSENT_STATUS_UNKNOWN"] = 0] = "CONSENT_STATUS_UNKNOWN";
  ConsentStatus2[ConsentStatus2["REVOKED"] = 1] = "REVOKED";
  ConsentStatus2[ConsentStatus2["GRANTED"] = 2] = "GRANTED";
  ConsentStatus2[ConsentStatus2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(ConsentStatus || (ConsentStatus = {}));
var Scope;
(function(Scope2) {
  Scope2[Scope2["SCOPE_UNKNOWN"] = 0] = "SCOPE_UNKNOWN";
  Scope2[Scope2["SUBMIT_POST"] = 1] = "SUBMIT_POST";
  Scope2[Scope2["SUBMIT_COMMENT"] = 2] = "SUBMIT_COMMENT";
  Scope2[Scope2["SUBSCRIBE_TO_SUBREDDIT"] = 3] = "SUBSCRIBE_TO_SUBREDDIT";
  Scope2[Scope2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(Scope || (Scope = {}));

// node_modules/@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js
var Client;
(function(Client2) {
  Client2[Client2["CLIENT_UNSPECIFIED"] = 0] = "CLIENT_UNSPECIFIED";
  Client2[Client2["ANDROID"] = 1] = "ANDROID";
  Client2[Client2["IOS"] = 2] = "IOS";
  Client2[Client2["SHREDDIT"] = 3] = "SHREDDIT";
  Client2[Client2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(Client || (Client = {}));
var Height;
(function(Height2) {
  Height2[Height2["HEIGHT_UNSPECIFIED"] = 0] = "HEIGHT_UNSPECIFIED";
  Height2[Height2["REGULAR"] = 1] = "REGULAR";
  Height2[Height2["TALL"] = 2] = "TALL";
  Height2[Height2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(Height || (Height = {}));

// node_modules/@devvit/shared-types/tid.js
var T_PREFIX;
(function(T_PREFIX2) {
  T_PREFIX2["COMMENT"] = "t1_";
  T_PREFIX2["ACCOUNT"] = "t2_";
  T_PREFIX2["LINK"] = "t3_";
  T_PREFIX2["MESSAGE"] = "t4_";
  T_PREFIX2["SUBREDDIT"] = "t5_";
  T_PREFIX2["AWARD"] = "t6_";
})(T_PREFIX || (T_PREFIX = {}));

// node_modules/@devvit/shared-types/web-view-scripts-constants.js
var devvitScriptFileName = "devvit.v1.min.js";
var devvitScriptUrl = `https://webview.devvit.net/scripts/${devvitScriptFileName}`;

// node_modules/jwt-decode/build/esm/index.js
var InvalidTokenError = class extends Error {
};
InvalidTokenError.prototype.name = "InvalidTokenError";

// node_modules/@devvit/protos/json/devvit/ui/form_builder/v1alpha/type.js
var FormFieldType;
(function(FormFieldType2) {
  FormFieldType2[FormFieldType2["STRING"] = 0] = "STRING";
  FormFieldType2[FormFieldType2["PARAGRAPH"] = 1] = "PARAGRAPH";
  FormFieldType2[FormFieldType2["NUMBER"] = 2] = "NUMBER";
  FormFieldType2[FormFieldType2["BOOLEAN"] = 3] = "BOOLEAN";
  FormFieldType2[FormFieldType2["LIST"] = 4] = "LIST";
  FormFieldType2[FormFieldType2["SELECTION"] = 5] = "SELECTION";
  FormFieldType2[FormFieldType2["GROUP"] = 6] = "GROUP";
  FormFieldType2[FormFieldType2["IMAGE"] = 7] = "IMAGE";
  FormFieldType2[FormFieldType2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(FormFieldType || (FormFieldType = {}));

// node_modules/@devvit/protos/json/devvit/events/v1alpha/events.js
var EventSource;
(function(EventSource2) {
  EventSource2[EventSource2["UNKNOWN_EVENT_SOURCE"] = 0] = "UNKNOWN_EVENT_SOURCE";
  EventSource2[EventSource2["USER"] = 1] = "USER";
  EventSource2[EventSource2["ADMIN"] = 2] = "ADMIN";
  EventSource2[EventSource2["MODERATOR"] = 3] = "MODERATOR";
  EventSource2[EventSource2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(EventSource || (EventSource = {}));
var DeletionReason;
(function(DeletionReason2) {
  DeletionReason2[DeletionReason2["UNSPECIFIED_DELETION_REASON"] = 0] = "UNSPECIFIED_DELETION_REASON";
  DeletionReason2[DeletionReason2["SPAM"] = 1] = "SPAM";
  DeletionReason2[DeletionReason2["LEGAL"] = 2] = "LEGAL";
  DeletionReason2[DeletionReason2["OTHER"] = 3] = "OTHER";
  DeletionReason2[DeletionReason2["UNKNOWN"] = 4] = "UNKNOWN";
  DeletionReason2[DeletionReason2["EXPLICIT_CONTENT"] = 5] = "EXPLICIT_CONTENT";
  DeletionReason2[DeletionReason2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(DeletionReason || (DeletionReason = {}));

// node_modules/@devvit/protos/json/devvit/reddit/v2alpha/postv2.js
var CrowdControlLevel;
(function(CrowdControlLevel2) {
  CrowdControlLevel2[CrowdControlLevel2["OFF"] = 0] = "OFF";
  CrowdControlLevel2[CrowdControlLevel2["LENIENT"] = 1] = "LENIENT";
  CrowdControlLevel2[CrowdControlLevel2["MEDIUM"] = 2] = "MEDIUM";
  CrowdControlLevel2[CrowdControlLevel2["STRICT"] = 3] = "STRICT";
  CrowdControlLevel2[CrowdControlLevel2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(CrowdControlLevel || (CrowdControlLevel = {}));
var DistinguishType;
(function(DistinguishType2) {
  DistinguishType2[DistinguishType2["NULL_VALUE"] = 0] = "NULL_VALUE";
  DistinguishType2[DistinguishType2["ADMIN"] = 1] = "ADMIN";
  DistinguishType2[DistinguishType2["GOLD"] = 2] = "GOLD";
  DistinguishType2[DistinguishType2["GOLD_AUTO"] = 3] = "GOLD_AUTO";
  DistinguishType2[DistinguishType2["YES"] = 4] = "YES";
  DistinguishType2[DistinguishType2["SPECIAL"] = 5] = "SPECIAL";
  DistinguishType2[DistinguishType2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(DistinguishType || (DistinguishType = {}));

// node_modules/@devvit/protos/json/devvit/reddit/v2alpha/subredditv2.js
var SubredditType;
(function(SubredditType2) {
  SubredditType2[SubredditType2["ARCHIVED"] = 0] = "ARCHIVED";
  SubredditType2[SubredditType2["EMPLOYEES_ONLY"] = 1] = "EMPLOYEES_ONLY";
  SubredditType2[SubredditType2["GOLD_ONLY"] = 2] = "GOLD_ONLY";
  SubredditType2[SubredditType2["GOLD_RESTRICTED"] = 3] = "GOLD_RESTRICTED";
  SubredditType2[SubredditType2["PRIVATE"] = 4] = "PRIVATE";
  SubredditType2[SubredditType2["PUBLIC"] = 5] = "PUBLIC";
  SubredditType2[SubredditType2["RESTRICTED"] = 6] = "RESTRICTED";
  SubredditType2[SubredditType2["USER"] = 7] = "USER";
  SubredditType2[SubredditType2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(SubredditType || (SubredditType = {}));
var SubredditRating;
(function(SubredditRating2) {
  SubredditRating2[SubredditRating2["UNKNOWN_SUBREDDIT_RATING"] = 0] = "UNKNOWN_SUBREDDIT_RATING";
  SubredditRating2[SubredditRating2["E"] = 1] = "E";
  SubredditRating2[SubredditRating2["M1"] = 2] = "M1";
  SubredditRating2[SubredditRating2["M2"] = 3] = "M2";
  SubredditRating2[SubredditRating2["D"] = 4] = "D";
  SubredditRating2[SubredditRating2["V"] = 5] = "V";
  SubredditRating2[SubredditRating2["X"] = 6] = "X";
  SubredditRating2[SubredditRating2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(SubredditRating || (SubredditRating = {}));
var SubredditTypeV2;
(function(SubredditTypeV22) {
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_UNSPECIFIED"] = 0] = "SUBREDDIT_TYPE_UNSPECIFIED";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_UNKNOWN"] = 1] = "SUBREDDIT_TYPE_UNKNOWN";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_ARCHIVED"] = 2] = "SUBREDDIT_TYPE_ARCHIVED";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_EMPLOYEES_ONLY"] = 3] = "SUBREDDIT_TYPE_EMPLOYEES_ONLY";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_GOLD_ONLY"] = 4] = "SUBREDDIT_TYPE_GOLD_ONLY";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_GOLD_RESTRICTED"] = 5] = "SUBREDDIT_TYPE_GOLD_RESTRICTED";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_PRIVATE"] = 6] = "SUBREDDIT_TYPE_PRIVATE";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_PUBLIC"] = 7] = "SUBREDDIT_TYPE_PUBLIC";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_RESTRICTED"] = 8] = "SUBREDDIT_TYPE_RESTRICTED";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_USER"] = 9] = "SUBREDDIT_TYPE_USER";
  SubredditTypeV22[SubredditTypeV22["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(SubredditTypeV2 || (SubredditTypeV2 = {}));
var SubredditRatingV2;
(function(SubredditRatingV22) {
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_UNSPECIFIED"] = 0] = "SUBREDDIT_RATING_UNSPECIFIED";
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_UNKNOWN"] = 1] = "SUBREDDIT_RATING_UNKNOWN";
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_E"] = 2] = "SUBREDDIT_RATING_E";
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_M1"] = 3] = "SUBREDDIT_RATING_M1";
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_M2"] = 4] = "SUBREDDIT_RATING_M2";
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_D"] = 5] = "SUBREDDIT_RATING_D";
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_V"] = 6] = "SUBREDDIT_RATING_V";
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_X"] = 7] = "SUBREDDIT_RATING_X";
  SubredditRatingV22[SubredditRatingV22["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(SubredditRatingV2 || (SubredditRatingV2 = {}));

// node_modules/@devvit/shared-types/shared/form.js
var SettingScope;
(function(SettingScope2) {
  SettingScope2["Installation"] = "installation";
  SettingScope2["App"] = "app";
})(SettingScope || (SettingScope = {}));

// node_modules/@devvit/client/index.js
initWebViewMode();

// node_modules/@devvit/protos/json/devvit/ui/effect_types/v1alpha/create_order.js
var OrderResultStatus;
(function(OrderResultStatus2) {
  OrderResultStatus2[OrderResultStatus2["STATUS_CANCELLED"] = 0] = "STATUS_CANCELLED";
  OrderResultStatus2[OrderResultStatus2["STATUS_SUCCESS"] = 1] = "STATUS_SUCCESS";
  OrderResultStatus2[OrderResultStatus2["STATUS_ERROR"] = 2] = "STATUS_ERROR";
  OrderResultStatus2[OrderResultStatus2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(OrderResultStatus || (OrderResultStatus = {}));

// node_modules/@devvit/protos/json/devvit/ui/effects/v1alpha/realtime_subscriptions.js
var RealtimeSubscriptionStatus;
(function(RealtimeSubscriptionStatus2) {
  RealtimeSubscriptionStatus2[RealtimeSubscriptionStatus2["REALTIME_SUBSCRIBED"] = 0] = "REALTIME_SUBSCRIBED";
  RealtimeSubscriptionStatus2[RealtimeSubscriptionStatus2["REALTIME_UNSUBSCRIBED"] = 1] = "REALTIME_UNSUBSCRIBED";
  RealtimeSubscriptionStatus2[RealtimeSubscriptionStatus2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(RealtimeSubscriptionStatus || (RealtimeSubscriptionStatus = {}));

// src/client/splash.ts
var FINAL_STATES = [
  "Final",
  "Game Over",
  "Final: Tied",
  "Completed Early",
  "Completed Early: Rain",
  "Completed Early: Mercy",
  "Cancelled",
  "Cancelled: Rain"
];
var PRE_GAME_STATES = ["Pre-Game", "Scheduled", "Warmup"];
var isFinalState = (s) => FINAL_STATES.includes(s);
var isPreGameState = (s) => PRE_GAME_STATES.includes(s);
var isSuspendedState = (s) => s.startsWith("Suspended");
var isLiveState = (s) => !isFinalState(s) && !isPreGameState(s) && !["Postponed", "Suspended", "Suspended: Rain", "Cancelled", "Cancelled: Rain", "Delayed"].includes(s);
var isTerminalState = (s) => isFinalState(s) || s === "Postponed";
var MLB_TEAM_IDS = /* @__PURE__ */ new Set([
  108,
  109,
  110,
  111,
  112,
  113,
  114,
  115,
  116,
  117,
  118,
  119,
  120,
  121,
  133,
  134,
  135,
  136,
  137,
  138,
  139,
  140,
  141,
  142,
  143,
  144,
  145,
  146,
  147,
  158
]);
var PITCH_MAP = {
  FF: { label: "4-Seam", abbr: "FF", color: "#e63946" },
  FA: { label: "4-Seam", abbr: "FF", color: "#e63946" },
  FT: { label: "2-Seam", abbr: "FT", color: "#c1121f" },
  SI: { label: "Sinker", abbr: "SI", color: "#c1121f" },
  FC: { label: "Cutter", abbr: "FC", color: "#f4a261" },
  SL: { label: "Slider", abbr: "SL", color: "#2a9d8f" },
  ST: { label: "Sweeper", abbr: "ST", color: "#fb8500" },
  SV: { label: "Slurve", abbr: "SV", color: "#3a86ff" },
  CU: { label: "Curve", abbr: "CU", color: "#457b9d" },
  KC: { label: "Knuck-Cur", abbr: "KC", color: "#457b9d" },
  CS: { label: "Slow Cur", abbr: "CS", color: "#457b9d" },
  CH: { label: "Change", abbr: "CH", color: "#8338ec" },
  FS: { label: "Splitter", abbr: "FS", color: "#06d6a0" },
  FO: { label: "Forkball", abbr: "FO", color: "#06d6a0" },
  KN: { label: "Knuckle", abbr: "KN", color: "#adb5bd" },
  EP: { label: "Eephus", abbr: "EP", color: "#adb5bd" },
  PO: { label: "Pitchout", abbr: "PO", color: "#6c757d" },
  IN: { label: "Int. Ball", abbr: "IN", color: "#6c757d" }
};
function pitchInfo(code) {
  return PITCH_MAP[code || ""] || { label: code || "?", abbr: code || "?", color: "#94a3b8" };
}
var ZONE_W = 120;
var ZONE_H = 155;
var SZ_LEFT = 22;
var SZ_RIGHT = 98;
var SZ_TOP = 24;
var SZ_BOT = 108;
var SZ_CX = (SZ_LEFT + SZ_RIGHT) / 2;
var PX_PER_FT = (SZ_RIGHT - SZ_LEFT) / 1.7;
var PZ_TOP_FT = 3.5;
var PZ_BOT_FT = 1.5;
var DZ_LEFT = SZ_LEFT + 6;
var DZ_RIGHT = SZ_RIGHT - 6;
var DZ_TOP = SZ_TOP + 5;
var DZ_BOT = SZ_BOT - 12;
function mapPx(pX) {
  return SZ_CX + pX * PX_PER_FT;
}
function mapPz(pZ) {
  return SZ_BOT - (pZ - PZ_BOT_FT) / (PZ_TOP_FT - PZ_BOT_FT) * (SZ_BOT - SZ_TOP);
}
function svgInk() {
  const light = document.documentElement.getAttribute("data-theme") === "light";
  return light ? {
    empty: "rgba(10,24,40,0.10)",
    faint: "rgba(10,24,40,0.32)",
    mid: "rgba(10,24,40,0.30)",
    strong: "rgba(10,24,40,0.62)",
    label: "rgba(10,24,40,0.50)",
    grid: "rgba(10,24,40,0.10)",
    chartBg: "rgba(10,24,40,0.05)",
    dotFill: "#0a1828",
    dotRing: "rgba(10,24,40,0.6)"
  } : {
    empty: "rgba(255,255,255,0.08)",
    faint: "rgba(255,255,255,0.35)",
    mid: "rgba(255,255,255,0.30)",
    strong: "rgba(255,255,255,0.55)",
    label: "rgba(255,255,255,0.45)",
    grid: "rgba(255,255,255,0.08)",
    chartBg: "rgba(255,255,255,0.04)",
    dotFill: "#fff",
    dotRing: "rgba(255,255,255,0.6)"
  };
}
function svgRed() {
  const light = document.documentElement.getAttribute("data-theme") === "light";
  return light ? {
    fill: "#bf0d3ca6",
    fillDim: "#bf0d3c8c",
    stroke: "#bf0d3c92",
    strokeDim: "#bf0d3c72",
    zone: "#bf0d3c85",
    zoneGrid: "#bf0d3c2e",
    zoneFill: "#bf0d3c0d",
    dot: "#bf0d3ce0",
    dotBall: "#2a9d5cf0",
    lastRing: "#002D72",
    dotOpacity: "0.82"
  } : {
    fill: "#ff5c7fb3",
    fillDim: "#ff5c7f8a",
    stroke: "#ff5c7fa6",
    strokeDim: "#ff5c7f70",
    zone: "#ff5c7f8f",
    zoneGrid: "#ff5c7f38",
    zoneFill: "#ff5c7f12",
    dot: "#ff5c7fdb",
    dotBall: "#3fd18ae0",
    lastRing: "#ffffff",
    dotOpacity: "0.7"
  };
}
function pitchOutcomeColor(p) {
  const r = svgRed();
  return p?.details?.isBall ? r.dotBall : r.dot;
}
function slotHand(playerId, isBatter) {
  if (playerId == null) return "";
  const bio = lastGameData?.gameData?.players?.["ID" + playerId];
  if (isBatter) {
    const side = bio?.batSide?.code;
    return side === "S" ? "SWH" : side === "L" || side === "R" ? side + "HB" : "";
  }
  const hand = bio?.pitchHand?.code;
  return hand === "L" || hand === "R" ? hand + "HP" : "";
}
function slotPitchCount(teamBox, playerId) {
  if (playerId == null) return "";
  const p = teamBox?.players?.["ID" + playerId]?.stats?.pitching;
  const np = p?.numberOfPitches ?? p?.pitchesThrown;
  const st = p?.strikes;
  return np != null && st != null ? `${np}-${st}` : "";
}
function buildStrikeZoneSVG(pitches) {
  const ink = svgInk();
  const red = svgRed();
  const dW = DZ_RIGHT - DZ_LEFT, dH = DZ_BOT - DZ_TOP;
  const d3 = dW / 3, d3h = dH / 3;
  const dots = pitches.map((p, i) => {
    const px = p.pitchData?.coordinates?.pX;
    const pz = p.pitchData?.coordinates?.pZ;
    if (px == null || pz == null) return "";
    const cx = mapPx(px), cy = mapPz(pz);
    const isLast = i === pitches.length - 1;
    return `<circle cx="${cx}" cy="${cy}" r="${isLast ? 7 : 5}"
      fill="${pitchOutcomeColor(p)}" stroke="${isLast ? red.lastRing : ink.faint}"
      stroke-width="${isLast ? 2 : 1}" opacity="${isLast ? 1 : red.dotOpacity}"/>
      <text x="${cx}" y="${cy + 0.5}" text-anchor="middle" dominant-baseline="middle"
      font-size="${isLast ? 7 : 6}" font-weight="700" fill="white"
      font-family="monospace" pointer-events="none">${i + 1}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${ZONE_W} ${ZONE_H}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;">
    <rect x="${DZ_LEFT}" y="${DZ_TOP}" width="${dW}" height="${dH}"
      fill="${red.zoneFill}" stroke="${red.zone}" stroke-width="1.5" rx="1"/>
    <line x1="${DZ_LEFT + d3}" y1="${DZ_TOP}" x2="${DZ_LEFT + d3}" y2="${DZ_BOT}"
      stroke="${red.zoneGrid}" stroke-width="0.8" stroke-dasharray="3,2"/>
    <line x1="${DZ_LEFT + d3 * 2}" y1="${DZ_TOP}" x2="${DZ_LEFT + d3 * 2}" y2="${DZ_BOT}"
      stroke="${red.zoneGrid}" stroke-width="0.8" stroke-dasharray="3,2"/>
    <line x1="${DZ_LEFT}" y1="${DZ_TOP + d3h}" x2="${DZ_RIGHT}" y2="${DZ_TOP + d3h}"
      stroke="${red.zoneGrid}" stroke-width="0.8" stroke-dasharray="3,2"/>
    <line x1="${DZ_LEFT}" y1="${DZ_TOP + d3h * 2}" x2="${DZ_RIGHT}" y2="${DZ_TOP + d3h * 2}"
      stroke="${red.zoneGrid}" stroke-width="0.8" stroke-dasharray="3,2"/>
    <polygon points="${DZ_LEFT},${DZ_BOT + 5} ${DZ_RIGHT},${DZ_BOT + 5} ${DZ_RIGHT},${DZ_BOT + 12} ${SZ_CX},${DZ_BOT + 20} ${DZ_LEFT},${DZ_BOT + 12}"
      fill="${ink.strong}" stroke="${ink.mid}" stroke-width="1"/>
    ${dots}
  </svg>`;
}
function buildBasesSVG(outs, onBase) {
  const ink = svgInk();
  const red = svgRed();
  const outFill = (n) => outs >= n ? red.fill : ink.empty;
  const baseFill = (b) => b ? red.fill : ink.empty;
  return `<svg width="60" height="60" viewBox="0 0 58 79" xmlns="http://www.w3.org/2000/svg">
    <circle cx="13" cy="61" r="6" fill="${outFill(1)}" stroke="${red.stroke}" stroke-width="1.5"/>
    <circle cx="30" cy="61" r="6" fill="${outFill(2)}" stroke="${red.stroke}" stroke-width="1.5"/>
    <circle cx="47" cy="61" r="6" fill="${outFill(3)}" stroke="${red.stroke}" stroke-width="1.5"/>
    <rect x="17.6" y="29.7" width="14" height="14" transform="rotate(45 17.6 29.7)"
      fill="${baseFill(onBase?.third)}" stroke="${red.stroke}" stroke-width="1.5"/>
    <rect x="29.4" y="17.7" width="14" height="14" transform="rotate(45 29.4 17.7)"
      fill="${baseFill(onBase?.second)}" stroke="${red.stroke}" stroke-width="1.5"/>
    <rect x="41.6" y="29.7" width="14" height="14" transform="rotate(45 41.6 29.7)"
      fill="${baseFill(onBase?.first)}" stroke="${red.stroke}" stroke-width="1.5"/>
  </svg>`;
}
function getBatterSeasonStats(teamBox, batterId) {
  if (!teamBox || !batterId) return "\u2014";
  const stats = teamBox.players?.[`ID${batterId}`]?.seasonStats?.batting;
  if (!stats) return "\u2014";
  const avg = stats.avg || "---";
  const hr = stats.homeRuns ?? 0;
  const rbi = stats.rbi ?? 0;
  return `${avg} \xB7 ${hr} HR \xB7 ${rbi} RBI`;
}
function getPitcherInGameLine(teamBox, pitcherId) {
  if (!teamBox || !pitcherId) return "\u2014";
  const player = teamBox.players?.[`ID${pitcherId}`];
  const game = player?.stats?.pitching;
  const season = player?.seasonStats?.pitching;
  if (!game && !season) return "\u2014";
  const ip = game?.inningsPitched ?? "0.0";
  const k = game?.strikeOuts ?? 0;
  const era = season?.era ?? "\u2014";
  return `${ip} IP \xB7 ${k} K \xB7 ${era} ERA`;
}
function getPitcherSeasonStats(teamBox, pitcherId) {
  if (!teamBox || !pitcherId) return "\u2014";
  const player = teamBox.players?.[`ID${pitcherId}`];
  const stats = player?.seasonStats?.pitching;
  if (!stats) return "\u2014";
  const w = stats.wins ?? 0;
  const l = stats.losses ?? 0;
  const era = stats.era ?? "\u2014";
  const k = stats.strikeOuts ?? 0;
  return `${w}-${l}  \xB7  ${era} ERA  \xB7  ${k} K`;
}
function abbreviateSeriesDesc(desc) {
  if (!desc) return "Postseason";
  if (/world series/i.test(desc)) return "World Series";
  if (/american league championship/i.test(desc)) return "ALCS";
  if (/national league championship/i.test(desc)) return "NLCS";
  if (/american league division/i.test(desc)) return "ALDS";
  if (/national league division/i.test(desc)) return "NLDS";
  if (/american league wild card/i.test(desc)) return "AL Wild Card";
  if (/national league wild card/i.test(desc)) return "NL Wild Card";
  if (/wild card/i.test(desc)) return "Wild Card";
  return desc;
}
function getGameContextLabel(gameDataObj) {
  const gameInfo = gameDataObj?.game || {};
  const gameType = gameInfo.type || gameInfo.gameType || "R";
  const parts = [];
  if (["F", "D", "L", "W"].includes(gameType)) {
    const seriesPrefix = abbreviateSeriesDesc(gameInfo.seriesDescription || "");
    const gameNum = gameInfo.seriesGameNumber;
    parts.push(gameNum ? `${seriesPrefix} Game ${gameNum}` : seriesPrefix);
  } else if (gameType === "S") {
    parts.push("Spring Training");
  } else if (gameType === "A") {
    parts.push("All-Star Game");
  } else if (gameType === "E") {
    parts.push("Exhibition");
  }
  const dh = gameInfo.doubleHeader || "N";
  const dhNum = gameInfo.gameNumber;
  if (dh !== "N" && dhNum) {
    parts.push(`Game ${dhNum} of 2`);
  }
  return parts.join(" \xB7 ").toUpperCase();
}
var gamePk = null;
var pollInterval = null;
var lastGameData = null;
var postgameNotificationFired = false;
var postType = null;
var gameIsTerminal = false;
function isDebugEnabled() {
  try {
    const v = (new URLSearchParams(location.search).get("debug") || "").toLowerCase();
    if (v === "1" || v === "true" || v === "yes") return true;
  } catch {
  }
  try {
    if (localStorage.getItem("mlb-scores-debug") === "1") return true;
  } catch {
  }
  return false;
}
var DEBUG_OVERLAY = isDebugEnabled();
function reportError(label, e) {
  console.error(`[${label}]`, e);
  if (!DEBUG_OVERLAY) return;
  let overlay = document.getElementById("error-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "error-overlay";
    overlay.style.cssText = "position:fixed;top:0;left:0;right:0;background:rgba(180,0,0,0.95);color:#fff;padding:8px 12px;font-family:monospace;font-size:10px;z-index:99999;max-height:40vh;overflow-y:auto;border-bottom:2px solid #fff;line-height:1.4;white-space:pre-wrap;word-break:break-word;";
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
  }
  const msg = e instanceof Error ? `${e.message}
${e.stack || ""}` : String(e);
  const line = document.createElement("div");
  line.style.cssText = "padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.2);";
  line.textContent = `[${label}] ${msg}`;
  overlay.appendChild(line);
}
window.addEventListener("error", (e) => reportError("window.error", e.error || e.message));
window.addEventListener("unhandledrejection", (e) => reportError("unhandled promise", e.reason));
var $ = (id) => document.getElementById(id);
function baseLogoPath(teamId) {
  return `/teams/${teamId}.svg`;
}
function getLogoPath(teamId) {
  const light = document.documentElement.getAttribute("data-theme") === "light";
  if (light) return `/teams/${teamId}.svg`;
  return MLB_TEAM_IDS.has(teamId) ? `/teams/dark/${teamId}.svg` : `/teams/${teamId}.svg`;
}
var logoFallbackAttr = (teamId) => `this.onerror=null;this.src='${baseLogoPath(teamId)}'`;
function loadLogo(imgEl, teamId) {
  imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.src = baseLogoPath(teamId);
  };
  imgEl.src = getLogoPath(teamId);
}
function formatGameTime(gameDate) {
  const d = new Date(gameDate);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}
function getTeamShortName(team) {
  if (!team) return "";
  if (team.teamName) return team.teamName;
  if (team.clubName) return team.clubName;
  const name = team.name || "";
  if (name.includes("Red Sox")) return "Red Sox";
  if (name.includes("White Sox")) return "White Sox";
  if (name.includes("Blue Jays")) return "Blue Jays";
  const parts = name.split(" ");
  return parts[parts.length - 1] || team.abbreviation || "";
}
function formatPitcherName(fullName) {
  const safe = (fullName || "").trim();
  if (!safe) return "TBD";
  const parts = safe.split(/\s+/);
  if (parts.length === 1) {
    return safe;
  }
  const last = parts.pop();
  const rest = parts.join(" ");
  return `${rest}<br>${last}`;
}
function hideAllStatePanes() {
  ["pregame-content", "live-content", "final-content", "postponed-content", "suspended-content"].forEach((id) => {
    const el = $(id);
    if (el) el.style.display = "none";
  });
}
var EXPAND_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
function isExpandedMode() {
  try {
    return getWebViewMode() === "expanded";
  } catch {
    return false;
  }
}
var pagerScrollWired = /* @__PURE__ */ new WeakSet();
var pagerRaf = 0;
function scheduleInlinePagerSync() {
  if (pagerRaf) return;
  pagerRaf = requestAnimationFrame(() => {
    pagerRaf = 0;
    updateInlinePager();
  });
}
function inlinePagerRegion() {
  const active = document.querySelector(".tab-content.tab-content-active");
  if (!active) return null;
  return active.querySelector(".bs-panel-wrap") || active;
}
function updateInlinePager() {
  const pager = document.getElementById("inline-pager");
  if (!pager) return;
  const inline = document.body.classList.contains("is-inline");
  const region = inline ? inlinePagerRegion() : null;
  const needed = !!region && region.scrollHeight > region.clientHeight + 2;
  pager.classList.toggle("pager-active", inline && needed);
  if (!needed || !region) return;
  const bar = document.querySelector(".tab-bar");
  pager.style.bottom = (bar ? bar.offsetHeight : 56) + 10 + "px";
  const up = document.getElementById("inline-pager-up");
  const down = document.getElementById("inline-pager-down");
  if (up) up.disabled = region.scrollTop <= 1;
  if (down) down.disabled = region.scrollTop >= region.scrollHeight - region.clientHeight - 1;
  if (!pagerScrollWired.has(region)) {
    region.addEventListener("scroll", scheduleInlinePagerSync, { passive: true });
    pagerScrollWired.add(region);
  }
}
function setupInlinePager() {
  const host = $("scorebug-content");
  if (!host || document.getElementById("inline-pager")) return;
  const chev = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';
  const pager = document.createElement("div");
  pager.id = "inline-pager";
  const mk = (id, label, path, dir) => {
    const b = document.createElement("button");
    b.id = id;
    b.type = "button";
    b.className = "inline-pager-btn";
    b.setAttribute("aria-label", label);
    b.innerHTML = chev(path);
    b.addEventListener("click", () => {
      const region = inlinePagerRegion();
      if (!region) return;
      region.scrollBy({ top: dir * Math.round(region.clientHeight * 0.8), behavior: "smooth" });
    });
    return b;
  };
  pager.appendChild(mk("inline-pager-up", "Scroll up", "M18 15l-6-6-6 6", -1));
  pager.appendChild(mk("inline-pager-down", "Scroll down", "M6 9l6 6 6-6", 1));
  host.appendChild(pager);
  const obs = new MutationObserver(scheduleInlinePagerSync);
  obs.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
  window.addEventListener("resize", scheduleInlinePagerSync);
  updateInlinePager();
}
function setupExpand() {
  if (document.getElementById("expand-btn")) return;
  const host = $("scorebug-content") || document.body;
  const btn = document.createElement("button");
  btn.id = "expand-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", "Open full screen");
  btn.innerHTML = EXPAND_ICON;
  btn.style.cssText = "position:absolute;top:10px;right:12px;z-index:40;width:25px;height:25px;display:flex;align-items:center;justify-content:center;padding:0;background:var(--bg-elev-2);color:var(--text-primary);border:1px solid var(--border-medium);border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);";
  let modePoll = 0;
  const sync = () => {
    const expanded = isExpandedMode();
    btn.style.display = expanded ? "none" : "flex";
    document.body.classList.toggle("is-inline", !expanded);
    scheduleInlinePagerSync();
    if (expanded && !modePoll) {
      modePoll = window.setInterval(sync, 400);
    } else if (!expanded && modePoll) {
      window.clearInterval(modePoll);
      modePoll = 0;
    }
  };
  sync();
  window.addEventListener("resize", sync);
  document.addEventListener("visibilitychange", sync);
  btn.addEventListener("click", (event) => {
    if (isExpandedMode()) {
      sync();
      return;
    }
    try {
      requestExpandedMode(event, "default");
    } catch (e) {
      reportError("requestExpandedMode", e);
    }
    sync();
  });
  host.appendChild(btn);
}
var SUN_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
var MOON_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
var THEME_KEY = "mlb-scores-theme";
function applyTheme(theme) {
  if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
  else document.documentElement.removeAttribute("data-theme");
}
function savedTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}
function resolveTheme() {
  return savedTheme() ?? "light";
}
function setupThemeToggle() {
  if (document.getElementById("theme-btn")) return;
  const host = $("scorebug-content") || document.body;
  let theme = resolveTheme();
  applyTheme(theme);
  const btn = document.createElement("button");
  btn.id = "theme-btn";
  btn.type = "button";
  btn.style.cssText = "position:absolute;top:10px;left:12px;z-index:40;width:25px;height:25px;display:flex;align-items:center;justify-content:center;padding:0;background:var(--bg-elev-2);color:var(--text-primary);border:1px solid var(--border-medium);border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);";
  const paint = () => {
    btn.innerHTML = theme === "light" ? MOON_ICON : SUN_ICON;
    btn.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
  };
  paint();
  btn.addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
    }
    paint();
    try {
      if (lastGameData) render(lastGameData);
    } catch (e) {
      reportError("theme re-render", e);
    }
  });
  try {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSchemeChange = (e) => {
      try {
        localStorage.removeItem(THEME_KEY);
      } catch {
      }
      theme = e.matches ? "dark" : "light";
      applyTheme(theme);
      paint();
      try {
        if (lastGameData) render(lastGameData);
      } catch (err) {
        reportError("scheme re-render", err);
      }
    };
    if (mq.addEventListener) mq.addEventListener("change", onSchemeChange);
    else if (mq.addListener) mq.addListener(onSchemeChange);
  } catch {
  }
  host.appendChild(btn);
}
function renderPregameContent(data, awayTeam, homeTeam) {
  const teamsBox = data.liveData?.boxscore?.teams || {};
  const probables = data.gameData?.probablePitchers || {};
  const awayPid = probables.away?.id;
  const homePid = probables.home?.id;
  const awayLabel = $("pregame-away-pitcher-label");
  const homeLabel = $("pregame-home-pitcher-label");
  if (awayLabel) awayLabel.textContent = `${getTeamShortName(awayTeam).toUpperCase()} STARTER`;
  if (homeLabel) homeLabel.textContent = `${getTeamShortName(homeTeam).toUpperCase()} STARTER`;
  $("pregame-away-pitcher-name").innerHTML = formatPitcherName(probables.away?.fullName || "TBD");
  $("pregame-home-pitcher-name").innerHTML = formatPitcherName(probables.home?.fullName || "TBD");
  $("pregame-away-pitcher-stats").textContent = getPitcherSeasonStats(teamsBox.away, awayPid);
  $("pregame-home-pitcher-stats").textContent = getPitcherSeasonStats(teamsBox.home, homePid);
  const dt = new Date(data.gameData.datetime?.dateTime || Date.now());
  const dateStr = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  const timeStr = formatGameTime(data.gameData.datetime?.dateTime || dt.toISOString());
  $("pregame-first-pitch").textContent = `${dateStr}  \xB7  ${timeStr}`;
}
function renderLiveContent(data) {
  const linescore = data.liveData?.linescore;
  const currentPlay = data.liveData?.plays?.currentPlay;
  if (!linescore || !currentPlay) return;
  const teamsBox = data.liveData.boxscore?.teams || {};
  const matchup = currentPlay.matchup || {};
  const batter = matchup.batter;
  const pitcher = matchup.pitcher;
  const count = currentPlay.count || { balls: 0, strikes: 0, outs: 0 };
  const awayBatting = linescore.inningHalf === "Top";
  const awaySlotPlayer = awayBatting ? batter : pitcher;
  const homeSlotPlayer = awayBatting ? pitcher : batter;
  const awaySlotIsBatter = awayBatting;
  const homeSlotIsBatter = !awayBatting;
  const awaySlotEl = $("live-player-away");
  const homeSlotEl = $("live-player-home");
  if (awaySlotEl) {
    awaySlotEl.classList.toggle("is-batter", awaySlotIsBatter);
    awaySlotEl.classList.toggle("is-pitcher", !awaySlotIsBatter);
  }
  if (homeSlotEl) {
    homeSlotEl.classList.toggle("is-batter", homeSlotIsBatter);
    homeSlotEl.classList.toggle("is-pitcher", !homeSlotIsBatter);
  }
  const awayTeamId = data.gameData?.teams?.away?.id;
  const homeTeamId = data.gameData?.teams?.home?.id;
  const getPlayerPos = (teamBox, playerId) => {
    if (!teamBox || !playerId) return "";
    return teamBox.players?.[`ID${playerId}`]?.position?.abbreviation || "";
  };
  $("live-away-role").textContent = awaySlotIsBatter ? "BATTER" : "PITCHER";
  $("live-away-pos").textContent = awaySlotIsBatter ? getPlayerPos(teamsBox.away, awaySlotPlayer?.id) : slotPitchCount(teamsBox.away, awaySlotPlayer?.id);
  $("live-away-hand").textContent = slotHand(awaySlotPlayer?.id, awaySlotIsBatter);
  $("live-away-name").textContent = awaySlotPlayer?.fullName || "\u2014";
  $("live-away-stats").textContent = awaySlotIsBatter ? getBatterSeasonStats(teamsBox.away, awaySlotPlayer?.id) : getPitcherInGameLine(teamsBox.away, awaySlotPlayer?.id);
  const awayLogoEl = $("live-away-team-logo");
  if (awayLogoEl && awayTeamId) loadLogo(awayLogoEl, awayTeamId);
  $("live-home-role").textContent = homeSlotIsBatter ? "BATTER" : "PITCHER";
  $("live-home-pos").textContent = homeSlotIsBatter ? getPlayerPos(teamsBox.home, homeSlotPlayer?.id) : slotPitchCount(teamsBox.home, homeSlotPlayer?.id);
  $("live-home-hand").textContent = slotHand(homeSlotPlayer?.id, homeSlotIsBatter);
  $("live-home-name").textContent = homeSlotPlayer?.fullName || "\u2014";
  $("live-home-stats").textContent = homeSlotIsBatter ? getBatterSeasonStats(teamsBox.home, homeSlotPlayer?.id) : getPitcherInGameLine(teamsBox.home, homeSlotPlayer?.id);
  const homeLogoEl = $("live-home-team-logo");
  if (homeLogoEl && homeTeamId) loadLogo(homeLogoEl, homeTeamId);
  const onBase = linescore.offense || {};
  $("live-bases").innerHTML = buildBasesSVG(count.outs ?? 0, onBase);
  $("live-count").textContent = `${count.balls ?? 0}\u2013${count.strikes ?? 0}`;
  const pitches = (currentPlay.playEvents || []).filter((e) => e.isPitch);
  $("live-zone-container").innerHTML = buildStrikeZoneSVG(pitches);
  const lastPitch = pitches[pitches.length - 1];
  const pitchEl = $("live-pitch-latest");
  if (lastPitch) {
    const info = pitchInfo(lastPitch.details?.type?.code);
    const velo = lastPitch.pitchData?.startSpeed?.toFixed(1) ?? "\u2014";
    const isInPlay = lastPitch.details?.isInPlay;
    const isStrike = lastPitch.details?.isStrike;
    const isFoul = (lastPitch.details?.description || "").toLowerCase().includes("foul");
    let resCls = "live-pr-ball";
    let resLbl = "BALL";
    if (isInPlay) {
      resCls = "live-pr-strike";
      resLbl = "IN PLAY";
    } else if (isFoul) {
      resCls = "live-pr-strike";
      resLbl = "FOUL";
    } else if (isStrike) {
      resCls = "live-pr-strike";
      resLbl = "STRIKE";
    }
    pitchEl.innerHTML = `
      <span class="live-pitch-num">PITCH ${pitches.length}</span>
      <span class="live-pitch-badge" style="background:${info.color}">${info.abbr}</span>
      <span class="live-pitch-type">${info.label}</span>
      <span class="live-pitch-velo">${velo} mph</span>
      <span class="live-pitch-result ${resCls}">${resLbl}</span>
    `;
  } else {
    pitchEl.innerHTML = '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);">Waiting for first pitch\u2026</span>';
  }
  const resultEvent = currentPlay.result?.event || "";
  const resultDesc = currentPlay.result?.description || "";
  const resultEl = $("live-result");
  if (resultEvent || resultDesc) {
    resultEl.innerHTML = `
      ${resultEvent ? `<div class="live-event">${resultEvent}</div>` : ""}
      ${resultDesc ? `<div class="live-desc">${resultDesc}</div>` : ""}
    `;
  } else {
    resultEl.innerHTML = "";
  }
}
function shortName(name) {
  if (!name) return "";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0] ?? "";
  const SUFFIX = ["Jr.", "Jr", "Sr.", "Sr", "II", "III", "IV", "V"];
  const lastPart = parts[parts.length - 1] ?? "";
  const useSecondToLast = SUFFIX.includes(lastPart) && parts.length > 2;
  const surname = useSecondToLast ? parts[parts.length - 2] ?? "" : lastPart;
  const firstInitial = parts[0]?.[0] ?? "";
  return `${firstInitial}. ${surname}`;
}
function fmtAvg(v) {
  if (!v || v === ".000" || v === "0.000") return ".000";
  const f = parseFloat(v);
  if (isNaN(f)) return ".000";
  return f < 1 ? "." + String(Math.round(f * 1e3)).padStart(3, "0") : String(v);
}
function buildBattingRow(player, displayNum, s, isSub = false) {
  const g = player.stats?.batting || {};
  const name = shortName(player.person?.fullName || "Unknown");
  const pos = player.position?.abbreviation || "";
  const ab = g.atBats ?? 0;
  const h = g.hits ?? 0;
  const r = g.runs ?? 0;
  const rbi = g.rbi ?? 0;
  const hr = g.homeRuns ?? 0;
  const bb = g.baseOnBalls ?? 0;
  const so = g.strikeOuts ?? 0;
  const lob = g.leftOnBase ?? 0;
  const avg = fmtAvg(s?.avg);
  const obp = fmtAvg(s?.obp);
  const slg = fmtAvg(s?.slg);
  const numCell = isSub ? "" : String(displayNum);
  const nameCell = isSub ? `<div class="bs-pname" style="padding-left:15px;opacity:.72">${name}</div>` : `<div class="bs-pname">${name}</div>`;
  return `<tr class="bs-row${isSub ? " bs-sub" : ""}" data-player-id="${player.person?.id ?? ""}">
    <td class="bs-num">${numCell}</td>
    <td class="bs-pos-cell"><span class="bs-pos">${pos}</span></td>
    <td class="bs-player">${nameCell}</td>
    <td>${ab}</td>
    <td class="${h > 0 ? "bs-hit" : ""}">${h}</td>
    <td>${r}</td>
    <td>${rbi}</td>
    <td class="${hr > 0 ? "bs-hr" : ""}">${hr}</td>
    <td>${bb}</td>
    <td>${so}</td>
    <td>${lob}</td>
    <td class="bs-avg bs-slash">${avg}</td>
    <td class="bs-avg bs-slash">${obp}</td>
    <td class="bs-avg bs-slash">${slg}</td>
  </tr>`;
}
function buildPitchingRow(player, s) {
  const g = player.stats?.pitching || {};
  const name = shortName(player.person?.fullName || "Unknown");
  const ip = g.inningsPitched ?? "0.0";
  const h = g.hits ?? 0;
  const r = g.runs ?? 0;
  const er = g.earnedRuns ?? 0;
  const bb = g.baseOnBalls ?? 0;
  const so = g.strikeOuts ?? 0;
  const np = g.numberOfPitches ?? g.pitchesThrown ?? "";
  const strikes = g.strikes;
  const ps = np !== "" && strikes != null ? `${np}-${strikes}` : String(np);
  const wp = g.wildPitches ?? 0;
  const era = s?.era ?? "-.--";
  const erHasRuns = er > 0;
  return `<tr class="bs-row" data-player-id="${player.person?.id ?? ""}">
    <td class="bs-num"></td>
    <td class="bs-pos-cell"><span class="bs-pos p">P</span></td>
    <td class="bs-player"><div class="bs-pname">${name}</div></td>
    <td>${ip}</td>
    <td>${h}</td>
    <td class="${erHasRuns ? "bs-er" : ""}">${r}</td>
    <td class="${erHasRuns ? "bs-er" : ""}">${er}</td>
    <td>${bb}</td>
    <td>${so}</td>
    <td>${wp}</td>
    <td class="bs-ps">${ps}</td>
    <td class="bs-avg">${era}</td>
  </tr>`;
}
function buildBoxPanel(teamStats) {
  if (!teamStats?.players) {
    return '<div class="bs-empty">Lineups not yet available</div>';
  }
  const rawBatters = teamStats.batters || [];
  const pitchers = teamStats.pitchers || [];
  const batters = rawBatters.filter((id) => {
    const pos = teamStats.players?.[`ID${id}`]?.position?.abbreviation;
    return pos && pos !== "P" && pos !== "Pitcher";
  });
  if (!batters.length && !pitchers.length) {
    return '<div class="bs-empty">Lineups not yet available</div>';
  }
  const slots = {};
  let haveOrder = false;
  for (const id of batters) {
    const player = teamStats.players?.[`ID${id}`];
    if (!player) continue;
    const bo = parseInt(String(player.battingOrder ?? ""), 10);
    if (!Number.isFinite(bo) || bo <= 0) continue;
    haveOrder = true;
    const slot = Math.floor(bo / 100);
    (slots[slot] = slots[slot] || []).push(player);
  }
  let battingRows;
  if (haveOrder) {
    const rows = [];
    for (let slot = 1; slot <= 9; slot++) {
      const group = slots[slot];
      if (!group || !group.length) continue;
      group.sort(
        (a, b) => parseInt(String(a.battingOrder), 10) - parseInt(String(b.battingOrder), 10)
      );
      group.forEach((player, idx) => {
        rows.push(buildBattingRow(player, slot, player.seasonStats?.batting, idx > 0));
      });
    }
    battingRows = rows.join("");
  } else {
    battingRows = batters.map((id, i) => {
      const player = teamStats.players?.[`ID${id}`];
      if (!player) return "";
      return buildBattingRow(player, i + 1, player.seasonStats?.batting, false);
    }).filter(Boolean).join("");
  }
  const pitchingRows = pitchers.map((id) => {
    const player = teamStats.players?.[`ID${id}`];
    if (!player) return "";
    const s = player.seasonStats?.pitching;
    return buildPitchingRow(player, s);
  }).filter(Boolean).join("");
  return `
    <div class="bs-section-hdr"><span class="bs-dot"></span>Batting</div>
    <table class="bs-table bs-table-batting">
      <thead>
        <tr>
          <th class="bs-th-num">#</th>
          <th class="bs-th-pos"></th>
          <th class="bs-th-player">Player</th>
          <th>AB</th><th>H</th><th>R</th><th>RBI</th><th>HR</th><th>BB</th><th>K</th><th>LOB</th><th class="bs-th-slash">AVG</th><th class="bs-th-slash">OBP</th><th class="bs-th-slash">SLG</th>
        </tr>
      </thead>
      <tbody>${battingRows || `<tr><td colspan="12" class="bs-empty">Awaiting first AB</td></tr>`}</tbody>
    </table>
    <div class="bs-section-hdr pitching"><span class="bs-dot"></span>Pitching</div>
    <table class="bs-table bs-table-pitching">
      <thead>
        <tr>
          <th class="bs-th-num"></th>
          <th class="bs-th-pos"></th>
          <th class="bs-th-player">Pitcher</th>
          <th>IP</th><th>H</th><th>R</th><th>ER</th><th>BB</th><th>K</th><th>WP</th><th>P-S</th><th>ERA</th>
        </tr>
      </thead>
      <tbody>${pitchingRows || `<tr><td colspan="12" class="bs-empty">No pitching data yet</td></tr>`}</tbody>
    </table>
    ${buildBoxNotes(teamStats)}
  `;
}
function buildBoxNotes(teamBox) {
  const players = Object.values(teamBox?.players || {});
  const notes = [];
  const sb = players.filter((p) => (p?.stats?.batting?.stolenBases ?? 0) > 0).map((p) => `${shortName(p.person?.fullName || "")} ${p.stats.batting.stolenBases}`);
  if (sb.length) notes.push(`<span class="bs-note"><b>SB</b> ${sb.join(", ")}</span>`);
  const err = players.filter((p) => (p?.stats?.fielding?.errors ?? 0) > 0).map((p) => `${shortName(p.person?.fullName || "")} ${p.stats.fielding.errors}`);
  if (err.length) notes.push(`<span class="bs-note"><b>E</b> ${err.join(", ")}</span>`);
  return notes.length ? `<div class="bs-notes">${notes.join("")}</div>` : "";
}
function renderBoxScore(data) {
  const awayTeam = data.gameData?.teams?.away;
  const homeTeam = data.gameData?.teams?.home;
  const boxscore = data.liveData?.boxscore;
  if (!awayTeam || !homeTeam || !boxscore) return;
  const awayAbbrEl = $("bs-away-tab-abbr");
  const homeAbbrEl = $("bs-home-tab-abbr");
  if (awayAbbrEl) awayAbbrEl.textContent = awayTeam.abbreviation || "?";
  if (homeAbbrEl) homeAbbrEl.textContent = homeTeam.abbreviation || "?";
  const awayLogoEl = $("bs-away-tab-logo");
  const homeLogoEl = $("bs-home-tab-logo");
  if (awayLogoEl && awayTeam.id) loadLogo(awayLogoEl, awayTeam.id);
  if (homeLogoEl && homeTeam.id) loadLogo(homeLogoEl, homeTeam.id);
  const wrap = document.querySelector(".bs-panel-wrap");
  const savedScroll = wrap?.scrollTop ?? 0;
  const awayPanel = $("bs-away-panel");
  const homePanel = $("bs-home-panel");
  if (awayPanel) awayPanel.innerHTML = buildBoxPanel(boxscore.teams?.away);
  if (homePanel) homePanel.innerHTML = buildBoxPanel(boxscore.teams?.home);
  if (wrap) wrap.scrollTop = savedScroll;
}
function setupBoxScoreTeamTabs() {
  document.querySelectorAll(".bs-team-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const team = btn.dataset.bsTeam;
      if (!team) return;
      document.querySelectorAll(".bs-team-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".bs-panel").forEach((p) => p.classList.remove("active"));
      $(`bs-${team}-panel`)?.classList.add("active");
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      const wrap = document.querySelector(".bs-panel-wrap");
      if (wrap) wrap.scrollTop = 0;
    });
  });
}
function getEventBadge(eventType) {
  if (!eventType) return "?";
  const exact = {
    "Single": "1B",
    "Double": "2B",
    "Triple": "3B",
    "Home Run": "HR",
    "Strikeout": "K",
    "Walk": "BB",
    "Intent Walk": "IBB",
    "Hit By Pitch": "HBP",
    "Grounded Into DP": "DP",
    "Field Error": "E",
    "Fielders Choice": "FC",
    "Fielders Choice Out": "FC",
    "Double Play": "DP",
    "Catcher Interference": "CI",
    "Caught Stealing 2B": "CS",
    "Caught Stealing 3B": "CS",
    "Pickoff Caught Stealing 2B": "CS",
    "Pickoff Caught Stealing 3B": "CS",
    "Stolen Base 2B": "SB",
    "Stolen Base 3B": "SB",
    "Stolen Base Home": "SB",
    "Sac Fly": "SAC",
    "Sac Bunt": "SAC",
    "Wild Pitch": "WP",
    "Passed Ball": "PB"
  };
  if (exact[eventType]) return exact[eventType];
  if (eventType.includes("Substitution") || eventType.includes("Switch")) return "\u2194";
  if (/error/i.test(eventType)) return "E";
  if (/out/i.test(eventType)) return "OUT";
  return eventType.slice(0, 3).toUpperCase();
}
function buildPlayScorebug(play) {
  const count = play.count || {};
  const outs = count.outs ?? 0;
  const balls = count.balls ?? 0;
  const strikes = count.strikes ?? 0;
  const onBase = {
    first: !!play.matchup?.postOnFirst,
    second: !!play.matchup?.postOnSecond,
    third: !!play.matchup?.postOnThird
  };
  const ink = svgInk();
  const red = svgRed();
  const outFill = (n) => outs >= n ? red.fill : ink.empty;
  const baseFill = (b) => b ? red.fill : ink.empty;
  return `<div class="play-scorebug">
    <div class="play-count-mini">${balls}-${strikes}</div>
    <svg width="48" height="48" viewBox="0 0 58 79" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="61" r="5" fill="${outFill(1)}" stroke="${red.stroke}" stroke-width="1"/>
      <circle cx="30" cy="61" r="5" fill="${outFill(2)}" stroke="${red.stroke}" stroke-width="1"/>
      <circle cx="47" cy="61" r="5" fill="${outFill(3)}" stroke="${red.stroke}" stroke-width="1"/>
      <rect x="17.6" y="29.7" width="14" height="14" transform="rotate(45 17.6 29.7)"
        fill="${baseFill(onBase.third)}"  stroke="${red.stroke}" stroke-width="1"/>
      <rect x="29.4" y="17.7" width="14" height="14" transform="rotate(45 29.4 17.7)"
        fill="${baseFill(onBase.second)}" stroke="${red.stroke}" stroke-width="1"/>
      <rect x="41.6" y="29.7" width="14" height="14" transform="rotate(45 41.6 29.7)"
        fill="${baseFill(onBase.first)}"  stroke="${red.stroke}" stroke-width="1"/>
    </svg>
  </div>`;
}
function buildPlayCard(play, awayAbbr, homeAbbr, showScore) {
  const inning = play.about?.inning ?? 1;
  const isTop = play.about?.isTopInning;
  const inningTxt = `${isTop ? "\u25B2" : "\u25BC"} ${inning}`;
  const event = play.result?.event || "\u2014";
  const eventBadge = getEventBadge(event);
  const desc = play.result?.description || "";
  const hitData = play.playEvents?.find((e) => e?.hitData)?.hitData || {};
  const exitVelo = hitData.launchSpeed ? `${Math.round(hitData.launchSpeed)} mph` : "";
  const launchAngle = hitData.launchAngle != null ? `${Math.round(hitData.launchAngle)}\xB0` : "";
  const distance = hitData.totalDistance ? `${Math.round(hitData.totalDistance)} ft` : "";
  const hasStatcast = exitVelo || launchAngle || distance;
  let scoreHtml = "";
  if (showScore && play.result?.awayScore != null && play.result?.homeScore != null) {
    const rbiHtml = play.result.rbi > 0 ? `<span class="play-rbi">+${play.result.rbi} RBI</span>` : "";
    scoreHtml = `<div class="play-score-line">
      <span class="play-score">${awayAbbr} ${play.result.awayScore} \u2014 ${homeAbbr} ${play.result.homeScore}</span>
      ${rbiHtml}
    </div>`;
  }
  let statcastHtml = "";
  if (hasStatcast) {
    const chips = [];
    if (exitVelo) chips.push(`<div class="play-chip"><span class="play-chip-l">Exit Velo</span><span class="play-chip-v">${exitVelo}</span></div>`);
    if (launchAngle) chips.push(`<div class="play-chip"><span class="play-chip-l">Angle</span><span class="play-chip-v">${launchAngle}</span></div>`);
    if (distance) chips.push(`<div class="play-chip"><span class="play-chip-l">Distance</span><span class="play-chip-v">${distance}</span></div>`);
    statcastHtml = `<div class="play-statcast">${chips.join("")}</div>`;
  }
  return `<div class="play-card" data-clip-key="${playClipId(play)}">
    <div class="play-main">
      <div class="play-header">
        <span class="play-inning">${inningTxt}</span>
        <span class="play-event-badge">${eventBadge}</span>
        <span class="play-event-text">${event}</span>
      </div>
      <div class="play-desc">${desc}</div>
      ${scoreHtml}
      ${statcastHtml}
    </div>
    ${buildPlayScorebug(play)}
  </div>`;
}
function renderScoringPlays(data) {
  const container = $("scoring-plays-list");
  if (!container) return;
  const tabEl = $("tab-scoring");
  const savedScroll = tabEl?.scrollTop ?? 0;
  const allPlays = data.liveData?.plays?.allPlays || [];
  const scoringIdx = data.liveData?.plays?.scoringPlays || [];
  const awayAbbr = data.gameData?.teams?.away?.abbreviation || "AWAY";
  const homeAbbr = data.gameData?.teams?.home?.abbreviation || "HOME";
  if (!scoringIdx.length) {
    container.innerHTML = '<div class="plays-empty">No scoring plays yet</div>';
    return;
  }
  const cards = [...scoringIdx].reverse().map((idx) => {
    const play = allPlays[idx];
    if (!play) return "";
    return buildPlayCard(play, awayAbbr, homeAbbr, true);
  }).filter(Boolean).join("");
  container.innerHTML = cards;
  if (tabEl) tabEl.scrollTop = savedScroll;
}
function renderAllPlays(data) {
  const container = $("all-plays-list");
  if (!container) return;
  const tabEl = $("tab-plays");
  const savedScroll = tabEl?.scrollTop ?? 0;
  const allPlays = data.liveData?.plays?.allPlays || [];
  const awayAbbr = data.gameData?.teams?.away?.abbreviation || "AWAY";
  const homeAbbr = data.gameData?.teams?.home?.abbreviation || "HOME";
  if (!allPlays.length) {
    container.innerHTML = '<div class="plays-empty">Awaiting first play</div>';
    return;
  }
  const completed = allPlays.filter((p) => p.result?.event);
  if (!completed.length) {
    container.innerHTML = '<div class="plays-empty">Awaiting first play</div>';
    return;
  }
  const cards = [...completed].reverse().map(
    (play) => buildPlayCard(play, awayAbbr, homeAbbr, false)
  ).join("");
  container.innerHTML = cards;
  if (tabEl) tabEl.scrollTop = savedScroll;
}
function renderFinalContent(data) {
  const awayTeamId = data.gameData?.teams?.away?.id;
  const homeTeamId = data.gameData?.teams?.home?.id;
  const linescore = data.liveData?.linescore;
  const decisions = data.liveData?.decisions || {};
  const winner = decisions.winner;
  const loser = decisions.loser;
  const teamsBox = data.liveData?.boxscore?.teams || {};
  const awayRuns = linescore?.teams?.away?.runs ?? 0;
  const homeRuns = linescore?.teams?.home?.runs ?? 0;
  const awayWon = awayRuns > homeRuns;
  const homeWon = homeRuns > awayRuns;
  const awayLogoEl = $("final-away-team-logo");
  const homeLogoEl = $("final-home-team-logo");
  if (awayLogoEl && awayTeamId) loadLogo(awayLogoEl, awayTeamId);
  if (homeLogoEl && homeTeamId) loadLogo(homeLogoEl, homeTeamId);
  let awayPitcher = null;
  let homePitcher = null;
  let awayDecision = "";
  let homeDecision = "";
  if (awayWon) {
    awayPitcher = winner;
    homePitcher = loser;
    awayDecision = "W";
    homeDecision = "L";
  } else if (homeWon) {
    awayPitcher = loser;
    homePitcher = winner;
    awayDecision = "L";
    homeDecision = "W";
  }
  const getFinalPitcherLine = (teamBox, pitcherId) => {
    if (!teamBox || !pitcherId) return "\u2014";
    const game = teamBox.players?.[`ID${pitcherId}`]?.stats?.pitching;
    if (!game) return "\u2014";
    const ip = game.inningsPitched ?? "0.0";
    const h = game.hits ?? 0;
    const er = game.earnedRuns ?? 0;
    const k = game.strikeOuts ?? 0;
    return `${ip} IP \xB7 ${h} H \xB7 ${er} ER \xB7 ${k} K`;
  };
  $("final-away-pitcher-name").textContent = awayPitcher?.fullName || "\u2014";
  $("final-away-pitcher-stats").textContent = getFinalPitcherLine(teamsBox.away, awayPitcher?.id);
  const awayDecEl = $("final-away-decision");
  awayDecEl.textContent = awayDecision || "\u2014";
  awayDecEl.classList.remove("win", "loss");
  if (awayDecision === "W") awayDecEl.classList.add("win");
  else if (awayDecision === "L") awayDecEl.classList.add("loss");
  $("final-home-pitcher-name").textContent = homePitcher?.fullName || "\u2014";
  $("final-home-pitcher-stats").textContent = getFinalPitcherLine(teamsBox.home, homePitcher?.id);
  const homeDecEl = $("final-home-decision");
  homeDecEl.textContent = homeDecision || "\u2014";
  homeDecEl.classList.remove("win", "loss");
  if (homeDecision === "W") homeDecEl.classList.add("win");
  else if (homeDecision === "L") homeDecEl.classList.add("loss");
  const save = decisions.save;
  const saveSlot = $("final-pitcher-save");
  const decGrid = document.querySelector(".final-decisions");
  if (saveSlot) {
    if (save?.id) {
      const saveTeamBox = awayWon ? teamsBox.away : teamsBox.home;
      const saveTeamId = awayWon ? awayTeamId : homeTeamId;
      const saveLogoEl = $("final-save-team-logo");
      if (saveLogoEl && saveTeamId) loadLogo(saveLogoEl, saveTeamId);
      $("final-save-pitcher-name").textContent = save.fullName || "\u2014";
      $("final-save-pitcher-stats").textContent = getFinalPitcherLine(saveTeamBox, save.id);
      saveSlot.style.display = "";
      decGrid?.classList.add("has-save");
    } else {
      saveSlot.style.display = "none";
      decGrid?.classList.remove("has-save");
    }
  }
  const performers = data.liveData?.boxscore?.topPerformers || [];
  for (let i = 0; i < 3; i++) {
    const slot = $(`final-performer-${i + 1}`);
    if (!slot) continue;
    const performer = performers[i];
    if (!performer?.player) {
      slot.style.display = "none";
      continue;
    }
    slot.style.display = "";
    const name = performer.player.person?.fullName || "\u2014";
    const type = performer.type;
    const isPitcher = type === "pitcher" || type === "starter";
    let stats = "\u2014";
    if (isPitcher) {
      const p = performer.player.stats?.pitching;
      if (p?.summary) stats = p.summary;
      else if (p) stats = `${p.inningsPitched || "0"} IP \xB7 ${p.earnedRuns ?? 0} ER \xB7 ${p.strikeOuts ?? 0} K`;
    } else {
      const b = performer.player.stats?.batting;
      if (b?.summary) stats = b.summary;
      else if (b) stats = `${b.hits ?? 0}-${b.atBats ?? 0} \xB7 ${b.runs ?? 0} R \xB7 ${b.rbi ?? 0} RBI`;
    }
    const nameEl = slot.querySelector(".final-performer-name");
    const statsEl = slot.querySelector(".final-performer-stats");
    if (nameEl) nameEl.textContent = name;
    if (statsEl) statsEl.textContent = stats;
  }
}
function renderPostponedContent(data) {
  const game = data.gameData;
  const reason = game?.status?.reason || "";
  const reasonEl = $("postponed-reason");
  if (reasonEl) {
    reasonEl.textContent = reason ? `Due to ${reason.toLowerCase()}` : "Postponed by Major League Baseball";
  }
  const gameInfo = game?.game || {};
  const dh = gameInfo.doubleHeader || "N";
  const dhNum = gameInfo.gameNumber;
  const dhEl = $("postponed-dh-note");
  if (dhEl) {
    if (dh !== "N" && dhNum) {
      dhEl.textContent = `Now scheduled as Game ${dhNum} of a doubleheader`;
      dhEl.style.display = "block";
    } else {
      dhEl.style.display = "none";
    }
  }
  const away = game?.teams?.away?.name || "";
  const home = game?.teams?.home?.name || "";
  const teamsEl = $("postponed-teams");
  if (teamsEl) {
    teamsEl.textContent = away && home ? `${away} at ${home}` : "";
  }
}
function renderSuspendedContent(data) {
  const game = data.gameData;
  const linescore = data.liveData?.linescore;
  const inningEl = $("suspended-inning");
  if (inningEl) {
    const half = linescore?.inningHalf;
    const inning = linescore?.currentInning;
    if (half && inning) {
      const halfTxt = half === "Top" ? "TOP" : "BOTTOM";
      inningEl.textContent = `${halfTxt} ${ordinalInning(inning)}`;
    } else {
      inningEl.textContent = "";
    }
  }
  const away = game?.teams?.away?.name || "";
  const home = game?.teams?.home?.name || "";
  const teamsEl = $("suspended-teams");
  if (teamsEl) {
    teamsEl.textContent = away && home ? `${away} at ${home}` : "";
  }
  const reason = game?.status?.reason || "";
  const reasonEl = $("suspended-reason");
  if (reasonEl) {
    reasonEl.textContent = reason ? `Due to ${reason.toLowerCase()}` : "Game has been suspended";
  }
  const reschedRaw = game?.rescheduleDate || game?.rescheduleGameDate || game?.rescheduledTo || game?.datetime?.rescheduleDate || game?.game?.rescheduleDate || null;
  const makeupEl = $("suspended-makeup-note");
  if (makeupEl) {
    if (reschedRaw) {
      const dt = new Date(reschedRaw);
      const dateStr = dt.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
      });
      const timeStr = formatGameTime(reschedRaw);
      makeupEl.textContent = `Resumes ${dateStr} at ${timeStr}`;
      makeupEl.style.display = "block";
    } else {
      makeupEl.style.display = "none";
    }
  }
  const gameInfo = game?.game || {};
  const dh = gameInfo.doubleHeader || "N";
  const dhNum = gameInfo.gameNumber;
  const dhEl = $("suspended-dh-note");
  if (dhEl) {
    if (dh !== "N" && dhNum) {
      dhEl.textContent = `Continues as Game ${dhNum} of a doubleheader`;
      dhEl.style.display = "block";
    } else {
      dhEl.style.display = "none";
    }
  }
}
function ordinalInning(n) {
  if (n === 1) return "1ST";
  if (n === 2) return "2ND";
  if (n === 3) return "3RD";
  if (n >= 21) {
    const last = n % 10;
    if (last === 1) return `${n}ST`;
    if (last === 2) return `${n}ND`;
    if (last === 3) return `${n}RD`;
  }
  return `${n}TH`;
}
var MLB_TEAM_COLORS = {
  108: "#BA0021",
  109: "#A71930",
  110: "#DF4601",
  111: "#BD3039",
  112: "#0E3386",
  113: "#C6011F",
  114: "#E50022",
  115: "#7C6BAF",
  116: "#FA4616",
  117: "#EB6E1F",
  118: "#004687",
  119: "#005A9C",
  120: "#AB0003",
  121: "#FF5910",
  133: "#003831",
  134: "#FDB827",
  135: "#FFC72C",
  136: "#005C5C",
  137: "#FD5A1E",
  138: "#C41E3A",
  139: "#8FBCE6",
  140: "#003278",
  141: "#134A8E",
  142: "#D31145",
  143: "#E81828",
  144: "#CE1141",
  145: "#C4CED4",
  146: "#00A3E0",
  147: "#C4CED3",
  158: "#ffc52f",
  159: "#000088",
  160: "#cc0000"
};
var WBC_COLORS = {
  "Japan": "#BC002D",
  "USA": "#BF0A30",
  "Korea": "#CD2E3A",
  "Venezuela": "#CF0921",
  "Mexico": "#006847",
  "Puerto Rico": "#ED0000",
  "Dominican Republic": "#002D62",
  "Canada": "#FF0000",
  "Cuba": "#002A8F",
  "Italy": "#009246"
};
function getTeamColor(id, name = "") {
  if (id && MLB_TEAM_COLORS[id]) return MLB_TEAM_COLORS[id];
  if (name && WBC_COLORS[name]) return WBC_COLORS[name];
  return "#535557";
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
var winProbCache = null;
async function fetchWinProb() {
  if (!gamePk) return null;
  try {
    const res = await fetch(`/api/winprob/${gamePk}`);
    if (!res.ok) return winProbCache;
    const data = await res.json();
    if (Array.isArray(data)) {
      winProbCache = data;
      return data;
    }
    return winProbCache;
  } catch (e) {
    console.error("fetchWinProb error:", e);
    return winProbCache;
  }
}
async function renderWinProb() {
  const container = $("tab-winprob");
  if (!container) return;
  if (!lastGameData) {
    container.innerHTML = '<div class="placeholder">Waiting for game data\u2026</div>';
    return;
  }
  const awayTeam = lastGameData.gameData?.teams?.away;
  const homeTeam = lastGameData.gameData?.teams?.home;
  if (!awayTeam || !homeTeam) {
    container.innerHTML = '<div class="placeholder">Waiting for game data\u2026</div>';
    return;
  }
  if (!container.querySelector(".wp-summary")) {
    container.innerHTML = '<div class="placeholder">Loading win probability\u2026</div>';
  }
  const wpData = await fetchWinProb();
  if (!wpData || !wpData.length) {
    container.innerHTML = '<div class="placeholder">Win probability not available</div>';
    return;
  }
  const curAbi = lastGameData?.liveData?.plays?.currentPlay?.about?.atBatIndex;
  const wp = typeof curAbi === "number" ? wpData.filter((d) => typeof d.atBatIndex !== "number" || d.atBatIndex <= curAbi) : wpData;
  if (!wp.length) {
    container.innerHTML = '<div class="placeholder">Win probability not available yet</div>';
    return;
  }
  const awayId = awayTeam.id;
  const homeId = homeTeam.id;
  const awayName = awayTeam.name || "";
  const homeName = homeTeam.name || "";
  const awayAbbr = awayTeam.abbreviation || awayTeam.teamName || "AWY";
  const homeAbbr = homeTeam.abbreviation || homeTeam.teamName || "HOM";
  const awayColor = getTeamColor(awayId, awayName);
  const homeColor = getTeamColor(homeId, homeName);
  const latest = wp[wp.length - 1];
  const homeProb = Math.round(latest.homeTeamWinProbability ?? 50);
  const awayProb = Math.round(latest.awayTeamWinProbability ?? 50);
  const W = 520, H = 125;
  const PL = 36, PR = 16, PT = 10, PB = 22;
  const CW = W - PL - PR;
  const CH = H - PT - PB;
  const stepX = CW / Math.max(1, wp.length - 1);
  const midY = PT + CH / 2;
  const pts = wp.map((d, i) => ({
    x: PL + i * stepX,
    y: PT + CH / 2 + ((d.homeTeamWinProbability ?? 50) - 50) / 50 * (CH / 2),
    homeProb: d.homeTeamWinProbability ?? 50,
    awayProb: d.awayTeamWinProbability ?? 50,
    added: d.homeTeamWinProbabilityAdded,
    event: d.result?.event || "",
    desc: d.result?.description || "",
    inning: d.about?.inning || 0,
    isTop: !!d.about?.isTopInning
  }));
  const linePoints = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const polyPts = [`${PL},${midY}`, ...pts.map((p) => `${p.x},${p.y}`), `${PL + CW},${midY}`].join(" ");
  const ink = svgInk();
  let inningLines = "";
  let lastInn = 0;
  pts.forEach((p) => {
    if (p.inning && p.inning !== lastInn && p.isTop) {
      lastInn = p.inning;
      inningLines += `
        <line x1="${p.x}" y1="${PT}" x2="${p.x}" y2="${PT + CH}" stroke="${ink.grid}" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="${p.x}" y1="${PT + CH}" x2="${p.x}" y2="${PT + CH + 5}" stroke="${ink.mid}" stroke-width="1"/>
        <text x="${p.x}" y="${PT + CH + 15}" text-anchor="middle" font-size="8" fill="${ink.strong}" font-family="DM Mono, monospace">${p.inning}</text>`;
    }
  });
  const zones = pts.map((p, i) => {
    const prev = pts[i - 1];
    const next = pts[i + 1];
    const x = i === 0 ? PL : prev ? prev.x + (p.x - prev.x) / 2 : PL;
    const nx = i === pts.length - 1 ? PL + CW : next ? p.x + (next.x - p.x) / 2 : PL + CW;
    const added = p.added != null ? p.added.toFixed(1) : "N/A";
    const sign = (p.added ?? 0) >= 0 ? "+" : "";
    const acls = (p.added ?? 0) >= 0 ? "wp-pos" : "wp-neg";
    const inn = p.inning ? `${p.isTop ? "Top" : "Bot"} ${p.inning}` : "";
    return `<rect x="${x}" y="${PT}" width="${nx - x}" height="${CH}" class="wp-zone"
      data-x="${p.x}" data-y="${p.y}"
      data-home="${p.homeProb.toFixed(1)}" data-away="${p.awayProb.toFixed(1)}"
      data-added="${added}" data-acls="${acls}" data-sign="${sign}"
      data-event="${escapeHtml(p.event)}" data-desc="${escapeHtml(p.desc)}" data-inn="${inn}"/>`;
  }).join("");
  container.innerHTML = `
    <div class="wp-summary">
      <div class="wp-team wp-team-away">
        <img class="wp-team-logo" src="${getLogoPath(awayId)}" onerror="${logoFallbackAttr(awayId)}" alt="${awayAbbr}">
        <span class="wp-team-pct" style="color:${awayColor}">${awayProb}%</span>
      </div>
      <div class="wp-title">WIN PROBABILITY</div>
      <div class="wp-team wp-team-home">
        <span class="wp-team-pct" style="color:${homeColor}">${homeProb}%</span>
        <img class="wp-team-logo" src="${getLogoPath(homeId)}" onerror="${logoFallbackAttr(homeId)}" alt="${homeAbbr}">
      </div>
    </div>

    <div class="wp-prob-bar">
      <div class="wp-prob-bar-fill" style="width:${awayProb}%;background:${awayColor};"></div>
      <div class="wp-prob-bar-fill" style="width:${homeProb}%;background:${homeColor};"></div>
    </div>

    <div class="wp-chart-wrap">
      <div class="wp-tooltip" id="wp-tooltip"></div>
      <svg class="wp-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
        <rect x="${PL}" y="${PT}" width="${CW}" height="${CH}" fill="${ink.chartBg}" rx="2"/>
        <defs>
          <clipPath id="wp-clip-top"><rect x="${PL}" y="${PT}" width="${CW}" height="${CH / 2}"/></clipPath>
          <clipPath id="wp-clip-bot"><rect x="${PL}" y="${PT + CH / 2}" width="${CW}" height="${CH / 2}"/></clipPath>
        </defs>
        <polygon points="${polyPts}" fill="${awayColor}" opacity="0.9" clip-path="url(#wp-clip-top)"/>
        <polygon points="${polyPts}" fill="${homeColor}" opacity="0.9" clip-path="url(#wp-clip-bot)"/>
        <line x1="${PL}" y1="${midY}" x2="${PL + CW}" y2="${midY}" stroke="${ink.mid}" stroke-width="1" stroke-dasharray="4,3"/>
        <text x="${PL - 4}" y="${midY + 3}" text-anchor="end" font-size="8" fill="${ink.strong}" font-family="DM Mono, monospace">50%</text>
        <text x="${PL - 4}" y="${PT + 6}" text-anchor="end" font-size="8" fill="${awayColor}" font-family="DM Mono, monospace">${awayAbbr}</text>
        <text x="${PL - 4}" y="${PT + CH + 2}" text-anchor="end" font-size="8" fill="${homeColor}" font-family="DM Mono, monospace">${homeAbbr}</text>
        ${inningLines}
        <polyline points="${linePoints}" fill="none" stroke="${ink.strong}" stroke-width="1.2" stroke-linejoin="round"/>
        ${zones}
        <circle id="wp-dot" cx="0" cy="0" r="4" fill="${ink.dotFill}" stroke="${ink.dotRing}" stroke-width="2" style="display:none;pointer-events:none;"/>
        <text x="${PL + CW / 2}" y="${H - 2}" text-anchor="middle" font-size="9" fill="${ink.label}" font-family="DM Mono, monospace">INNING</text>
      </svg>
    </div>

    <div class="wp-legend">
      <div class="wp-legend-item"><span class="wp-legend-swatch" style="background:${awayColor}"></span>${awayName}</div>
      <div class="wp-legend-item"><span class="wp-legend-swatch" style="background:${homeColor}"></span>${homeName}</div>
    </div>
  `;
  wireWinProbHover(awayAbbr, homeAbbr, awayColor, homeColor);
}
function wireWinProbHover(awayAbbr, homeAbbr, awayColor, homeColor) {
  const chart = document.querySelector(".wp-chart");
  const tooltip = $("wp-tooltip");
  const dot = document.getElementById("wp-dot");
  if (!chart || !tooltip || !dot) return;
  const showFor = (z) => {
    const ds = z.dataset;
    dot.setAttribute("cx", ds.x || "0");
    dot.setAttribute("cy", ds.y || "0");
    dot.style.display = "block";
    const addedLine = ds.added !== "N/A" ? `<div class="${ds.acls}">${ds.sign}${ds.added}% WP shift</div>` : "";
    tooltip.innerHTML = `
      ${ds.inn ? `<div class="wp-tt-inn">${ds.inn}</div>` : ""}
      ${ds.event ? `<div class="wp-tt-event">${ds.event}</div>` : ""}
      ${ds.desc ? `<div class="wp-tt-desc">${ds.desc}</div>` : ""}
      ${addedLine}
      <div class="wp-tt-probs"><span style="color:${awayColor}">${awayAbbr} ${ds.away}%</span><span style="color:${homeColor}">${homeAbbr} ${ds.home}%</span></div>`;
    tooltip.style.display = "block";
  };
  const hide = () => {
    tooltip.style.display = "none";
    dot.style.display = "none";
  };
  chart.querySelectorAll(".wp-zone").forEach((zone) => {
    const z = zone;
    z.addEventListener("mouseenter", () => showFor(z));
    z.addEventListener("mouseleave", hide);
    z.addEventListener("click", (e) => {
      e.stopPropagation();
      showFor(z);
    });
  });
}
function setupWinProbDismiss() {
  document.addEventListener("click", (e) => {
    const tip = document.getElementById("wp-tooltip");
    if (!tip || tip.style.display === "none") return;
    const target = e.target;
    if (target?.closest(".wp-chart")) return;
    tip.style.display = "none";
    const dotEl = document.getElementById("wp-dot");
    if (dotEl) dotEl.style.display = "none";
  });
}
async function selectGameForThisPost() {
  try {
    const res = await fetch("/api/post-game");
    if (res.ok) {
      const data = await res.json();
      if (data?.postType) postType = data.postType;
      if (data?.gamePk) return Number(data.gamePk);
    }
  } catch (e) {
  }
  return null;
}
function renderEndedState() {
  const host = $("loading-state");
  if (!host) return;
  host.innerHTML = `
    <div class="ended-display">
      <div class="ended-headline">Thread Ended</div>
      <div class="ended-divider"></div>
      <div class="ended-text">This game thread is no longer live. Live scoreboards appear here only while a game is in progress.</div>
    </div>`;
}
async function fetchAndRender(pk) {
  try {
    const res = await fetch(`/api/game/${pk}`);
    const data = await res.json();
    if (!data?.gameData || !data?.liveData) {
      console.error("Game data unavailable");
      return;
    }
    render(data);
  } catch (e) {
    console.error("fetchAndRender error:", e);
  }
}
function render(data) {
  lastGameData = data;
  const game = data.gameData;
  const linescore = data.liveData.linescore;
  const statusText = postType === "postponed" ? "Postponed" : game.status.detailedState;
  const awayTeam = game.teams.away;
  const homeTeam = game.teams.home;
  document.body.classList.toggle("is-pregame", isPreGameState(statusText));
  document.body.classList.toggle("is-live", isLiveState(statusText));
  document.body.classList.toggle("is-final", isFinalState(statusText));
  document.body.classList.toggle("is-postponed", statusText === "Postponed");
  document.body.classList.toggle("is-suspended", isSuspendedState(statusText));
  void maybeNotifyPostgame(statusText);
  const loading = $("loading-state");
  const content = $("scorebug-content");
  loading.style.display = "none";
  content.style.display = "";
  const venueName = game.venue?.name || "";
  const dt = new Date(game.datetime?.dateTime || Date.now());
  const dateStr = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  const timeStr = formatGameTime(game.datetime?.dateTime || dt.toISOString());
  $("venue-info").textContent = `${venueName.toUpperCase()} \xB7 ${dateStr} \xB7 ${timeStr}`;
  const broadcasts = game.broadcasts || [];
  const tvBroadcast = broadcasts.find((b) => b.type === "TV" && b.isNational);
  $("network-info").textContent = tvBroadcast?.name || "";
  const contextEl = $("game-context");
  if (contextEl) {
    contextEl.textContent = getGameContextLabel(game);
  }
  $("away-logo").alt = awayTeam.name;
  $("home-logo").alt = homeTeam.name;
  loadLogo($("away-logo"), awayTeam.id);
  loadLogo($("home-logo"), homeTeam.id);
  $("away-name").textContent = getTeamShortName(awayTeam);
  $("home-name").textContent = getTeamShortName(homeTeam);
  const awayRec = awayTeam.record;
  const homeRec = homeTeam.record;
  $("away-record").textContent = awayRec ? `${awayRec.wins}-${awayRec.losses}` : "";
  $("home-record").textContent = homeRec ? `${homeRec.wins}-${homeRec.losses}` : "";
  $("away-score").textContent = String(linescore?.teams?.away?.runs ?? 0);
  $("home-score").textContent = String(linescore?.teams?.home?.runs ?? 0);
  const badge = $("status-badge");
  const inning = $("inning-info");
  const countBlock = $("status-count");
  hideAllStatePanes();
  if (isFinalState(statusText)) {
    badge.textContent = "FINAL";
    badge.style.background = "";
    const n = linescore?.currentInning || 9;
    inning.textContent = n !== 9 ? `F/${n}` : "";
    inning.style.color = "";
    countBlock.style.display = "none";
    $("dynamic-tab-label").textContent = "WRAP";
    const finEl = $("final-content");
    if (finEl) finEl.style.display = "block";
    try {
      renderFinalContent(data);
    } catch (e) {
      reportError("renderFinalContent", e);
    }
  } else if (isPreGameState(statusText)) {
    badge.textContent = "";
    inning.textContent = timeStr;
    inning.style.color = "var(--text-secondary)";
    countBlock.style.display = "none";
    $("dynamic-tab-label").textContent = "GAME INFO";
    const preEl = $("pregame-content");
    if (preEl) preEl.style.display = "block";
    try {
      renderPregameContent(data, awayTeam, homeTeam);
    } catch (e) {
      reportError("renderPregameContent", e);
    }
  } else if (statusText === "Postponed") {
    badge.textContent = "POSTPONED";
    badge.style.background = "";
    const reason = game?.status?.reason || "";
    inning.textContent = reason ? reason.toUpperCase() : "";
    inning.style.color = "var(--text-secondary)";
    countBlock.style.display = "none";
    $("dynamic-tab-label").textContent = "POSTPONED";
    const ppdEl = $("postponed-content");
    if (ppdEl) ppdEl.style.display = "block";
    try {
      renderPostponedContent(data);
    } catch (e) {
      reportError("renderPostponedContent", e);
    }
  } else if (isSuspendedState(statusText)) {
    badge.textContent = "SUSPENDED";
    badge.style.background = "";
    const half = linescore?.inningHalf === "Top" ? "\u25B2" : "\u25BC";
    inning.textContent = linescore?.currentInning ? `${half} ${linescore.currentInning}` : "";
    inning.style.color = "";
    countBlock.style.display = "none";
    $("dynamic-tab-label").textContent = "SUSPENDED";
    const susEl = $("suspended-content");
    if (susEl) susEl.style.display = "block";
    try {
      renderSuspendedContent(data);
    } catch (e) {
      reportError("renderSuspendedContent", e);
    }
  } else if (isLiveState(statusText)) {
    badge.textContent = "LIVE";
    badge.style.background = "";
    const half = linescore?.inningHalf === "Top" ? "\u25B2" : "\u25BC";
    inning.textContent = `${half} ${linescore?.currentInning || ""}`;
    inning.style.color = "";
    const cp = data.liveData?.plays?.currentPlay;
    const count = cp?.count;
    if (count) {
      $("balls").textContent = String(count.balls ?? 0);
      $("strikes").textContent = String(count.strikes ?? 0);
      $("outs").textContent = String(count.outs ?? 0);
      countBlock.style.display = "flex";
    } else {
      countBlock.style.display = "none";
    }
    $("dynamic-tab-label").textContent = "LIVE";
    const liveEl = $("live-content");
    if (liveEl) liveEl.style.display = "block";
    try {
      renderLiveContent(data);
    } catch (e) {
      reportError("renderLiveContent", e);
    }
  } else {
    badge.textContent = statusText.toUpperCase();
    badge.style.background = "var(--text-muted)";
    inning.textContent = "";
    countBlock.style.display = "none";
    $("dynamic-tab-label").textContent = statusText.toUpperCase();
  }
  try {
    renderWeather(data);
  } catch (e) {
    reportError("renderWeather", e);
  }
  try {
    renderLinescore(linescore, awayTeam, homeTeam, isFinalState(statusText));
  } catch (e) {
    reportError("renderLinescore", e);
  }
  if ($("tab-box")?.classList.contains("tab-content-active")) {
    try {
      renderBoxScore(data);
    } catch (e) {
      reportError("renderBoxScore", e);
    }
  }
  if ($("tab-plays")?.classList.contains("tab-content-active")) {
    try {
      renderScoringPlays(data);
    } catch (e) {
      reportError("renderScoringPlays", e);
    }
    void augmentScoringVideos();
    void augmentStatcast();
    void renderHighlights();
    try {
      renderAllPlays(data);
    } catch (e) {
      reportError("renderAllPlays", e);
    }
  }
  if ($("tab-winprob")?.classList.contains("tab-content-active")) {
    void renderWinProb();
  }
  if (isTerminalState(statusText)) {
    gameIsTerminal = true;
    stopPolling();
  }
}
function renderLinescore(linescore, awayTeam, homeTeam, isFinal) {
  if (!linescore) return;
  const innings = linescore.innings || [];
  const currentInning = linescore.currentInning;
  const maxInnings = Math.max(9, innings.length);
  const awayRuns = linescore.teams?.away?.runs ?? 0;
  const homeRuns = linescore.teams?.home?.runs ?? 0;
  const awayIsLoser = isFinal && homeRuns > awayRuns;
  const homeIsLoser = isFinal && awayRuns > homeRuns;
  let headerCells = '<th class="ls-team-col"></th>';
  for (let i = 1; i <= maxInnings; i++) {
    headerCells += `<th class="ls-inning-h${i === currentInning ? " ls-current" : ""}">${i}</th>`;
  }
  headerCells += '<th class="ls-total ls-r-header">R</th><th class="ls-total ls-h-header">H</th><th class="ls-total ls-e-header">E</th>';
  const buildRow = (teamKey, team) => {
    const abbr = team.abbreviation || team.teamName?.slice(0, 3).toUpperCase() || "\u2014";
    let cells = `<td class="ls-team-col">
      <img class="ls-team-logo" src="${getLogoPath(team.id)}" onerror="${logoFallbackAttr(team.id)}" alt="${abbr}">
      <span class="ls-team-abbr">${abbr}</span>
    </td>`;
    for (let i = 1; i <= maxInnings; i++) {
      const inn = innings.find((x) => x.num === i);
      const runs = inn?.[teamKey]?.runs;
      const isCurrent = i === currentInning;
      let cls = "ls-inning";
      if (runs == null) cls += " ls-empty";
      else if (runs === 0) cls += " ls-zero";
      else cls += " ls-nonzero";
      if (isCurrent) cls += " ls-current";
      cells += `<td class="${cls}">${runs == null ? "\u2013" : runs}</td>`;
    }
    const t = linescore.teams[teamKey];
    const r = t?.runs ?? 0;
    const h = t?.hits ?? 0;
    const e = t?.errors ?? 0;
    cells += `<td class="ls-total ls-r-value ${r === 0 ? "ls-zero" : "ls-nonzero"}">${r}</td>`;
    cells += `<td class="ls-total ls-h-value ${h === 0 ? "ls-zero" : "ls-nonzero"}">${h}</td>`;
    cells += `<td class="ls-total ls-e-value">${e}</td>`;
    return cells;
  };
  const awayRowClass = awayIsLoser ? "ls-row-loser" : "";
  const homeRowClass = homeIsLoser ? "ls-row-loser" : "";
  $("linescore-container").innerHTML = `
    <table class="linescore-compact">
      <thead><tr>${headerCells}</tr></thead>
      <tbody>
        <tr class="ls-row-away ${awayRowClass}">${buildRow("away", awayTeam)}</tr>
        <tr class="ls-row-home ${homeRowClass}">${buildRow("home", homeTeam)}</tr>
      </tbody>
    </table>`;
}
function setPlaysView(which) {
  const toggle = $("plays-toggle");
  const lists = {
    highlights: $("highlights-list"),
    scoring: $("scoring-plays-list"),
    all: $("all-plays-list")
  };
  const show = lists[which];
  if (!toggle || !show) return;
  toggle.setAttribute("data-active", which);
  toggle.querySelectorAll(".plays-seg").forEach((seg) => {
    seg.classList.toggle("is-active", seg.getAttribute("data-plays") === which);
  });
  Object.keys(lists).forEach((k) => {
    const l = lists[k];
    if (l) l.hidden = k !== which;
  });
  show.classList.remove("plays-list-enter");
  void show.offsetWidth;
  show.classList.add("plays-list-enter");
}
function setupPlaysToggle() {
  const toggle = $("plays-toggle");
  if (!toggle) return;
  toggle.querySelectorAll(".plays-seg").forEach((seg) => {
    seg.addEventListener("click", () => {
      const which = seg.getAttribute("data-plays");
      if (which === "highlights" || which === "scoring" || which === "all") setPlaysView(which);
      if (which === "highlights") void renderHighlights();
    });
  });
}
function setupTabs() {
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      if (!targetTab) return;
      document.body.classList.toggle("on-box-tab", targetTab === "box");
      document.body.classList.toggle("compact-top", targetTab !== "dynamic");
      document.body.classList.toggle("on-standings-tab", targetTab === "standings");
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("tab-active"));
      btn.classList.add("tab-active");
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("tab-content-active"));
      $(`tab-${targetTab}`)?.classList.add("tab-content-active");
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      const region = inlinePagerRegion();
      if (region) region.scrollTop = 0;
      if (targetTab === "box" && lastGameData) {
        try {
          renderBoxScore(lastGameData);
        } catch (e) {
          reportError("renderBoxScore", e);
        }
      }
      if (targetTab === "plays") {
        if (lastGameData) {
          try {
            renderScoringPlays(lastGameData);
          } catch (e) {
            reportError("renderScoringPlays", e);
          }
          try {
            renderAllPlays(lastGameData);
          } catch (e) {
            reportError("renderAllPlays", e);
          }
          void augmentScoringVideos();
          void augmentStatcast();
        }
        setPlaysView("scoring");
      }
      if (targetTab === "winprob") {
        void renderWinProb();
      }
      if (targetTab === "standings") {
        setStandLeague("AL");
      }
    });
  });
}
function startPolling() {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(() => {
    if (document.hidden || gamePk == null) return;
    void fetchAndRender(gamePk);
  }, 1e4);
}
function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
async function maybeNotifyPostgame(statusText) {
  if (postgameNotificationFired) return;
  if (!isFinalState(statusText)) return;
  postgameNotificationFired = true;
  try {
    await fetch("/api/postgame-check", { method: "POST" });
  } catch (e) {
    console.error("postgame notify failed:", e);
  }
}
var GRAPH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18 L9 12 L13 16 L21 6"/><polyline points="15 6 21 6 21 12"/></svg>';
var TV_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M8 3l4 4 4-4"/></svg>';
var FEED_TV_ICON = TV_ICON;
var FEED_RADIO_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="2.5"/><path d="M4.9 9.9a10 10 0 0 1 14.2 0"/><path d="M7.8 12.8a6 6 0 0 1 8.4 0"/></svg>';
var CHEV_UP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>';
var CHEV_DOWN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
var OVERLAY_CLOSE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
var VIDEO_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"/></svg>';
var WX_SUN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';
var WX_CLOUD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.34 9.5 4 4 0 0 0 7 19z"/></svg>';
var WX_PARTLY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8.5" r="2.6"/><path d="M8 3.4v1.2M4.1 4.6l.8.8M3 8.5h1.2M11.9 4.6l-.8.8"/><path d="M17 19a4 4 0 0 0 .4-7.98A5.2 5.2 0 0 0 7.6 12 4 4 0 0 0 8 19z"/></svg>';
var WX_RAIN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 14a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.34 4.5 4 4 0 0 0 7 14z"/><path d="M8 18v1.5M12 18v2.5M16 18v1.5"/></svg>';
var WX_SNOW_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 14a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.34 4.5 4 4 0 0 0 7 14z"/><path d="M8 18.5v.01M12 20v.01M16 18.5v.01"/></svg>';
var WX_ROOF_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 18 0"/><path d="M2 12h20M6 12v6M18 12v6M6 18h12"/></svg>';
var infoOverlayEl = null;
function overlayRowsHtml(items) {
  return items.map((it, i) => {
    const visual = it.img ? `<img class="info-row-logo" src="${it.img}" alt="">` : it.icon ? `<span class="info-row-icon">${it.icon}</span>` : "";
    const inner = visual + '<span class="info-row-text"><span class="info-row-label">' + it.label + "</span>" + (it.sub ? '<span class="info-row-sub">' + it.sub + "</span>" : "") + "</span>";
    const style = `animation-delay:${50 + i * 55}ms`;
    return it.url ? `<button class="info-row" type="button" data-url="${it.url}" style="${style}">${inner}</button>` : `<div class="info-row is-static" style="${style}">${inner}</div>`;
  }).join("");
}
function wireOverlayRows(ov) {
  ov.querySelectorAll(".info-row[data-url]").forEach((row) => {
    row.addEventListener("click", () => {
      const url = row.getAttribute("data-url");
      if (!url) return;
      try {
        navigateTo(url);
      } catch (e) {
        reportError("navigateTo", e);
      }
    });
  });
  ov.querySelectorAll(".info-row-logo").forEach((img) => {
    img.addEventListener("error", () => {
      img.style.display = "none";
    });
  });
}
function closeInfoOverlay() {
  const ov = infoOverlayEl;
  if (!ov) return;
  ov.classList.remove("is-open");
  window.setTimeout(() => {
    if (ov && !ov.classList.contains("is-open")) ov.style.display = "none";
  }, 220);
}
function openInfoOverlay(title, items) {
  const host = $("scorebug-content") || document.body;
  let ov = infoOverlayEl;
  if (!ov) {
    ov = document.createElement("div");
    ov.className = "info-overlay";
    ov.addEventListener("click", (e) => {
      if (e.target === ov) closeInfoOverlay();
    });
    host.appendChild(ov);
    infoOverlayEl = ov;
  }
  ov.innerHTML = '<div class="info-panel"><div class="info-panel-head"><span class="info-panel-title">' + title + '</span><button class="info-panel-close" type="button" aria-label="Close">' + OVERLAY_CLOSE_ICON + '</button></div><div class="info-panel-body">' + overlayRowsHtml(items) + "</div></div>";
  ov.querySelector(".info-panel-close")?.addEventListener("click", closeInfoOverlay);
  wireOverlayRows(ov);
  ov.style.display = "flex";
  void ov.offsetWidth;
  ov.classList.add("is-open");
  syncOverlayScroll();
}
function setOverlayRows(items) {
  const ov = infoOverlayEl;
  if (!ov) return;
  const body = ov.querySelector(".info-panel-body");
  if (!body) return;
  body.innerHTML = overlayRowsHtml(items);
  wireOverlayRows(ov);
  syncOverlayScroll();
}
function syncOverlayScroll() {
  const ov = infoOverlayEl;
  if (!ov) return;
  const panel = ov.querySelector(".info-panel");
  const body = ov.querySelector(".info-panel-body, .pl-scroll");
  if (!panel || !body) return;
  panel.querySelector(".info-scroll")?.remove();
  window.requestAnimationFrame(() => {
    if (!document.body.classList.contains("is-inline")) return;
    if (body.scrollHeight <= body.clientHeight + 4) return;
    const bar = document.createElement("div");
    bar.className = "info-scroll";
    bar.innerHTML = '<button class="info-scroll-btn" type="button" aria-label="Scroll up" data-dir="-1">' + CHEV_UP_ICON + '</button><button class="info-scroll-btn" type="button" aria-label="Scroll down" data-dir="1">' + CHEV_DOWN_ICON + "</button>";
    bar.querySelectorAll(".info-scroll-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const dir = Number(b.getAttribute("data-dir")) || 1;
        body.scrollBy({ top: dir * 150, behavior: "smooth" });
      });
    });
    panel.appendChild(bar);
  });
}
function mkTopMiniButton(id, label, icon, side, offsetPx) {
  const b = document.createElement("button");
  b.id = id;
  b.type = "button";
  b.className = "topbar-mini-btn";
  b.setAttribute("aria-label", label);
  b.innerHTML = icon;
  b.style.cssText = "position:absolute;top:10px;" + side + ":" + offsetPx + "px;z-index:40;width:25px;height:25px;display:flex;align-items:center;justify-content:center;padding:0;background:var(--bg-elev-2);color:var(--text-primary);border:1px solid var(--border-medium);border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);";
  return b;
}
function setupGraphButton() {
  if (document.getElementById("graph-btn")) return;
  const host = $("scorebug-content") || document.body;
  const btn = mkTopMiniButton("graph-btn", "Analytics links", GRAPH_ICON, "right", 44);
  btn.addEventListener("click", () => {
    if (gamePk == null) return;
    const od = lastGameData?.gameData?.datetime?.officialDate;
    const date = typeof od === "string" && od ? od : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    openInfoOverlay("Analytics", [
      { label: "Baseball Savant", sub: "Statcast game feed", img: "assets/logos/savant.png", url: `https://baseballsavant.mlb.com/gamefeed?gamePk=${gamePk}` },
      { label: "MLB.com Gameday", sub: "Official game page", img: "assets/logos/mlb.png", url: `https://www.mlb.com/gameday/${gamePk}` },
      { label: "FanGraphs", sub: "Live scoreboard for the day", img: "assets/logos/fangraphs.png", url: `https://www.fangraphs.com/scores?date=${date}` },
      { label: "Baseball-Reference", sub: "Box scores (posts next day)", img: "assets/logos/baseball-reference.png", url: "https://www.baseball-reference.com/boxes/index.fcgi" }
    ]);
  });
  host.appendChild(btn);
}
async function fetchBroadcastItems(pk) {
  try {
    const res = await fetch(`/api/broadcasts/${pk}`);
    if (!res.ok) return [{ label: "Broadcast info unavailable" }];
    const data = await res.json();
    const game = data?.dates?.[0]?.games?.[0];
    const casts = game?.broadcasts || [];
    if (casts.length === 0) return [{ label: "No listed broadcasts" }];
    const tier = (b) => {
      if (b?.isNational) return "National";
      const ha = String(b?.homeAway || "").toLowerCase();
      if (ha === "away") return "Away feed";
      if (ha === "home") return "Home feed";
      return "Broadcast";
    };
    const rank = (b) => {
      const t = tier(b);
      return t === "National" ? 0 : t === "Away feed" ? 1 : t === "Home feed" ? 2 : 3;
    };
    const seen = /* @__PURE__ */ new Set();
    const items = [];
    casts.slice().sort((a, b) => rank(a) - rank(b)).forEach((b) => {
      const name = String(b?.name || b?.callSign || "").trim();
      if (!name) return;
      const kind = String(b?.type || "").toUpperCase();
      const dedup = name + "|" + kind + "|" + tier(b);
      if (seen.has(dedup)) return;
      seen.add(dedup);
      const isTv = kind.includes("TV");
      items.push({ label: name, sub: kind ? `${tier(b)} \xB7 ${kind}` : tier(b), icon: isTv ? FEED_TV_ICON : FEED_RADIO_ICON });
    });
    return items.length ? items : [{ label: "No listed broadcasts" }];
  } catch (e) {
    reportError("fetchBroadcastItems", e);
    return [{ label: "Broadcast info unavailable" }];
  }
}
function setupTvButton() {
  if (document.getElementById("tv-btn")) return;
  const host = $("scorebug-content") || document.body;
  const btn = mkTopMiniButton("tv-btn", "Where to watch", TV_ICON, "left", 44);
  btn.addEventListener("click", async () => {
    if (gamePk == null) return;
    openInfoOverlay("Where to Watch", [{ label: "Loading\u2026" }]);
    const items = await fetchBroadcastItems(gamePk);
    setOverlayRows(items);
  });
  host.appendChild(btn);
}
function weatherCategory(cond) {
  const c = cond.toLowerCase();
  if (/(rain|drizzle|shower|thunder)/.test(c)) return "rain";
  if (/(snow|flurr|wintry)/.test(c)) return "snow";
  if (/(partly|mostly cloudy|partly sunny)/.test(c)) return "partly";
  if (/(cloud|overcast|hazy|fog|mist)/.test(c)) return "cloud";
  if (/(clear|sunny|fair)/.test(c)) return "sun";
  return "cloud";
}
function weatherIconFor(cat) {
  switch (cat) {
    case "rain":
      return WX_RAIN_ICON;
    case "snow":
      return WX_SNOW_ICON;
    case "partly":
      return WX_PARTLY_ICON;
    case "sun":
      return WX_SUN_ICON;
    default:
      return WX_CLOUD_ICON;
  }
}
function renderWeather(data) {
  const lineEl = $("linescore-container");
  const parent2 = lineEl?.parentElement;
  if (!lineEl || !parent2) return;
  let strip = $("weather-strip");
  if (!strip) {
    strip = document.createElement("div");
    strip.id = "weather-strip";
    strip.className = "weather-strip";
    parent2.insertBefore(strip, lineEl);
  }
  const w = data?.gameData?.weather;
  const cond = String(w?.condition || "").trim();
  const temp = String(w?.temp || "").trim();
  if (!cond && !temp) {
    strip.style.display = "none";
    return;
  }
  strip.style.display = "";
  if (/dome|roof|indoor/i.test(cond)) {
    strip.innerHTML = '<span class="weather-pill wx-roof"><span class="weather-icon">' + WX_ROOF_ICON + '</span><span class="weather-text">Roof Closed</span></span>';
    return;
  }
  const cat = weatherCategory(cond);
  const tempTxt = temp ? `${temp}\xB0` : "";
  const sep = cond && tempTxt ? " \xB7 " : "";
  strip.innerHTML = `<span class="weather-pill wx-${cat}"><span class="weather-icon">${weatherIconFor(cat)}</span><span class="weather-text">${cond}${sep}${tempTxt}</span></span>`;
}
var clipMapCache = null;
async function getClipMap(pk) {
  const now = Date.now();
  if (clipMapCache && clipMapCache.pk === pk && now - clipMapCache.ts < 3e4) return clipMapCache.map;
  try {
    const res = await fetch(`/api/clips/${pk}`);
    if (!res.ok) return clipMapCache?.map || {};
    const map = await res.json();
    clipMapCache = { pk, map, ts: now };
    return map;
  } catch (e) {
    reportError("getClipMap", e);
    return clipMapCache?.map || {};
  }
}
function playClipId(play) {
  const evs = play?.playEvents;
  if (!Array.isArray(evs)) return "";
  for (let i = evs.length - 1; i >= 0; i--) {
    const pid = evs[i]?.playId;
    if (pid) return String(pid);
  }
  return "";
}
var statcastCache = null;
async function getStatcastMap(pk) {
  const now = Date.now();
  if (statcastCache && statcastCache.pk === pk && now - statcastCache.ts < 3e4) return statcastCache.map;
  try {
    const res = await fetch(`/api/statcast/${pk}`);
    if (!res.ok) return statcastCache?.map || {};
    const map = await res.json();
    statcastCache = { pk, map, ts: now };
    return map;
  } catch (e) {
    reportError("getStatcastMap", e);
    return statcastCache?.map || {};
  }
}
async function augmentStatcast() {
  if (gamePk == null) return;
  const lists = [$("scoring-plays-list"), $("all-plays-list")].filter((x) => !!x);
  if (!lists.length) return;
  const cards = [];
  lists.forEach((l) => l.querySelectorAll(".play-card[data-clip-key]").forEach((c) => cards.push(c)));
  if (!cards.length) return;
  const map = await getStatcastMap(gamePk);
  cards.forEach((card) => {
    const keyId = card.getAttribute("data-clip-key");
    if (!keyId) return;
    const sc = map[keyId];
    if (!sc || !sc.xba) return;
    if (card.querySelector(".play-statcast")) return;
    const bits = [];
    if (sc.ev) bits.push(`<span class="sc-ev${sc.barrel ? " sc-barrel" : ""}">${sc.ev} mph</span>`);
    if (sc.la) bits.push(`<span class="sc-la">${sc.la}\xB0</span>`);
    bits.push(`<span class="sc-xba">xBA ${sc.xba}</span>`);
    const strip = document.createElement("div");
    strip.className = "play-statcast";
    strip.innerHTML = bits.join("");
    (card.querySelector(".play-main") || card).appendChild(strip);
  });
}
var hlCache = null;
async function fetchHighlights(pk) {
  const now = Date.now();
  if (hlCache && hlCache.pk === pk && now - hlCache.ts < 6e4) return hlCache.items;
  try {
    const res = await fetch(`/api/highlights/${pk}`);
    if (!res.ok) return hlCache?.items || [];
    const items = await res.json();
    hlCache = { pk, items: Array.isArray(items) ? items : [], ts: now };
    return hlCache.items;
  } catch (e) {
    reportError("fetchHighlights", e);
    return hlCache?.items || [];
  }
}
async function renderHighlights() {
  if (gamePk == null) return;
  const list = $("highlights-list");
  if (!list) return;
  const items = await fetchHighlights(gamePk);
  if (!items.length) {
    list.innerHTML = '<div class="hl-empty">No highlights yet \u2014 they appear here as MLB posts them.</div>';
    return;
  }
  list.innerHTML = items.map((it, i) => `<button class="hl-row" type="button" data-i="${i}"><span class="hl-play">` + VIDEO_ICON + `</span><span class="hl-title"></span></button>`).join("");
  list.querySelectorAll(".hl-row").forEach((row) => {
    const i = Number(row.getAttribute("data-i"));
    const it = items[i];
    if (!it) return;
    const titleEl = row.querySelector(".hl-title");
    if (titleEl) titleEl.textContent = it.t;
    row.addEventListener("click", () => {
      try {
        navigateTo(it.u);
      } catch (e) {
        reportError("navigateTo(hl)", e);
      }
    });
  });
}
async function augmentScoringVideos() {
  if (gamePk == null) return;
  const container = $("scoring-plays-list");
  if (!container) return;
  const cards = container.querySelectorAll(".play-card[data-clip-key]");
  if (cards.length === 0) return;
  const map = await getClipMap(gamePk);
  cards.forEach((card) => {
    const key = card.getAttribute("data-clip-key");
    if (!key) return;
    const url = map[key];
    if (!url) return;
    if (card.querySelector(".play-video-btn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "play-video-btn";
    btn.setAttribute("aria-label", "Watch this play");
    btn.innerHTML = VIDEO_ICON + "<span>VIDEO</span>";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      try {
        navigateTo(url);
      } catch (err) {
        reportError("navigateTo(video)", err);
      }
    });
    (card.querySelector(".play-main") || card).appendChild(btn);
  });
}
var STAND_DIVISION_NAMES = { 201: "AL East", 202: "AL Central", 200: "AL West", 204: "NL East", 205: "NL Central", 203: "NL West" };
var STAND_TEAM_ABBR = { 108: "LAA", 109: "ARI", 110: "BAL", 111: "BOS", 112: "CHC", 113: "CIN", 114: "CLE", 115: "COL", 116: "DET", 117: "HOU", 118: "KC", 119: "LAD", 120: "WSH", 121: "NYM", 133: "OAK", 134: "PIT", 135: "SD", 136: "SEA", 137: "SF", 138: "STL", 139: "TB", 140: "TEX", 141: "TOR", 142: "MIN", 143: "PHI", 144: "ATL", 145: "CWS", 146: "MIA", 147: "NYY", 158: "MIL" };
var standCache = null;
var standCacheTs = 0;
var standActiveLeague = "AL";
var standLoaded = false;
async function fetchStandingsData() {
  const now = Date.now();
  if (standCache && now - standCacheTs < 12e4) return standCache;
  const res = await fetch("/api/standings");
  if (!res.ok) throw new Error("standings fetch failed");
  const data = await res.json();
  standCache = data;
  standCacheTs = now;
  return data;
}
function standAbbr(team) {
  const id = team?.id;
  return id != null && STAND_TEAM_ABBR[id] || String(team?.abbreviation || team?.name?.split(" ").pop() || "").toUpperCase();
}
function standPct(p) {
  if (!p || p === "0") return ".000";
  const f = parseFloat(p);
  return f < 1 ? "." + String(Math.round(f * 1e3)).padStart(3, "0") : f.toFixed(3);
}
function standGB(leadW, leadL, w, l) {
  if (w === leadW && l === leadL) return "\u2014";
  const gb = (leadW - w + (l - leadL)) / 2;
  return gb % 1 === 0 ? String(gb) : gb.toFixed(1);
}
function standTeamRow(team, rank, isFirst, gb, clinchLine) {
  const id = team?.team?.id;
  const abbr = standAbbr(team?.team);
  const p = parseFloat(team?.winningPercentage) || 0;
  const barPct = Math.max(0, Math.min(100, (p - 0.35) / 0.35 * 100));
  return `<div class="stand-row${isFirst ? " leader" : ""}${clinchLine ? " playoff-line" : ""}"><span class="stand-pos${isFirst ? " first" : ""}">${rank}</span><span class="stand-team"><img class="stand-logo" src="${getLogoPath(id)}" onerror="${logoFallbackAttr(id)}" alt="${abbr}"><span class="stand-abbr">${abbr}</span></span><span class="stand-stat">${team?.wins ?? 0}</span><span class="stand-stat">${team?.losses ?? 0}</span><span class="stand-stat muted">${gb}</span><span class="stand-stat muted">${team?.runsScored ?? "\u2014"}</span><span class="stand-stat muted">${team?.runsAllowed ?? "\u2014"}</span><span class="stand-stat ${(team?.runDifferential ?? 0) > 0 ? "pos" : (team?.runDifferential ?? 0) < 0 ? "neg" : ""}">${(team?.runDifferential ?? 0) > 0 ? "+" : ""}${team?.runDifferential ?? "\u2014"}</span><span class="stand-pct"><span class="stand-pct-val">${standPct(team?.winningPercentage)}</span><span class="stand-bar"><span class="stand-bar-fill" style="width:${barPct}%"></span></span></span></div>`;
}
function standColHdr() {
  return '<div class="stand-col-hdr"><span>#</span><span class="stand-col-team">Team</span><span>W</span><span>L</span><span>GB</span><span>R</span><span>RA</span><span>DIFF</span><span class="stand-col-pct">PCT</span></div>';
}
function standDivisionCard(record) {
  const name = STAND_DIVISION_NAMES[record?.division?.id] || "Division";
  const teams = [...record?.teamRecords || []].sort((a, b) => parseFloat(b.winningPercentage) - parseFloat(a.winningPercentage));
  const lead = teams[0];
  const rows = teams.map((t, i) => standTeamRow(t, i + 1, i === 0, standGB(lead?.wins || 0, lead?.losses || 0, t.wins, t.losses), false)).join("");
  return `<div class="stand-card"><div class="stand-card-hdr"><span class="stand-card-dot"></span><span class="stand-card-name">${name}</span></div>${standColHdr()}${rows}</div>`;
}
function standWildcardCards(data) {
  return ["AL", "NL"].map((lg) => {
    const leagueId = lg === "AL" ? 103 : 104;
    const wc = [];
    (data?.records || []).forEach((rec) => {
      if (rec?.league?.id !== leagueId) return;
      (rec.teamRecords || []).forEach((t) => {
        if (t.wildCardRank && parseInt(t.wildCardRank) <= 8) wc.push(t);
      });
    });
    wc.sort((a, b) => parseInt(a.wildCardRank) - parseInt(b.wildCardRank));
    const rows = wc.map((t) => {
      const rank = parseInt(t.wildCardRank);
      const gbRaw = t.wildCardGamesBack || t.gamesBack;
      const gb = !gbRaw || gbRaw === "-" || gbRaw === "0.0" || gbRaw === 0 ? "\u2014" : gbRaw;
      return standTeamRow(t, rank, rank <= 3, gb, rank === 4);
    }).join("");
    return `<div class="stand-card"><div class="stand-card-hdr"><span class="stand-card-dot"></span><span class="stand-card-name">${lg} Wild Card</span><span class="stand-wc-badge">3 spots</span></div>${standColHdr()}${rows}</div>`;
  }).join("");
}
var TEAM_DIVISION = {
  110: 201,
  111: 201,
  147: 201,
  139: 201,
  141: 201,
  // AL East
  145: 202,
  114: 202,
  116: 202,
  118: 202,
  142: 202,
  // AL Central
  117: 200,
  108: 200,
  133: 200,
  136: 200,
  140: 200,
  // AL West
  144: 204,
  146: 204,
  121: 204,
  143: 204,
  120: 204,
  // NL East
  112: 205,
  113: 205,
  158: 205,
  134: 205,
  138: 205,
  // NL Central
  109: 203,
  115: 203,
  119: 203,
  135: 203,
  137: 203
  // NL West
};
var sbCache = null;
async function fetchScoreboard() {
  const od = lastGameData?.gameData?.datetime?.officialDate;
  const date = typeof od === "string" && /^\d{4}-\d{2}-\d{2}$/.test(od) ? od : "";
  const now = Date.now();
  if (sbCache && sbCache.date === date && now - sbCache.ts < 6e4) return sbCache.data;
  const res = await fetch(date ? `/api/scoreboard/${date}` : "/api/scoreboard");
  if (!res.ok) throw new Error("scoreboard fetch failed");
  const data = await res.json();
  sbCache = { date, data, ts: now };
  return data;
}
function sbStatusHtml(g) {
  const abstract = String(g?.status?.abstractGameState || "");
  if (abstract === "Live") {
    const ls = g?.linescore || {};
    const inn = ls.currentInning ?? "";
    const st = String(ls.inningState || "");
    const mark = st === "Top" ? "\u25B2" : st === "Bottom" ? "\u25BC" : st === "Middle" ? "M" : st === "End" ? "E" : "";
    return `<span class="sb-live-dot"></span><span class="sb-inn">${mark}${inn}</span>`;
  }
  if (abstract === "Final") {
    const inn = g?.linescore?.currentInning;
    return `<span class="sb-final">F${typeof inn === "number" && inn > 9 ? "/" + inn : ""}</span>`;
  }
  let time = "";
  try {
    time = new Date(g.gameDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } catch {
    time = "";
  }
  return `<span class="sb-time">${time}</span>`;
}
function sbTeamRow(side) {
  const id = side?.team?.id;
  const abbr = id != null && STAND_TEAM_ABBR[id] || String(side?.team?.abbreviation || "").toUpperCase() || "\u2014";
  const score = side?.score ?? "";
  return `<div class="sb-team"><img class="sb-logo" src="${getLogoPath(id)}" onerror="${logoFallbackAttr(id)}" alt=""><span class="sb-abbr">${abbr}</span><span class="sb-score">${score}</span></div>`;
}
async function renderDivOpp() {
  const data = await fetchScoreboard();
  const games = data?.sched?.dates?.[0]?.games || [];
  const cfgTeam = data?.teamId != null && /^\d+$/.test(String(data.teamId)) ? Number(data.teamId) : null;
  const divs = /* @__PURE__ */ new Set();
  const cfgDiv = cfgTeam != null ? TEAM_DIVISION[cfgTeam] : void 0;
  if (cfgDiv != null) {
    divs.add(cfgDiv);
  } else {
    const awayId = lastGameData?.gameData?.teams?.away?.id;
    const homeId = lastGameData?.gameData?.teams?.home?.id;
    const da = typeof awayId === "number" ? TEAM_DIVISION[awayId] : void 0;
    const dh = typeof homeId === "number" ? TEAM_DIVISION[homeId] : void 0;
    if (da != null) divs.add(da);
    if (dh != null) divs.add(dh);
  }
  const inDiv = (g) => {
    if (divs.size === 0) return true;
    const a = g?.teams?.away?.team?.id, hm = g?.teams?.home?.team?.id;
    const ga = TEAM_DIVISION[a], gh = TEAM_DIVISION[hm];
    return ga != null && divs.has(ga) || gh != null && divs.has(gh);
  };
  const rows = games.filter((g) => g?.gamePk !== gamePk).filter(inDiv).map((g) => `<div class="sb-box"><div class="sb-status">${sbStatusHtml(g)}</div>${sbTeamRow(g.teams?.away)}${sbTeamRow(g.teams?.home)}</div>`).join("");
  return rows ? `<div class="sb-grid">${rows}</div>` : '<div class="stand-msg">No division games today.</div>';
}
async function loadStandingsView() {
  standLoaded = true;
  const body = $("stand-body");
  if (!body) return;
  const lg = standActiveLeague;
  body.innerHTML = '<div class="stand-msg">Loading\u2026</div>';
  if (lg === "DIV") {
    try {
      body.innerHTML = await renderDivOpp();
    } catch (e) {
      reportError("renderDivOpp", e);
      body.innerHTML = '<div class="stand-msg">Could not load the scoreboard.</div>';
    }
    return;
  }
  try {
    const data = await fetchStandingsData();
    if (lg === "WC") {
      body.innerHTML = standWildcardCards(data);
      return;
    }
    const divIds = lg === "AL" ? [201, 202, 200] : [204, 205, 203];
    const cards = divIds.map((id) => {
      const rec = (data?.records || []).find((r) => r?.division?.id === id);
      return rec ? standDivisionCard(rec) : "";
    }).join("");
    body.innerHTML = cards || '<div class="stand-msg">No standings available.</div>';
  } catch (e) {
    reportError("loadStandingsView", e);
    body.innerHTML = '<div class="stand-msg">Could not load standings.</div>';
  }
}
function setStandLeague(lg) {
  standActiveLeague = lg;
  const nav = $("stand-nav");
  if (nav) {
    nav.setAttribute("data-active", lg);
    nav.querySelectorAll(".stand-seg").forEach((s) => s.classList.toggle("is-active", s.getAttribute("data-league") === lg));
  }
  void loadStandingsView();
}
function setupStandings() {
  const nav = $("stand-nav");
  if (!nav) return;
  nav.querySelectorAll(".stand-seg").forEach((seg) => {
    seg.addEventListener("click", () => {
      const lg = seg.getAttribute("data-league");
      if (lg) setStandLeague(lg);
    });
  });
  const obs = new MutationObserver(() => {
    if (standLoaded) void loadStandingsView();
  });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}
var PL_RATE = (v) => {
  const f = parseFloat(v);
  return isNaN(f) ? "-" : f.toFixed(3).replace(/^0+/, "");
};
var PL_F2 = (v) => {
  const f = parseFloat(v);
  return isNaN(f) ? "-" : f.toFixed(2);
};
var PL_F1 = (v) => {
  const f = parseFloat(v);
  return isNaN(f) ? "-" : f.toFixed(1);
};
function plAdvancedCells(stats, isPitcher) {
  if (!stats) return "";
  const num = (v) => parseFloat(v);
  const cell = (val, lbl) => `<div class="pl-adv-i"><span class="pl-adv-v">${val}</span><span class="pl-adv-l">${lbl}</span></div>`;
  const out = [];
  if (isPitcher) {
    const ip = num(stats.inningsPitched), so = num(stats.strikeOuts), bb = num(stats.baseOnBalls), hr = num(stats.homeRuns);
    if (ip > 0) {
      if (!isNaN(so)) out.push(cell((so * 9 / ip).toFixed(1), "K/9"));
      if (!isNaN(bb)) out.push(cell((bb * 9 / ip).toFixed(1), "BB/9"));
      if (!isNaN(hr)) out.push(cell((hr * 9 / ip).toFixed(1), "HR/9"));
    }
  } else {
    const slg = num(stats.slg), avg = num(stats.avg), pa = num(stats.plateAppearances), bb = num(stats.baseOnBalls), so = num(stats.strikeOuts);
    if (!isNaN(slg) && !isNaN(avg)) out.push(cell((slg - avg).toFixed(3).replace(/^0+/, ""), "ISO"));
    if (pa > 0 && !isNaN(bb)) out.push(cell((bb / pa * 100).toFixed(1) + "%", "BB%"));
    if (pa > 0 && !isNaN(so)) out.push(cell((so / pa * 100).toFixed(1) + "%", "K%"));
  }
  return out.join("");
}
function buildPlayerBox(playerId) {
  const data = lastGameData;
  if (!data) return '<div class="pl-box"><div class="pl-msg">No player data available.</div></div>';
  const bio = data.gameData?.players?.["ID" + playerId] || {};
  let seasonBat = null, seasonPit = null, teamId = null, teamName = "";
  const teams = data.liveData?.boxscore?.teams || {};
  for (const side of ["away", "home"]) {
    const p = teams[side]?.players?.["ID" + playerId];
    if (p) {
      seasonBat = p.seasonStats?.batting;
      seasonPit = p.seasonStats?.pitching;
      teamId = teams[side]?.team?.id;
      teamName = teams[side]?.team?.name || "";
      break;
    }
  }
  const name = bio.fullName || "Player";
  const pos = bio.primaryPosition?.abbreviation || "";
  const posName = bio.primaryPosition?.name || pos;
  const isPitcher = pos === "P";
  const stats = isPitcher ? seasonPit : seasonBat;
  let logoSrc = "";
  if (teamId != null) logoSrc = MLB_TEAM_IDS.has(teamId) ? `/teams/dark/${teamId}.svg` : `/teams/${teamId}.svg`;
  const logo = teamId != null ? `<img class="pl-team-logo" src="${logoSrc}" onerror="${logoFallbackAttr(teamId)}" alt="">` : "";
  const details = [];
  if (bio.primaryNumber) details.push(`<span>#${bio.primaryNumber}</span>`);
  if (bio.currentAge) details.push(`<span>Age ${bio.currentAge}</span>`);
  if (bio.batSide?.code && bio.pitchHand?.code) details.push(`<span>B/T ${bio.batSide.code}/${bio.pitchHand.code}</span>`);
  const sv = (statName, fmt) => {
    const raw = stats ? stats[statName] : null;
    if (raw == null || raw === "") return "\u2014";
    return fmt ? fmt(raw) : String(raw);
  };
  let body = '<div class="pl-msg">No season stats yet.</div>';
  if (stats) {
    const trio = isPitcher ? [["ERA", sv("era", PL_F2)], ["IP", sv("inningsPitched", PL_F1)], ["K", sv("strikeOuts")]] : [["AVG", sv("avg", PL_RATE)], ["OBP", sv("obp", PL_RATE)], ["SLG", sv("slg", PL_RATE)]];
    const tiles = isPitcher ? [["W", sv("wins")], ["L", sv("losses")], ["SV", sv("saves")], ["HLD", sv("holds")]] : [["HR", sv("homeRuns")], ["RBI", sv("rbi")], ["R", sv("runs")], ["SB", sv("stolenBases")]];
    const rows = isPitcher ? [["WHIP", sv("whip", PL_RATE)], ["Hits", sv("hits")], ["Runs", sv("runs")], ["Home Runs", sv("homeRuns")], ["Walks", sv("baseOnBalls")], ["K/BB", sv("strikeoutWalkRatio", PL_F2)], ["Games", sv("gamesPlayed")], ["Starts", sv("gamesStarted")]] : [["Hits", sv("hits")], ["Doubles", sv("doubles")], ["Triples", sv("triples")], ["Walks", sv("baseOnBalls")], ["Strikeouts", sv("strikeOuts")], ["Plate App.", sv("plateAppearances")], ["Total Bases", sv("totalBases")], ["OPS", sv("ops", PL_RATE)]];
    const adv = plAdvancedCells(stats, isPitcher);
    body = `<div class="pl-trio">${trio.map(([l, v]) => `<div class="pl-trio-i"><div class="pl-trio-v">${v}</div><div class="pl-trio-l">${l}</div></div>`).join("")}</div><div class="pl-tiles">${tiles.map(([l, v]) => `<div class="pl-tile"><div class="pl-tile-v">${v}</div><div class="pl-tile-l">${l}</div></div>`).join("")}</div><div class="pl-rows">${rows.map(([l, v]) => `<div class="pl-r"><span class="pl-r-l">${l}</span><span class="pl-r-v">${v}</span></div>`).join("")}</div>` + (adv ? `<div class="pl-adv">${adv}</div>` : "");
  }
  return `<div class="pl-box"><div class="pl-hdr"><button class="info-panel-close" type="button" aria-label="Close">${OVERLAY_CLOSE_ICON}</button><div class="pl-name">${name}</div><div class="pl-meta"><span>${posName}</span><span class="pl-dot"></span>${logo}<span>${teamName}</span></div>` + (details.length ? `<div class="pl-meta pl-details">${details.join('<span class="pl-dot"></span>')}</div>` : "") + `</div><div class="pl-scroll"><div class="pl-form" id="pl-form"></div>` + body + "</div></div>";
}
var plCurrentId = "";
async function fetchPlayerRecent(id, group) {
  try {
    const res = await fetch(`/api/player-recent/${id}/${group}`);
    if (!res.ok) return null;
    const data = await res.json();
    const games = data?.stats?.[0]?.splits || [];
    if (!games.length) return null;
    if (group === "hitting") {
      let ab = 0, h = 0;
      games.forEach((g) => {
        ab += Number(g.stat?.atBats) || 0;
        h += Number(g.stat?.hits) || 0;
      });
      if (ab <= 0) return null;
      const avg = h / ab;
      const disp = avg.toFixed(3).replace(/^0+/, "");
      const cls = avg > 0.285 ? "hot" : avg >= 0.225 ? "steady" : "cold";
      const word = cls === "hot" ? "Hot" : cls === "steady" ? "Steady" : "Cold";
      return { label: `${word} \xB7 last ${games.length}`, sub: `${disp} AVG`, cls };
    } else {
      let er = 0, ip = 0;
      games.forEach((g) => {
        er += Number(g.stat?.earnedRuns) || 0;
        const s = String(g.stat?.inningsPitched || "0");
        if (s.includes(".")) {
          const p = s.split(".");
          ip += (Number(p[0]) || 0) + (Number(p[1]) || 0) / 3;
        } else ip += Number(s) || 0;
      });
      if (ip <= 0) return null;
      const era = er / ip * 9;
      const disp = era.toFixed(2);
      const cls = era < 3 ? "hot" : era <= 3.9 ? "steady" : "cold";
      const word = cls === "hot" ? "Hot" : cls === "steady" ? "Steady" : "Cold";
      return { label: `${word} \xB7 last ${games.length}`, sub: `${disp} ERA`, cls };
    }
  } catch (e) {
    reportError("fetchPlayerRecent", e);
    return null;
  }
}
async function openPlayer(playerId) {
  plCurrentId = playerId;
  openPlayerOverlay(buildPlayerBox(playerId));
  const data = lastGameData;
  if (!data) return;
  const bio = data.gameData?.players?.["ID" + playerId];
  const group = bio?.primaryPosition?.abbreviation === "P" ? "pitching" : "hitting";
  const loadEl = $("pl-form");
  if (loadEl) loadEl.innerHTML = '<span class="pl-form-load">Checking recent form\u2026</span>';
  const form = await fetchPlayerRecent(playerId, group);
  if (plCurrentId !== playerId) return;
  const el = $("pl-form");
  if (!el) return;
  if (!form) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `<span class="pl-badge pl-${form.cls}"><span class="pl-badge-word">${form.label}</span><span class="pl-badge-val">${form.sub}</span></span>`;
}
function openPlayerOverlay(html) {
  const host = $("scorebug-content") || document.body;
  let ov = infoOverlayEl;
  if (!ov) {
    ov = document.createElement("div");
    ov.className = "info-overlay";
    ov.addEventListener("click", (e) => {
      if (e.target === ov) closeInfoOverlay();
    });
    host.appendChild(ov);
    infoOverlayEl = ov;
  }
  ov.innerHTML = '<div class="info-panel pl-panel">' + html + "</div>";
  ov.querySelector(".info-panel-close")?.addEventListener("click", closeInfoOverlay);
  ov.style.display = "flex";
  void ov.offsetWidth;
  ov.classList.add("is-open");
  syncOverlayScroll();
}
function setupPlayerTaps() {
  const box = $("tab-box");
  if (!box) return;
  box.addEventListener("click", (e) => {
    const target = e.target;
    const row = target?.closest?.(".bs-row[data-player-id]");
    if (!row) return;
    const id = row.getAttribute("data-player-id");
    if (!id) return;
    void openPlayer(id);
  });
}
(async () => {
  setupTabs();
  setupPlaysToggle();
  setupBoxScoreTeamTabs();
  setupWinProbDismiss();
  setupThemeToggle();
  setupExpand();
  setupGraphButton();
  setupTvButton();
  setupStandings();
  setupPlayerTaps();
  setupInlinePager();
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && pollInterval !== null && gamePk != null) {
      void fetchAndRender(gamePk);
    }
  });
  gamePk = await selectGameForThisPost();
  if (!gamePk) {
    renderEndedState();
    return;
  }
  await fetchAndRender(gamePk);
  if (!gameIsTerminal) startPolling();
})();
//# sourceMappingURL=splash.js.map
