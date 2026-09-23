var xt=Object.defineProperty;var wt=(r,t,e)=>t in r?xt(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e;var B=(r,t,e)=>wt(r,typeof t!="symbol"?t+"":t,e);var q=globalThis,H=q.ShadowRoot&&(q.ShadyCSS===void 0||q.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,I=Symbol(),et=new WeakMap,E=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==I)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(H&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=et.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&et.set(e,t))}return t}toString(){return this.cssText}},st=r=>new E(typeof r=="string"?r:r+"",void 0,I),W=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((s,i,a)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[a+1],r[0]);return new E(e,r,I)},it=(r,t)=>{if(H)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),i=q.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,r.appendChild(s)}},V=H?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return st(e)})(r):r;var{is:At,defineProperty:kt,getOwnPropertyDescriptor:St,getOwnPropertyNames:Et,getOwnPropertySymbols:Ct,getPrototypeOf:Pt}=Object,f=globalThis,rt=f.trustedTypes,Ut=rt?rt.emptyScript:"",Tt=f.reactiveElementPolyfillSupport,C=(r,t)=>r,F={toAttribute(r,t){switch(t){case Boolean:r=r?Ut:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},ot=(r,t)=>!At(r,t),at={attribute:!0,type:String,converter:F,reflect:!1,useDefault:!1,hasChanged:ot};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),f.litPropertyMetadata??(f.litPropertyMetadata=new WeakMap);var b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=at){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&kt(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){let{get:i,set:a}=St(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:i,set(o){let c=i?.call(this);a?.call(this,o),this.requestUpdate(t,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??at}static _$Ei(){if(this.hasOwnProperty(C("elementProperties")))return;let t=Pt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(C("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(C("properties"))){let e=this.properties,s=[...Et(e),...Ct(e)];for(let i of s)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let i of s)e.unshift(V(i))}else t!==void 0&&e.push(V(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return it(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){let a=(s.converter?.toAttribute!==void 0?s.converter:F).toAttribute(e,s.type);this._$Em=t,a==null?this.removeAttribute(i):this.setAttribute(i,a),this._$Em=null}}_$AK(t,e){let s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let a=s.getPropertyOptions(i),o=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:F;this._$Em=i;let c=o.fromAttribute(e,a.type);this[i]=c??this._$Ej?.get(i)??c,this._$Em=null}}requestUpdate(t,e,s,i=!1,a){if(t!==void 0){let o=this.constructor;if(i===!1&&(a=this[t]),s??(s=o.getPropertyOptions(t)),!((s.hasChanged??ot)(a,e)||s.useDefault&&s.reflect&&a===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:a},o){s&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,o??e??this[t]),a!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[i,a]of this._$Ep)this[i]=a;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,a]of s){let{wrapped:o}=a,c=this[i];o!==!0||this._$AL.has(i)||c===void 0||this.C(i,void 0,a,c)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[C("elementProperties")]=new Map,b[C("finalized")]=new Map,Tt?.({ReactiveElement:b}),(f.reactiveElementVersions??(f.reactiveElementVersions=[])).push("2.1.2");var U=globalThis,nt=r=>r,L=U.trustedTypes,lt=L?L.createPolicy("lit-html",{createHTML:r=>r}):void 0,_t="$lit$",v=`lit$${Math.random().toFixed(9).slice(2)}$`,mt="?"+v,Mt=`<${mt}>`,w=document,T=()=>w.createComment(""),M=r=>r===null||typeof r!="object"&&typeof r!="function",G=Array.isArray,Dt=r=>G(r)||typeof r?.[Symbol.iterator]=="function",Q=`[ 	
\f\r]`,P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ht=/-->/g,ct=/>/g,y=RegExp(`>|${Q}(?:([^\\s"'>=/]+)(${Q}*=${Q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),dt=/'/g,pt=/"/g,bt=/^(?:script|style|textarea|title)$/i,tt=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),n=tt(1),Wt=tt(2),Vt=tt(3),A=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),ut=new WeakMap,x=w.createTreeWalker(w,129);function gt(r,t){if(!G(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return lt!==void 0?lt.createHTML(t):t}var Ot=(r,t)=>{let e=r.length-1,s=[],i,a=t===2?"<svg>":t===3?"<math>":"",o=P;for(let c=0;c<e;c++){let l=r[c],d,u,h=-1,m=0;for(;m<l.length&&(o.lastIndex=m,u=o.exec(l),u!==null);)m=o.lastIndex,o===P?u[1]==="!--"?o=ht:u[1]!==void 0?o=ct:u[2]!==void 0?(bt.test(u[2])&&(i=RegExp("</"+u[2],"g")),o=y):u[3]!==void 0&&(o=y):o===y?u[0]===">"?(o=i??P,h=-1):u[1]===void 0?h=-2:(h=o.lastIndex-u[2].length,d=u[1],o=u[3]===void 0?y:u[3]==='"'?pt:dt):o===pt||o===dt?o=y:o===ht||o===ct?o=P:(o=y,i=void 0);let g=o===y&&r[c+1].startsWith("/>")?" ":"";a+=o===P?l+Mt:h>=0?(s.push(d),l.slice(0,h)+_t+l.slice(h)+v+g):l+v+(h===-2?c:g)}return[gt(r,a+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},D=class r{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let a=0,o=0,c=t.length-1,l=this.parts,[d,u]=Ot(t,e);if(this.el=r.createElement(d,s),x.currentNode=this.el.content,e===2||e===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(i=x.nextNode())!==null&&l.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(let h of i.getAttributeNames())if(h.endsWith(_t)){let m=u[o++],g=i.getAttribute(h).split(v),R=/([.?@])?(.*)/.exec(m);l.push({type:1,index:a,name:R[2],strings:g,ctor:R[1]==="."?J:R[1]==="?"?X:R[1]==="@"?Y:S}),i.removeAttribute(h)}else h.startsWith(v)&&(l.push({type:6,index:a}),i.removeAttribute(h));if(bt.test(i.tagName)){let h=i.textContent.split(v),m=h.length-1;if(m>0){i.textContent=L?L.emptyScript:"";for(let g=0;g<m;g++)i.append(h[g],T()),x.nextNode(),l.push({type:2,index:++a});i.append(h[m],T())}}}else if(i.nodeType===8)if(i.data===mt)l.push({type:2,index:a});else{let h=-1;for(;(h=i.data.indexOf(v,h+1))!==-1;)l.push({type:7,index:a}),h+=v.length-1}a++}}static createElement(t,e){let s=w.createElement("template");return s.innerHTML=t,s}};function k(r,t,e=r,s){if(t===A)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl,a=M(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(r),i._$AT(r,e,s)),s!==void 0?(e._$Co??(e._$Co=[]))[s]=i:e._$Cl=i),i!==void 0&&(t=k(r,i._$AS(r,t.values),i,s)),t}var K=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??w).importNode(e,!0);x.currentNode=i;let a=x.nextNode(),o=0,c=0,l=s[0];for(;l!==void 0;){if(o===l.index){let d;l.type===2?d=new O(a,a.nextSibling,this,t):l.type===1?d=new l.ctor(a,l.name,l.strings,this,t):l.type===6&&(d=new Z(a,this,t)),this._$AV.push(d),l=s[++c]}o!==l?.index&&(a=x.nextNode(),o++)}return x.currentNode=w,i}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},O=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=k(this,t,e),M(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==A&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Dt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&M(this._$AH)?this._$AA.nextSibling.data=t:this.T(w.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=D.createElement(gt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{let a=new K(i,this),o=a.u(this.options);a.p(e),this.T(o),this._$AH=a}}_$AC(t){let e=ut.get(t.strings);return e===void 0&&ut.set(t.strings,e=new D(t)),e}k(t){G(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,i=0;for(let a of t)i===e.length?e.push(s=new r(this.O(T()),this.O(T()),this,this.options)):s=e[i],s._$AI(a),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=nt(t).nextSibling;nt(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},S=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,a){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=a,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=p}_$AI(t,e=this,s,i){let a=this.strings,o=!1;if(a===void 0)t=k(this,t,e,0),o=!M(t)||t!==this._$AH&&t!==A,o&&(this._$AH=t);else{let c=t,l,d;for(t=a[0],l=0;l<a.length-1;l++)d=k(this,c[s+l],e,l),d===A&&(d=this._$AH[l]),o||(o=!M(d)||d!==this._$AH[l]),d===p?t=p:t!==p&&(t+=(d??"")+a[l+1]),this._$AH[l]=d}o&&!i&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},J=class extends S{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}},X=class extends S{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}},Y=class extends S{constructor(t,e,s,i,a){super(t,e,s,i,a),this.type=5}_$AI(t,e=this){if((t=k(this,t,e,0)??p)===A)return;let s=this._$AH,i=t===p&&s!==p||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,a=t!==p&&(s===p||i);i&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Z=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){k(this,t)}};var zt=U.litHtmlPolyfillSupport;zt?.(D,O),(U.litHtmlVersions??(U.litHtmlVersions=[])).push("3.3.3");var ft=(r,t,e)=>{let s=e?.renderBefore??t,i=s._$litPart$;if(i===void 0){let a=e?.renderBefore??null;s._$litPart$=i=new O(t.insertBefore(T(),a),a,void 0,e??{})}return i._$AI(r),i};var z=globalThis,$=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;let t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=ft(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A}};$._$litElement$=!0,$.finalized=!0,z.litElementHydrateSupport?.({LitElement:$});var Nt=z.litElementPolyfillSupport;Nt?.({LitElement:$});(z.litElementVersions??(z.litElementVersions=[])).push("4.2.2");var Rt={light:"\u{1F4A1}",switch:"\u{1F50C}",lock:"\u{1F512}",cover:"\u{1FA9F}",climate:"\u{1F321}\uFE0F",media_player:"\u{1F50A}",fan:"\u{1F300}",sensor:"\u{1F4DF}",binary_sensor:"\u{1F50E}",humidifier:"\u{1F4A8}",water_heater:"\u{1F6BF}",vacuum:"\u{1F916}",button:"\u{1F518}",scene:"\u{1F3AC}",script:"\u{1F4DC}",automation:"\u2699\uFE0F",input_boolean:"\u{1F532}",input_button:"\u{1F518}",input_number:"\u{1F522}",input_select:"\u{1F4CB}",input_text:"\u270D\uFE0F",number:"\u{1F522}",select:"\u{1F4CB}",text:"\u270D\uFE0F",siren:"\u{1F4E2}",valve:"\u{1F527}",alarm_control_panel:"\u{1F6E1}\uFE0F",camera:"\u{1F4F7}",weather:"\u26C5",person:"\u{1F464}",device_tracker:"\u{1F4CD}",update:"\u2B06\uFE0F",todo:"\u{1F4DD}",calendar:"\u{1F4C5}",air_quality:"\u{1F32B}\uFE0F"},qt=r=>r.split(".",1)[0],vt=r=>Rt[qt(r)]||"\u26A1",$t={page_view:"\u8BBF\u95EE\u9875\u9762",password_ok:"\u5BC6\u7801\u6B63\u786E",password_fail:"\u5BC6\u7801\u9519\u8BEF",call_ok:"\u63A7\u5236\u6210\u529F",call_fail:"\u63A7\u5236\u5931\u8D25",blocked:"\u88AB\u62E6\u622A"},j=r=>{if(!r)return"\u2014";let t=new Date(r);return isNaN(t)?r:t.toLocaleString("zh-CN",{hour12:!1})},yt=r=>{if(!r)return"";let t=new Date(r);if(isNaN(t))return"";let e=s=>String(s).padStart(2,"0");return`${t.getFullYear()}-${e(t.getMonth()+1)}-${e(t.getDate())}T${e(t.getHours())}:${e(t.getMinutes())}`},_=r=>String(r??""),N=class extends ${constructor(){super(),this.narrow=!1,this._view="list",this._shares=[],this._settings=null,this._effBase="",this._draft=null,this._pickerQuery="",this._qrData=null,this._confirm=null,this._toastMsg=null,this._busy=!1,this._settingsDraft=null,this._logs=[],this._pwVisible=!1,this._logTotal=0,this._logFilter={share_id:"",start:"",end:""},this._toastTimer=null}firstUpdated(){this._loadAll()}async _loadAll(){if(this.hass)try{let[t,e]=await Promise.all([this.hass.callWS({type:"ha_share/settings/get"}),this.hass.callWS({type:"ha_share/shares/list"})]);this._settings=t.settings,this._effBase=t.effective_base_url||"",this._shares=e.shares}catch(t){this._toast("\u52A0\u8F7D\u5931\u8D25\uFF1A"+_(t),"error")}}_toast(t,e){this._toastMsg={text:t,type:e||""},clearTimeout(this._toastTimer),this._toastTimer=setTimeout(()=>{this._toastMsg=null},2600)}async _copy(t){if(t)try{await navigator.clipboard.writeText(t),this._toast("\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F","ok")}catch{let s=document.createElement("textarea");s.value=t,document.body.appendChild(s),s.select();try{document.execCommand("copy"),this._toast("\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F","ok")}catch{this._toast("\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u590D\u5236","error")}s.remove()}}_askConfirm(t,e,s,i){this._confirm={title:t,text:e,okLabel:s,onOk:i}}_statusOf(t){if(!t.enabled)return{text:"\u5DF2\u505C\u7528",cls:"st-gray"};let e=new Date;return t.start_time&&new Date(t.start_time)>e?{text:"\u672A\u5F00\u59CB",cls:"st-warn"}:t.end_time&&new Date(t.end_time)<e?{text:"\u5DF2\u8FC7\u671F",cls:"st-err"}:{text:"\u8FDB\u884C\u4E2D",cls:"st-ok"}}async _toggleShare(t){try{let e=await this.hass.callWS({type:"ha_share/shares/toggle",share_id:t.id,enabled:!t.enabled});this._replaceShare(e.share),this._toast(t.enabled?"\u5DF2\u505C\u7528\u8BE5\u5206\u4EAB":"\u5DF2\u542F\u7528\u8BE5\u5206\u4EAB","ok")}catch(e){this._toast("\u64CD\u4F5C\u5931\u8D25\uFF1A"+_(e),"error")}}async _deleteShare(t){this._askConfirm("\u5220\u9664\u5206\u4EAB",`\u786E\u5B9A\u5220\u9664\u300C${t.name}\u300D\uFF1F\u8BE5\u64CD\u4F5C\u4E0D\u53EF\u6062\u590D\uFF0C\u94FE\u63A5\u7ACB\u5373\u5931\u6548\u3002`,"\u5220\u9664",async()=>{try{await this.hass.callWS({type:"ha_share/shares/delete",share_id:t.id}),this._shares=this._shares.filter(e=>e.id!==t.id),this._toast("\u5DF2\u5220\u9664","ok")}catch(e){this._toast("\u5220\u9664\u5931\u8D25\uFF1A"+_(e),"error")}})}async _resetCounters(t){this._askConfirm("\u91CD\u7F6E\u64CD\u4F5C\u6B21\u6570",`\u5C06\u300C${t.name}\u300D\u5185\u6240\u6709\u53EF\u63A7\u5B9E\u4F53\u7684\u5269\u4F59\u6B21\u6570\u6062\u590D\u4E3A\u4E0A\u9650\u3002`,"\u91CD\u7F6E",async()=>{try{let e=await this.hass.callWS({type:"ha_share/shares/reset_counters",share_id:t.id});this._replaceShare(e.share),this._toast("\u5DF2\u91CD\u7F6E\u5168\u90E8\u8BA1\u6570","ok")}catch(e){this._toast("\u64CD\u4F5C\u5931\u8D25\uFF1A"+_(e),"error")}})}_replaceShare(t){let e=this._shares.findIndex(s=>s.id===t.id);e>=0?this._shares[e]=t:this._shares.push(t),this._shares=[...this._shares]}async _showQr(t){try{let e=await this.hass.callWS({type:"ha_share/qr",share_id:t.id});this._qrData={name:t.name,url:e.url,png:e.png}}catch(e){this._qrData={name:t.name,url:t.url||null,png:null,error:String(e)}}}_newDraft(){return{id:null,name:"",description:"",start:"",end:"",poll:"",entities:[],hasPassword:!1,newPassword:"",clearPassword:!1,ui:{theme:"light",card_bg:"",text_color:"",accent:"",title:"",footer:""}}}_draftFromShare(t){return{id:t.id,name:t.name||"",description:t.description||"",start:yt(t.start_time),end:yt(t.end_time),poll:t.poll_interval!=null?String(t.poll_interval):"",entities:(t.entities||[]).map(e=>({entity_id:e.entity_id,name:e.name||e.entity_id,icon:e.icon||"",mode:e.mode||"read",limitMode:e.limit==null?"unlimited":e.limit===1?"once":"n",limit:e.limit!=null?String(e.limit):"3",show_attrs:e.show_attrs!==!1,remaining:e.remaining})),hasPassword:!!t.has_password,newPassword:"",clearPassword:!1,ui:{theme:t.ui&&t.ui.theme||"light",card_bg:t.ui&&t.ui.card_bg||"",text_color:t.ui&&t.ui.text_color||"",accent:t.ui&&t.ui.accent||"",title:t.ui&&t.ui.title||"",footer:t.ui&&t.ui.footer||""}}}_pickerResults(){if(!this.hass||!this.hass.states)return[];let t=this._pickerQuery.trim().toLowerCase(),e=Object.keys(this.hass.states),s=t?e.filter(i=>i.toLowerCase().includes(t)||String(this.hass.states[i].attributes?.friendly_name||"").toLowerCase().includes(t)):e;return s.sort(),s.slice(0,80)}_togglePick(t){let e=this._draft,s=e.entities.findIndex(i=>i.entity_id===t);if(s>=0)e.entities.splice(s,1);else{let i=this.hass.states[t];e.entities.push({entity_id:t,name:i?.attributes?.friendly_name||t,icon:"",mode:"read",limitMode:"unlimited",limit:"3",show_attrs:!0,remaining:null})}this.requestUpdate()}async _saveShare(){let t=this._draft;if(!t.name.trim()){this._toast("\u8BF7\u586B\u5199\u5206\u4EAB\u540D\u79F0","error");return}if(!t.entities.length){this._toast("\u8BF7\u81F3\u5C11\u9009\u62E9\u4E00\u4E2A\u5B9E\u4F53","error");return}if(t.start&&t.end&&new Date(t.start)>new Date(t.end)){this._toast("\u5F00\u59CB\u65F6\u95F4\u4E0D\u80FD\u665A\u4E8E\u7ED3\u675F\u65F6\u95F4","error");return}let e=t.entities.map(i=>({entity_id:i.entity_id,mode:i.mode,limit:i.limitMode==="unlimited"?null:i.limitMode==="once"?1:Math.max(1,parseInt(i.limit,10)||1),icon:i.icon||null,show_attrs:!!i.show_attrs})),s={name:t.name.trim(),description:t.description.trim(),start_time:t.start||null,end_time:t.end||null,poll_interval:t.poll?Math.max(2,Math.min(10,parseInt(t.poll,10)||5)):null,entities:e,ui:t.ui};t.id&&(s.id=t.id),t.newPassword&&(s.password=t.newPassword),t.clearPassword&&(s.clear_password=!0),this._busy=!0;try{let i=await this.hass.callWS({type:"ha_share/shares/save",share:s});this._replaceShare(i.share),this._toast("\u5DF2\u4FDD\u5B58","ok");let a={url:i.share.url,png:null};try{a=await this.hass.callWS({type:"ha_share/qr",share_id:i.share.id})}catch{}this._draft=null,this._view="list",this._qrData={name:i.share.name,url:a.url||i.share.url,png:a.png}}catch(i){this._toast("\u4FDD\u5B58\u5931\u8D25\uFF1A"+_(i),"error")}finally{this._busy=!1}}_startEditSettings(){this._settingsDraft={...this._settings}}async _saveSettings(){let t=this._settingsDraft;this._busy=!0;try{let e=await this.hass.callWS({type:"ha_share/settings/save",settings:t});this._settings=e.settings,this._effBase=e.effective_base_url||"",this._toast("\u8BBE\u7F6E\u5DF2\u4FDD\u5B58","ok")}catch(e){this._toast("\u4FDD\u5B58\u5931\u8D25\uFF1A"+_(e),"error")}finally{this._busy=!1}}async _checkUrl(){let t=(this._settingsDraft.base_url||this._effBase||"").trim();if(!t){this._toast("\u8BF7\u5148\u586B\u5199\u5916\u7F51\u57FA\u7840\u5730\u5740","error");return}this._busy=!0;try{let e=await this.hass.callWS({type:"ha_share/check_url",url:t});e.ok?this._toast(`\u8FDE\u901A\u6B63\u5E38\uFF08HTTP ${e.status}\uFF09`,"ok"):this._toast("\u81EA\u68C0\u5931\u8D25\uFF1A"+_(e.error),"error")}catch(e){this._toast("\u81EA\u68C0\u5931\u8D25\uFF1A"+_(e),"error")}finally{this._busy=!1}}async _queryLogs(){let t=this._logFilter;this._busy=!0;try{let e=await this.hass.callWS({type:"ha_share/logs/query",share_id:t.share_id||void 0,start:t.start?t.start+"T00:00:00":void 0,end:t.end?t.end+"T23:59:59":void 0,limit:500});this._logs=e.logs,this._logTotal=e.total}catch(e){this._toast("\u67E5\u8BE2\u5931\u8D25\uFF1A"+_(e),"error")}finally{this._busy=!1}}_exportCsv(){if(!this._logs.length){this._toast("\u5F53\u524D\u6CA1\u6709\u53EF\u5BFC\u51FA\u7684\u65E5\u5FD7","error");return}let t=["\u65F6\u95F4","IP","\u5206\u4EAB","\u4E8B\u4EF6","\u5B9E\u4F53","\u52A8\u4F5C","\u64CD\u4F5C\u524D\u5269\u4F59\u6B21\u6570","\u8BE6\u60C5"],e=this._logs.map(o=>[o.t||"",o.ip||"",o.share_name||"",$t[o.event]||o.event||"",o.entity_id||"",o.action||"",o.remaining_before!=null?String(o.remaining_before):"",o.detail||""]),s=[t,...e].map(o=>o.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join(`\r
`),i=new Blob(["\uFEFF"+s],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(i),a.download="ha_share_logs.csv",a.click(),setTimeout(()=>URL.revokeObjectURL(a.href),3e3)}render(){return this.hass?n`
      <div class="wrap">
        ${this._view==="edit"?this._renderEdit():this._renderTabs()}
        ${this._view==="list"?this._renderList():""}
        ${this._view==="logs"?this._renderLogs():""}
        ${this._view==="settings"?this._renderSettings():""}
      </div>
      ${this._qrData?this._renderQrDialog():""}
      ${this._confirm?this._renderConfirm():""}
      ${this._toastMsg?this._renderToast():""}
    `:n`<div class="wrap"><div class="empty">正在加载…</div></div>`}_renderTabs(){let t=[["list","\u5206\u4EAB\u7BA1\u7406"],["logs","\u5BA1\u8BA1\u65E5\u5FD7"],["settings","\u5168\u5C40\u8BBE\u7F6E"]];return n`
      <h1>🔗 HA Share</h1>
      <p class="sub">实体临时分享网关 · 外网基础地址：${this._effBase||"\u672A\u914D\u7F6E\uFF08\u5728\u5168\u5C40\u8BBE\u7F6E\u4E2D\u586B\u5199\uFF09"}</p>
      <div class="tabs">
        ${t.map(([e,s])=>n`
          <button class="tab ${this._view===e?"active":""}" @click=${()=>{this._view=e,e==="settings"&&!this._settingsDraft&&this._startEditSettings()}}>
            ${s}
          </button>`)}
      </div>
    `}_renderList(){return n`
      <div class="row" style="justify-content:flex-end;margin-bottom:12px">
        <button class="btn primary" @click=${()=>{this._draft=this._newDraft(),this._view="edit"}}>＋ 新建分享</button>
      </div>
      ${this._shares.length===0?n`<div class="card"><div class="empty">还没有分享任务，点击右上角「新建分享」创建</div></div>`:""}
      ${this._shares.map(t=>this._renderShareCard(t))}
    `}_renderShareCard(t){let e=this._statusOf(t),s=(t.entities||[]).filter(o=>o.mode==="control"),i=s.map(o=>o.limit==null?"\u221E":`${o.remaining??o.limit}/${o.limit}`).join(" \xB7 "),a=t.start_time||t.end_time?`${t.start_time?j(t.start_time):"\u4E0D\u9650"} ~ ${t.end_time?j(t.end_time):"\u4E0D\u9650"}`:"\u6C38\u4E45\u6709\u6548";return n`
      <div class="card">
        <div class="share-head">
          <div class="grow">
            <p class="share-name">${t.name}</p>
            <div class="share-meta">
              ${t.entities.length} 个实体（${s.length} 个可控制） · 创建于 ${j(t.created_at)}<br>
              有效期：${a}${t.has_password?" \xB7 \u{1F510} \u5BC6\u7801\u4FDD\u62A4":""}${i?n`<br>剩余次数：${i}`:""}
            </div>
            ${t.url?n`
              <div class="url-row">
                <span class="mono" title=${t.url}>${t.url}</span>
                <button class="btn small" @click=${()=>this._copy(t.url)}>复制</button>
              </div>`:n`<div class="hint">⚠️ 未配置外网基础地址，暂无法生成链接</div>`}
          </div>
          <span class="st ${e.cls}">${e.text}</span>
        </div>
        <div class="share-actions">
          <button class="btn small" @click=${()=>{this._draft=this._draftFromShare(t),this._view="edit"}}>编辑</button>
          <button class="btn small" @click=${()=>this._showQr(t)}>二维码</button>
          ${t.url?n`<button class="btn small" @click=${()=>window.open(t.url,"_blank")}>预览</button>`:""}
          <button class="btn small" @click=${()=>this._toggleShare(t)}>${t.enabled?"\u505C\u7528":"\u542F\u7528"}</button>
          ${s.length?n`<button class="btn small" @click=${()=>this._resetCounters(t)}>重置计数</button>`:""}
          <button class="btn small danger" @click=${()=>this._deleteShare(t)}>删除</button>
        </div>
      </div>
    `}_renderEdit(){let t=this._draft;return t?n`
      <div class="back"><button class="btn small" @click=${()=>{this._draft=null,this._view="list"}}>← 返回列表</button></div>
      <h1>${t.id?"\u7F16\u8F91\u5206\u4EAB":"\u65B0\u5EFA\u5206\u4EAB"}</h1>

      <div class="card">
        <label class="f">分享名称 *</label>
        <input type="text" placeholder="例如：给保洁的临时门锁权限" .value=${t.name}
          @input=${e=>{t.name=e.target.value}} />
        <label class="f">分享描述（展示在访客页面顶部）</label>
        <textarea .value=${t.description} @input=${e=>{t.description=e.target.value}}
          placeholder="例如：周一上门清洁期间可开灯与门锁，用完即止"></textarea>
      </div>

      <div class="card">
        <label class="f">选择实体（支持全部 HA 实体）</label>
        <input type="text" placeholder="搜索实体名称或 ID…" .value=${this._pickerQuery}
          @input=${e=>{this._pickerQuery=e.target.value}} />
        <div class="picker-list">
          ${this._pickerResults().map(e=>{let s=this.hass.states[e],i=t.entities.some(a=>a.entity_id===e);return n`
              <div class="pick-row" @click=${()=>this._togglePick(e)}>
                <input type="checkbox" class="cb" .checked=${i} @click=${a=>a.stopPropagation()} @change=${()=>this._togglePick(e)} />
                <span class="pick-ic">${vt(e)}</span>
                <span class="grow">${s?.attributes?.friendly_name||e}</span>
                <span class="eid mono">${e}</span>
              </div>`})}
          ${this._pickerResults().length===0?n`<div class="pick-row" style="color:var(--hs-muted)">没有匹配的实体</div>`:""}
        </div>

        ${t.entities.length?n`
          <label class="f">已选实体（每个实体独立配置权限与次数）</label>
          <div class="etab-wrap">
            <table class="etab">
              <thead><tr>
                <th>实体</th><th>权限</th><th>次数上限</th><th title="访客页卡片左侧图标：可填 emoji（如 💡），留空使用该类型设备的默认图标">图标</th><th>属性</th><th></th>
              </tr></thead>
              <tbody>
                ${t.entities.map(e=>n`
                  <tr>
                    <td>
                      <div class="ent-name">${vt(e.entity_id)} ${e.name}</div>
                      <div class="ent-eid mono">${e.entity_id}</div>
                      ${e.remaining!=null?n`<div class="rem">剩余 ${e.remaining} 次</div>`:""}
                    </td>
                    <td>
                      <select .value=${e.mode} @change=${s=>{e.mode=s.target.value,this.requestUpdate()}}>
                        <option value="read">只读</option>
                        <option value="control">允许控制</option>
                      </select>
                    </td>
                    <td>
                      ${e.mode==="control"?n`
                        <select .value=${e.limitMode} @change=${s=>{e.limitMode=s.target.value,this.requestUpdate()}}>
                          <option value="unlimited">不限次数</option>
                          <option value="once">仅 1 次</option>
                          <option value="n">限定 N 次</option>
                        </select>
                        ${e.limitMode==="n"?n`
                          <input type="number" min="1" max="999" .value=${e.limit}
                            @input=${s=>{e.limit=s.target.value}} />`:""}`:"\u2014"}
                    </td>
                    <td><input type="text" placeholder="留空用默认" .value=${e.icon}
                      @input=${s=>{e.icon=s.target.value}} /></td>
                    <td><input type="checkbox" class="cb" .checked=${e.show_attrs}
                      @change=${s=>{e.show_attrs=s.target.checked}} /></td>
                    <td><button class="btn small danger" @click=${()=>this._togglePick(e.entity_id)}>✕</button></td>
                  </tr>`)}
              </tbody>
            </table>
          </div>
          <div class="hint">仅成功执行控制动作才扣减对应实体自身的次数；查看与刷新不计。</div>`:""}
      </div>

      <div class="card">
        <label class="f">全局策略（作用于整条链接）</label>
        <div class="grid2">
          <div>
            <label class="f">开始时间（留空 = 立即生效）</label>
            <input type="datetime-local" .value=${t.start}
              @input=${e=>{t.start=e.target.value}} />
          </div>
          <div>
            <label class="f">结束时间（留空 = 永久有效）</label>
            <input type="datetime-local" .value=${t.end}
              @input=${e=>{t.end=e.target.value}} />
          </div>
        </div>
        <label class="f">访问密码 ${t.id&&t.hasPassword&&!t.clearPassword?"\uFF08\u5DF2\u8BBE\u7F6E\uFF1B\u7559\u7A7A\u4FDD\u6301\u4E0D\u53D8\uFF09":""}</label>
        <div class="row">
          <input type="${this._pwVisible?"text":"password"}" style="flex:1"
            autocomplete="new-password"
            placeholder="${t.clearPassword?"\u4FDD\u5B58\u540E\u6E05\u9664\u5BC6\u7801":t.id&&t.hasPassword?"\u7559\u7A7A\u4FDD\u6301\u73B0\u6709\u5BC6\u7801":"\u53EF\u9009\uFF0C\u7559\u7A7A\u5219\u65E0\u9700\u5BC6\u7801"}"
            .value=${t.clearPassword?"":t.newPassword}
            ?disabled=${t.clearPassword}
            @input=${e=>{t.newPassword=e.target.value}} />
          <button class="btn" title="显示/隐藏明文" @click=${()=>{this._pwVisible=!this._pwVisible,this.requestUpdate()}}>${this._pwVisible?"\u{1F648} \u9690\u85CF":"\u{1F441} \u663E\u793A"}</button>
          <button class="btn" @click=${async()=>{try{let e=await this.hass.callWS({type:"ha_share/generate_password"});t.clearPassword=!1,t.newPassword=e.password,this._pwVisible=!0,this.requestUpdate()}catch{this._toast("\u751F\u6210\u5931\u8D25","error")}}}>🎲 随机</button>
          ${t.id&&t.hasPassword&&!t.clearPassword?n`
            <button class="btn danger" @click=${()=>{t.clearPassword=!0,t.newPassword="",this.requestUpdate()}}>清除密码</button>`:""}
          ${t.clearPassword?n`
            <button class="btn" @click=${()=>{t.clearPassword=!1,this.requestUpdate()}}>撤销清除</button>`:""}
        </div>
        ${t.clearPassword?n`<div class="hint">保存后该分享将不再需要密码即可访问。</div>`:""}
        <label class="f">状态轮询间隔（秒，留空用全局默认）</label>
        <input type="number" min="2" max="10" .value=${t.poll}
          @input=${e=>{t.poll=e.target.value}} />
      </div>

      <div class="card">
        <label class="f">访客页面 UI 自定义</label>
        <div class="grid2">
          <div>
            <label class="f">主题</label>
            <select .value=${t.ui.theme} @change=${e=>{t.ui.theme=e.target.value,this.requestUpdate()}}>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
          <div>
            <label class="f">页面标题（留空用分享名称）</label>
            <input type="text" .value=${t.ui.title} @input=${e=>{t.ui.title=e.target.value}} />
          </div>
        </div>
        <div class="grid2">
          <div>
            <label class="f">卡片背景色</label>
            ${this._renderColor(t.ui,"card_bg")}
          </div>
          <div>
            <label class="f">正文文字颜色</label>
            ${this._renderColor(t.ui,"text_color")}
          </div>
        </div>
        <label class="f">操作按钮强调色</label>
        ${this._renderColor(t.ui,"accent")}
        <label class="f">底部备注文字</label>
        <input type="text" .value=${t.ui.footer} @input=${e=>{t.ui.footer=e.target.value}} />
      </div>

      <div class="row" style="justify-content:flex-end">
        <button class="btn" @click=${()=>{this._draft=null,this._view="list"}}>取消</button>
        <button class="btn primary" ?disabled=${this._busy} @click=${()=>this._saveShare()}>
          ${this._busy?"\u4FDD\u5B58\u4E2D\u2026":"\u4FDD\u5B58\u5E76\u751F\u6210\u94FE\u63A5"}
        </button>
      </div>
    `:n``}_renderColor(t,e){return n`
      <div class="color-row">
        <input type="color" .value=${t[e]||"#4f6ef7"}
          @input=${s=>{t[e]=s.target.value,this.requestUpdate()}} />
        <span class="mono">${t[e]||"\u4E3B\u9898\u9ED8\u8BA4"}</span>
        ${t[e]?n`<button class="btn small" @click=${()=>{t[e]="",this.requestUpdate()}}>清除</button>`:""}
      </div>
    `}_renderSettings(){let t=this._settingsDraft;return t?n`
      <h1>全局设置</h1>
      <div class="card">
        <label class="f">外网基础地址（生成分享链接时拼接，如 https://ha.example.com）</label>
        <div class="row">
          <input type="text" style="flex:1" placeholder="https://你的HA外网域名" .value=${t.base_url||""}
            @input=${e=>{t.base_url=e.target.value}} />
          <button class="btn" ?disabled=${this._busy} @click=${()=>this._checkUrl()}>自检</button>
        </div>
        ${this._effBase&&!t.base_url?n`<div class="hint">当前回退使用 HA 外部地址：${this._effBase}</div>`:""}
        <div class="grid2">
          <div>
            <label class="f">默认状态轮询间隔（2-10 秒）</label>
            <input type="number" min="2" max="10" .value=${t.poll_interval}
              @input=${e=>{t.poll_interval=parseInt(e.target.value,10)||5}} />
          </div>
          <div>
            <label class="f">日志保留天数</label>
            <input type="number" min="1" max="3650" .value=${t.log_retention_days}
              @input=${e=>{t.log_retention_days=parseInt(e.target.value,10)||90}} />
          </div>
        </div>
        <div class="grid2">
          <div>
            <label class="f">密码错误最大重试次数</label>
            <input type="number" min="1" max="100" .value=${t.max_password_retries}
              @input=${e=>{t.max_password_retries=parseInt(e.target.value,10)||5}} />
          </div>
          <div>
            <label class="f">达到上限后锁定时长（分钟）</label>
            <input type="number" min="1" max="1440" .value=${t.lockout_minutes}
              @input=${e=>{t.lockout_minutes=parseInt(e.target.value,10)||10}} />
          </div>
        </div>
        <div class="row" style="justify-content:flex-end;margin-top:14px">
          <button class="btn primary" ?disabled=${this._busy} @click=${()=>this._saveSettings()}>
            ${this._busy?"\u4FDD\u5B58\u4E2D\u2026":"\u4FDD\u5B58\u8BBE\u7F6E"}
          </button>
        </div>
      </div>
    `:n`<div class="card"><div class="empty">加载中…</div></div>`}_renderLogs(){let t=this._logFilter;return n`
      <h1>审计日志</h1>
      <div class="card">
        <div class="row">
          <select style="width:auto" .value=${t.share_id}
            @change=${e=>{t.share_id=e.target.value,this.requestUpdate()}}>
            <option value="">全部分享</option>
            ${this._shares.map(e=>n`<option value=${e.id}>${e.name}</option>`)}
          </select>
          <input type="date" .value=${t.start} @input=${e=>{t.start=e.target.value}} />
          <span style="color:var(--hs-muted)">至</span>
          <input type="date" .value=${t.end} @input=${e=>{t.end=e.target.value}} />
          <button class="btn primary" ?disabled=${this._busy} @click=${()=>this._queryLogs()}>查询</button>
          <button class="btn" @click=${()=>this._exportCsv()}>导出 CSV</button>
        </div>
        <div class="hint">共 ${this._logTotal} 条记录${this._logTotal>500?"\uFF08\u4EC5\u663E\u793A\u6700\u8FD1 500 \u6761\uFF09":""}</div>
      </div>
      <div class="card">
        ${this._logs.length===0?n`<div class="empty">暂无日志，点击「查询」加载</div>`:n`
          <div class="etab-wrap">
            <table class="ltab">
              <thead><tr>
                <th>时间</th><th>IP</th><th>分享</th><th>事件</th><th>实体</th><th>动作</th><th>剩余</th><th>详情</th>
              </tr></thead>
              <tbody>
                ${this._logs.map(e=>n`
                  <tr>
                    <td class="mono">${j(e.t)}</td>
                    <td class="mono">${e.ip||"\u2014"}</td>
                    <td>${e.share_name||"\u2014"}</td>
                    <td class=${e.event==="call_ok"||e.event==="password_ok"?"ev-ok":e.event==="blocked"||e.event==="call_fail"||e.event==="password_fail"?"ev-err":"ev-mut"}>
                      ${$t[e.event]||e.event}</td>
                    <td class="mono">${e.entity_id||"\u2014"}</td>
                    <td class="mono">${e.action||"\u2014"}</td>
                    <td>${e.remaining_before!=null?e.remaining_before:"\u2014"}</td>
                    <td>${e.detail||"\u2014"}</td>
                  </tr>`)}
              </tbody>
            </table>
          </div>`}
      </div>
    `}_renderQrDialog(){let t=this._qrData;return n`
      <div class="mask" @click=${()=>{this._qrData=null}}>
        <div class="dlg" @click=${e=>e.stopPropagation()}>
          <h3>${t.name||"\u5206\u4EAB\u94FE\u63A5"}</h3>
          ${t.png?n`<img class="qr-img" alt="二维码" src=${t.png} />`:n`<p>${t.error?"\u4E8C\u7EF4\u7801\u751F\u6210\u5931\u8D25\uFF1A"+_(t.error):"\u4E8C\u7EF4\u7801\u751F\u6210\u5931\u8D25"}</p>`}
          ${t.url?n`
            <p class="mono" style="word-break:break-all">${t.url}</p>
            <div class="row">
              <button class="btn grow" @click=${()=>this._copy(t.url)}>复制链接</button>
              ${t.png?n`
                <a class="btn grow" style="text-decoration:none;text-align:center" download="ha_share_qr.png" href=${t.png}>下载二维码</a>`:""}
              <button class="btn grow" @click=${()=>window.open(t.url,"_blank")}>预览</button>
            </div>`:n`<p>未配置外网基础地址，请到「全局设置」填写后重试。</p>`}
          <div class="row"><button class="btn grow" @click=${()=>{this._qrData=null}}>关闭</button></div>
        </div>
      </div>
    `}_renderConfirm(){let t=this._confirm;return n`
      <div class="mask" @click=${()=>{this._confirm=null}}>
        <div class="dlg" @click=${e=>e.stopPropagation()}>
          <h3>${t.title}</h3>
          <p>${t.text}</p>
          <div class="row">
            <button class="btn grow" @click=${()=>{this._confirm=null}}>取消</button>
            <button class="btn grow danger" @click=${()=>{let e=t.onOk;this._confirm=null,e&&e()}}>${t.okLabel||"\u786E\u8BA4"}</button>
          </div>
        </div>
      </div>
    `}_renderToast(){let t=this._toastMsg;return n`<div class="toast show ${t.type}">${t.text}</div>`}};B(N,"properties",{hass:{attribute:!1},narrow:{type:Boolean,reflect:!1},_view:{state:!0},_shares:{state:!0},_settings:{state:!0},_effBase:{state:!0},_draft:{state:!0},_pickerQuery:{state:!0},_qrData:{state:!0},_confirm:{state:!0},_toastMsg:{state:!0},_busy:{state:!0},_settingsDraft:{state:!0},_logs:{state:!0},_pwVisible:{state:!0},_logTotal:{state:!0},_logFilter:{state:!0}}),B(N,"styles",W`
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
  `);customElements.define("ha-share-panel",N);
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
