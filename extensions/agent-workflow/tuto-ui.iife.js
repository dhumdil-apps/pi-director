var TutoUI=(function(b){"use strict";var ae=Object.defineProperty;var re=(b,G,st)=>G in b?ae(b,G,{enumerable:!0,configurable:!0,writable:!0,value:st}):b[G]=st;var h=(b,G,st)=>re(b,typeof G!="symbol"?G+"":G,st);const G={dark:{bg:"#090a0f",grid:"rgba(255, 255, 255, 0.04)",text:"#f1f5f9",textMuted:"#94a3b8",muted:"#64748b",panelBg:"#10131d",panelHead:"#161b28",cardBg:"#12151f",cardSelectedBg:"#181d2c",headBg:"#161b28",headSelectedBg:"#1e263c",border:"#283044",borderSubtle:"#1c2232",edge:"#7a869e",edgeDim:"#1e2536",hot:"#3b82f6",toolBg:"#141a24",badgeBg:"#181e2e",highlight:"rgba(59, 130, 246, 0.18)",shadow:"0 12px 36px rgba(0, 0, 0, 0.55)"},light:{bg:"#f8fafc",grid:"rgba(100, 116, 139, 0.10)",text:"#0f172a",textMuted:"#475569",muted:"#64748b",panelBg:"#ffffff",panelHead:"#f1f5f9",cardBg:"#ffffff",cardSelectedBg:"#f8fafc",headBg:"#f1f5f9",headSelectedBg:"#e2e8f0",border:"#cbd5e1",borderSubtle:"#e2e8f0",edge:"#64748b",edgeDim:"#e2e8f0",hot:"#2563eb",toolBg:"#ffffff",badgeBg:"#f1f5f9",highlight:"rgba(37, 99, 235, 0.12)",shadow:"0 12px 36px rgba(0, 0, 0, 0.12)"},accents:{align:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},spec:{accent:"#38bdf8",badge:"SPEC",perm:"READ",permClass:"perm-read"},vibe:{accent:"#10b981",badge:"VIBE",perm:"WRITE",permClass:"perm-write"},envision:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},establish:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},evaluate:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},explore:{accent:"#38bdf8",badge:"SPEC",perm:"READ",permClass:"perm-read"},elaborate:{accent:"#38bdf8",badge:"SPEC",perm:"READ",permClass:"perm-read"},execute:{accent:"#10b981",badge:"VIBE",perm:"WRITE",permClass:"perm-write"},examine:{accent:"#10b981",badge:"VIBE",perm:"WRITE",permClass:"perm-write"},closeOut:{accent:"#8b5cf6",badge:"PROCEDURE",perm:"READ",permClass:"perm-read"},blocked:{accent:"#ef4444",badge:"PROCEDURE",perm:"READ",permClass:"perm-read"},handoff:{accent:"#64748b",badge:"PROCEDURE",perm:"STANDBY",permClass:"perm-standby"}}},st={fonts:{sans:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',mono:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'},sizes:{xs:"0.68rem",sm:"0.75rem",base:"0.875rem",md:"0.95rem",lg:"1.125rem",xl:"1.25rem","2xl":"1.5rem"},weights:{normal:"400",medium:"500",semibold:"600",bold:"700",extrabold:"800"},lineHeights:{tight:"1.15",normal:"1.4",relaxed:"1.6"}},Ft={space:{1:"0.25rem",2:"0.5rem",3:"0.75rem",4:"1rem",5:"1.25rem",6:"1.5rem",8:"2rem",10:"2.5rem",12:"3rem"},radii:{none:"0",sm:"0.375rem",md:"0.5rem",lg:"0.75rem",xl:"1rem",full:"9999px"},shadows:{sm:"0 1px 2px 0 rgba(0, 0, 0, 0.05)",md:"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",lg:"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",xl:"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",elevated:"0 12px 36px rgba(0, 0, 0, 0.45)",glow:"0 0 15px rgba(59, 130, 246, 0.35)"},transitions:{fast:"150ms ease",default:"200ms ease",smooth:"300ms cubic-bezier(0.4, 0, 0.2, 1)"},zIndex:{canvas:0,edge:1,node:5,overlay:10,drawer:20,tooltip:30}};function Ct(){if(typeof document>"u"||document.getElementById("tuto-theme-tokens"))return;const s=document.createElement("style");s.id="tuto-theme-tokens",s.textContent=`
    :root {
      --tuto-bg: #0c0e12;
      --tuto-grid: color-mix(in srgb, #94a3b8 9%, transparent);
      --tuto-text: #e8eaed;
      --tuto-text-muted: #94a3b8;
      --tuto-muted: #64748b;
      --tuto-panel-bg: #161b22;
      --tuto-panel-head: #1c2128;
      --tuto-card-bg: #12161c;
      --tuto-card-selected-bg: #161b22;
      --tuto-head-bg: #1a2030;
      --tuto-head-selected-bg: #1e293b;
      --tuto-border: #30363d;
      --tuto-border-subtle: #21262d;
      --tuto-edge: #4b5563;
      --tuto-edge-dim: #1a202c;
      --tuto-hot: #3b82f6;
      --tuto-tool-bg: #141a24;
      --tuto-badge-bg: #1e293b;
      --tuto-highlight: rgba(59, 130, 246, 0.15);
      --tuto-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
      --tuto-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --tuto-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
    [data-theme="light"], :root[data-theme="light"] {
      --tuto-bg: #f8fafc;
      --tuto-grid: color-mix(in srgb, #64748b 12%, transparent);
      --tuto-text: #0f172a;
      --tuto-text-muted: #475569;
      --tuto-muted: #64748b;
      --tuto-panel-bg: #ffffff;
      --tuto-panel-head: #f1f5f9;
      --tuto-card-bg: #ffffff;
      --tuto-card-selected-bg: #f8fafc;
      --tuto-head-bg: #f1f5f9;
      --tuto-head-selected-bg: #e2e8f0;
      --tuto-border: #cbd5e1;
      --tuto-border-subtle: #e2e8f0;
      --tuto-edge: #94a3b8;
      --tuto-edge-dim: #e2e8f0;
      --tuto-hot: #2563eb;
      --tuto-tool-bg: #ffffff;
      --tuto-badge-bg: #f1f5f9;
      --tuto-highlight: rgba(37, 99, 235, 0.1);
      --tuto-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
    }
  `,document.head.appendChild(s)}const at=class at extends HTMLElement{constructor(t={}){super();h(this,"_isRenderPending",!1);h(this,"_hasRendered",!1);h(this,"_useShadow");h(this,"shadowRootNode",null);this._useShadow=t.useShadow!==!1,this._useShadow&&(this.shadowRootNode=this.attachShadow({mode:t.shadowMode||"open"}))}connectedCallback(){this.adoptStyles(),this.requestUpdate()}disconnectedCallback(){}adoptStyles(){const t=this.constructor,i=t.styles;if(!(!i||!this.shadowRootNode)){if("adoptedStyleSheets"in Document.prototype&&"adoptedStyleSheets"in ShadowRoot.prototype)try{let e=at._styleSheetMap.get(t);e||(e=new CSSStyleSheet,e.replaceSync(i),at._styleSheetMap.set(t,e)),this.shadowRootNode.adoptedStyleSheets.includes(e)||(this.shadowRootNode.adoptedStyleSheets=[...this.shadowRootNode.adoptedStyleSheets,e]);return}catch{}if(!this.shadowRootNode.querySelector("style[data-tuto-style]")){const e=document.createElement("style");e.setAttribute("data-tuto-style","true"),e.textContent=i,this.shadowRootNode.prepend(e)}}}requestUpdate(){this._isRenderPending||(this._isRenderPending=!0,requestAnimationFrame(()=>{this._isRenderPending=!1,this.render(),this._hasRendered||(this._hasRendered=!0,this.firstUpdated()),this.updated()}))}emit(t,i,e={}){const o=new CustomEvent(t,{bubbles:!0,composed:!0,cancelable:!0,detail:i,...e});return this.dispatchEvent(o)}get renderRoot(){return this.shadowRootNode||this}firstUpdated(){}updated(){}};h(at,"styles",""),h(at,"_styleSheetMap",new WeakMap);let J=at;const zt="http://www.w3.org/2000/svg";function U(s,r={},t){const i=document.createElementNS(zt,s);for(const[e,o]of Object.entries(r))o!=null&&o!==!1&&i.setAttribute(e,String(o));return t&&t.appendChild(i),i}function Vt(s,r={},t){const i=document.createElement(s);for(const[e,o]of Object.entries(r))o!=null&&o!==!1&&(e==="className"||e==="class"?i.className=String(o):i.setAttribute(e,String(o)));return t&&t.appendChild(i),i}function v(s){return s==null?"":String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function gt(s,r,t){return Math.max(r,Math.min(t,s))}class yt extends J{static get observedAttributes(){return["variant","size","disabled"]}get variant(){return this.getAttribute("variant")||"secondary"}set variant(r){this.setAttribute("variant",r)}get size(){return this.getAttribute("size")||"md"}set size(r){this.setAttribute("size",r)}get disabled(){return this.hasAttribute("disabled")}set disabled(r){r?this.setAttribute("disabled",""):this.removeAttribute("disabled")}attributeChangedCallback(){this.requestUpdate()}render(){this.shadowRootNode&&(this.shadowRootNode.innerHTML=`
      <button class="variant-${this.variant} size-${this.size}" ${this.disabled?"disabled":""}>
        <slot></slot>
      </button>
    `)}}h(yt,"styles",`
    :host {
      display: inline-block;
      font-family: var(--tuto-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
    }
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border: 1px solid transparent;
      border-radius: var(--tuto-radius-md, 0.5rem);
      font-weight: 600;
      cursor: pointer;
      transition: all 150ms ease;
      font-family: inherit;
      line-height: 1;
      text-decoration: none;
      box-sizing: border-box;
      outline: none;
    }
    button:focus-visible {
      box-shadow: 0 0 0 2px var(--tuto-hot, #3b82f6);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Sizes */
    .size-sm {
      padding: 0.35rem 0.65rem;
      font-size: 0.75rem;
      height: 1.75rem;
    }
    .size-md {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      height: 2.25rem;
    }
    .size-lg {
      padding: 0.65rem 1.25rem;
      font-size: 1rem;
      height: 2.75rem;
    }

    /* Variants */
    .variant-primary {
      background: var(--tuto-hot, #3b82f6);
      color: #ffffff;
    }
    .variant-primary:hover:not(:disabled) {
      filter: brightness(1.1);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
    }

    .variant-secondary {
      background: var(--tuto-panel-head, #1c2128);
      color: var(--tuto-text, #e8eaed);
      border-color: var(--tuto-border, #30363d);
    }
    .variant-secondary:hover:not(:disabled) {
      background: var(--tuto-head-bg, #1a2030);
      border-color: var(--tuto-muted, #64748b);
    }

    .variant-outline {
      background: transparent;
      color: var(--tuto-text, #e8eaed);
      border-color: var(--tuto-border, #30363d);
    }
    .variant-outline:hover:not(:disabled) {
      background: var(--tuto-panel-head, #1c2128);
      border-color: var(--tuto-hot, #3b82f6);
    }

    .variant-ghost {
      background: transparent;
      color: var(--tuto-text-muted, #94a3b8);
    }
    .variant-ghost:hover:not(:disabled) {
      background: var(--tuto-panel-head, #1c2128);
      color: var(--tuto-text, #e8eaed);
    }

    .variant-danger {
      background: #ef4444;
      color: #ffffff;
    }
    .variant-danger:hover:not(:disabled) {
      filter: brightness(1.1);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
    }
  `),customElements.get("tuto-button")||customElements.define("tuto-button",yt);class _t extends J{static get observedAttributes(){return["variant"]}get variant(){return this.getAttribute("variant")||"default"}set variant(r){this.setAttribute("variant",r)}attributeChangedCallback(){this.requestUpdate()}render(){this.shadowRootNode&&(this.shadowRootNode.innerHTML=`
      <span class="badge variant-${this.variant}">
        <slot></slot>
      </span>
    `)}}h(_t,"styles",`
    :host {
      display: inline-block;
      font-family: var(--tuto-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      line-height: 1;
    }
    span.badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      border: 1px solid transparent;
      box-sizing: border-box;
    }

    .variant-default {
      background: var(--tuto-badge-bg, #1e293b);
      color: var(--tuto-text-muted, #94a3b8);
      border-color: var(--tuto-border, #30363d);
    }
    .variant-accent {
      background: var(--tuto-hot, #3b82f6);
      color: #ffffff;
    }
    .variant-success {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border-color: rgba(16, 185, 129, 0.35);
    }
    .variant-warning {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border-color: rgba(245, 158, 11, 0.35);
    }
    .variant-danger {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.35);
    }
    .variant-mono {
      background: var(--tuto-panel-head, #1c2128);
      color: var(--tuto-text, #e8eaed);
      border-color: var(--tuto-border, #30363d);
      font-family: var(--tuto-font-mono, monospace);
    }
  `),customElements.get("tuto-badge")||customElements.define("tuto-badge",_t);const tt=.2,it=3.5,Bt=44;function Ut(s,r,t=Bt,i=1.25){const e=s.width||900,o=s.height||700,n=r.w||2e3,d=r.h||1e3,c=gt(Math.min((e-t*2)/n,(o-t*2)/d),tt,i),u=(e-n*c)/2-r.x*c,p=(o-d*c)/2-r.y*c;return{panX:u,panY:p,scale:c}}function ut(s,r,t,i,e=tt,o=it){const n=gt(s.scale*i,e,o);if(n===s.scale)return s;const d=r-(r-s.panX)*n/s.scale,c=t-(t-s.panY)*n/s.scale;return{panX:d,panY:c,scale:n}}function At(s,r,t=1.05){const i=s.width||900,e=s.height||700,o=gt(t,tt,it),n=r.x+r.w/2,d=r.y+r.h/2,c=i/2-n*o,u=e/2-d*o;return{panX:c,panY:u,scale:o}}function Jt(s,r){return{x:(s.x-r.panX)/r.scale,y:(s.y-r.panY)/r.scale}}function Kt(s,r){return{x:s.x*r.scale+r.panX,y:s.y*r.scale+r.panY}}const Tt=new Set(["GOAL_SET","ASK_ROUTED_SPEC","ASK_ROUTED_VIBE","RESEARCH_DONE","NEXT_VIBE","NEXT_SPEC","NEXT_ALIGN","RUN_CHECKS","CLOSE_OUT","NEXT_HANDOFF"]);function Wt(s){return s.map((r,t)=>({id:r.id||`${r.from}->${r.to}-${t}`,from:r.from,to:r.to,self:r.from===r.to,label:r.label||r.event||"",event:r.event||r.label||"",events:r.event?[r.event]:r.events?[...r.events]:[],description:r.description||"",descriptions:r.descriptions?[...r.descriptions]:r.description?[r.description]:[],userMediated:!!r.userMediated,bidirectional:!!r.bidirectional,waypoints:r.waypoints?[...r.waypoints]:void 0,customData:r.customData?{...r.customData}:void 0}))}function Zt(s,r,t=.5){const i=Math.min(.9,Math.max(.1,t));return r==="left"?{x:s.x,y:s.y+s.h*i}:r==="right"?{x:s.x+s.w,y:s.y+s.h*i}:r==="top"?{x:s.x+s.w*i,y:s.y}:{x:s.x+s.w*i,y:s.y+s.h}}function xt(s,r){const t=[{point:[s.x,s.y+s.h/2],side:"left"},{point:[s.x+s.w,s.y+s.h/2],side:"right"},{point:[s.x+s.w/2,s.y],side:"top"},{point:[s.x+s.w/2,s.y+s.h],side:"bottom"}];let i=t[0],e=1/0;for(const o of t){const n=Math.hypot(o.point[0]-r[0],o.point[1]-r[1]);n<e&&(e=n,i=o)}return i}function Dt(s,r=!0){if(!s||s.length===0)return[0,0];if(s.length===1)return s[0];if(s.length===2)return[(s[0][0]+s[1][0])/2,(s[0][1]+s[1][1])/2];if(r&&s.length===3)return s[1];let t=0;const i=[];for(let n=0;n<s.length-1;n++){const d=Math.hypot(s[n+1][0]-s[n][0],s[n+1][1]-s[n][1]);i.push(d),t+=d}if(t===0)return s[0];const e=t/2;let o=0;for(let n=0;n<i.length;n++){const d=i[n];if(o+d>=e){const c=e-o,u=d>0?c/d:.5,p=s[n],l=s[n+1];return[p[0]+(l[0]-p[0])*u,p[1]+(l[1]-p[1])*u]}o+=d}return s[Math.floor(s.length/2)]}function Ot(s,r){const t=[[s.x,s.y+s.h/2],[s.x+s.w,s.y+s.h/2],[s.x+s.w/2,s.y],[s.x+s.w/2,s.y+s.h]],i=[[r.x,r.y+r.h/2],[r.x+r.w,r.y+r.h/2],[r.x+r.w/2,r.y],[r.x+r.w/2,r.y+r.h]];let e=t[0],o=i[0],n=1/0;for(const d of t)for(const c of i){const u=Math.hypot(c[0]-d[0],c[1]-d[1]);u<n&&(n=u,e=d,o=c)}return{p1:e,p2:o}}function qt(s,r){return s}function jt(s,r){const t=r[s.from],i=r[s.to];if(!t||!i)return null;if(s.waypoints&&s.waypoints.length>0){const n=s.self||s.from===s.to,d=s.waypoints[0],c=s.waypoints[s.waypoints.length-1];let u=xt(t,d),p=xt(i,c),l=u.point,k=p.point;n&&Math.hypot(l[0]-k[0],l[1]-k[1])<8&&(u.side==="right"||u.side==="left"?(l=[l[0],l[1]-12],k=[k[0],k[1]+12]):(l=[l[0]-16,l[1]],k=[k[0]+16,k[1]]));const E=[l,...s.waypoints,k],[M,_]=Dt(E,!0);return{points:E,seatX:M,seatY:_,seatSide:"h"}}if(s.self||s.from===s.to){const n=t.x+t.w,d=t.y+t.h/2,c=38;return{points:[[n,d-10],[n+c,d-18],[n+c,d+18],[n,d+10]],seatX:n+c+24,seatY:d,seatSide:"h"}}const{p1:e,p2:o}=Ot(t,i);return{points:[e,o],seatX:(e[0]+o[0])/2,seatY:(e[1]+o[1])/2,seatSide:"h"}}function Qt(s){}function Xt(s,r=!1,t=10){if(!s||s.length===0)return"";if(s.length===1)return`M ${s[0][0]} ${s[0][1]}`;if(r&&s.length===4)return`M ${s[0][0]} ${s[0][1]} C ${s[1][0]} ${s[1][1]}, ${s[2][0]} ${s[2][1]}, ${s[3][0]} ${s[3][1]}`;if(s.length===2)return`M ${s[0][0]} ${s[0][1]} L ${s[1][0]} ${s[1][1]}`;if(t<=0)return s.map((o,n)=>`${n===0?"M":"L"} ${o[0]} ${o[1]}`).join(" ");let i=`M ${s[0][0]} ${s[0][1]}`;for(let o=1;o<s.length-1;o++){const n=s[o-1],d=s[o],c=s[o+1],u=d[0]-n[0],p=d[1]-n[1],l=Math.hypot(u,p),k=c[0]-d[0],E=c[1]-d[1],M=Math.hypot(k,E);if(l<1||M<1){i+=` L ${d[0]} ${d[1]}`;continue}const _=Math.min(t,l/2,M/2),N=d[0]-u/l*_,q=d[1]-p/l*_,R=d[0]+k/M*_,$=d[1]+E/M*_;i+=` L ${N} ${q}`,i+=` Q ${d[0]} ${d[1]} ${R} ${$}`}const e=s[s.length-1];return i+=` L ${e[0]} ${e[1]}`,i}function te(s,r,t,i){return t===s.id||i===s.id?!0:r?s.from===r||s.to===r:!1}function ee(s,r,t,i,e=Tt){return!0}function ft(s,r=64,t=56,i=46,e){let o=1/0,n=1/0,d=-1/0,c=-1/0;const u=Object.values(s);if(u.length===0&&(!e||e.length===0))return{x:0,y:0,w:1e3,h:600};for(const l of u)o=Math.min(o,l.x),n=Math.min(n,l.y),d=Math.max(d,l.x+l.w),c=Math.max(c,l.y+l.h);if(e)for(const l of e)o=Math.min(o,l.x),n=Math.min(n,l.y),d=Math.max(d,l.x+l.w),c=Math.max(c,l.y+l.h);const p=i>0;return{x:o-r,y:n-t-(p?i:0),w:d-o+r*2,h:c-n+t*2+(p?i+80:0)}}function oe(s,r={}){const t=r.colWidth||420,i=r.colGap||180,e=r.rowGap||40,o=r.startX||120,n=r.startY||120,d={};let c=o,u=n;return s.forEach((p,l)=>{d[p.id]={...p,x:p.x??c,y:p.y??u,w:p.w||t,h:p.h||280},(l+1)%3===0?(c+=t+i,u=n):u+=(p.h||280)+e}),d}const et=20,kt=8;function Yt(s,r,t,i,e,o,n=et,d=kt){const c=[],u=r,p=r+i/2,l=r+i,k=t,E=t+e/2,M=t+e;let _=null,N=d+1,q=[],R=null,$=d+1,B=[];for(const[C,L]of Object.entries(o)){if(C===s)continue;const S=L.x,P=L.x+L.w/2,g=L.x+L.w,I=L.y,X=L.y+L.h/2,A=L.y+L.h,W=Math.abs(p-P);W<N?(N=W,_=P-i/2,q=[{type:"vertical",pos:P,start:Math.min(t,I)-30,end:Math.max(t+e,A)+30,kind:"center",sourceNodeId:s,targetNodeId:C}]):_!==null&&Math.abs(W-N)<.5&&q.push({type:"vertical",pos:P,start:Math.min(t,I)-30,end:Math.max(t+e,A)+30,kind:"center",sourceNodeId:s,targetNodeId:C});const a=Math.abs(u-S);a<N&&(N=a,_=S,q=[{type:"vertical",pos:S,start:Math.min(t,I)-30,end:Math.max(t+e,A)+30,kind:"edge",sourceNodeId:s,targetNodeId:C}]);const f=Math.abs(l-g);f<N&&(N=f,_=g-i,q=[{type:"vertical",pos:g,start:Math.min(t,I)-30,end:Math.max(t+e,A)+30,kind:"edge",sourceNodeId:s,targetNodeId:C}]);const w=Math.abs(E-X);w<$?($=w,R=X-e/2,B=[{type:"horizontal",pos:X,start:Math.min(r,S)-30,end:Math.max(r+i,g)+30,kind:"center",sourceNodeId:s,targetNodeId:C}]):R!==null&&Math.abs(w-$)<.5&&B.push({type:"horizontal",pos:X,start:Math.min(r,S)-30,end:Math.max(r+i,g)+30,kind:"center",sourceNodeId:s,targetNodeId:C});const m=Math.abs(k-I);m<$&&($=m,R=I,B=[{type:"horizontal",pos:I,start:Math.min(r,S)-30,end:Math.max(r+i,g)+30,kind:"edge",sourceNodeId:s,targetNodeId:C}]);const z=Math.abs(M-A);z<$&&($=z,R=A-e,B=[{type:"horizontal",pos:A,start:Math.min(r,S)-30,end:Math.max(r+i,g)+30,kind:"edge",sourceNodeId:s,targetNodeId:C}])}const O=_!==null?Math.round(_):Math.round(r/n)*n,x=R!==null?Math.round(R):Math.round(t/n)*n;return _!==null&&c.push(...q),R!==null&&c.push(...B),{x:O,y:x,guides:c}}function mt(s,r,t,i,e,o,n,d=et,c=kt){const u=[];let p=null,l=c+1,k=[],E=null,M=c+1,_=[];const N=o.find(x=>x.id===t),q=n.get(t)||[],R=i>0?q[i-1]:N&&e[N.from]?[e[N.from].x+e[N.from].w/2,e[N.from].y+e[N.from].h/2]:null,$=i<q.length-1?q[i+1]:N&&e[N.to]?[e[N.to].x+e[N.to].w/2,e[N.to].y+e[N.to].h/2]:null;if(R){const x=Math.abs(s-R[0]);x<l&&(l=x,p=R[0],k=[{type:"vertical",pos:R[0],start:Math.min(r,R[1])-20,end:Math.max(r,R[1])+20,kind:"axis"}]);const C=Math.abs(r-R[1]);C<M&&(M=C,E=R[1],_=[{type:"horizontal",pos:R[1],start:Math.min(s,R[0])-20,end:Math.max(s,R[0])+20,kind:"axis"}])}if($){const x=Math.abs(s-$[0]);x<l&&(l=x,p=$[0],k=[{type:"vertical",pos:$[0],start:Math.min(r,$[1])-20,end:Math.max(r,$[1])+20,kind:"axis"}]);const C=Math.abs(r-$[1]);C<M&&(M=C,E=$[1],_=[{type:"horizontal",pos:$[1],start:Math.min(s,$[0])-20,end:Math.max(s,$[0])+20,kind:"axis"}])}for(const[x,C]of n.entries())C&&C.forEach((L,S)=>{if(x===t&&S===i)return;const P=Math.abs(s-L[0]);P<l&&(l=P,p=L[0],k=[{type:"vertical",pos:L[0],start:Math.min(r,L[1])-20,end:Math.max(r,L[1])+20,kind:"edge"}]);const g=Math.abs(r-L[1]);g<M&&(M=g,E=L[1],_=[{type:"horizontal",pos:L[1],start:Math.min(s,L[0])-20,end:Math.max(s,L[0])+20,kind:"edge"}])});for(const x of Object.values(e)){const C=x.x+x.w/2,L=x.y+x.h/2,S=Math.abs(s-C);S<l&&(l=S,p=C,k=[{type:"vertical",pos:C,start:Math.min(r,x.y)-20,end:Math.max(r,x.y+x.h)+20,kind:"center"}]);const P=Math.abs(r-L);P<M&&(M=P,E=L,_=[{type:"horizontal",pos:L,start:Math.min(s,x.x)-20,end:Math.max(s,x.x+x.w)+20,kind:"center"}])}const B=p!==null?Math.round(p):Math.round(s/d)*d,O=E!==null?Math.round(E):Math.round(r/d)*d;return p!==null&&u.push(...k),E!==null&&u.push(..._),{x:B,y:O,guides:u}}class Et extends J{constructor(){super(...arguments);h(this,"_node",null);h(this,"_selected",!1);h(this,"_draggableNode",!1);h(this,"_isDragging",!1)}get node(){return this._node}set node(t){this._node=t,this.requestUpdate()}get selected(){return this._selected}set selected(t){this._selected=!!t,this.requestUpdate()}get draggableNode(){return this._draggableNode}set draggableNode(t){this._draggableNode=!!t,this.requestUpdate()}get isDragging(){return this._isDragging}set isDragging(t){this._isDragging=!!t,this.requestUpdate()}render(){if(!this.shadowRootNode||!this._node)return;const t=this._node,i=G.accents[t.id]||(t.permission?G.accents[t.permission]:null)||G.accents.spec;this.style.setProperty("--node-accent",i.accent);const e=["node-card","compact",this._selected?"selected":"",this._draggableNode?"draggable":"",this._isDragging?"dragging":""].filter(Boolean).join(" ");this.shadowRootNode.innerHTML=`
      <div class="${e}" role="button" tabindex="0">
        <div class="node-head">
          <div class="node-head-left">
            <span class="state-dot"></span>
            <span class="head-title">${v(t.label||t.id)}</span>
          </div>
        </div>
      </div>
    `;const o=this.shadowRootNode.querySelector(".node-card");o&&o.addEventListener("click",n=>{n.stopPropagation(),this.emit("flow:select-node",{node:this._node})})}}h(Et,"styles",`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      user-select: none;
      font-family: var(--tuto-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      color: var(--tuto-text, #ffffff);
    }
    .node-card {
      background: var(--tuto-card-bg, #1c202a);
      border: 2px solid var(--tuto-border, #2c3242);
      border-radius: 8px;
      padding: 0;
      cursor: pointer;
      transition: border-color 140ms ease, box-shadow 140ms ease;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    .node-card:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.5);
    }
    .node-card.selected {
      border-color: #3b82f6;
      background: var(--tuto-card-selected-bg, #222735);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35), 0 8px 24px rgba(0, 0, 0, 0.6);
    }

    /* Header row: status dot · title · badges */
    .node-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 0 0.85rem 0 0.9rem;
      background: var(--tuto-head-bg, #1c202a);
      gap: 0.5rem;
      position: relative;
    }
    .node-card.selected .node-head {
      background: var(--tuto-head-selected-bg, #252c3c);
    }

    .node-head-left {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex: 1;
      min-width: 0;
    }

    /* State indicator circle dot */
    .state-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--node-accent, #3b82f6);
      box-shadow: 0 0 8px var(--node-accent, #3b82f6);
      flex-shrink: 0;
    }

    .head-title {
      font-weight: 700;
      font-size: 0.82rem;
      letter-spacing: 0.04em;
      color: #ffffff;
      white-space: nowrap;
      font-family: var(--tuto-font-sans, sans-serif);
    }

    .head-badges {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      flex-shrink: 0;
    }

    .node-card.draggable {
      cursor: grab;
    }
    .node-card.draggable:hover {
      border-color: #60a5fa;
      box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.4), 0 6px 20px rgba(0, 0, 0, 0.5);
    }
    .node-card.dragging {
      cursor: grabbing !important;
      opacity: 0.92;
      box-shadow: 0 0 0 3px #3b82f6, 0 12px 30px rgba(0, 0, 0, 0.7);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.12rem 0.45rem;
      border-radius: 999px;
      font-size: 0.58rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-family: var(--tuto-font-mono, monospace);
    }
    .perm-read {
      background: rgba(56, 189, 248, 0.12);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.28);
    }
    .perm-write {
      background: rgba(16, 185, 129, 0.14);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .perm-standby {
      background: rgba(148, 163, 184, 0.12);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.25);
    }
  `),customElements.get("tuto-flow-node")||customElements.define("tuto-flow-node",Et);class Mt extends J{constructor(){super(...arguments);h(this,"_zoom",100);h(this,"_isMinimapActive",!1);h(this,"_isInspectorActive",!1);h(this,"_toolMode","view")}get zoom(){return this._zoom}set zoom(t){this._zoom=Math.round(t),this.requestUpdate()}get isMinimapActive(){return this._isMinimapActive}set isMinimapActive(t){this._isMinimapActive=!!t,this.requestUpdate()}get isInspectorActive(){return this._isInspectorActive}set isInspectorActive(t){this._isInspectorActive=!!t,this.requestUpdate()}get toolMode(){return this._toolMode}set toolMode(t){this._toolMode=t,this.requestUpdate()}get isEditModeActive(){return this._toolMode==="edit"}set isEditModeActive(t){this._toolMode=t?"edit":"view",this.requestUpdate()}render(){var o,n,d,c,u,p,l,k,E,M,_;if(!this.shadowRootNode)return;const t=this._toolMode==="move",i=this._toolMode==="edit",e=t||i;this.shadowRootNode.innerHTML=`
      <!-- Left part: Zoom & View Controls -->
      <div class="toolbar-group toolbar-zoom-group">
        <button class="tool-btn" id="btn-zoom-out" title="Zoom Out" aria-label="Zoom Out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button class="zoom-text" id="btn-zoom-reset" title="Set zoom to 100%" aria-label="Set zoom to 100%">${this._zoom}%</button>
        <button class="tool-btn" id="btn-zoom-in" title="Zoom In" aria-label="Zoom In">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

        <div class="divider"></div>

        <button class="tool-btn" id="btn-fit" title="Fit to Screen (F / 0)" aria-label="Fit to Screen">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
        </button>
        <button class="tool-btn" id="btn-reset" title="Reset Camera View" aria-label="Reset View">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </button>
        <button class="tool-btn ${this._isMinimapActive?"active":""}" id="btn-minimap" title="Toggle Minimap" aria-label="Toggle Minimap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
        </button>
      </div>

      <!-- Right part: Modes & Tools -->
      <div class="toolbar-group toolbar-actions-group">
        <!-- Move / Reposition Layout Mode -->
        <button class="tool-btn ${t?"active":""}" id="btn-move-mode" title="Move Mode (M) — Drag nodes, labels & lines to reposition" aria-label="Move Mode">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="5 9 2 12 5 15"></polyline>
            <polyline points="9 5 12 2 15 5"></polyline>
            <polyline points="15 19 12 22 9 19"></polyline>
            <polyline points="19 9 22 12 19 15"></polyline>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="12" y1="2" x2="12" y2="22"></line>
          </svg>
        </button>

        <!-- Edit Actions Mode -->
        <button class="tool-btn ${i?"active":""}" id="btn-edit-mode" title="Edit Actions Mode (E) — Click labels & nodes for actions/removal" aria-label="Edit Actions Mode">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
        ${e?`
        <button class="tool-btn" id="btn-snapshot" title="Snapshot Layout JS to Clipboard (S)" aria-label="Snapshot Layout">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </button>
        <button class="tool-btn" id="btn-reset-layout" title="Reset Node Positions to Default" aria-label="Reset Layout">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 4v6h6"></path>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
        </button>
        `:""}

        <div class="divider"></div>

        <!-- Toggles -->
        <button class="tool-btn ${this._isInspectorActive?"active":""}" id="btn-inspector" title="Toggle Inspector (I)" aria-label="Toggle Inspector">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2"></rect>
            <path d="M15 3v18"></path>
          </svg>
        </button>
      </div>
    `,(o=this.shadowRootNode.getElementById("btn-zoom-in"))==null||o.addEventListener("click",()=>{this.emit("flow:zoom-in")}),(n=this.shadowRootNode.getElementById("btn-zoom-out"))==null||n.addEventListener("click",()=>{this.emit("flow:zoom-out")}),(d=this.shadowRootNode.getElementById("btn-zoom-reset"))==null||d.addEventListener("click",()=>{this.emit("flow:zoom-reset")}),(c=this.shadowRootNode.getElementById("btn-fit"))==null||c.addEventListener("click",()=>{this.emit("flow:fit")}),(u=this.shadowRootNode.getElementById("btn-reset"))==null||u.addEventListener("click",()=>{this.emit("flow:reset")}),(p=this.shadowRootNode.getElementById("btn-minimap"))==null||p.addEventListener("click",()=>{this.emit("flow:toggle-minimap")}),(l=this.shadowRootNode.getElementById("btn-move-mode"))==null||l.addEventListener("click",()=>{this.emit("flow:toggle-move-mode")}),(k=this.shadowRootNode.getElementById("btn-edit-mode"))==null||k.addEventListener("click",()=>{this.emit("flow:toggle-edit-mode")}),(E=this.shadowRootNode.getElementById("btn-snapshot"))==null||E.addEventListener("click",()=>{this.emit("flow:snapshot-layout")}),(M=this.shadowRootNode.getElementById("btn-reset-layout"))==null||M.addEventListener("click",()=>{this.emit("flow:reset-layout")}),(_=this.shadowRootNode.getElementById("btn-inspector"))==null||_.addEventListener("click",()=>{this.emit("flow:toggle-inspector")})}}h(Mt,"styles",`
    :host {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      pointer-events: none;
      font-family: var(--tuto-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      color: var(--tuto-text, #e8eaed);
      user-select: none;
      box-sizing: border-box;
    }
    .toolbar-group,
    .toolbar-container {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem;
      background: color-mix(in srgb, var(--tuto-panel-bg, #161b22) 92%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--tuto-border, #30363d);
      border-radius: 0.75rem;
      box-shadow: var(--tuto-shadow, 0 12px 36px rgba(0, 0, 0, 0.45));
      pointer-events: auto;
    }
    .divider {
      width: 1px;
      height: 1.2rem;
      background: var(--tuto-border, #30363d);
      margin: 0 0.15rem;
    }
    button.tool-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      padding: 0;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 0.5rem;
      color: var(--tuto-text, #e8eaed);
      cursor: pointer;
      transition: all 120ms ease;
      font: inherit;
    }
    button.tool-btn:hover {
      background: var(--tuto-panel-head, #1c2128);
      border-color: var(--tuto-border, #30363d);
    }
    button.tool-btn.active {
      background: var(--tuto-highlight, rgba(59, 130, 246, 0.15));
      border-color: var(--tuto-hot, #3b82f6);
      color: var(--tuto-hot, #3b82f6);
    }
    button.zoom-text {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--tuto-font-mono, monospace);
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0 0.35rem;
      height: 2rem;
      color: var(--tuto-muted, #64748b);
      background: transparent;
      border: 1px solid transparent;
      border-radius: 0.5rem;
      min-width: 2.75rem;
      text-align: center;
      cursor: pointer;
      transition: all 120ms ease;
      font-variant-numeric: tabular-nums;
    }
    button.zoom-text:hover {
      background: var(--tuto-panel-head, #1c2128);
      border-color: var(--tuto-border, #30363d);
      color: var(--tuto-text, #e8eaed);
    }
    button.zoom-text:active {
      transform: scale(0.96);
    }
  `),customElements.get("tuto-flow-toolbar")||customElements.define("tuto-flow-toolbar",Mt);class St extends J{constructor(){super(...arguments);h(this,"_bounds",{x:0,y:0,w:2e3,h:1e3});h(this,"_camera",{panX:0,panY:0,scale:1});h(this,"_viewportSize",{width:900,height:700});h(this,"_nodes",{});h(this,"_transitions",[]);h(this,"_groups",[]);h(this,"_selectedNodeId",null);h(this,"_isDragging",!1);h(this,"_dragOffsetWorld",{x:0,y:0});h(this,"_lastProjection",null);h(this,"handlePointerDown",t=>{var l;if(t.button!==0||!((l=this.shadowRootNode)==null?void 0:l.querySelector("svg.minimap-canvas")))return;t.preventDefault(),t.stopPropagation();const e=this.screenToWorld(t.clientX,t.clientY);if(!e)return;const o=this._camera.scale||1,n=-this._camera.panX/o,d=-this._camera.panY/o,c=(this._viewportSize.width||900)/o,u=(this._viewportSize.height||700)/o,p=e.x>=n&&e.x<=n+c&&e.y>=d&&e.y<=d+u;this._isDragging=!0;try{this.setPointerCapture(t.pointerId)}catch{}if(p){const k=n+c/2,E=d+u/2;this._dragOffsetWorld={x:e.x-k,y:e.y-E}}else this._dragOffsetWorld={x:0,y:0},this.emit("flow:pan-to",{worldX:e.x,worldY:e.y});this.requestUpdate()});h(this,"handlePointerMove",t=>{if(!this._isDragging)return;t.preventDefault(),t.stopPropagation();const i=this.screenToWorld(t.clientX,t.clientY);if(!i)return;const e=i.x-this._dragOffsetWorld.x,o=i.y-this._dragOffsetWorld.y;this.emit("flow:pan-to",{worldX:e,worldY:o})});h(this,"handlePointerUp",t=>{if(this._isDragging){this._isDragging=!1;try{this.releasePointerCapture(t.pointerId)}catch{}this.requestUpdate()}})}get bounds(){return this._bounds}set bounds(t){this._bounds=t,this.requestUpdate()}get camera(){return this._camera}set camera(t){this._camera=t,this.requestUpdate()}get viewportSize(){return this._viewportSize}set viewportSize(t){this._viewportSize=t,this.requestUpdate()}get nodes(){return this._nodes}set nodes(t){this._nodes=t,this.requestUpdate()}get transitions(){return this._transitions}set transitions(t){this._transitions=t||[],this.requestUpdate()}get groups(){return this._groups}set groups(t){this._groups=t||[],this.requestUpdate()}get selectedNodeId(){return this._selectedNodeId}set selectedNodeId(t){this._selectedNodeId=t,this.requestUpdate()}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback()}screenToWorld(t,i){var _;if(!this._lastProjection)return null;const e=(_=this.shadowRootNode)==null?void 0:_.querySelector("svg.minimap-canvas");if(!e)return null;const o=e.getBoundingClientRect();if(o.width<=0||o.height<=0)return null;const n=190,d=106,c=(t-o.left)*(n/o.width),u=(i-o.top)*(d/o.height),{offsetX:p,offsetY:l,scaleMap:k,bx:E,by:M}=this._lastProjection;return{x:(c-p)/k+E,y:(u-l)/k+M}}render(){var O,x,C,L;if(!this.shadowRootNode)return;const t=190,i=106,e=8,o=t-e*2,n=i-e*2,d=Math.max(10,this._bounds.w||2e3),c=Math.max(10,this._bounds.h||1e3),u=this._bounds.x||0,p=this._bounds.y||0,l=Math.min(o/d,n/c),k=e+(o-d*l)/2,E=e+(n-c*l)/2;this._lastProjection={offsetX:k,offsetY:E,scaleMap:l,bx:u,by:p},this.shadowRootNode.innerHTML=`
      <div class="minimap-container">
        <div class="minimap-header">
          <span class="minimap-title">Minimap</span>
          <button type="button" class="minimap-close-btn" id="btn-close-minimap" title="Close Minimap" aria-label="Close Minimap">×</button>
        </div>
        <svg class="minimap-canvas" viewBox="0 0 ${t} ${i}" preserveAspectRatio="none"></svg>
      </div>
    `;const M=this.shadowRootNode.querySelector("svg.minimap-canvas");if(!M)return;M.addEventListener("pointerdown",this.handlePointerDown),M.addEventListener("pointermove",this.handlePointerMove),M.addEventListener("pointerup",this.handlePointerUp),M.addEventListener("pointercancel",this.handlePointerUp),(O=this.shadowRootNode.getElementById("btn-close-minimap"))==null||O.addEventListener("click",S=>{S.stopPropagation(),this.emit("flow:close-minimap")});const _=U("g",{transform:`translate(${k}, ${E}) scale(${l}) translate(${-u}, ${-p})`},M);if(U("rect",{x:u,y:p,width:d,height:c,rx:16,fill:"rgba(59, 130, 246, 0.03)",stroke:"var(--tuto-border, #30363d)","stroke-width":1.5/l},_),this._groups&&this._groups.length>0)for(const S of this._groups){const P=S.accent||"#3b82f6";U("rect",{x:S.x,y:S.y,width:S.w,height:S.h,rx:12,fill:"rgba(255, 255, 255, 0.02)",stroke:P,"stroke-width":1/l,"stroke-opacity":"0.4"},_)}if(this._transitions&&this._transitions.length>0)for(const S of this._transitions){const P=(x=S.route)==null?void 0:x.points;if(P&&P.length>=2){let g=`M ${P[0][0]} ${P[0][1]}`;for(let I=1;I<P.length;I++)g+=` L ${P[I][0]} ${P[I][1]}`;U("path",{d:g,fill:"none",stroke:"var(--tuto-muted, #64748b)","stroke-width":1.2/l,"stroke-opacity":"0.35"},_)}else if(this._nodes[S.from]&&this._nodes[S.to]){const g=this._nodes[S.from],I=this._nodes[S.to],X=g.x+g.w/2,A=g.y+g.h/2,W=I.x+I.w/2,a=I.y+I.h/2;U("line",{x1:X,y1:A,x2:W,y2:a,stroke:"var(--tuto-muted, #64748b)","stroke-width":1.2/l,"stroke-opacity":"0.35"},_)}}for(const[S,P]of Object.entries(this._nodes)){const g=((C=G.accents[S])==null?void 0:C.accent)||((L=G.accents[P.kind])==null?void 0:L.accent)||"#3b82f6",I=S===this._selectedNodeId;U("rect",{x:P.x,y:P.y,width:P.w,height:P.h,rx:8,fill:I?g:"var(--tuto-head-bg, #1a2030)",stroke:g,"stroke-width":(I?2.5:1.2)/l},_)}const N=this._camera.scale||1,q=-this._camera.panX/N,R=-this._camera.panY/N,$=(this._viewportSize.width||900)/N,B=(this._viewportSize.height||700)/N;U("rect",{x:q,y:R,width:$,height:B,rx:6,class:`minimap-viewport ${this._isDragging?"is-dragging":""}`,"stroke-width":1.5/l},_)}}h(St,"styles",`
    :host {
      display: block;
      width: 190px;
      height: 136px;
      background: color-mix(in srgb, var(--tuto-panel-bg, #10131d) 92%, transparent);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--tuto-border, #30363d);
      border-radius: 12px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
      overflow: hidden;
      user-select: none;
      box-sizing: border-box;
    }
    .minimap-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .minimap-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.35rem 0.6rem 0.2rem 0.6rem;
      border-bottom: 1px solid color-mix(in srgb, var(--tuto-border, #30363d) 60%, transparent);
      background: color-mix(in srgb, var(--tuto-panel-head, #161b26) 80%, transparent);
    }
    .minimap-title {
      font-family: var(--tuto-font-mono, monospace);
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--tuto-muted, #94a3b8);
      text-transform: uppercase;
    }
    .minimap-close-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.1rem;
      height: 1.1rem;
      padding: 0;
      border: 1px solid transparent;
      border-radius: 3px;
      background: transparent;
      color: var(--tuto-muted, #94a3b8);
      cursor: pointer;
      font-size: 0.85rem;
      line-height: 1;
      transition: all 120ms ease;
    }
    .minimap-close-btn:hover {
      background: var(--tuto-border, #30363d);
      color: var(--tuto-text, #ffffff);
    }
    .minimap-canvas {
      flex: 1;
      width: 100%;
      cursor: crosshair;
      display: block;
    }
    .minimap-viewport {
      fill: rgba(56, 189, 248, 0.16);
      stroke: #38bdf8;
      stroke-width: 1.5;
      cursor: grab;
      transition: fill 120ms ease, stroke 120ms ease;
    }
    .minimap-viewport:hover {
      fill: rgba(56, 189, 248, 0.24);
      stroke: #7dd3fc;
    }
    .minimap-viewport.is-dragging {
      cursor: grabbing;
      fill: rgba(56, 189, 248, 0.32);
      stroke: #ffffff;
    }
  `),customElements.get("tuto-flow-minimap")||customElements.define("tuto-flow-minimap",St);class It extends J{constructor(){super(...arguments);h(this,"_isOpen",!1);h(this,"_node",null);h(this,"_edge",null);h(this,"_graph",null);h(this,"_tools",[])}get graph(){return this._graph}set graph(t){this._graph=t,this.requestUpdate()}get isOpen(){return this._isOpen}set isOpen(t){this._isOpen=!!t,this.requestUpdate()}get node(){return this._node}set node(t){this._node=t,t&&(this._edge=null),this.requestUpdate()}get edge(){return this._edge}set edge(t){this._edge=t,t&&(this._node=null),this.requestUpdate()}get tools(){return this._tools}set tools(t){this._tools=t,this.requestUpdate()}render(){var n,d,c,u,p,l,k,E,M,_,N,q,R,$,B,O,x,C,L,S,P;if(!this.shadowRootNode)return;let t="",i="";if(this._node){const g=this._node,I=G.accents[g.id]||G.accents[g.kind]||{accent:"#3b82f6",badge:(g.kind||"MODE").toUpperCase(),perm:(g.permission||"READ-ONLY").toUpperCase(),permClass:`perm-${g.permission||"readonly"}`},A=I.perm==="WRITE"?'<svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 3px; display: inline-block; vertical-align: -1px;"><path d="M11 2l3 3-8.5 8.5H2.5v-3z"/></svg>':'<svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 3px; display: inline-block; vertical-align: -1px;"><path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>';this.style.setProperty("--drawer-accent",I.accent),t=`
        <div class="header-titles">
          <h2>${v(g.label||g.id)}</h2>
          <div class="header-badges">
            <span class="badge badge-accent">${v(I.badge)}</span>
            <span class="badge badge-perm ${I.permClass}">${A}${v(I.perm)}</span>
          </div>
        </div>
      `;const W=(g.substates||[]).length?`<div>
            <h4 class="section-title">Substates</h4>
            <div class="chip-group">
              ${g.substates.map(y=>`<span class="chip">${v(y)}</span>`).join("")}
            </div>
          </div>`:"",a=(g.procedure||[]).length?`<div>
            <h4 class="section-title">Ordered Instructions (${g.procedure.length})</h4>
            <ol class="instruction-list">
              ${g.procedure.map((y,j)=>`
                <li class="instruction-item">
                  <span class="instruction-idx">${j+1}.</span>
                  <span>${v(y)}</span>
                </li>
              `).join("")}
            </ol>
          </div>`:"",f=this._tools.filter(y=>(y.modes||[]).includes(g.id)||(y.modes||[]).includes("any")),w=f.length?`<div>
            <h4 class="section-title">Permitted Tools & Gates (${f.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              ${f.map(y=>{var j;return`
                <div class="tool-card">
                  <div class="tool-title">
                    <span>${v(y.name)}</span>
                    <span class="chip">TOOL</span>
                  </div>
                  <p class="section-text" style="font-size: 0.78rem;">${v(y.summary)}</p>
                  ${(j=y.gate)!=null&&j.length?`<div style="font-size: 0.72rem; color: var(--tuto-muted, #64748b);"><strong>Gate:</strong> ${v(y.gate.join(" · "))}</div>`:""}
                </div>
              `}).join("")}
            </div>
          </div>`:"",m=g.targetSubgraph||g.subgraphId||((d=(n=this._graph)==null?void 0:n.subgraphs)!=null&&d[g.id]?g.id:null);i=`
        ${m?`<div style="margin-bottom: 0.5rem;">
            <button class="btn-subgraph-drill" id="btn-subgraph-drill" data-subgraph="${v(m)}">
              <span>Drill into <strong>${v(m)}</strong> Subgraph</span>
              <span>➔</span>
            </button>
          </div>`:""}
        ${g.summary?`<div><h4 class="section-title">Summary</h4><p class="section-text">${v(g.summary)}</p></div>`:""}
        ${W}
        ${a}
        ${w}
      `}else if(this._edge){const g=this._edge;this.style.setProperty("--drawer-accent","#3b82f6");const I=g.event||g.label||"Transition";t=`
        <div class="header-titles">
          <h2>${v(I)}</h2>
          <div class="header-badges">
            <span class="badge badge-accent">TRANSITION</span>
            ${g.userMediated?'<span class="badge badge-perm perm-readonly">USER-MEDIATED</span>':'<span class="badge badge-perm perm-write">PROCEDURAL</span>'}
            ${g.bidirectional?'<span class="badge badge-perm perm-write">BIDIRECTIONAL</span>':""}
          </div>
        </div>
      `,i=`
        <div>
          <h4 class="section-title">Route Connection</h4>
          <p class="section-text" style="font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
            <span class="chip" style="font-size: 0.82rem; font-weight: 700; padding: 0.2rem 0.6rem;">${v(g.from.toUpperCase())}</span>
            <span style="color: var(--tuto-muted);">${g.bidirectional?"◄──►":"──►"}</span>
            <span class="chip" style="font-size: 0.82rem; font-weight: 700; padding: 0.2rem 0.6rem;">${v(g.to.toUpperCase())}</span>
          </p>
        </div>
        ${g.label&&g.label!==I?`<div><h4 class="section-title">Action / Intention</h4><p class="section-text" style="color: var(--tuto-text); font-weight: 600;">${v(g.label)}</p></div>`:""}
        ${g.description?`<div><h4 class="section-title">Description & Rules</h4><p class="section-text" style="line-height: 1.6;">${v(g.description)}</p></div>`:""}
        ${(c=g.events)!=null&&c.length?`<div>
                <h4 class="section-title">Trigger Events (${g.events.length})</h4>
                <div class="chip-group">
                  ${g.events.map(X=>`<span class="chip" style="color: var(--tuto-accent, #38bdf8);">${v(X)}</span>`).join("")}
                </div>
              </div>`:""}
        ${(u=g.descriptions)!=null&&u.length&&g.descriptions.length>1?`<div>
                <h4 class="section-title">Bundled Paths</h4>
                <ul class="instruction-list">
                  ${g.descriptions.map(X=>`
                    <li class="instruction-item">
                      <span>${v(X)}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>`:""}
      `}else{this.style.setProperty("--drawer-accent","#f97316");const g=((p=this._graph)==null?void 0:p.title)||"Workflow Overview",I=((l=this._graph)==null?void 0:l.version)||"",X=((k=this._graph)==null?void 0:k.description)||((E=this._graph)==null?void 0:E.summary)||"",A=(M=this._graph)==null?void 0:M.session,W=(_=this._graph)==null?void 0:_.exceptions,a=((N=this._graph)==null?void 0:N.invariants)||((q=this._graph)==null?void 0:q.rules)||(W==null?void 0:W.rules)||[],f=((R=this._graph)==null?void 0:R.ownership)||[],w=(($=this._graph)==null?void 0:$.always)||[],m=(B=this._graph)==null?void 0:B.artifact,z=((O=this._graph)==null?void 0:O.procedures)||{};t=`
        <div class="header-titles">
          <h2>${v(g)}</h2>
          <div class="header-badges">
            <span class="badge badge-accent" style="background: #f97316;">OVERVIEW</span>
            ${I?`<span class="badge badge-perm perm-standby">${v(I)}</span>`:""}
          </div>
        </div>
      `;const y=A?`<div>
            <h4 class="section-title" style="color: var(--tuto-accent, #38bdf8);">Session Model & Artifact Contract</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${A.mode?`<div class="info-card"><span class="info-card-label">Session Mode</span><span class="info-card-value">${v(A.mode)}</span></div>`:""}
              ${A.artifact?`<div class="info-card"><span class="info-card-label">Plan Artifact</span><span class="info-card-value">${v(A.artifact)}</span></div>`:""}
              ${A.scope?`<div class="info-card"><span class="info-card-label">Session Scope</span><span class="info-card-value">${v(A.scope)}</span></div>`:""}
              ${A.review?`<div class="info-card"><span class="info-card-label">Review State</span><span class="info-card-value">${v(A.review)}</span></div>`:""}
            </div>
          </div>`:"",j=W?`<div>
            <h4 class="section-title" style="color: #f97316;">${v(W.title||"Exceptions & Escape Hatches")}</h4>
            ${W.summary?`<p class="section-text" style="line-height: 1.55; margin-bottom: 0.75rem; font-size: 0.82rem;">${v(W.summary)}</p>`:""}
            ${(x=W.commands)!=null&&x.length?`<div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem;">
                    ${W.commands.map(T=>`
                      <div class="tool-card" style="border-left: 3px solid #f97316; padding: 0.65rem 0.8rem;">
                        <div class="tool-title" style="margin-bottom: 0.25rem;">
                          <span style="color: #f97316; font-size: 0.84rem; font-weight: 700;">${v(T.command)}</span>
                          ${T.label?`<span class="chip" style="color: #fdba74; border-color: rgba(249, 115, 22, 0.3); font-size: 0.68rem;">${v(T.label)}</span>`:""}
                        </div>
                        <p class="section-text" style="font-size: 0.78rem; line-height: 1.45;">${v(T.summary||T.description||"")}</p>
                      </div>
                    `).join("")}
                  </div>`:""}
            ${(C=W.rules)!=null&&C.length?`<ul class="instruction-list">
                    ${W.rules.map(T=>`
                      <li class="instruction-item">
                        <span class="instruction-idx" style="color: #f97316;">•</span>
                        <span style="font-size: 0.8rem; line-height: 1.45;">${v(T)}</span>
                      </li>
                    `).join("")}
                  </ul>`:""}
          </div>`:"",V=a.length?`<div>
            <h4 class="section-title">Workflow Invariants & Boundaries</h4>
            <ul class="instruction-list">
              ${a.map(T=>`
                <li class="instruction-item">
                  <span class="instruction-idx" style="color: #f97316;">•</span>
                  <span style="font-size: 0.8rem; line-height: 1.45;">${v(T)}</span>
                </li>
              `).join("")}
            </ul>
          </div>`:"",K=f.length?`<div>
            <h4 class="section-title">Ownership & Roles</h4>
            <ul class="instruction-list">
              ${f.map(T=>`
                <li class="instruction-item">
                  <span class="instruction-idx" style="color: #3b82f6;">•</span>
                  <span style="font-size: 0.8rem; line-height: 1.45;">${v(T)}</span>
                </li>
              `).join("")}
            </ul>
          </div>`:"",Lt=m?`<div>
            <h4 class="section-title">Artifact Sections & Identifiers</h4>
            ${(L=m.sections)!=null&&L.length?`<div style="margin-bottom: 0.6rem;">
                    <div style="font-size: 0.72rem; color: var(--tuto-muted, #64748b); margin-bottom: 0.35rem; font-weight: 700;">REQUIRED SECTIONS (${m.sections.length})</div>
                    <div class="chip-group">
                      ${m.sections.map(T=>`<span class="chip" style="color: var(--tuto-accent, #38bdf8);">${v(T)}</span>`).join("")}
                    </div>
                  </div>`:""}
            ${m.identifiers&&Object.keys(m.identifiers).length?`<div style="margin-bottom: 0.6rem;">
                    <div style="font-size: 0.72rem; color: var(--tuto-muted, #64748b); margin-bottom: 0.35rem; font-weight: 700;">STABLE LIFECYCLE IDENTIFIERS</div>
                    <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                      ${Object.entries(m.identifiers).map(([T,Z])=>`
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem;">
                          <span class="chip" style="font-weight: 700; color: #f97316;">${v(T)}</span>
                          <span style="color: var(--tuto-text-muted, #94a3b8);">${v(Z)}</span>
                        </div>
                      `).join("")}
                    </div>
                  </div>`:""}
            ${(S=m.rules)!=null&&S.length?`<ul class="instruction-list">
                    ${m.rules.map(T=>`
                      <li class="instruction-item">
                        <span class="instruction-idx" style="color: #38bdf8;">•</span>
                        <span style="font-size: 0.8rem; line-height: 1.45;">${v(T)}</span>
                      </li>
                    `).join("")}
                  </ul>`:""}
          </div>`:"",Nt=w.length?`<div>
            <h4 class="section-title">Execution Principles (ALWAYS)</h4>
            <ul class="instruction-list">
              ${w.map(T=>`
                <li class="instruction-item">
                  <span class="instruction-idx" style="color: #22c55e;">•</span>
                  <span style="font-size: 0.8rem; line-height: 1.45;">${v(T)}</span>
                </li>
              `).join("")}
            </ul>
          </div>`:"",rt=Object.keys(z),bt=rt.length?`<div>
            <h4 class="section-title">Global Procedures (${rt.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              ${rt.map(T=>`
                <details class="spec-details">
                  <summary>
                    <span>${v(T)}</span>
                    <span class="chip" style="font-size: 0.68rem;">${(z[T]||[]).length} steps</span>
                  </summary>
                  <div class="spec-details-content">
                    <ol class="instruction-list" style="gap: 0.4rem;">
                      ${(z[T]||[]).map((Z,ot)=>`
                        <li class="instruction-item" style="padding: 0.45rem 0.6rem; font-size: 0.78rem;">
                          <span class="instruction-idx">${ot+1}.</span>
                          <span>${v(Z)}</span>
                        </li>
                      `).join("")}
                    </ol>
                  </div>
                </details>
              `).join("")}
            </div>
          </div>`:"";i=`
        ${X?`<div>
                <h4 class="section-title">Big Picture & Architecture</h4>
                <p class="section-text" style="line-height: 1.6; color: var(--tuto-text, #e8eaed); font-size: 0.84rem;">${v(X)}</p>
              </div>`:""}
        ${y}
        ${j}
        ${V}
        ${K}
        ${Lt}
        ${Nt}
        ${bt}

        <div>
          <h4 class="section-title" style="color: var(--tuto-muted, #64748b);">Interactive Inspection</h4>
          <p class="section-text" style="font-size: 0.78rem; color: var(--tuto-text-muted, #94a3b8); line-height: 1.5;">
            Click any state node card or transition edge on the canvas to inspect its step-by-step instructions, permissions, and tool gates.
          </p>
        </div>
      `}this.shadowRootNode.innerHTML=`
      <aside class="drawer ${this._isOpen?"is-open":""}">
        <div class="drawer-header">
          ${t}
          <button class="btn-close" id="btn-close" title="Close Drawer">×</button>
        </div>
        <div class="drawer-body">
          ${i}
        </div>
      </aside>
    `;const e=this.shadowRootNode.querySelector(".drawer");e&&(e.addEventListener("pointerdown",g=>g.stopPropagation()),e.addEventListener("mousedown",g=>g.stopPropagation())),(P=this.shadowRootNode.getElementById("btn-close"))==null||P.addEventListener("click",()=>{this.emit("flow:close-inspector")});const o=this.shadowRootNode.getElementById("btn-subgraph-drill");o&&o.addEventListener("click",()=>{const g=o.getAttribute("data-subgraph");g&&this.emit("flow:select-subgraph",{subgraphId:g})})}}h(It,"styles",`
    :host {
      display: block;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 420px;
      max-width: 90vw;
      z-index: 50;
      pointer-events: none;
      font-family: var(--tuto-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      color: var(--tuto-text, #e8eaed);
      user-select: text;
      -webkit-user-select: text;
    }
    .drawer {
      width: 100%;
      height: 100%;
      background: color-mix(in srgb, var(--tuto-panel-bg, #161b22) 96%, transparent);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-left: 1px solid var(--tuto-border, #30363d);
      box-shadow: -12px 0 36px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: auto;
      box-sizing: border-box;
      user-select: text;
      -webkit-user-select: text;
      cursor: auto;
    }
    .drawer.is-open {
      transform: translateX(0);
    }
    .drawer-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--tuto-border, #30363d);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      background: var(--tuto-panel-head, #1c2128);
      user-select: text;
      -webkit-user-select: text;
    }
    .header-titles h2 {
      margin: 0 0 0.4rem 0;
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .header-badges {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 700;
      font-family: var(--tuto-font-mono, monospace);
    }
    .badge-accent {
      background: var(--drawer-accent, #3b82f6);
      color: #ffffff;
    }
    .badge-perm {
      border: 1px solid currentColor;
      padding: 0.1rem 0.42rem;
      display: inline-flex;
      align-items: center;
    }
    .perm-read { color: #38bdf8; border-color: rgba(56, 189, 248, 0.4); background: rgba(56, 189, 248, 0.1); }
    .perm-write { color: #10b981; border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.1); }
    .perm-standby { color: #94a3b8; border-color: rgba(148, 163, 184, 0.4); background: rgba(148, 163, 184, 0.1); }

    .btn-close {
      background: transparent;
      border: 1px solid var(--tuto-border, #30363d);
      color: var(--tuto-text-muted, #94a3b8);
      width: 1.9rem;
      height: 1.9rem;
      border-radius: 999px;
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 150ms ease;
    }
    .btn-close:hover {
      background: var(--tuto-head-bg, #1a2030);
      color: var(--tuto-text, #e8eaed);
    }
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .section-title {
      font-size: 0.76rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--tuto-muted, #64748b);
      font-weight: 700;
      margin: 0 0 0.6rem 0;
    }
    .section-text {
      font-size: 0.85rem;
      line-height: 1.5;
      color: var(--tuto-text-muted, #94a3b8);
      margin: 0;
    }
    .instruction-list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .instruction-item {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      font-size: 0.82rem;
      line-height: 1.45;
      color: var(--tuto-text, #e8eaed);
      background: var(--tuto-head-bg, #1a2030);
      padding: 0.6rem 0.75rem;
      border-radius: 8px;
      border: 1px solid var(--tuto-border-subtle, #21262d);
    }
    .instruction-idx {
      font-family: var(--tuto-font-mono, monospace);
      font-weight: 700;
      color: var(--drawer-accent, #3b82f6);
      font-size: 0.76rem;
      min-width: 1.2rem;
    }
    .tool-card {
      background: var(--tuto-tool-bg, #141a24);
      border: 1px solid var(--tuto-border, #30363d);
      border-radius: 8px;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .tool-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 700;
      font-size: 0.85rem;
      font-family: var(--tuto-font-mono, monospace);
      color: var(--tuto-text, #e8eaed);
    }
    .chip-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .btn-subgraph-drill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(59, 130, 246, 0.15));
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #38bdf8;
      border-radius: 8px;
      padding: 0.6rem 0.85rem;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 150ms ease;
      font-family: inherit;
    }
    .btn-subgraph-drill:hover {
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(59, 130, 246, 0.3));
      border-color: #38bdf8;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(56, 189, 248, 0.3);
    }
    .chip {
      font-size: 0.72rem;
      font-family: var(--tuto-font-mono, monospace);
      background: var(--tuto-badge-bg, #1e293b);
      border: 1px solid var(--tuto-border, #30363d);
      color: var(--tuto-text-muted, #94a3b8);
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
    }
    .info-card {
      background: var(--tuto-head-bg, #1a2030);
      border: 1px solid var(--tuto-border-subtle, #21262d);
      border-radius: 8px;
      padding: 0.65rem 0.8rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .info-card-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--tuto-muted, #64748b);
    }
    .info-card-value {
      font-size: 0.82rem;
      line-height: 1.45;
      color: var(--tuto-text, #e8eaed);
    }
    details.spec-details {
      background: var(--tuto-tool-bg, #141a24);
      border: 1px solid var(--tuto-border, #30363d);
      border-radius: 8px;
      overflow: hidden;
    }
    details.spec-details summary {
      padding: 0.6rem 0.8rem;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--tuto-text, #e8eaed);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      user-select: none;
      background: var(--tuto-head-bg, #1a2030);
    }
    details.spec-details summary:hover {
      background: color-mix(in srgb, var(--tuto-head-bg, #1a2030) 80%, white);
    }
    details.spec-details[open] summary {
      border-bottom: 1px solid var(--tuto-border-subtle, #21262d);
    }
    .spec-details-content {
      padding: 0.75rem 0.8rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .empty-state {
      text-align: center;
      color: var(--tuto-muted, #64748b);
      padding: 3rem 1rem;
      font-size: 0.88rem;
    }
  `),customElements.get("tuto-flow-inspector")||customElements.define("tuto-flow-inspector",It);class $t extends J{constructor(){super(...arguments);h(this,"_rootGraph",null);h(this,"_graph",null);h(this,"_activeSubgraphId",null);h(this,"_showSubgraphNav",!0);h(this,"_camera",{panX:0,panY:0,scale:1});h(this,"_bounds",{x:0,y:0,w:2e3,h:1e3});h(this,"_activeStateId",null);h(this,"_selectedNodeId",null);h(this,"_selectedEdgeId",null);h(this,"_hoveredEdgeId",null);h(this,"_showMinimap",!0);h(this,"_showInspector",!0);h(this,"_hasRestoredCamera",!1);h(this,"_theme","dark");h(this,"_toolMode","view");h(this,"_isDragging",!1);h(this,"_dragStart",{x:0,y:0,panX:0,panY:0});h(this,"_draggedNodeId",null);h(this,"_dragNodeStart",null);h(this,"_nodeDragMoved",!1);h(this,"_edgeWaypoints",new Map);h(this,"_draggedWaypoint",null);h(this,"_activeGuides",[]);h(this,"_defaultLayout",null);h(this,"_toastMessage",null);h(this,"_toastTimeout",null);h(this,"_activePopover",null);h(this,"handleKeyDown",t=>{var i;t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement||(t.key==="+"||t.key==="="?this.zoomBy(1.2):t.key==="-"?this.zoomBy(.8333333333333334):t.key==="0"||t.key==="f"||t.key==="F"?this.fitToViewport():t.key==="r"||t.key==="R"?(i=this._graph)!=null&&i.initial&&(this._activeStateId=this._graph.initial,this._selectedNodeId=this._graph.initial,this._selectedEdgeId=null,this.requestUpdate()):t.key==="i"||t.key==="I"?this._toggleInspector():t.key==="m"||t.key==="M"?this.toolMode=this._toolMode==="move"?"view":"move":t.key==="e"||t.key==="E"?this.toolMode=this._toolMode==="edit"?"view":"edit":(t.key==="s"||t.key==="S")&&this._toolMode!=="view"?t.shiftKey?this.copyFsmPatch():this.copyLayoutSnapshot():t.key==="Escape"&&(this._activePopover?(this._activePopover=null,this.requestUpdate()):this._selectedNodeId||this._selectedEdgeId?(this._selectedNodeId=null,this._activeStateId=null,this._selectedEdgeId=null,this.requestUpdate()):this._toolMode!=="view"?this.toolMode="view":this._closeInspector()))});h(this,"handleResize",()=>{this.requestUpdate()});h(this,"handleWheel",t=>{t.preventDefault();const i=this.getBoundingClientRect(),e=t.clientX-i.left,o=t.clientY-i.top,n=t.deltaY<0?1.12:.89;this._camera=ut(this._camera,e,o,n,tt,it),this._saveCamera(),this.requestUpdate()});h(this,"handlePointerDown",t=>{var o;if(t.button!==0||t.target.closest(".flow-edge-pill, tuto-flow-node, .floating-toolbar, .floating-minimap, tuto-flow-inspector, .flow-waypoint-handle, .flow-waypoint-split"))return;this._isDragging=!0,this._dragStart={x:t.clientX,y:t.clientY,panX:this._camera.panX,panY:this._camera.panY};const e=(o=this.shadowRootNode)==null?void 0:o.querySelector("svg.flow-svg");e==null||e.classList.add("grabbing"),window.addEventListener("pointermove",this.handlePointerMove),window.addEventListener("pointerup",this.handlePointerUp)});h(this,"handlePointerMove",t=>{this._isDragging&&(this._camera={...this._camera,panX:this._dragStart.panX+(t.clientX-this._dragStart.x),panY:this._dragStart.panY+(t.clientY-this._dragStart.y)},this.requestUpdate())});h(this,"handlePointerUp",()=>{var i;this._isDragging&&(Math.hypot(this._camera.panX-this._dragStart.panX,this._camera.panY-this._dragStart.panY)<4&&(this._selectedNodeId=null,this._activeStateId=null,this._selectedEdgeId=null),this._saveCamera()),this._isDragging=!1;const t=(i=this.shadowRootNode)==null?void 0:i.querySelector("svg.flow-svg");t==null||t.classList.remove("grabbing"),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("pointerup",this.handlePointerUp),this.requestUpdate()});h(this,"handleNodePointerMove",t=>{if(!this._draggedNodeId||!this._dragNodeStart||!this._graph)return;const i=this._graph.states[this._draggedNodeId];if(!i)return;const e=this._camera.scale||1,o=(t.clientX-this._dragNodeStart.startX)/e,n=(t.clientY-this._dragNodeStart.startY)/e;Math.hypot(o,n)>4&&(this._nodeDragMoved=!0);const d=this._dragNodeStart.nodeOrigX+o,c=this._dragNodeStart.nodeOrigY+n,u=Yt(this._draggedNodeId,d,c,i.w,i.h,this._graph.states,et,10);i.x=u.x,i.y=u.y,this._activeGuides=u.guides;const p=this._graph.framing!==!1;this._bounds=ft(this._graph.states,p?64:40,p?56:30,p?46:0,this._graph.groups),this.requestUpdate()});h(this,"handleNodePointerUp",()=>{var i;if(!this._draggedNodeId)return;const t=this._draggedNodeId;this._draggedNodeId=null,this._dragNodeStart=null,this._activeGuides=[],window.removeEventListener("pointermove",this.handleNodePointerMove),window.removeEventListener("pointerup",this.handleNodePointerUp),this._nodeDragMoved?this.emit("flow:layout-change",{nodeId:t,layout:this.exportLayoutSnapshot()}):this._selectedNodeId===t?(this._selectedNodeId=null,this._activeStateId=null,this.emit("flow:select-node",{node:null})):(this._selectedNodeId=t,this._activeStateId=t,(i=this._graph)!=null&&i.states[t]&&this.emit("flow:select-node",{node:this._graph.states[t]})),this.requestUpdate()});h(this,"handleWaypointPointerMove",t=>{if(!this._draggedWaypoint||!this._graph)return;const{edgeId:i,waypointIndex:e,startX:o,startY:n,origX:d,origY:c}=this._draggedWaypoint,u=this._edgeWaypoints.get(i);if(!u||!u[e])return;const p=this._camera.scale||1,l=(t.clientX-o)/p,k=(t.clientY-n)/p,E=d+l,M=c+k,_=mt(E,M,i,e,this._graph.states,this._graph.transitions||[],this._edgeWaypoints,et,10);u[e]=[_.x,_.y],this._activeGuides=_.guides,this.requestUpdate()});h(this,"handleWaypointPointerUp",()=>{this._draggedWaypoint&&(this._draggedWaypoint=null,this._activeGuides=[],window.removeEventListener("pointermove",this.handleWaypointPointerMove),window.removeEventListener("pointerup",this.handleWaypointPointerUp),this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.requestUpdate())})}get graph(){return this._graph}set graph(t){var e;this._rootGraph=t,this._activeSubgraphId=(t==null?void 0:t.activeSubgraphId)||null;const i=this._activeSubgraphId&&((e=t==null?void 0:t.subgraphs)!=null&&e[this._activeSubgraphId])?t.subgraphs[this._activeSubgraphId]:t;this._applyGraph(i),this.requestUpdate()}get rootGraph(){return this._rootGraph}get activeSubgraphId(){return this._activeSubgraphId}set activeSubgraphId(t){this.selectSubgraph(t)}get subgraphs(){var t;return(t=this._rootGraph)==null?void 0:t.subgraphs}get showSubgraphNav(){return this._showSubgraphNav}set showSubgraphNav(t){this._showSubgraphNav=t,this.requestUpdate()}selectSubgraph(t){var i;if(this._rootGraph){if(this._syncWaypointsToGraph(),!t||t==="__root__"||t==="overview")this._activeSubgraphId=null,this._applyGraph(this._rootGraph);else if((i=this._rootGraph.subgraphs)!=null&&i[t])this._activeSubgraphId=t,this._applyGraph(this._rootGraph.subgraphs[t]);else return;this._selectedNodeId=null,this._selectedEdgeId=null,requestAnimationFrame(()=>this.fitToViewport()),this.emit("flow:subgraph-change",{subgraphId:this._activeSubgraphId,graph:this._graph}),this.requestUpdate()}}_applyGraph(t){if(this._graph=t,t){if(this._defaultLayout=null,t.states){this._defaultLayout={};for(const[e,o]of Object.entries(t.states))this._defaultLayout[e]={x:o.x,y:o.y,w:o.w,h:o.h}}if(this._edgeWaypoints.clear(),t.transitions)for(const e of t.transitions)e.waypoints&&e.waypoints.length>0&&this._edgeWaypoints.set(e.id,e.waypoints.map(o=>[...o]));try{const e=localStorage.getItem("pi_workflow_edge_override");if(e!==null){const o=JSON.parse(e),n=this._activeSubgraphId||"overview";let d=null;if(o!=null&&o.diagrams&&typeof o.diagrams=="object"?d=o.diagrams[n]||null:o&&typeof o=="object"&&(d=o),d)for(const[c,u]of Object.entries(d))Array.isArray(u)&&u.length>0&&this._edgeWaypoints.set(c,u)}}catch{}this._activeStateId=t.initial||Object.keys(t.states||{})[0]||null;const i=t.framing!==!1;if(this._bounds=ft(t.states,i?64:40,i?56:30,i?46:0,t.groups),!this._hasRestoredCamera)try{const e=localStorage.getItem("pi_workflow_camera");if(e){const o=JSON.parse(e);o&&typeof o.scale=="number"&&typeof o.panX=="number"&&(this._camera=o,this._hasRestoredCamera=!0)}}catch{}this._hasRestoredCamera||requestAnimationFrame(()=>this.fitToViewport())}}_removeWaypoint(t,i){const e=[...this._edgeWaypoints.get(t)||[]];i>=0&&i<e.length&&e.splice(i,1),e.length===0?(this._edgeWaypoints.delete(t),this.showToast("✓ Straightened edge (0 breakpoints)")):(this._edgeWaypoints.set(t,e),this.showToast(`✓ Removed breakpoint (${e.length}/2 remaining)`)),this._activePopover=null,this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.requestUpdate()}_resetEdge(t){this._edgeWaypoints.delete(t),this._activePopover=null,this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.showToast("✓ Reset edge to straight line (0 breakpoints)"),this.requestUpdate()}_addWaypointToEdge(t,i,e){var u,p;const o=this._edgeWaypoints.get(t)?[...this._edgeWaypoints.get(t)]:[];if(o.length>=2){this.showToast("Maximum 2 breakpoints per line");return}const n=mt(i,e,t,o.length,((u=this._graph)==null?void 0:u.states)||{},((p=this._graph)==null?void 0:p.transitions)||[],this._edgeWaypoints,et,10),d=n.x,c=n.y;o.push([d,c]),this._edgeWaypoints.set(t,o),this._activePopover={type:"waypoint",id:t,index:o.length-1,worldX:d,worldY:c},this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.showToast(`✓ Added breakpoint (${o.length}/2)`),this.requestUpdate()}_resetNode(t){var i,e;if(this._defaultLayout&&this._defaultLayout[t]&&((e=(i=this._graph)==null?void 0:i.states)!=null&&e[t])){const o=this._defaultLayout[t];this._graph.states[t].x=o.x,this._graph.states[t].y=o.y,this._graph.states[t].w=o.w,this._graph.states[t].h=o.h;try{const n=localStorage.getItem("pi_workflow_layout_override");if(n){const d=JSON.parse(n);delete d[t],localStorage.setItem("pi_workflow_layout_override",JSON.stringify(d))}}catch{}this._activePopover=null,this.emit("flow:layout-change",{nodeId:t,layout:this.exportLayoutSnapshot()}),this.showToast(`✓ Reset ${t} position`),this.requestUpdate()}}_renderPopoverContent(){var t,i;if(!this._activePopover)return"";if(this._activePopover.type==="waypoint"){const e=this._activePopover.id,o=this._edgeWaypoints.get(e)||[];return`
        <span class="flow-fab-label">
          Breakpoint #${(this._activePopover.index??0)+1} of ${o.length}
          <span class="flow-fab-badge">${Math.round(this._activePopover.worldX)}, ${Math.round(this._activePopover.worldY)}</span>
        </span>
        <button type="button" class="flow-fab-btn danger" data-action="remove-waypoint" title="Remove this breakpoint">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          Remove
        </button>
        <button type="button" class="flow-fab-close" data-action="close-popover" title="Close">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `}if(this._activePopover.type==="edge"){const e=this._activePopover.id,o=this._edgeWaypoints.get(e)||[],n=o.length>0,d=o.length<2;return`
        <span class="flow-fab-label">
          ${v(this._activePopover.label||e)}
          <span class="flow-fab-badge">${n?`${o.length}/2 bp`:"Straight (0 bp)"}</span>
        </span>
        ${n?`<button type="button" class="flow-fab-btn warning" data-action="reset-edge" title="Straighten line (remove all breakpoints)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                Straighten
              </button>`:""}
        ${d?`<button type="button" class="flow-fab-btn primary" data-action="add-waypoint" title="Add a breakpoint (${o.length+1}/2)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Breakpoint
              </button>`:""}
        <button type="button" class="flow-fab-close" data-action="close-popover" title="Close">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `}if(this._activePopover.type==="node"){const e=this._activePopover.id,o=(i=(t=this._graph)==null?void 0:t.states)==null?void 0:i[e];return`
        <span class="flow-fab-label">
          ${v(this._activePopover.label||e)}
          <span class="flow-fab-badge">${Math.round((o==null?void 0:o.x)||0)}, ${Math.round((o==null?void 0:o.y)||0)}</span>
        </span>
        <button type="button" class="flow-fab-btn warning" data-action="reset-node" title="Reset node position to default">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
          Reset Position
        </button>
        <button type="button" class="flow-fab-close" data-action="close-popover" title="Close">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `}return""}get toolMode(){return this._toolMode}set toolMode(t){this._toolMode=t,this._activePopover=null,this.emit("flow:tool-mode-change",{toolMode:this._toolMode}),this._toolMode==="move"?this.showToast("Move Mode Active (Drag nodes, labels & lines to reposition · M to exit)"):this._toolMode==="edit"&&this.showToast("Edit Mode Active (Click labels, waypoints & nodes for actions · E to exit)"),this.requestUpdate()}get isEditMode(){return this._toolMode==="edit"}set isEditMode(t){this.toolMode=t?"edit":"view"}get isMoveMode(){return this._toolMode==="move"}set isMoveMode(t){this.toolMode=t?"move":"view"}get activeStateId(){return this._activeStateId}set activeStateId(t){this._activeStateId=t,this.requestUpdate()}get selectedNodeId(){return this._selectedNodeId}set selectedNodeId(t){this._selectedNodeId=t,this.requestUpdate()}get selectedEdgeId(){return this._selectedEdgeId}set selectedEdgeId(t){this._selectedEdgeId=t,this.requestUpdate()}get showMinimap(){return this._showMinimap}set showMinimap(t){this._showMinimap=!!t;try{localStorage.setItem("pi_workflow_minimap_open",JSON.stringify(this._showMinimap))}catch{}this.requestUpdate()}get showInspector(){return this._showInspector}set showInspector(t){this._showInspector=!!t,this.requestUpdate()}get theme(){return this._theme}set theme(t){this._theme=t,this.setAttribute("data-theme",t),this.requestUpdate()}get camera(){return this._camera}set camera(t){this._camera=t,this._saveCamera(),this.requestUpdate()}connectedCallback(){super.connectedCallback();try{const t=localStorage.getItem("pi_workflow_minimap_open");t!==null?this._showMinimap=JSON.parse(t):this._showMinimap=!0;const i=localStorage.getItem("pi_workflow_inspector_open");i!==null?this._showInspector=JSON.parse(i):this._showInspector=!0;const e=localStorage.getItem("pi_workflow_camera");if(e!==null){const o=JSON.parse(e);o&&typeof o.scale=="number"&&typeof o.panX=="number"&&(this._camera=o,this._hasRestoredCamera=!0)}}catch{}window.addEventListener("keydown",this.handleKeyDown),window.addEventListener("resize",this.handleResize)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.handleKeyDown),window.removeEventListener("resize",this.handleResize),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("pointerup",this.handlePointerUp),window.removeEventListener("pointermove",this.handleNodePointerMove),window.removeEventListener("pointerup",this.handleNodePointerUp),window.removeEventListener("pointermove",this.handleWaypointPointerMove),window.removeEventListener("pointerup",this.handleWaypointPointerUp)}_saveCamera(){try{localStorage.setItem("pi_workflow_camera",JSON.stringify(this._camera))}catch{}}_toggleMinimap(){this.showMinimap=!this._showMinimap}_toggleInspector(){this._showInspector=!this._showInspector;try{localStorage.setItem("pi_workflow_inspector_open",JSON.stringify(this._showInspector))}catch{}this.requestUpdate()}_closeInspector(){this._showInspector=!1;try{localStorage.setItem("pi_workflow_inspector_open",JSON.stringify(!1))}catch{}this.requestUpdate()}fitToViewport(){const t=this.getBoundingClientRect(),i=t.width||900,e=t.height||700,o=this._showInspector?Math.min(420,i*.45):0,n=i-o,d=Ut({width:n,height:e},this._bounds);this._camera={scale:d.scale,panX:d.panX,panY:d.panY},this._saveCamera(),this.requestUpdate()}centerOnState(t){var u;if(!((u=this._graph)!=null&&u.states[t]))return;const i=this._graph.states[t],e=this.getBoundingClientRect(),o=e.width||900,n=e.height||700,d=this._showInspector?Math.min(420,o*.45):0,c=o-d;this._camera=At({width:c,height:n},i),this._activeStateId=t,this._selectedNodeId=t,this._selectedEdgeId=null,this._saveCamera(),this.requestUpdate()}showToast(t){this._toastMessage=t,this._toastTimeout&&clearTimeout(this._toastTimeout),this.requestUpdate(),this._toastTimeout=setTimeout(()=>{this._toastMessage=null,this.requestUpdate()},2500)}exportLayoutSnapshot(){var e;this._syncWaypointsToGraph();const t=this._snapshotGraphLayout(this._graph),i={...t.nodes,nodes:t.nodes,edges:t.edges,activeDiagramId:this._activeSubgraphId};if((e=this._rootGraph)!=null&&e.subgraphs&&Object.keys(this._rootGraph.subgraphs).length>0){const o={overview:this._snapshotGraphLayout(this._rootGraph)};for(const[n,d]of Object.entries(this._rootGraph.subgraphs))o[n]=this._snapshotGraphLayout(d);o[this._diagramIdForActive()]=t,i.diagrams=o}return i}async copyLayoutSnapshot(){const t=this.exportLayoutSnapshot(),i=t.diagrams?{diagrams:t.diagrams}:{nodes:t.nodes||{},edges:t.edges||{}},e=`window.WORKFLOW_LAYOUT = ${JSON.stringify(i,null,2)};
`;try{typeof navigator<"u"&&navigator.clipboard&&navigator.clipboard.writeText&&await navigator.clipboard.writeText(e)}catch{}try{t.diagrams?localStorage.setItem("pi_workflow_layout_override",JSON.stringify(t.diagrams)):localStorage.setItem("pi_workflow_layout_override",JSON.stringify(t.nodes||{})),this._saveEdgeWaypoints()}catch{}return console.log(`Exported layout JS:
`+e),this.showToast(t.diagrams?"✓ Multi-diagram layout JS copied to clipboard!":"✓ Layout JS copied to clipboard!"),this.emit("flow:snapshot-layout",{snapshot:t,code:e,json:i}),e}updateNode(t,i){var o,n;const e=(n=(o=this._graph)==null?void 0:o.states)==null?void 0:n[t];return e?(Object.assign(e,i,{id:t}),this.emit("flow:graph-change",{op:"update-node",nodeId:t,node:e,diagramId:this._diagramIdForActive(),graph:this._graph,rootGraph:this._rootGraph}),this.requestUpdate(),e):null}updateEdge(t,i){var o,n;const e=(n=(o=this._graph)==null?void 0:o.transitions)==null?void 0:n.find(d=>d.id===t);return e?(Object.assign(e,i,{id:t}),this.emit("flow:graph-change",{op:"update-edge",edgeId:t,edge:e,diagramId:this._diagramIdForActive(),graph:this._graph,rootGraph:this._rootGraph}),this.requestUpdate(),e):null}exportFsmPatch(){this._syncWaypointsToGraph();const t=this._rootGraph||this._graph,i={},e=[],o=["overview"],n=(c,u)=>{if(c){if(c.states)for(const[p,l]of Object.entries(c.states))u&&l.targetSubgraph||(i[p]={id:p,label:l.label,summary:l.summary,procedure:l.procedure?[...l.procedure]:void 0,substates:l.substates?[...l.substates]:void 0,kind:l.kind,permission:l.permission,targetSubgraph:l.targetSubgraph});if(c.transitions)for(const p of c.transitions)p.customData&&p.customData.aggregate||e.some(l=>l.id===p.id)||e.push({id:p.id,from:p.from,to:p.to,label:p.label,event:p.event,description:p.description,userMediated:p.userMediated,bidirectional:p.bidirectional})}};if(n(t,!!(t!=null&&t.subgraphs&&Object.keys(t.subgraphs).length>0)),t!=null&&t.subgraphs)for(const[c,u]of Object.entries(t.subgraphs))o.push(c),n(u,!1);const d={version:t==null?void 0:t.version,states:i,transitions:e,diagrams:o};return this.emit("flow:export-fsm-patch",{patch:d}),d}async copyFsmPatch(){var e;const t=this.exportFsmPatch(),i=JSON.stringify(t,null,2)+`
`;try{typeof navigator<"u"&&((e=navigator.clipboard)!=null&&e.writeText)&&await navigator.clipboard.writeText(i)}catch{}return console.log(`Exported FSM patch:
`+i),this.showToast("✓ FSM patch JSON copied to clipboard!"),i}resetLayout(){var i;if(!this._defaultLayout||!((i=this._graph)!=null&&i.states))return;for(const[e,o]of Object.entries(this._defaultLayout))this._graph.states[e]&&(this._graph.states[e].x=o.x,this._graph.states[e].y=o.y,this._graph.states[e].w=o.w,this._graph.states[e].h=o.h);this._edgeWaypoints.clear();try{localStorage.removeItem("pi_workflow_layout_override"),localStorage.removeItem("pi_workflow_edge_override")}catch{}const t=this._graph.framing!==!1;this._bounds=ft(this._graph.states,t?64:40,t?56:30,t?46:0,this._graph.groups),this.showToast("✓ Reset layout to default"),this.emit("flow:reset-layout"),this.requestUpdate()}zoomBy(t){const i=this.getBoundingClientRect(),e=i.width/2,o=i.height/2;this._camera=ut(this._camera,e,o,t,tt,it),this._saveCamera(),this.requestUpdate()}zoomTo(t=1){const i=this.getBoundingClientRect(),e=i.width/2,o=i.height/2,n=this._camera.scale||1,d=t/n;this._camera=ut(this._camera,e,o,d,tt,it),this._saveCamera(),this.requestUpdate()}resetZoom(){this.zoomTo(1)}_startNodeDrag(t,i){var o;const e=(o=this._graph)==null?void 0:o.states[t];e&&(this._draggedNodeId=t,this._nodeDragMoved=!1,this._activeGuides=[],this._dragNodeStart={startX:i.clientX,startY:i.clientY,nodeOrigX:e.x,nodeOrigY:e.y},window.addEventListener("pointermove",this.handleNodePointerMove),window.addEventListener("pointerup",this.handleNodePointerUp),this.requestUpdate())}_startWaypointDrag(t,i,e){const o=this._edgeWaypoints.get(t);if(!o||!o[i])return;const n=o[i];this._draggedWaypoint={edgeId:t,waypointIndex:i,startX:e.clientX,startY:e.clientY,origX:n[0],origY:n[1]},this._activeGuides=[],window.addEventListener("pointermove",this.handleWaypointPointerMove),window.addEventListener("pointerup",this.handleWaypointPointerUp),this.requestUpdate()}_syncWaypointsToGraph(){var t;if((t=this._graph)!=null&&t.transitions)for(const i of this._graph.transitions){const e=this._edgeWaypoints.get(i.id);e&&e.length>0?i.waypoints=e.map(([o,n])=>[o,n]):delete i.waypoints}}_diagramIdForActive(){return this._activeSubgraphId||"overview"}_snapshotGraphLayout(t){const i={};if(t!=null&&t.states)for(const[o,n]of Object.entries(t.states))i[o]={x:Math.round(n.x),y:Math.round(n.y),w:Math.round(n.w),h:Math.round(n.h)};const e={};if(t!=null&&t.transitions)for(const o of t.transitions)o.waypoints&&o.waypoints.length>0&&(e[o.id]=o.waypoints.map(([n,d])=>[Math.round(n),Math.round(d)]));return{nodes:i,edges:e}}_saveEdgeWaypoints(){this._syncWaypointsToGraph();try{const t={};for(const[d,c]of this._edgeWaypoints.entries())c&&c.length>0&&(t[d]=c);const i=this._diagramIdForActive();let e={};try{const d=localStorage.getItem("pi_workflow_edge_override");d&&(e=JSON.parse(d)||{})}catch{e={}}const o=e.diagrams&&typeof e.diagrams=="object"?{...e.diagrams}:{};!e.diagrams&&Object.keys(e).length>0&&Object.values(e).every(d=>Array.isArray(d))&&(o.overview=e),o[i]=t,localStorage.setItem("pi_workflow_edge_override",JSON.stringify({diagrams:o}))}catch{}}render(){var C,L,S,P,g,I,X,A,W;if(!this.shadowRootNode)return;if(!this._graph){this.shadowRootNode.innerHTML=`
        <div class="canvas-root" style="display:flex;align-items:center;justify-content:center;color:var(--tuto-muted);">
          No flow graph loaded
        </div>
      `;return}const t=this._graph.states,i=this._graph.transitions||[],e=qt(Wt(i));for(const a of e){this._edgeWaypoints.has(a.id)?a.waypoints=this._edgeWaypoints.get(a.id):a.waypoints=void 0;const f=jt(a,t);f&&(a.route=f)}const o=this._selectedNodeId||this._activeStateId||null,n=this._toolMode==="move",d=this._toolMode==="edit",c=n||d;let u="";if(d&&this._activePopover){const a=this._camera.panX+this._activePopover.worldX*this._camera.scale,f=this._camera.panY+this._activePopover.worldY*this._camera.scale;u=`
        <div class="flow-fab-popover" id="action-popover" style="left: ${a}px; top: ${f}px;">
          ${this._renderPopoverContent()}
        </div>
      `}let p="";if((C=this._rootGraph)!=null&&C.subgraphs&&Object.keys(this._rootGraph.subgraphs).length>0&&this._showSubgraphNav){const a=(f,w)=>{var y;const m=(w||f||"").trim(),z=((y=m.split(/[·•|]/)[0])==null?void 0:y.trim())||m;return/^align$/i.test(f)||/^align\b/i.test(z)?"Align":/^spec$/i.test(f)||/^spec\b/i.test(z)?"Spec":/^vibe$/i.test(f)||/^vibe\b/i.test(z)?"Vibe":z.length<=12?z:f};p=`
        <div class="flow-subgraph-bar" id="subgraph-bar" role="tablist" aria-label="Diagram">
          <div class="flow-subgraph-tabs">
            <button type="button" role="tab" class="flow-subgraph-tab ${this._activeSubgraphId?"":"active"}" data-subgraph="__root__" aria-selected="${!this._activeSubgraphId}">Overview</button>
            ${Object.entries(this._rootGraph.subgraphs).map(([f,w])=>{const m=this._activeSubgraphId===f;return`
              <button type="button" role="tab" class="flow-subgraph-tab ${m?"active":""}" data-subgraph="${v(f)}" aria-selected="${m}">
                ${v(a(f,w.title))}
              </button>`}).join("")}
          </div>
        </div>
      `}this.shadowRootNode.innerHTML=`
      <div class="canvas-root ${n?"move-mode edit-mode":d?"edit-mode":""}">
        ${this._toastMessage?`<div class="flow-toast">${v(this._toastMessage)}</div>`:""}
        ${u}
        ${p}

        <svg class="flow-svg" id="flow-svg">
          <defs>
            <pattern
              id="flow-grid-pattern"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
              patternTransform="translate(${this._camera.panX}, ${this._camera.panY}) scale(${this._camera.scale})"
            >
              <circle cx="10" cy="10" r="1.2" fill="var(--tuto-grid, rgba(255, 255, 255, 0.05))" />
            </pattern>
            <!-- End markers: tip at +X. Start markers: same geometry + auto-start-reverse (do not pre-flip path or the reverse tip vanishes into the node). -->
            <marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse" markerUnits="strokeWidth">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--tuto-edge, #5b6477)" />
            </marker>
            <marker id="flow-arrow-hot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse" markerUnits="strokeWidth">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
            <marker id="flow-arrow-init" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse" markerUnits="strokeWidth">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ffffff" />
            </marker>
            <marker id="flow-arrow-start" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse" markerUnits="strokeWidth">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--tuto-edge, #5b6477)" />
            </marker>
            <marker id="flow-arrow-start-hot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse" markerUnits="strokeWidth">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
            <marker id="flow-arrow-start-init" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse" markerUnits="strokeWidth">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ffffff" />
            </marker>
          </defs>

          <!-- Infinite Grid -->
          <rect width="100%" height="100%" fill="url(#flow-grid-pattern)" />

          <!-- Root Transform Viewport -->
          <g id="viewport-root" transform="translate(${this._camera.panX}, ${this._camera.panY}) scale(${this._camera.scale})">
            ${this._graph.framing!==!1&&this._graph.title?`<!-- Machine Outer Framing Card -->
            <g class="machine-frame">
              <rect
                x="${this._bounds.x}"
                y="${this._bounds.y}"
                width="${this._bounds.w}"
                height="${this._bounds.h}"
                rx="16"
                fill="var(--tuto-card-bg, #141820)"
                fill-opacity="0.5"
                stroke="var(--tuto-border, #283040)"
                stroke-width="1.2"
              />
              <text x="${this._bounds.x+20}" y="${this._bounds.y+28}" fill="var(--tuto-text, #ffffff)" font-size="12" font-weight="700" letter-spacing="0.05em" font-family="var(--tuto-font-sans, sans-serif)">${v(this._graph.title.toUpperCase())}</text>
              ${this._graph.subtitle?`<text x="${this._bounds.x+20+this._graph.title.length*7.5+16}" y="${this._bounds.y+28}" fill="var(--tuto-muted, #64748b)" font-size="11" font-family="var(--tuto-font-sans, sans-serif)">${v(this._graph.subtitle)}</text>`:""}
              <text x="${this._bounds.x+this._bounds.w-20}" y="${this._bounds.y+28}" fill="var(--tuto-muted, #64748b)" font-size="11" font-family="var(--tuto-font-mono, monospace)" text-anchor="end">${v(this._graph.version||"v1.0")}</text>
            </g>`:""}

            <!-- Groups Background Layer -->
            <g id="groups-group"></g>

            <!-- Guidelines Layer -->
            <g id="guidelines-group"></g>

            <!-- Edge Lines Layer -->
            <g id="edges-paths-group"></g>

            <!-- Edge Labels Layer (ALWAYS on top of edge lines) -->
            <g id="edges-pills-group"></g>

            <!-- Waypoint Handles Layer (on top of pills and lines) -->
            <g id="edges-handles-group"></g>

            <!-- Nodes Group -->
            <g id="nodes-group"></g>
          </g>
        </svg>

        <!-- Floating UI Overlays -->
        <div class="floating-toolbar">
          <tuto-flow-toolbar id="toolbar-el"></tuto-flow-toolbar>
        </div>

        <div class="floating-minimap ${this._showMinimap?"":"hidden"}">
          <tuto-flow-minimap id="minimap-el"></tuto-flow-minimap>
        </div>

        <!-- Inspector Drawer Sidebar -->
        <tuto-flow-inspector id="inspector-el"></tuto-flow-inspector>
      </div>
    `;const l=this.shadowRootNode.querySelector("svg.flow-svg");l&&(l.addEventListener("wheel",this.handleWheel,{passive:!1}),l.addEventListener("pointerdown",this.handlePointerDown));const k=this.shadowRootNode.getElementById("groups-group"),E=this.shadowRootNode.getElementById("guidelines-group"),M=this.shadowRootNode.getElementById("edges-paths-group"),_=this.shadowRootNode.getElementById("edges-pills-group"),N=this.shadowRootNode.getElementById("edges-handles-group"),q=this.shadowRootNode.getElementById("nodes-group");if(E&&this._activeGuides.length>0)for(const a of this._activeGuides)a.type==="vertical"?(U("line",{x1:a.pos,y1:a.start,x2:a.pos,y2:a.end,class:"flow-guideline"},E),U("circle",{cx:a.pos,cy:a.start+12,r:2.5,class:"flow-guideline-dot"},E),U("circle",{cx:a.pos,cy:a.end-12,r:2.5,class:"flow-guideline-dot"},E)):(U("line",{x1:a.start,y1:a.pos,x2:a.end,y2:a.pos,class:"flow-guideline"},E),U("circle",{cx:a.start+12,cy:a.pos,r:2.5,class:"flow-guideline-dot"},E),U("circle",{cx:a.end-12,cy:a.pos,r:2.5,class:"flow-guideline-dot"},E));if(this._graph.groups)for(const a of this._graph.groups){const f=U("g",{class:"flow-group-container"},k),w=a.accent||"#3b82f6";U("rect",{x:a.x,y:a.y,width:a.w,height:a.h,rx:14,fill:"var(--tuto-card-bg, #12161c)","fill-opacity":"0.38",stroke:w,"stroke-width":1.2,"stroke-opacity":"0.35"},f),U("path",{d:`M ${a.x} ${a.y+14} Q ${a.x} ${a.y} ${a.x+14} ${a.y} L ${a.x+a.w-14} ${a.y} Q ${a.x+a.w} ${a.y} ${a.x+a.w} ${a.y+14} L ${a.x+a.w} ${a.y+28} L ${a.x} ${a.y+28} Z`,fill:w,"fill-opacity":"0.12"},f);const m=U("text",{x:a.x+14,y:a.y+18,fill:w,"font-size":10.5,"font-weight":800,"letter-spacing":"0.08em","font-family":"var(--tuto-font-mono, monospace)"},f);m.textContent=a.label.toUpperCase()}if(this._graph.initial&&t[this._graph.initial]){const a=t[this._graph.initial],f=a.x-14,w=a.y+a.h/2,m=a.x,z=a.y+a.h/2,y=U("g",{class:"flow-initial-indicator"},M);U("circle",{cx:f-4,cy:w,r:4,fill:"#ffffff"},y),U("path",{d:`M ${f} ${w} L ${m} ${z}`,stroke:"#ffffff","stroke-width":2,fill:"none","marker-end":"url(#flow-arrow-init)"},y)}for(const a of e){if(!a.route||!a.route.points||a.route.points.length<2)continue;const f=!!(this._selectedNodeId&&a.from===this._selectedNodeId),w=!!(this._selectedNodeId&&a.to===this._selectedNodeId),m=!!a.bidirectional,z=f||w;if(this._selectedNodeId&&!z)continue;const y=a.id===this._selectedEdgeId;a.id,this._hoveredEdgeId;const j=y||f||m&&w,V=this._selectedNodeId?w&&!m&&!j:!1,K=!!((a.self||a.from===a.to)&&(!a.waypoints||a.waypoints.length===0)),Lt=Xt(a.route.points,K,12),Nt=j?"url(#flow-arrow-hot)":V?"url(#flow-arrow)":"url(#flow-arrow-init)",rt=m?j?"url(#flow-arrow-start-hot)":V?"url(#flow-arrow-start)":"url(#flow-arrow-start-init)":void 0,bt={d:Lt,class:`flow-edge-path ${j?"hot available":""} ${V?"dimmed":""} ${y?"selected":""}`,stroke:j?"#38bdf8":V?"#334155":"#64748b","stroke-width":j?2.8:V?1.4:1.8,fill:"none","marker-end":Nt};rt&&(bt["marker-start"]=rt),U("path",bt,M).addEventListener("click",D=>{var Y,H;if(D.stopPropagation(),!n){if(d){const F=D,lt=this.getBoundingClientRect(),ct=this._camera.scale||1,vt=(F.clientX-lt.left-this._camera.panX)/ct,wt=(F.clientY-lt.top-this._camera.panY)/ct;this._activePopover={type:"edge",id:a.id,worldX:((Y=a.route)==null?void 0:Y.seatX)||vt,worldY:((H=a.route)==null?void 0:H.seatY)||wt,label:Z},this._selectedEdgeId=a.id,this.requestUpdate();return}a.to?(this._activeStateId=a.to,this._selectedNodeId=a.to,this._selectedEdgeId=a.id,this.emit("flow:transition",{from:a.from,to:a.to,event:a.event}),t[a.to]&&this.emit("flow:select-node",{node:t[a.to]}),this.requestUpdate()):(this._selectedEdgeId=a.id,this.emit("flow:select-edge",{edge:a}),this.requestUpdate())}});const Z=a.event||a.label||"",ot=Math.max(76,Math.min(240,Z.length*8+28)),dt=28,Pt=a.route.seatX-ot/2,Rt=a.route.seatY-dt/2,se=((L=this._draggedWaypoint)==null?void 0:L.edgeId)===a.id,nt=f||m&&w||!this._selectedNodeId,Q=U("g",{class:`flow-edge-pill ${nt?"available":"dimmed"} ${se?"dragging":""}`,transform:`translate(${Pt}, ${Rt})`},_);U("rect",{width:ot,height:dt,rx:14,fill:nt?"#3b82f6":"#202636",stroke:nt?"#93c5fd":"rgba(255, 255, 255, 0.12)","stroke-width":nt?2:1,filter:nt?"drop-shadow(0 4px 14px rgba(59, 130, 246, 0.55))":"drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))"},Q);const ie=U("text",{x:ot/2,y:dt/2,"text-anchor":"middle","dominant-baseline":"central",fill:nt?"#ffffff":"#94a3b8","font-size":11,"font-weight":800,"letter-spacing":"0.04em","font-family":"var(--tuto-font-sans, sans-serif)"},Q);if(ie.textContent=Z,n?Q.addEventListener("pointerdown",D=>{var ct,vt,wt;if(D.button!==0)return;D.stopPropagation();let Y=this._edgeWaypoints.get(a.id)?[...this._edgeWaypoints.get(a.id)]:[],H=0;const F=((ct=a.route)==null?void 0:ct.seatX)||Pt+ot/2,lt=((vt=a.route)==null?void 0:vt.seatY)||Rt+dt/2;if(Y.length===0){const ht=mt(F,lt,a.id,0,t,((wt=this._graph)==null?void 0:wt.transitions)||[],this._edgeWaypoints,et,10);Y=[[ht.x,ht.y]],this._edgeWaypoints.set(a.id,Y),this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),H=0}else{let ht=0,Gt=1/0;for(let pt=0;pt<Y.length;pt++){const Ht=Math.hypot(Y[pt][0]-F,Y[pt][1]-lt);Ht<Gt&&(Gt=Ht,ht=pt)}H=ht}this._startWaypointDrag(a.id,H,D)}):d?(Q.addEventListener("pointerdown",D=>D.stopPropagation()),Q.addEventListener("click",D=>{var Y,H;D.stopPropagation(),this._activePopover={type:"edge",id:a.id,worldX:((Y=a.route)==null?void 0:Y.seatX)||Pt+ot/2,worldY:((H=a.route)==null?void 0:H.seatY)||Rt+dt/2,label:Z},this._selectedEdgeId=a.id,this.requestUpdate()})):(Q.addEventListener("pointerdown",D=>D.stopPropagation()),Q.addEventListener("click",D=>{D.stopPropagation(),a.to&&(this._activeStateId=a.to,this._selectedNodeId=a.to,this._selectedEdgeId=a.id,this.emit("flow:transition",{from:a.from,to:a.to,event:a.event}),t[a.to]&&this.emit("flow:select-node",{node:t[a.to]}),this.requestUpdate())})),Q.addEventListener("dblclick",D=>{D.stopPropagation(),this._selectedEdgeId=a.id,this._showInspector=!0,this.requestUpdate()}),c&&a.waypoints&&a.waypoints.length>0)for(let D=0;D<a.waypoints.length;D++){const Y=a.waypoints[D],H=U("circle",{cx:Y[0],cy:Y[1],r:6,class:"flow-waypoint-handle",fill:"#ffffff",stroke:"#0284c7","stroke-width":2.2},N);n?H.addEventListener("pointerdown",F=>{F.button===0&&(F.stopPropagation(),this._startWaypointDrag(a.id,D,F))}):d&&(H.addEventListener("pointerdown",F=>F.stopPropagation()),H.addEventListener("click",F=>{F.stopPropagation(),this._activePopover={type:"waypoint",id:a.id,index:D,worldX:Y[0],worldY:Y[1]},this.requestUpdate()}))}}for(const a of Object.values(t)){const f=U("foreignObject",{x:a.x,y:a.y,width:a.w,height:a.h,style:n?"cursor: grab;":""},q);f.addEventListener("pointerdown",m=>m.stopPropagation());const w=document.createElement("tuto-flow-node");if(w.node=a,w.selected=o===a.id,w.draggableNode=n,w.isDragging=this._draggedNodeId===a.id,n)w.addEventListener("pointerdown",m=>{m.button===0&&(m.stopPropagation(),this._startNodeDrag(a.id,m))});else if(d)w.addEventListener("pointerdown",m=>m.stopPropagation()),w.addEventListener("click",m=>{m.stopPropagation(),this._activePopover={type:"node",id:a.id,worldX:a.x+a.w/2,worldY:a.y,label:a.label||a.id},this.requestUpdate()});else{w.addEventListener("pointerdown",z=>{z.stopPropagation()});const m=z=>{z.stopPropagation();const y=a.id;this._selectedNodeId===y?(this._selectedNodeId=null,this._activeStateId=null,this._selectedEdgeId=null,this.emit("flow:select-node",{node:null})):(this._selectedNodeId=y,this._activeStateId=y,this._selectedEdgeId=null,this.emit("flow:select-node",{node:a})),this.requestUpdate()};w.addEventListener("flow:select-node",m),w.addEventListener("click",m)}w.addEventListener("dblclick",m=>{var y,j,V,K;m.stopPropagation();const z=a.targetSubgraph||a.subgraphId||((j=(y=this._rootGraph)==null?void 0:y.subgraphs)!=null&&j[a.id]?a.id:null);if(z&&((K=(V=this._rootGraph)==null?void 0:V.subgraphs)!=null&&K[z])){this.selectSubgraph(z);return}this._selectedNodeId=a.id,this._activeStateId=a.id,this._selectedEdgeId=null,this._showInspector=!0,this.requestUpdate()}),f.appendChild(w)}const R=this.shadowRootNode.getElementById("subgraph-bar");R&&(R.addEventListener("pointerdown",f=>f.stopPropagation()),R.addEventListener("mousedown",f=>f.stopPropagation()),R.querySelectorAll("[data-subgraph]").forEach(f=>{f.addEventListener("click",w=>{w.stopPropagation();const m=f.getAttribute("data-subgraph");this.selectSubgraph(m)})}));const $=this.shadowRootNode.getElementById("action-popover");if($){$.addEventListener("pointerdown",y=>y.stopPropagation());const a=$.querySelector("[data-action='remove-waypoint']");a&&((S=this._activePopover)==null?void 0:S.type)==="waypoint"&&a.addEventListener("click",y=>{y.stopPropagation(),this._removeWaypoint(this._activePopover.id,this._activePopover.index)});const f=$.querySelector("[data-action='reset-edge']");f&&((P=this._activePopover)==null?void 0:P.type)==="edge"&&f.addEventListener("click",y=>{y.stopPropagation(),this._resetEdge(this._activePopover.id)});const w=$.querySelector("[data-action='add-waypoint']");w&&((g=this._activePopover)==null?void 0:g.type)==="edge"&&w.addEventListener("click",y=>{y.stopPropagation(),this._addWaypointToEdge(this._activePopover.id,this._activePopover.worldX,this._activePopover.worldY)});const m=$.querySelector("[data-action='reset-node']");m&&((I=this._activePopover)==null?void 0:I.type)==="node"&&m.addEventListener("click",y=>{y.stopPropagation(),this._resetNode(this._activePopover.id)});const z=$.querySelector("[data-action='close-popover']");z&&z.addEventListener("click",y=>{y.stopPropagation(),this._activePopover=null,this.requestUpdate()})}const B=this.shadowRootNode.getElementById("toolbar-el");B&&(B.zoom=Math.round(this._camera.scale*100),B.isMinimapActive=this._showMinimap,B.isInspectorActive=this._showInspector,B.toolMode=this._toolMode,B.addEventListener("flow:zoom-in",()=>this.zoomBy(1.2)),B.addEventListener("flow:zoom-out",()=>this.zoomBy(.8333333333333334)),B.addEventListener("flow:zoom-reset",()=>this.zoomTo(1)),B.addEventListener("flow:fit",()=>this.fitToViewport()),B.addEventListener("flow:reset",()=>{this._selectedNodeId=null,this._selectedEdgeId=null,this._showInspector=!1,this.fitToViewport()}),B.addEventListener("flow:toggle-minimap",()=>{this._toggleMinimap()}),B.addEventListener("flow:toggle-move-mode",()=>{this.toolMode=this._toolMode==="move"?"view":"move"}),B.addEventListener("flow:toggle-edit-mode",()=>{this.toolMode=this._toolMode==="edit"?"view":"edit"}),B.addEventListener("flow:snapshot-layout",()=>{this.copyLayoutSnapshot()}),B.addEventListener("flow:reset-layout",()=>{this.resetLayout()}),B.addEventListener("flow:toggle-inspector",()=>{this._toggleInspector()}));const O=this.shadowRootNode.getElementById("minimap-el");if(O){const a=this.getBoundingClientRect();O.bounds=this._bounds,O.camera=this._camera,O.viewportSize={width:a.width||900,height:a.height||700},O.nodes=((X=this._graph)==null?void 0:X.states)||{},O.transitions=((A=this._graph)==null?void 0:A.transitions)||[],O.groups=((W=this._graph)==null?void 0:W.groups)||[],O.selectedNodeId=this._selectedNodeId,O.addEventListener("flow:pan-to",f=>{const w=f;if(w.detail){const{worldX:m,worldY:z}=w.detail,y=this.getBoundingClientRect(),j=y.width||900,V=y.height||700,K=this._camera.scale||1;this._camera={...this._camera,panX:j/2-m*K,panY:V/2-z*K},this._saveCamera(),this.requestUpdate()}}),O.addEventListener("flow:close-minimap",()=>{this.showMinimap=!1})}const x=this.shadowRootNode.getElementById("inspector-el");if(x){if(x.isOpen=this._showInspector,x.graph=this._graph,x.tools=this._graph.tools||[],this._selectedNodeId&&t[this._selectedNodeId])x.node=t[this._selectedNodeId];else if(this._selectedEdgeId){const a=i.find(f=>f.id===this._selectedEdgeId)||e.find(f=>f.id===this._selectedEdgeId);x.edge=a||null}else x.node=null,x.edge=null;x.addEventListener("flow:close-inspector",()=>{this._closeInspector()}),x.addEventListener("flow:select-subgraph",a=>{var w;const f=a;(w=f.detail)!=null&&w.subgraphId&&this.selectSubgraph(f.detail.subgraphId)})}}}return h($t,"styles",`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--tuto-bg, #090a0f);
      color: var(--tuto-text, #f1f5f9);
      font-family: var(--tuto-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      user-select: none;
    }
    .canvas-root {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    svg.flow-svg {
      width: 100%;
      height: 100%;
      display: block;
      cursor: grab;
    }
    svg.flow-svg.grabbing {
      cursor: grabbing;
    }
    .flow-guideline {
      stroke: #38bdf8;
      stroke-width: 1.5;
      stroke-dasharray: 4 4;
      opacity: 0.9;
      filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.85));
      pointer-events: none;
    }
    .flow-guideline-dot {
      fill: #38bdf8;
      stroke: #ffffff;
      stroke-width: 1;
      opacity: 0.95;
      pointer-events: none;
    }
    .flow-edge-path {
      fill: none;
      stroke: var(--tuto-edge, #64748b);
      stroke-width: 1.8;
      opacity: 0.65;
      stroke-dasharray: none !important;
      transition: stroke 160ms ease, stroke-width 160ms ease, opacity 160ms ease, filter 160ms ease;
      cursor: pointer;
    }
    .flow-edge-path.hot,
    .flow-edge-path.available,
    .flow-edge-path.selected {
      stroke: #38bdf8 !important;
      stroke-width: 2.8 !important;
      opacity: 1 !important;
      filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.85)) !important;
      cursor: pointer;
    }
    .flow-edge-path.hot:hover,
    .flow-edge-path.available:hover,
    .flow-edge-path.selected:hover {
      stroke-width: 3.4 !important;
      stroke: #60a5fa !important;
      filter: drop-shadow(0 0 12px rgba(59, 130, 246, 1)) !important;
    }
    .flow-edge-path.dimmed {
      stroke: #334155 !important;
      stroke-width: 1.4 !important;
      opacity: 0.25 !important;
      filter: none !important;
      cursor: default;
    }
    .flow-edge-pill {
      cursor: pointer;
      opacity: 0.85;
      transition: transform 160ms ease, opacity 160ms ease;
    }
    .flow-edge-pill.available,
    .flow-edge-pill.hot {
      cursor: pointer;
      opacity: 1;
    }
    .flow-edge-pill.dimmed {
      cursor: default;
      opacity: 0.35 !important;
    }
    .flow-edge-pill rect {
      transition: stroke 140ms ease, filter 140ms ease, fill 140ms ease, transform 140ms ease;
    }
    .flow-edge-pill.available rect,
    .flow-edge-pill.hot rect {
      fill: var(--tuto-hot, #3b82f6);
      stroke: #93c5fd;
      filter: drop-shadow(0 4px 14px rgba(59, 130, 246, 0.55));
    }
    .flow-edge-pill.available:hover rect,
    .flow-edge-pill.hot:hover rect {
      fill: #2563eb;
      stroke: #ffffff;
      filter: drop-shadow(0 6px 20px rgba(59, 130, 246, 0.85));
    }
    .flow-edge-pill text {
      transition: fill 140ms ease;
      pointer-events: none;
    }
    .flow-edge-pill.available text,
    .flow-edge-pill.hot text {
      fill: #ffffff;
      font-weight: 800;
    }
    .canvas-root.edit-mode .flow-edge-pill {
      cursor: grab !important;
      opacity: 0.95 !important;
    }
    .canvas-root.edit-mode .flow-edge-pill:hover rect {
      stroke: #38bdf8 !important;
      stroke-width: 2.2px !important;
      filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.75)) !important;
    }
    .canvas-root.edit-mode .flow-edge-pill.dragging rect {
      cursor: grabbing !important;
      stroke: #67e8f9 !important;
      fill: #0284c7 !important;
    }
    .flow-edge-hitarea {
      fill: none;
      stroke: transparent;
      stroke-width: 20;
      cursor: default;
    }
    .canvas-root.edit-mode .flow-edge-hitarea {
      cursor: grab;
    }
    .flow-waypoint-handle {
      cursor: move;
      transition: r 120ms ease, stroke-width 120ms ease;
    }
    .flow-waypoint-handle:hover {
      r: 7.5;
      stroke: #38bdf8;
      stroke-width: 2.8;
    }
    .flow-waypoint-split {
      cursor: crosshair;
      transition: r 120ms ease, fill-opacity 120ms ease;
    }
    .flow-waypoint-split:hover {
      r: 6.5;
      fill-opacity: 0.95;
      stroke-width: 2;
    }
    .floating-toolbar {
      position: absolute;
      left: 1rem;
      right: 1rem;
      bottom: 1rem;
      z-index: 20;
      pointer-events: none;
      display: flex;
    }
    .floating-minimap {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 20;
      transition: opacity 200ms ease, transform 200ms ease;
    }
    .floating-minimap.hidden {
      opacity: 0;
      pointer-events: none;
      transform: translateY(-10px);
    }
    .flow-toast {
      position: absolute;
      top: 1.25rem;
      left: 50%;
      transform: translateX(-50%);
      background: color-mix(in srgb, var(--tuto-panel-bg, #10131d) 94%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: #38bdf8;
      border: 1px solid #38bdf8;
      padding: 0.5rem 1.1rem;
      border-radius: 0.6rem;
      font-size: 0.8rem;
      font-weight: 700;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      z-index: 50;
      pointer-events: none;
      animation: fadeInDown 180ms ease forwards;
    }
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    /* FAB-style Floating Action Capsule (Click to Open, Stable) */
    .flow-fab-popover {
      position: absolute;
      z-index: 50;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.3rem 0.45rem;
      background: color-mix(in srgb, var(--tuto-panel-bg, #0b0f19) 97%, transparent);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--tuto-border, rgba(56, 189, 248, 0.4));
      border-radius: 9999px;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1);
      transform: translate(-50%, -100%) translateY(-12px);
      pointer-events: auto;
      user-select: none;
      animation: fabPopIn 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      font-family: var(--tuto-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      white-space: nowrap;
    }
    .flow-fab-popover::after {
      content: "";
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      width: 9px;
      height: 9px;
      background: inherit;
      border-right: 1px solid var(--tuto-border, rgba(56, 189, 248, 0.4));
      border-bottom: 1px solid var(--tuto-border, rgba(56, 189, 248, 0.4));
    }
    @keyframes fabPopIn {
      from {
        opacity: 0;
        transform: translate(-50%, -100%) translateY(-2px) scale(0.92);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -100%) translateY(-12px) scale(1);
      }
    }
    .flow-fab-label {
      font-size: 11px;
      font-weight: 700;
      color: #f1f5f9;
      padding: 0 0.35rem 0 0.2rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .flow-fab-badge {
      font-family: var(--tuto-font-mono, monospace);
      font-size: 9.5px;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.08);
      padding: 1px 5px;
      border-radius: 4px;
    }
    .flow-fab-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.3rem;
      height: 26px;
      padding: 0 0.55rem;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 120ms ease;
      font-family: inherit;
      color: #ffffff;
      line-height: 1;
    }
    .flow-fab-btn.danger {
      background: #ef4444;
      border-color: #f87171;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.45);
    }
    .flow-fab-btn.danger:hover {
      background: #dc2626;
      transform: scale(1.05);
    }
    .flow-fab-btn.warning {
      background: #f59e0b;
      border-color: #fbbf24;
      color: #0f172a;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.45);
    }
    .flow-fab-btn.warning:hover {
      background: #d97706;
      color: #ffffff;
      transform: scale(1.05);
    }
    .flow-fab-btn.primary {
      background: #3b82f6;
      border-color: #60a5fa;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.45);
    }
    .flow-fab-btn.primary:hover {
      background: #2563eb;
      transform: scale(1.05);
    }
    .flow-fab-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #94a3b8;
      cursor: pointer;
      transition: all 120ms ease;
      padding: 0;
      margin-left: 2px;
    }
    .flow-fab-close:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }

    /* Subgraph tab bar — minimal pills only (no long title breadcrumb) */
    .flow-subgraph-bar {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      z-index: 24;
      display: flex;
      align-items: center;
      gap: 0.2rem;
      background: color-mix(in srgb, var(--tuto-panel-bg, #10131d) 72%, transparent);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid color-mix(in srgb, var(--tuto-border, #30363d) 70%, transparent);
      border-radius: 999px;
      padding: 0.18rem;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
      user-select: none;
      opacity: 0.92;
    }
    .flow-subgraph-bar:hover {
      opacity: 1;
    }
    .flow-subgraph-tabs {
      display: flex;
      align-items: center;
      gap: 0.15rem;
    }
    .flow-subgraph-tab {
      background: transparent;
      border: 1px solid transparent;
      color: var(--tuto-text-muted, #94a3b8);
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      padding: 0.18rem 0.5rem;
      border-radius: 999px;
      cursor: pointer;
      transition: all 120ms ease;
      font-family: inherit;
      line-height: 1.2;
    }
    .flow-subgraph-tab:hover {
      color: #ffffff;
      border-color: color-mix(in srgb, #3b82f6 50%, transparent);
    }
    .flow-subgraph-tab.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }
    .flow-subgraph-tab:focus-visible {
      outline: 2px solid #93c5fd;
      outline-offset: 1px;
    }
  `),customElements.get("tuto-flow-canvas")||customElements.define("tuto-flow-canvas",$t),Ct(),b.BaseElement=J,b.DEFAULT_CAMERA_PADDING=Bt,b.DEFAULT_GRID_SIZE=et,b.DEFAULT_SNAP_THRESHOLD=kt,b.MAX_CAMERA_SCALE=it,b.MIN_CAMERA_SCALE=tt,b.PRIMARY_FORWARD_EVENTS=Tt,b.SVG_NS=zt,b.TutoBadge=_t,b.TutoButton=yt,b.TutoFlowCanvas=$t,b.TutoFlowInspector=It,b.TutoFlowMinimap=St,b.TutoFlowNode=Et,b.TutoFlowToolbar=Mt,b.assignLanes=qt,b.autoLayoutColumns=oe,b.bundleEdges=Wt,b.centerOnNode=At,b.clamp=gt,b.colors=G,b.computeFitBounds=Ut,b.computeGraphBounds=ft,b.computePolylineMidpoint=Dt,b.escapeHtml=v,b.getBestPortPair=Ot,b.getClosestPort=xt,b.getPort=Zt,b.htmlEl=Vt,b.injectThemeTokens=Ct,b.isEdgeHighlighted=te,b.pointsToSvgPath=Xt,b.resolvePillSeats=Qt,b.routeEdgeItem=jt,b.screenToWorld=Jt,b.shouldShowPill=ee,b.snapNode=Yt,b.snapWaypoint=mt,b.spacing=Ft,b.svgEl=U,b.typography=st,b.worldToScreen=Kt,b.zoomAtPoint=ut,Object.defineProperty(b,Symbol.toStringTag,{value:"Module"}),b})({});
