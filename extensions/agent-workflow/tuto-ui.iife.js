var TutoUI=(function(m){"use strict";var se=Object.defineProperty;var ie=(m,q,tt)=>q in m?se(m,q,{enumerable:!0,configurable:!0,writable:!0,value:tt}):m[q]=tt;var h=(m,q,tt)=>ie(m,typeof q!="symbol"?q+"":q,tt);const q={dark:{bg:"#090a0f",grid:"rgba(255, 255, 255, 0.04)",text:"#f1f5f9",textMuted:"#94a3b8",muted:"#64748b",panelBg:"#10131d",panelHead:"#161b28",cardBg:"#12151f",cardSelectedBg:"#181d2c",headBg:"#161b28",headSelectedBg:"#1e263c",border:"#283044",borderSubtle:"#1c2232",edge:"#7a869e",edgeDim:"#1e2536",hot:"#3b82f6",toolBg:"#141a24",badgeBg:"#181e2e",highlight:"rgba(59, 130, 246, 0.18)",shadow:"0 12px 36px rgba(0, 0, 0, 0.55)"},light:{bg:"#f8fafc",grid:"rgba(100, 116, 139, 0.10)",text:"#0f172a",textMuted:"#475569",muted:"#64748b",panelBg:"#ffffff",panelHead:"#f1f5f9",cardBg:"#ffffff",cardSelectedBg:"#f8fafc",headBg:"#f1f5f9",headSelectedBg:"#e2e8f0",border:"#cbd5e1",borderSubtle:"#e2e8f0",edge:"#64748b",edgeDim:"#e2e8f0",hot:"#2563eb",toolBg:"#ffffff",badgeBg:"#f1f5f9",highlight:"rgba(37, 99, 235, 0.12)",shadow:"0 12px 36px rgba(0, 0, 0, 0.12)"},accents:{align:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},spec:{accent:"#38bdf8",badge:"SPEC",perm:"READ",permClass:"perm-read"},vibe:{accent:"#10b981",badge:"VIBE",perm:"WRITE",permClass:"perm-write"},envision:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},establish:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},evaluate:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},explore:{accent:"#38bdf8",badge:"SPEC",perm:"READ",permClass:"perm-read"},elaborate:{accent:"#38bdf8",badge:"SPEC",perm:"READ",permClass:"perm-read"},execute:{accent:"#10b981",badge:"VIBE",perm:"WRITE",permClass:"perm-write"},examine:{accent:"#10b981",badge:"VIBE",perm:"WRITE",permClass:"perm-write"},closeOut:{accent:"#8b5cf6",badge:"PROCEDURE",perm:"READ",permClass:"perm-read"},blocked:{accent:"#ef4444",badge:"PROCEDURE",perm:"READ",permClass:"perm-read"},handoff:{accent:"#64748b",badge:"PROCEDURE",perm:"STANDBY",permClass:"perm-standby"}}},tt={fonts:{sans:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',mono:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'},sizes:{xs:"0.68rem",sm:"0.75rem",base:"0.875rem",md:"0.95rem",lg:"1.125rem",xl:"1.25rem","2xl":"1.5rem"},weights:{normal:"400",medium:"500",semibold:"600",bold:"700",extrabold:"800"},lineHeights:{tight:"1.15",normal:"1.4",relaxed:"1.6"}},Xt={space:{1:"0.25rem",2:"0.5rem",3:"0.75rem",4:"1rem",5:"1.25rem",6:"1.5rem",8:"2rem",10:"2.5rem",12:"3rem"},radii:{none:"0",sm:"0.375rem",md:"0.5rem",lg:"0.75rem",xl:"1rem",full:"9999px"},shadows:{sm:"0 1px 2px 0 rgba(0, 0, 0, 0.05)",md:"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",lg:"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",xl:"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",elevated:"0 12px 36px rgba(0, 0, 0, 0.45)",glow:"0 0 15px rgba(59, 130, 246, 0.35)"},transitions:{fast:"150ms ease",default:"200ms ease",smooth:"300ms cubic-bezier(0.4, 0, 0.2, 1)"},zIndex:{canvas:0,edge:1,node:5,overlay:10,drawer:20,tooltip:30}};function Rt(){if(typeof document>"u"||document.getElementById("tuto-theme-tokens"))return;const o=document.createElement("style");o.id="tuto-theme-tokens",o.textContent=`
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
  `,document.head.appendChild(o)}const ot=class ot extends HTMLElement{constructor(t={}){super();h(this,"_isRenderPending",!1);h(this,"_hasRendered",!1);h(this,"_useShadow");h(this,"shadowRootNode",null);this._useShadow=t.useShadow!==!1,this._useShadow&&(this.shadowRootNode=this.attachShadow({mode:t.shadowMode||"open"}))}connectedCallback(){this.adoptStyles(),this.requestUpdate()}disconnectedCallback(){}adoptStyles(){const t=this.constructor,s=t.styles;if(!(!s||!this.shadowRootNode)){if("adoptedStyleSheets"in Document.prototype&&"adoptedStyleSheets"in ShadowRoot.prototype)try{let e=ot._styleSheetMap.get(t);e||(e=new CSSStyleSheet,e.replaceSync(s),ot._styleSheetMap.set(t,e)),this.shadowRootNode.adoptedStyleSheets.includes(e)||(this.shadowRootNode.adoptedStyleSheets=[...this.shadowRootNode.adoptedStyleSheets,e]);return}catch{}if(!this.shadowRootNode.querySelector("style[data-tuto-style]")){const e=document.createElement("style");e.setAttribute("data-tuto-style","true"),e.textContent=s,this.shadowRootNode.prepend(e)}}}requestUpdate(){this._isRenderPending||(this._isRenderPending=!0,requestAnimationFrame(()=>{this._isRenderPending=!1,this.render(),this._hasRendered||(this._hasRendered=!0,this.firstUpdated()),this.updated()}))}emit(t,s,e={}){const a=new CustomEvent(t,{bubbles:!0,composed:!0,cancelable:!0,detail:s,...e});return this.dispatchEvent(a)}get renderRoot(){return this.shadowRootNode||this}firstUpdated(){}updated(){}};h(ot,"styles",""),h(ot,"_styleSheetMap",new WeakMap);let V=ot;const Pt="http://www.w3.org/2000/svg";function z(o,r={},t){const s=document.createElementNS(Pt,o);for(const[e,a]of Object.entries(r))a!=null&&a!==!1&&s.setAttribute(e,String(a));return t&&t.appendChild(s),s}function Ft(o,r={},t){const s=document.createElement(o);for(const[e,a]of Object.entries(r))a!=null&&a!==!1&&(e==="className"||e==="class"?s.className=String(a):s.setAttribute(e,String(a)));return t&&t.appendChild(s),s}function b(o){return o==null?"":String(o).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function ct(o,r,t){return Math.max(r,Math.min(t,o))}class wt extends V{static get observedAttributes(){return["variant","size","disabled"]}get variant(){return this.getAttribute("variant")||"secondary"}set variant(r){this.setAttribute("variant",r)}get size(){return this.getAttribute("size")||"md"}set size(r){this.setAttribute("size",r)}get disabled(){return this.hasAttribute("disabled")}set disabled(r){r?this.setAttribute("disabled",""):this.removeAttribute("disabled")}attributeChangedCallback(){this.requestUpdate()}render(){this.shadowRootNode&&(this.shadowRootNode.innerHTML=`
      <button class="variant-${this.variant} size-${this.size}" ${this.disabled?"disabled":""}>
        <slot></slot>
      </button>
    `)}}h(wt,"styles",`
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
  `),customElements.get("tuto-button")||customElements.define("tuto-button",wt);class yt extends V{static get observedAttributes(){return["variant"]}get variant(){return this.getAttribute("variant")||"default"}set variant(r){this.setAttribute("variant",r)}attributeChangedCallback(){this.requestUpdate()}render(){this.shadowRootNode&&(this.shadowRootNode.innerHTML=`
      <span class="badge variant-${this.variant}">
        <slot></slot>
      </span>
    `)}}h(yt,"styles",`
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
  `),customElements.get("tuto-badge")||customElements.define("tuto-badge",yt);const Z=.2,et=3.5,Ct=44;function zt(o,r,t=Ct,s=1.25){const e=o.width||900,a=o.height||700,n=r.w||2e3,d=r.h||1e3,l=ct(Math.min((e-t*2)/n,(a-t*2)/d),Z,s),g=(e-n*l)/2-r.x*l,p=(a-d*l)/2-r.y*l;return{panX:g,panY:p,scale:l}}function ht(o,r,t,s,e=Z,a=et){const n=ct(o.scale*s,e,a);if(n===o.scale)return o;const d=r-(r-o.panX)*n/o.scale,l=t-(t-o.panY)*n/o.scale;return{panX:d,panY:l,scale:n}}function Bt(o,r,t=1.05){const s=o.width||900,e=o.height||700,a=ct(t,Z,et),n=r.x+r.w/2,d=r.y+r.h/2,l=s/2-n*a,g=e/2-d*a;return{panX:l,panY:g,scale:a}}function Ht(o,r){return{x:(o.x-r.panX)/r.scale,y:(o.y-r.panY)/r.scale}}function Vt(o,r){return{x:o.x*r.scale+r.panX,y:o.y*r.scale+r.panY}}const At=new Set(["GOAL_SET","ASK_ROUTED_SPEC","ASK_ROUTED_VIBE","RESEARCH_DONE","NEXT_VIBE","NEXT_SPEC","NEXT_ALIGN","RUN_CHECKS","CLOSE_OUT","NEXT_HANDOFF"]);function Ut(o){return o.map((r,t)=>({id:r.id||`${r.from}->${r.to}-${t}`,from:r.from,to:r.to,self:r.from===r.to,label:r.label||r.event||"",event:r.event||r.label||"",events:r.event?[r.event]:r.events?[...r.events]:[],description:r.description||"",descriptions:r.descriptions?[...r.descriptions]:r.description?[r.description]:[],userMediated:!!r.userMediated,bidirectional:!!r.bidirectional,waypoints:r.waypoints?[...r.waypoints]:void 0,customData:r.customData?{...r.customData}:void 0}))}function Jt(o,r,t=.5){const s=Math.min(.9,Math.max(.1,t));return r==="left"?{x:o.x,y:o.y+o.h*s}:r==="right"?{x:o.x+o.w,y:o.y+o.h*s}:r==="top"?{x:o.x+o.w*s,y:o.y}:{x:o.x+o.w*s,y:o.y+o.h}}function _t(o,r){const t=[{point:[o.x,o.y+o.h/2],side:"left"},{point:[o.x+o.w,o.y+o.h/2],side:"right"},{point:[o.x+o.w/2,o.y],side:"top"},{point:[o.x+o.w/2,o.y+o.h],side:"bottom"}];let s=t[0],e=1/0;for(const a of t){const n=Math.hypot(a.point[0]-r[0],a.point[1]-r[1]);n<e&&(e=n,s=a)}return s}function Tt(o,r=!0){if(!o||o.length===0)return[0,0];if(o.length===1)return o[0];if(o.length===2)return[(o[0][0]+o[1][0])/2,(o[0][1]+o[1][1])/2];if(r&&o.length===3)return o[1];let t=0;const s=[];for(let n=0;n<o.length-1;n++){const d=Math.hypot(o[n+1][0]-o[n][0],o[n+1][1]-o[n][1]);s.push(d),t+=d}if(t===0)return o[0];const e=t/2;let a=0;for(let n=0;n<s.length;n++){const d=s[n];if(a+d>=e){const l=e-a,g=d>0?l/d:.5,p=o[n],c=o[n+1];return[p[0]+(c[0]-p[0])*g,p[1]+(c[1]-p[1])*g]}a+=d}return o[Math.floor(o.length/2)]}function Dt(o,r){const t=[[o.x,o.y+o.h/2],[o.x+o.w,o.y+o.h/2],[o.x+o.w/2,o.y],[o.x+o.w/2,o.y+o.h]],s=[[r.x,r.y+r.h/2],[r.x+r.w,r.y+r.h/2],[r.x+r.w/2,r.y],[r.x+r.w/2,r.y+r.h]];let e=t[0],a=s[0],n=1/0;for(const d of t)for(const l of s){const g=Math.hypot(l[0]-d[0],l[1]-d[1]);g<n&&(n=g,e=d,a=l)}return{p1:e,p2:a}}function Wt(o,r){return o}function Ot(o,r){const t=r[o.from],s=r[o.to];if(!t||!s)return null;if(o.waypoints&&o.waypoints.length>0){const n=o.self||o.from===o.to,d=o.waypoints[0],l=o.waypoints[o.waypoints.length-1];let g=_t(t,d),p=_t(s,l),c=g.point,k=p.point;n&&Math.hypot(c[0]-k[0],c[1]-k[1])<8&&(g.side==="right"||g.side==="left"?(c=[c[0],c[1]-12],k=[k[0],k[1]+12]):(c=[c[0]-16,c[1]],k=[k[0]+16,k[1]]));const E=[c,...o.waypoints,k],[L,S]=Tt(E,!0);return{points:E,seatX:L,seatY:S,seatSide:"h"}}if(o.self||o.from===o.to){const n=t.x+t.w,d=t.y+t.h/2,l=38;return{points:[[n,d-10],[n+l,d-18],[n+l,d+18],[n,d+10]],seatX:n+l+24,seatY:d,seatSide:"h"}}const{p1:e,p2:a}=Dt(t,s);return{points:[e,a],seatX:(e[0]+a[0])/2,seatY:(e[1]+a[1])/2,seatSide:"h"}}function Kt(o){}function qt(o,r=!1,t=10){if(!o||o.length===0)return"";if(o.length===1)return`M ${o[0][0]} ${o[0][1]}`;if(r&&o.length===4)return`M ${o[0][0]} ${o[0][1]} C ${o[1][0]} ${o[1][1]}, ${o[2][0]} ${o[2][1]}, ${o[3][0]} ${o[3][1]}`;if(o.length===2)return`M ${o[0][0]} ${o[0][1]} L ${o[1][0]} ${o[1][1]}`;if(t<=0)return o.map((a,n)=>`${n===0?"M":"L"} ${a[0]} ${a[1]}`).join(" ");let s=`M ${o[0][0]} ${o[0][1]}`;for(let a=1;a<o.length-1;a++){const n=o[a-1],d=o[a],l=o[a+1],g=d[0]-n[0],p=d[1]-n[1],c=Math.hypot(g,p),k=l[0]-d[0],E=l[1]-d[1],L=Math.hypot(k,E);if(c<1||L<1){s+=` L ${d[0]} ${d[1]}`;continue}const S=Math.min(t,c/2,L/2),N=d[0]-g/c*S,T=d[1]-p/c*S,M=d[0]+k/L*S,_=d[1]+E/L*S;s+=` L ${N} ${T}`,s+=` Q ${d[0]} ${d[1]} ${M} ${_}`}const e=o[o.length-1];return s+=` L ${e[0]} ${e[1]}`,s}function Zt(o,r,t,s){return t===o.id||s===o.id?!0:r?o.from===r||o.to===r:!1}function Qt(o,r,t,s,e=At){return!0}function pt(o,r=64,t=56,s=46,e){let a=1/0,n=1/0,d=-1/0,l=-1/0;const g=Object.values(o);if(g.length===0&&(!e||e.length===0))return{x:0,y:0,w:1e3,h:600};for(const c of g)a=Math.min(a,c.x),n=Math.min(n,c.y),d=Math.max(d,c.x+c.w),l=Math.max(l,c.y+c.h);if(e)for(const c of e)a=Math.min(a,c.x),n=Math.min(n,c.y),d=Math.max(d,c.x+c.w),l=Math.max(l,c.y+c.h);const p=s>0;return{x:a-r,y:n-t-(p?s:0),w:d-a+r*2,h:l-n+t*2+(p?s+80:0)}}function te(o,r={}){const t=r.colWidth||420,s=r.colGap||180,e=r.rowGap||40,a=r.startX||120,n=r.startY||120,d={};let l=a,g=n;return o.forEach((p,c)=>{d[p.id]={...p,x:p.x??l,y:p.y??g,w:p.w||t,h:p.h||280},(c+1)%3===0?(l+=t+s,g=n):g+=(p.h||280)+e}),d}const Q=20,xt=8;function Gt(o,r,t,s,e,a,n=Q,d=xt){const l=[],g=r,p=r+s/2,c=r+s,k=t,E=t+e/2,L=t+e;let S=null,N=d+1,T=[],M=null,_=d+1,P=[];for(const[C,I]of Object.entries(a)){if(C===o)continue;const W=I.x,G=I.x+I.w/2,f=I.x+I.w,A=I.y,j=I.y+I.h/2,i=I.y+I.h,u=Math.abs(p-G);u<N?(N=u,S=G-s/2,T=[{type:"vertical",pos:G,start:Math.min(t,A)-30,end:Math.max(t+e,i)+30,kind:"center",sourceNodeId:o,targetNodeId:C}]):S!==null&&Math.abs(u-N)<.5&&T.push({type:"vertical",pos:G,start:Math.min(t,A)-30,end:Math.max(t+e,i)+30,kind:"center",sourceNodeId:o,targetNodeId:C});const v=Math.abs(g-W);v<N&&(N=v,S=W,T=[{type:"vertical",pos:W,start:Math.min(t,A)-30,end:Math.max(t+e,i)+30,kind:"edge",sourceNodeId:o,targetNodeId:C}]);const y=Math.abs(c-f);y<N&&(N=y,S=f-s,T=[{type:"vertical",pos:f,start:Math.min(t,A)-30,end:Math.max(t+e,i)+30,kind:"edge",sourceNodeId:o,targetNodeId:C}]);const $=Math.abs(E-j);$<_?(_=$,M=j-e/2,P=[{type:"horizontal",pos:j,start:Math.min(r,W)-30,end:Math.max(r+s,f)+30,kind:"center",sourceNodeId:o,targetNodeId:C}]):M!==null&&Math.abs($-_)<.5&&P.push({type:"horizontal",pos:j,start:Math.min(r,W)-30,end:Math.max(r+s,f)+30,kind:"center",sourceNodeId:o,targetNodeId:C});const w=Math.abs(k-A);w<_&&(_=w,M=A,P=[{type:"horizontal",pos:A,start:Math.min(r,W)-30,end:Math.max(r+s,f)+30,kind:"edge",sourceNodeId:o,targetNodeId:C}]);const D=Math.abs(L-i);D<_&&(_=D,M=i-e,P=[{type:"horizontal",pos:i,start:Math.min(r,W)-30,end:Math.max(r+s,f)+30,kind:"edge",sourceNodeId:o,targetNodeId:C}])}const Y=S!==null?Math.round(S):Math.round(r/n)*n,x=M!==null?Math.round(M):Math.round(t/n)*n;return S!==null&&l.push(...T),M!==null&&l.push(...P),{x:Y,y:x,guides:l}}function gt(o,r,t,s,e,a,n,d=Q,l=xt){const g=[];let p=null,c=l+1,k=[],E=null,L=l+1,S=[];const N=a.find(x=>x.id===t),T=n.get(t)||[],M=s>0?T[s-1]:N&&e[N.from]?[e[N.from].x+e[N.from].w/2,e[N.from].y+e[N.from].h/2]:null,_=s<T.length-1?T[s+1]:N&&e[N.to]?[e[N.to].x+e[N.to].w/2,e[N.to].y+e[N.to].h/2]:null;if(M){const x=Math.abs(o-M[0]);x<c&&(c=x,p=M[0],k=[{type:"vertical",pos:M[0],start:Math.min(r,M[1])-20,end:Math.max(r,M[1])+20,kind:"axis"}]);const C=Math.abs(r-M[1]);C<L&&(L=C,E=M[1],S=[{type:"horizontal",pos:M[1],start:Math.min(o,M[0])-20,end:Math.max(o,M[0])+20,kind:"axis"}])}if(_){const x=Math.abs(o-_[0]);x<c&&(c=x,p=_[0],k=[{type:"vertical",pos:_[0],start:Math.min(r,_[1])-20,end:Math.max(r,_[1])+20,kind:"axis"}]);const C=Math.abs(r-_[1]);C<L&&(L=C,E=_[1],S=[{type:"horizontal",pos:_[1],start:Math.min(o,_[0])-20,end:Math.max(o,_[0])+20,kind:"axis"}])}for(const[x,C]of n.entries())C&&C.forEach((I,W)=>{if(x===t&&W===s)return;const G=Math.abs(o-I[0]);G<c&&(c=G,p=I[0],k=[{type:"vertical",pos:I[0],start:Math.min(r,I[1])-20,end:Math.max(r,I[1])+20,kind:"edge"}]);const f=Math.abs(r-I[1]);f<L&&(L=f,E=I[1],S=[{type:"horizontal",pos:I[1],start:Math.min(o,I[0])-20,end:Math.max(o,I[0])+20,kind:"edge"}])});for(const x of Object.values(e)){const C=x.x+x.w/2,I=x.y+x.h/2,W=Math.abs(o-C);W<c&&(c=W,p=C,k=[{type:"vertical",pos:C,start:Math.min(r,x.y)-20,end:Math.max(r,x.y+x.h)+20,kind:"center"}]);const G=Math.abs(r-I);G<L&&(L=G,E=I,S=[{type:"horizontal",pos:I,start:Math.min(o,x.x)-20,end:Math.max(o,x.x+x.w)+20,kind:"center"}])}const P=p!==null?Math.round(p):Math.round(o/d)*d,Y=E!==null?Math.round(E):Math.round(r/d)*d;return p!==null&&g.push(...k),E!==null&&g.push(...S),{x:P,y:Y,guides:g}}class kt extends V{constructor(){super(...arguments);h(this,"_node",null);h(this,"_selected",!1);h(this,"_draggableNode",!1);h(this,"_isDragging",!1)}get node(){return this._node}set node(t){this._node=t,this.requestUpdate()}get selected(){return this._selected}set selected(t){this._selected=!!t,this.requestUpdate()}get draggableNode(){return this._draggableNode}set draggableNode(t){this._draggableNode=!!t,this.requestUpdate()}get isDragging(){return this._isDragging}set isDragging(t){this._isDragging=!!t,this.requestUpdate()}render(){if(!this.shadowRootNode||!this._node)return;const t=this._node,s=q.accents[t.id]||(t.permission?q.accents[t.permission]:null)||q.accents.spec;this.style.setProperty("--node-accent",s.accent);const e=["node-card","compact",this._selected?"selected":"",this._draggableNode?"draggable":"",this._isDragging?"dragging":""].filter(Boolean).join(" ");this.shadowRootNode.innerHTML=`
      <div class="${e}" role="button" tabindex="0">
        <div class="node-head">
          <div class="node-head-left">
            <span class="state-dot"></span>
            <span class="head-title">${b(t.label||t.id)}</span>
          </div>
        </div>
      </div>
    `;const a=this.shadowRootNode.querySelector(".node-card");a&&a.addEventListener("click",n=>{n.stopPropagation(),this.emit("flow:select-node",{node:this._node})})}}h(kt,"styles",`
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
  `),customElements.get("tuto-flow-node")||customElements.define("tuto-flow-node",kt);class Et extends V{constructor(){super(...arguments);h(this,"_zoom",100);h(this,"_isMinimapActive",!1);h(this,"_isInspectorActive",!1);h(this,"_toolMode","view")}get zoom(){return this._zoom}set zoom(t){this._zoom=Math.round(t),this.requestUpdate()}get isMinimapActive(){return this._isMinimapActive}set isMinimapActive(t){this._isMinimapActive=!!t,this.requestUpdate()}get isInspectorActive(){return this._isInspectorActive}set isInspectorActive(t){this._isInspectorActive=!!t,this.requestUpdate()}get toolMode(){return this._toolMode}set toolMode(t){this._toolMode=t,this.requestUpdate()}get isEditModeActive(){return this._toolMode==="edit"}set isEditModeActive(t){this._toolMode=t?"edit":"view",this.requestUpdate()}render(){var a,n,d,l,g,p,c,k,E,L;if(!this.shadowRootNode)return;const t=this._toolMode==="move",s=this._toolMode==="edit",e=t||s;this.shadowRootNode.innerHTML=`
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
        <button class="tool-btn ${s?"active":""}" id="btn-edit-mode" title="Edit Actions Mode (E) — Click labels & nodes for actions/removal" aria-label="Edit Actions Mode">
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
    `,(a=this.shadowRootNode.getElementById("btn-zoom-in"))==null||a.addEventListener("click",()=>{this.emit("flow:zoom-in")}),(n=this.shadowRootNode.getElementById("btn-zoom-out"))==null||n.addEventListener("click",()=>{this.emit("flow:zoom-out")}),(d=this.shadowRootNode.getElementById("btn-zoom-reset"))==null||d.addEventListener("click",()=>{this.emit("flow:zoom-reset")}),(l=this.shadowRootNode.getElementById("btn-fit"))==null||l.addEventListener("click",()=>{this.emit("flow:fit")}),(g=this.shadowRootNode.getElementById("btn-reset"))==null||g.addEventListener("click",()=>{this.emit("flow:reset")}),(p=this.shadowRootNode.getElementById("btn-move-mode"))==null||p.addEventListener("click",()=>{this.emit("flow:toggle-move-mode")}),(c=this.shadowRootNode.getElementById("btn-edit-mode"))==null||c.addEventListener("click",()=>{this.emit("flow:toggle-edit-mode")}),(k=this.shadowRootNode.getElementById("btn-snapshot"))==null||k.addEventListener("click",()=>{this.emit("flow:snapshot-layout")}),(E=this.shadowRootNode.getElementById("btn-reset-layout"))==null||E.addEventListener("click",()=>{this.emit("flow:reset-layout")}),(L=this.shadowRootNode.getElementById("btn-inspector"))==null||L.addEventListener("click",()=>{this.emit("flow:toggle-inspector")})}}h(Et,"styles",`
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
  `),customElements.get("tuto-flow-toolbar")||customElements.define("tuto-flow-toolbar",Et);class Mt extends V{constructor(){super(...arguments);h(this,"_bounds",{x:0,y:0,w:2e3,h:1e3});h(this,"_camera",{panX:0,panY:0,scale:1});h(this,"_viewportSize",{width:900,height:700});h(this,"_nodes",{});h(this,"_selectedNodeId",null);h(this,"_isDragging",!1);h(this,"handlePointerDown",t=>{t.button===0&&(t.preventDefault(),this._isDragging=!0,this.panToEvent(t))});h(this,"handlePointerMove",t=>{this._isDragging&&this.panToEvent(t)});h(this,"handlePointerUp",()=>{this._isDragging=!1})}get bounds(){return this._bounds}set bounds(t){this._bounds=t,this.requestUpdate()}get camera(){return this._camera}set camera(t){this._camera=t,this.requestUpdate()}get viewportSize(){return this._viewportSize}set viewportSize(t){this._viewportSize=t,this.requestUpdate()}get nodes(){return this._nodes}set nodes(t){this._nodes=t,this.requestUpdate()}get selectedNodeId(){return this._selectedNodeId}set selectedNodeId(t){this._selectedNodeId=t,this.requestUpdate()}connectedCallback(){super.connectedCallback(),this.addEventListener("pointerdown",this.handlePointerDown),window.addEventListener("pointermove",this.handlePointerMove),window.addEventListener("pointerup",this.handlePointerUp)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("pointerdown",this.handlePointerDown),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("pointerup",this.handlePointerUp)}panToEvent(t){const s=this.getBoundingClientRect(),e=t.clientX-s.left,a=t.clientY-s.top,n=s.width||170,d=s.height||120,l=this._bounds.w||2e3,g=this._bounds.h||1e3,p=Math.min(n/l,d/g),c=e/p+this._bounds.x,k=a/p+this._bounds.y;this.emit("flow:pan-to",{worldX:c,worldY:k})}render(){var N,T;if(!this.shadowRootNode)return;this.shadowRootNode.innerHTML="";const t=z("svg",{viewBox:"0 0 170 120",preserveAspectRatio:"xMidYMid meet"},this.shadowRootNode),s=170,e=120,a=this._bounds.w||2e3,n=this._bounds.h||1e3,d=Math.min(s/a,e/n),l=z("g",{transform:`scale(${d}) translate(${-this._bounds.x}, ${-this._bounds.y})`},t);z("rect",{x:this._bounds.x,y:this._bounds.y,width:this._bounds.w,height:this._bounds.h,rx:16,fill:"rgba(59, 130, 246, 0.04)",stroke:"var(--tuto-border, #30363d)","stroke-width":2},l);for(const[M,_]of Object.entries(this._nodes)){const P=((N=q.accents[M])==null?void 0:N.accent)||((T=q.accents[_.kind])==null?void 0:T.accent)||"#3b82f6";z("rect",{x:_.x,y:_.y,width:_.w,height:_.h,rx:10,fill:M===this._selectedNodeId?P:"var(--tuto-head-bg, #1a2030)",stroke:P,"stroke-width":2},l)}const g=this._viewportSize.width||900,p=this._viewportSize.height||700,c=this._camera.scale||1,k=(-this._camera.panX/c-this._bounds.x)*d,E=(-this._camera.panY/c-this._bounds.y)*d,L=g/c*d,S=p/c*d;z("rect",{x:Math.max(0,Math.min(s,k)),y:Math.max(0,Math.min(e,E)),width:Math.max(4,Math.min(s,L)),height:Math.max(4,Math.min(e,S)),fill:"rgba(59, 130, 246, 0.15)",stroke:"var(--tuto-hot, #3b82f6)","stroke-width":1.5,rx:3},t)}}h(Mt,"styles",`
    :host {
      display: block;
      width: 170px;
      height: 120px;
      background: color-mix(in srgb, var(--tuto-panel-bg, #161b22) 92%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--tuto-border, #30363d);
      border-radius: 12px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
      overflow: hidden;
      cursor: crosshair;
      user-select: none;
    }
    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  `),customElements.get("tuto-flow-minimap")||customElements.define("tuto-flow-minimap",Mt);class St extends V{constructor(){super(...arguments);h(this,"_isOpen",!1);h(this,"_node",null);h(this,"_edge",null);h(this,"_graph",null);h(this,"_tools",[])}get graph(){return this._graph}set graph(t){this._graph=t,this.requestUpdate()}get isOpen(){return this._isOpen}set isOpen(t){this._isOpen=!!t,this.requestUpdate()}get node(){return this._node}set node(t){this._node=t,t&&(this._edge=null),this.requestUpdate()}get edge(){return this._edge}set edge(t){this._edge=t,t&&(this._node=null),this.requestUpdate()}get tools(){return this._tools}set tools(t){this._tools=t,this.requestUpdate()}render(){var n,d,l,g,p,c,k,E,L,S,N,T,M,_,P,Y,x,C,I,W,G;if(!this.shadowRootNode)return;let t="",s="";if(this._node){const f=this._node,A=q.accents[f.id]||q.accents[f.kind]||{accent:"#3b82f6",badge:(f.kind||"MODE").toUpperCase(),perm:(f.permission||"READ-ONLY").toUpperCase(),permClass:`perm-${f.permission||"readonly"}`},i=A.perm==="WRITE"?'<svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 3px; display: inline-block; vertical-align: -1px;"><path d="M11 2l3 3-8.5 8.5H2.5v-3z"/></svg>':'<svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 3px; display: inline-block; vertical-align: -1px;"><path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>';this.style.setProperty("--drawer-accent",A.accent),t=`
        <div class="header-titles">
          <h2>${b(f.label||f.id)}</h2>
          <div class="header-badges">
            <span class="badge badge-accent">${b(A.badge)}</span>
            <span class="badge badge-perm ${A.permClass}">${i}${b(A.perm)}</span>
          </div>
        </div>
      `;const u=(f.substates||[]).length?`<div>
            <h4 class="section-title">Substates</h4>
            <div class="chip-group">
              ${f.substates.map(B=>`<span class="chip">${b(B)}</span>`).join("")}
            </div>
          </div>`:"",v=(f.procedure||[]).length?`<div>
            <h4 class="section-title">Ordered Instructions (${f.procedure.length})</h4>
            <ol class="instruction-list">
              ${f.procedure.map((B,X)=>`
                <li class="instruction-item">
                  <span class="instruction-idx">${X+1}.</span>
                  <span>${b(B)}</span>
                </li>
              `).join("")}
            </ol>
          </div>`:"",y=this._tools.filter(B=>(B.modes||[]).includes(f.id)||(B.modes||[]).includes("any")),$=y.length?`<div>
            <h4 class="section-title">Permitted Tools & Gates (${y.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              ${y.map(B=>{var X;return`
                <div class="tool-card">
                  <div class="tool-title">
                    <span>${b(B.name)}</span>
                    <span class="chip">TOOL</span>
                  </div>
                  <p class="section-text" style="font-size: 0.78rem;">${b(B.summary)}</p>
                  ${(X=B.gate)!=null&&X.length?`<div style="font-size: 0.72rem; color: var(--tuto-muted, #64748b);"><strong>Gate:</strong> ${b(B.gate.join(" · "))}</div>`:""}
                </div>
              `}).join("")}
            </div>
          </div>`:"",w=f.targetSubgraph||f.subgraphId||((d=(n=this._graph)==null?void 0:n.subgraphs)!=null&&d[f.id]?f.id:null);s=`
        ${w?`<div style="margin-bottom: 0.5rem;">
            <button class="btn-subgraph-drill" id="btn-subgraph-drill" data-subgraph="${b(w)}">
              <span>Drill into <strong>${b(w)}</strong> Subgraph</span>
              <span>➔</span>
            </button>
          </div>`:""}
        ${f.summary?`<div><h4 class="section-title">Summary</h4><p class="section-text">${b(f.summary)}</p></div>`:""}
        ${u}
        ${v}
        ${$}
      `}else if(this._edge){const f=this._edge;this.style.setProperty("--drawer-accent","#3b82f6");const A=f.event||f.label||"Transition";t=`
        <div class="header-titles">
          <h2>${b(A)}</h2>
          <div class="header-badges">
            <span class="badge badge-accent">TRANSITION</span>
            ${f.userMediated?'<span class="badge badge-perm perm-readonly">USER-MEDIATED</span>':'<span class="badge badge-perm perm-write">PROCEDURAL</span>'}
            ${f.bidirectional?'<span class="badge badge-perm perm-write">BIDIRECTIONAL</span>':""}
          </div>
        </div>
      `,s=`
        <div>
          <h4 class="section-title">Route Connection</h4>
          <p class="section-text" style="font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
            <span class="chip" style="font-size: 0.82rem; font-weight: 700; padding: 0.2rem 0.6rem;">${b(f.from.toUpperCase())}</span>
            <span style="color: var(--tuto-muted);">${f.bidirectional?"◄──►":"──►"}</span>
            <span class="chip" style="font-size: 0.82rem; font-weight: 700; padding: 0.2rem 0.6rem;">${b(f.to.toUpperCase())}</span>
          </p>
        </div>
        ${f.label&&f.label!==A?`<div><h4 class="section-title">Action / Intention</h4><p class="section-text" style="color: var(--tuto-text); font-weight: 600;">${b(f.label)}</p></div>`:""}
        ${f.description?`<div><h4 class="section-title">Description & Rules</h4><p class="section-text" style="line-height: 1.6;">${b(f.description)}</p></div>`:""}
        ${(l=f.events)!=null&&l.length?`<div>
                <h4 class="section-title">Trigger Events (${f.events.length})</h4>
                <div class="chip-group">
                  ${f.events.map(j=>`<span class="chip" style="color: var(--tuto-accent, #38bdf8);">${b(j)}</span>`).join("")}
                </div>
              </div>`:""}
        ${(g=f.descriptions)!=null&&g.length&&f.descriptions.length>1?`<div>
                <h4 class="section-title">Bundled Paths</h4>
                <ul class="instruction-list">
                  ${f.descriptions.map(j=>`
                    <li class="instruction-item">
                      <span>${b(j)}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>`:""}
      `}else{this.style.setProperty("--drawer-accent","#f97316");const f=((p=this._graph)==null?void 0:p.title)||"Workflow Overview",A=((c=this._graph)==null?void 0:c.version)||"",j=((k=this._graph)==null?void 0:k.description)||((E=this._graph)==null?void 0:E.summary)||"",i=(L=this._graph)==null?void 0:L.session,u=(S=this._graph)==null?void 0:S.exceptions,v=((N=this._graph)==null?void 0:N.invariants)||((T=this._graph)==null?void 0:T.rules)||(u==null?void 0:u.rules)||[],y=((M=this._graph)==null?void 0:M.ownership)||[],$=((_=this._graph)==null?void 0:_.always)||[],w=(P=this._graph)==null?void 0:P.artifact,D=((Y=this._graph)==null?void 0:Y.procedures)||{};t=`
        <div class="header-titles">
          <h2>${b(f)}</h2>
          <div class="header-badges">
            <span class="badge badge-accent" style="background: #f97316;">OVERVIEW</span>
            ${A?`<span class="badge badge-perm perm-standby">${b(A)}</span>`:""}
          </div>
        </div>
      `;const B=i?`<div>
            <h4 class="section-title" style="color: var(--tuto-accent, #38bdf8);">Session Model & Artifact Contract</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${i.mode?`<div class="info-card"><span class="info-card-label">Session Mode</span><span class="info-card-value">${b(i.mode)}</span></div>`:""}
              ${i.artifact?`<div class="info-card"><span class="info-card-label">Plan Artifact</span><span class="info-card-value">${b(i.artifact)}</span></div>`:""}
              ${i.scope?`<div class="info-card"><span class="info-card-label">Session Scope</span><span class="info-card-value">${b(i.scope)}</span></div>`:""}
              ${i.review?`<div class="info-card"><span class="info-card-label">Review State</span><span class="info-card-value">${b(i.review)}</span></div>`:""}
            </div>
          </div>`:"",X=u?`<div>
            <h4 class="section-title" style="color: #f97316;">${b(u.title||"Exceptions & Escape Hatches")}</h4>
            ${u.summary?`<p class="section-text" style="line-height: 1.55; margin-bottom: 0.75rem; font-size: 0.82rem;">${b(u.summary)}</p>`:""}
            ${(x=u.commands)!=null&&x.length?`<div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem;">
                    ${u.commands.map(R=>`
                      <div class="tool-card" style="border-left: 3px solid #f97316; padding: 0.65rem 0.8rem;">
                        <div class="tool-title" style="margin-bottom: 0.25rem;">
                          <span style="color: #f97316; font-size: 0.84rem; font-weight: 700;">${b(R.command)}</span>
                          ${R.label?`<span class="chip" style="color: #fdba74; border-color: rgba(249, 115, 22, 0.3); font-size: 0.68rem;">${b(R.label)}</span>`:""}
                        </div>
                        <p class="section-text" style="font-size: 0.78rem; line-height: 1.45;">${b(R.summary||R.description||"")}</p>
                      </div>
                    `).join("")}
                  </div>`:""}
            ${(C=u.rules)!=null&&C.length?`<ul class="instruction-list">
                    ${u.rules.map(R=>`
                      <li class="instruction-item">
                        <span class="instruction-idx" style="color: #f97316;">•</span>
                        <span style="font-size: 0.8rem; line-height: 1.45;">${b(R)}</span>
                      </li>
                    `).join("")}
                  </ul>`:""}
          </div>`:"",$t=v.length?`<div>
            <h4 class="section-title">Workflow Invariants & Boundaries</h4>
            <ul class="instruction-list">
              ${v.map(R=>`
                <li class="instruction-item">
                  <span class="instruction-idx" style="color: #f97316;">•</span>
                  <span style="font-size: 0.8rem; line-height: 1.45;">${b(R)}</span>
                </li>
              `).join("")}
            </ul>
          </div>`:"",Lt=y.length?`<div>
            <h4 class="section-title">Ownership & Roles</h4>
            <ul class="instruction-list">
              ${y.map(R=>`
                <li class="instruction-item">
                  <span class="instruction-idx" style="color: #3b82f6;">•</span>
                  <span style="font-size: 0.8rem; line-height: 1.45;">${b(R)}</span>
                </li>
              `).join("")}
            </ul>
          </div>`:"",ut=w?`<div>
            <h4 class="section-title">Artifact Sections & Identifiers</h4>
            ${(I=w.sections)!=null&&I.length?`<div style="margin-bottom: 0.6rem;">
                    <div style="font-size: 0.72rem; color: var(--tuto-muted, #64748b); margin-bottom: 0.35rem; font-weight: 700;">REQUIRED SECTIONS (${w.sections.length})</div>
                    <div class="chip-group">
                      ${w.sections.map(R=>`<span class="chip" style="color: var(--tuto-accent, #38bdf8);">${b(R)}</span>`).join("")}
                    </div>
                  </div>`:""}
            ${w.identifiers&&Object.keys(w.identifiers).length?`<div style="margin-bottom: 0.6rem;">
                    <div style="font-size: 0.72rem; color: var(--tuto-muted, #64748b); margin-bottom: 0.35rem; font-weight: 700;">STABLE LIFECYCLE IDENTIFIERS</div>
                    <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                      ${Object.entries(w.identifiers).map(([R,J])=>`
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem;">
                          <span class="chip" style="font-weight: 700; color: #f97316;">${b(R)}</span>
                          <span style="color: var(--tuto-text-muted, #94a3b8);">${b(J)}</span>
                        </div>
                      `).join("")}
                    </div>
                  </div>`:""}
            ${(W=w.rules)!=null&&W.length?`<ul class="instruction-list">
                    ${w.rules.map(R=>`
                      <li class="instruction-item">
                        <span class="instruction-idx" style="color: #38bdf8;">•</span>
                        <span style="font-size: 0.8rem; line-height: 1.45;">${b(R)}</span>
                      </li>
                    `).join("")}
                  </ul>`:""}
          </div>`:"",ft=$.length?`<div>
            <h4 class="section-title">Execution Principles (ALWAYS)</h4>
            <ul class="instruction-list">
              ${$.map(R=>`
                <li class="instruction-item">
                  <span class="instruction-idx" style="color: #22c55e;">•</span>
                  <span style="font-size: 0.8rem; line-height: 1.45;">${b(R)}</span>
                </li>
              `).join("")}
            </ul>
          </div>`:"",mt=Object.keys(D),st=mt.length?`<div>
            <h4 class="section-title">Global Procedures (${mt.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              ${mt.map(R=>`
                <details class="spec-details">
                  <summary>
                    <span>${b(R)}</span>
                    <span class="chip" style="font-size: 0.68rem;">${(D[R]||[]).length} steps</span>
                  </summary>
                  <div class="spec-details-content">
                    <ol class="instruction-list" style="gap: 0.4rem;">
                      ${(D[R]||[]).map((J,at)=>`
                        <li class="instruction-item" style="padding: 0.45rem 0.6rem; font-size: 0.78rem;">
                          <span class="instruction-idx">${at+1}.</span>
                          <span>${b(J)}</span>
                        </li>
                      `).join("")}
                    </ol>
                  </div>
                </details>
              `).join("")}
            </div>
          </div>`:"";s=`
        ${j?`<div>
                <h4 class="section-title">Big Picture & Architecture</h4>
                <p class="section-text" style="line-height: 1.6; color: var(--tuto-text, #e8eaed); font-size: 0.84rem;">${b(j)}</p>
              </div>`:""}
        ${B}
        ${X}
        ${$t}
        ${Lt}
        ${ut}
        ${ft}
        ${st}

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
          ${s}
        </div>
      </aside>
    `;const e=this.shadowRootNode.querySelector(".drawer");e&&(e.addEventListener("pointerdown",f=>f.stopPropagation()),e.addEventListener("mousedown",f=>f.stopPropagation())),(G=this.shadowRootNode.getElementById("btn-close"))==null||G.addEventListener("click",()=>{this.emit("flow:close-inspector")});const a=this.shadowRootNode.getElementById("btn-subgraph-drill");a&&a.addEventListener("click",()=>{const f=a.getAttribute("data-subgraph");f&&this.emit("flow:select-subgraph",{subgraphId:f})})}}h(St,"styles",`
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
  `),customElements.get("tuto-flow-inspector")||customElements.define("tuto-flow-inspector",St);class It extends V{constructor(){super(...arguments);h(this,"_rootGraph",null);h(this,"_graph",null);h(this,"_activeSubgraphId",null);h(this,"_showSubgraphNav",!0);h(this,"_camera",{panX:0,panY:0,scale:1});h(this,"_bounds",{x:0,y:0,w:2e3,h:1e3});h(this,"_activeStateId",null);h(this,"_selectedNodeId",null);h(this,"_selectedEdgeId",null);h(this,"_hoveredEdgeId",null);h(this,"_showMinimap",!0);h(this,"_showInspector",!0);h(this,"_hasRestoredCamera",!1);h(this,"_theme","dark");h(this,"_toolMode","view");h(this,"_isDragging",!1);h(this,"_dragStart",{x:0,y:0,panX:0,panY:0});h(this,"_draggedNodeId",null);h(this,"_dragNodeStart",null);h(this,"_nodeDragMoved",!1);h(this,"_edgeWaypoints",new Map);h(this,"_draggedWaypoint",null);h(this,"_activeGuides",[]);h(this,"_defaultLayout",null);h(this,"_toastMessage",null);h(this,"_toastTimeout",null);h(this,"_activePopover",null);h(this,"handleKeyDown",t=>{var s;t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement||(t.key==="+"||t.key==="="?this.zoomBy(1.2):t.key==="-"?this.zoomBy(.8333333333333334):t.key==="0"||t.key==="f"||t.key==="F"?this.fitToViewport():t.key==="r"||t.key==="R"?(s=this._graph)!=null&&s.initial&&(this._activeStateId=this._graph.initial,this._selectedNodeId=this._graph.initial,this._selectedEdgeId=null,this.requestUpdate()):t.key==="i"||t.key==="I"?this._toggleInspector():t.key==="m"||t.key==="M"?this.toolMode=this._toolMode==="move"?"view":"move":t.key==="e"||t.key==="E"?this.toolMode=this._toolMode==="edit"?"view":"edit":(t.key==="s"||t.key==="S")&&this._toolMode!=="view"?t.shiftKey?this.copyFsmPatch():this.copyLayoutSnapshot():t.key==="Escape"&&(this._activePopover?(this._activePopover=null,this.requestUpdate()):this._selectedNodeId||this._selectedEdgeId?(this._selectedNodeId=null,this._activeStateId=null,this._selectedEdgeId=null,this.requestUpdate()):this._toolMode!=="view"?this.toolMode="view":this._closeInspector()))});h(this,"handleResize",()=>{this.requestUpdate()});h(this,"handleWheel",t=>{t.preventDefault();const s=this.getBoundingClientRect(),e=t.clientX-s.left,a=t.clientY-s.top,n=t.deltaY<0?1.12:.89;this._camera=ht(this._camera,e,a,n,Z,et),this._saveCamera(),this.requestUpdate()});h(this,"handlePointerDown",t=>{var a;if(t.button!==0||t.target.closest(".flow-edge-pill, tuto-flow-node, .floating-toolbar, .floating-minimap, tuto-flow-inspector, .flow-waypoint-handle, .flow-waypoint-split"))return;this._isDragging=!0,this._dragStart={x:t.clientX,y:t.clientY,panX:this._camera.panX,panY:this._camera.panY};const e=(a=this.shadowRootNode)==null?void 0:a.querySelector("svg.flow-svg");e==null||e.classList.add("grabbing"),window.addEventListener("pointermove",this.handlePointerMove),window.addEventListener("pointerup",this.handlePointerUp)});h(this,"handlePointerMove",t=>{this._isDragging&&(this._camera={...this._camera,panX:this._dragStart.panX+(t.clientX-this._dragStart.x),panY:this._dragStart.panY+(t.clientY-this._dragStart.y)},this.requestUpdate())});h(this,"handlePointerUp",()=>{var s;this._isDragging&&(Math.hypot(this._camera.panX-this._dragStart.panX,this._camera.panY-this._dragStart.panY)<4&&(this._selectedNodeId=null,this._activeStateId=null,this._selectedEdgeId=null),this._saveCamera()),this._isDragging=!1;const t=(s=this.shadowRootNode)==null?void 0:s.querySelector("svg.flow-svg");t==null||t.classList.remove("grabbing"),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("pointerup",this.handlePointerUp),this.requestUpdate()});h(this,"handleNodePointerMove",t=>{if(!this._draggedNodeId||!this._dragNodeStart||!this._graph)return;const s=this._graph.states[this._draggedNodeId];if(!s)return;const e=this._camera.scale||1,a=(t.clientX-this._dragNodeStart.startX)/e,n=(t.clientY-this._dragNodeStart.startY)/e;Math.hypot(a,n)>4&&(this._nodeDragMoved=!0);const d=this._dragNodeStart.nodeOrigX+a,l=this._dragNodeStart.nodeOrigY+n,g=Gt(this._draggedNodeId,d,l,s.w,s.h,this._graph.states,Q,10);s.x=g.x,s.y=g.y,this._activeGuides=g.guides;const p=this._graph.framing!==!1;this._bounds=pt(this._graph.states,p?64:40,p?56:30,p?46:0,this._graph.groups),this.requestUpdate()});h(this,"handleNodePointerUp",()=>{var s;if(!this._draggedNodeId)return;const t=this._draggedNodeId;this._draggedNodeId=null,this._dragNodeStart=null,this._activeGuides=[],window.removeEventListener("pointermove",this.handleNodePointerMove),window.removeEventListener("pointerup",this.handleNodePointerUp),this._nodeDragMoved?this.emit("flow:layout-change",{nodeId:t,layout:this.exportLayoutSnapshot()}):this._selectedNodeId===t?(this._selectedNodeId=null,this._activeStateId=null,this.emit("flow:select-node",{node:null})):(this._selectedNodeId=t,this._activeStateId=t,(s=this._graph)!=null&&s.states[t]&&this.emit("flow:select-node",{node:this._graph.states[t]})),this.requestUpdate()});h(this,"handleWaypointPointerMove",t=>{if(!this._draggedWaypoint||!this._graph)return;const{edgeId:s,waypointIndex:e,startX:a,startY:n,origX:d,origY:l}=this._draggedWaypoint,g=this._edgeWaypoints.get(s);if(!g||!g[e])return;const p=this._camera.scale||1,c=(t.clientX-a)/p,k=(t.clientY-n)/p,E=d+c,L=l+k,S=gt(E,L,s,e,this._graph.states,this._graph.transitions||[],this._edgeWaypoints,Q,10);g[e]=[S.x,S.y],this._activeGuides=S.guides,this.requestUpdate()});h(this,"handleWaypointPointerUp",()=>{this._draggedWaypoint&&(this._draggedWaypoint=null,this._activeGuides=[],window.removeEventListener("pointermove",this.handleWaypointPointerMove),window.removeEventListener("pointerup",this.handleWaypointPointerUp),this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.requestUpdate())})}get graph(){return this._graph}set graph(t){var e;this._rootGraph=t,this._activeSubgraphId=(t==null?void 0:t.activeSubgraphId)||null;const s=this._activeSubgraphId&&((e=t==null?void 0:t.subgraphs)!=null&&e[this._activeSubgraphId])?t.subgraphs[this._activeSubgraphId]:t;this._applyGraph(s),this.requestUpdate()}get rootGraph(){return this._rootGraph}get activeSubgraphId(){return this._activeSubgraphId}set activeSubgraphId(t){this.selectSubgraph(t)}get subgraphs(){var t;return(t=this._rootGraph)==null?void 0:t.subgraphs}get showSubgraphNav(){return this._showSubgraphNav}set showSubgraphNav(t){this._showSubgraphNav=t,this.requestUpdate()}selectSubgraph(t){var s;if(this._rootGraph){if(this._syncWaypointsToGraph(),!t||t==="__root__"||t==="overview")this._activeSubgraphId=null,this._applyGraph(this._rootGraph);else if((s=this._rootGraph.subgraphs)!=null&&s[t])this._activeSubgraphId=t,this._applyGraph(this._rootGraph.subgraphs[t]);else return;this._selectedNodeId=null,this._selectedEdgeId=null,requestAnimationFrame(()=>this.fitToViewport()),this.emit("flow:subgraph-change",{subgraphId:this._activeSubgraphId,graph:this._graph}),this.requestUpdate()}}_applyGraph(t){if(this._graph=t,t){if(this._defaultLayout=null,t.states){this._defaultLayout={};for(const[e,a]of Object.entries(t.states))this._defaultLayout[e]={x:a.x,y:a.y,w:a.w,h:a.h}}if(this._edgeWaypoints.clear(),t.transitions)for(const e of t.transitions)e.waypoints&&e.waypoints.length>0&&this._edgeWaypoints.set(e.id,e.waypoints.map(a=>[...a]));try{const e=localStorage.getItem("pi_workflow_edge_override");if(e!==null){const a=JSON.parse(e),n=this._activeSubgraphId||"overview";let d=null;if(a!=null&&a.diagrams&&typeof a.diagrams=="object"?d=a.diagrams[n]||null:a&&typeof a=="object"&&(d=a),d)for(const[l,g]of Object.entries(d))Array.isArray(g)&&g.length>0&&this._edgeWaypoints.set(l,g)}}catch{}this._activeStateId=t.initial||Object.keys(t.states||{})[0]||null;const s=t.framing!==!1;if(this._bounds=pt(t.states,s?64:40,s?56:30,s?46:0,t.groups),!this._hasRestoredCamera)try{const e=localStorage.getItem("pi_workflow_camera");if(e){const a=JSON.parse(e);a&&typeof a.scale=="number"&&typeof a.panX=="number"&&(this._camera=a,this._hasRestoredCamera=!0)}}catch{}this._hasRestoredCamera||requestAnimationFrame(()=>this.fitToViewport())}}_removeWaypoint(t,s){const e=[...this._edgeWaypoints.get(t)||[]];s>=0&&s<e.length&&e.splice(s,1),e.length===0?(this._edgeWaypoints.delete(t),this.showToast("✓ Straightened edge (0 breakpoints)")):(this._edgeWaypoints.set(t,e),this.showToast(`✓ Removed breakpoint (${e.length}/2 remaining)`)),this._activePopover=null,this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.requestUpdate()}_resetEdge(t){this._edgeWaypoints.delete(t),this._activePopover=null,this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.showToast("✓ Reset edge to straight line (0 breakpoints)"),this.requestUpdate()}_addWaypointToEdge(t,s,e){var g,p;const a=this._edgeWaypoints.get(t)?[...this._edgeWaypoints.get(t)]:[];if(a.length>=2){this.showToast("Maximum 2 breakpoints per line");return}const n=gt(s,e,t,a.length,((g=this._graph)==null?void 0:g.states)||{},((p=this._graph)==null?void 0:p.transitions)||[],this._edgeWaypoints,Q,10),d=n.x,l=n.y;a.push([d,l]),this._edgeWaypoints.set(t,a),this._activePopover={type:"waypoint",id:t,index:a.length-1,worldX:d,worldY:l},this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.showToast(`✓ Added breakpoint (${a.length}/2)`),this.requestUpdate()}_resetNode(t){var s,e;if(this._defaultLayout&&this._defaultLayout[t]&&((e=(s=this._graph)==null?void 0:s.states)!=null&&e[t])){const a=this._defaultLayout[t];this._graph.states[t].x=a.x,this._graph.states[t].y=a.y,this._graph.states[t].w=a.w,this._graph.states[t].h=a.h;try{const n=localStorage.getItem("pi_workflow_layout_override");if(n){const d=JSON.parse(n);delete d[t],localStorage.setItem("pi_workflow_layout_override",JSON.stringify(d))}}catch{}this._activePopover=null,this.emit("flow:layout-change",{nodeId:t,layout:this.exportLayoutSnapshot()}),this.showToast(`✓ Reset ${t} position`),this.requestUpdate()}}_renderPopoverContent(){var t,s;if(!this._activePopover)return"";if(this._activePopover.type==="waypoint"){const e=this._activePopover.id,a=this._edgeWaypoints.get(e)||[];return`
        <span class="flow-fab-label">
          Breakpoint #${(this._activePopover.index??0)+1} of ${a.length}
          <span class="flow-fab-badge">${Math.round(this._activePopover.worldX)}, ${Math.round(this._activePopover.worldY)}</span>
        </span>
        <button type="button" class="flow-fab-btn danger" data-action="remove-waypoint" title="Remove this breakpoint">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          Remove
        </button>
        <button type="button" class="flow-fab-close" data-action="close-popover" title="Close">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `}if(this._activePopover.type==="edge"){const e=this._activePopover.id,a=this._edgeWaypoints.get(e)||[],n=a.length>0,d=a.length<2;return`
        <span class="flow-fab-label">
          ${b(this._activePopover.label||e)}
          <span class="flow-fab-badge">${n?`${a.length}/2 bp`:"Straight (0 bp)"}</span>
        </span>
        ${n?`<button type="button" class="flow-fab-btn warning" data-action="reset-edge" title="Straighten line (remove all breakpoints)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                Straighten
              </button>`:""}
        ${d?`<button type="button" class="flow-fab-btn primary" data-action="add-waypoint" title="Add a breakpoint (${a.length+1}/2)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Breakpoint
              </button>`:""}
        <button type="button" class="flow-fab-close" data-action="close-popover" title="Close">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `}if(this._activePopover.type==="node"){const e=this._activePopover.id,a=(s=(t=this._graph)==null?void 0:t.states)==null?void 0:s[e];return`
        <span class="flow-fab-label">
          ${b(this._activePopover.label||e)}
          <span class="flow-fab-badge">${Math.round((a==null?void 0:a.x)||0)}, ${Math.round((a==null?void 0:a.y)||0)}</span>
        </span>
        <button type="button" class="flow-fab-btn warning" data-action="reset-node" title="Reset node position to default">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
          Reset Position
        </button>
        <button type="button" class="flow-fab-close" data-action="close-popover" title="Close">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `}return""}get toolMode(){return this._toolMode}set toolMode(t){this._toolMode=t,this._activePopover=null,this.emit("flow:tool-mode-change",{toolMode:this._toolMode}),this._toolMode==="move"?this.showToast("Move Mode Active (Drag nodes, labels & lines to reposition · M to exit)"):this._toolMode==="edit"&&this.showToast("Edit Mode Active (Click labels, waypoints & nodes for actions · E to exit)"),this.requestUpdate()}get isEditMode(){return this._toolMode==="edit"}set isEditMode(t){this.toolMode=t?"edit":"view"}get isMoveMode(){return this._toolMode==="move"}set isMoveMode(t){this.toolMode=t?"move":"view"}get activeStateId(){return this._activeStateId}set activeStateId(t){this._activeStateId=t,this.requestUpdate()}get selectedNodeId(){return this._selectedNodeId}set selectedNodeId(t){this._selectedNodeId=t,this.requestUpdate()}get selectedEdgeId(){return this._selectedEdgeId}set selectedEdgeId(t){this._selectedEdgeId=t,this.requestUpdate()}get showMinimap(){return this._showMinimap}set showMinimap(t){this._showMinimap=!!t,this.requestUpdate()}get showInspector(){return this._showInspector}set showInspector(t){this._showInspector=!!t,this.requestUpdate()}get theme(){return this._theme}set theme(t){this._theme=t,this.setAttribute("data-theme",t),this.requestUpdate()}get camera(){return this._camera}set camera(t){this._camera=t,this._saveCamera(),this.requestUpdate()}connectedCallback(){super.connectedCallback();try{const t=localStorage.getItem("pi_workflow_inspector_open");t!==null?this._showInspector=JSON.parse(t):this._showInspector=!0;const s=localStorage.getItem("pi_workflow_camera");if(s!==null){const e=JSON.parse(s);e&&typeof e.scale=="number"&&typeof e.panX=="number"&&(this._camera=e,this._hasRestoredCamera=!0)}}catch{}window.addEventListener("keydown",this.handleKeyDown),window.addEventListener("resize",this.handleResize)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.handleKeyDown),window.removeEventListener("resize",this.handleResize),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("pointerup",this.handlePointerUp),window.removeEventListener("pointermove",this.handleNodePointerMove),window.removeEventListener("pointerup",this.handleNodePointerUp),window.removeEventListener("pointermove",this.handleWaypointPointerMove),window.removeEventListener("pointerup",this.handleWaypointPointerUp)}_saveCamera(){try{localStorage.setItem("pi_workflow_camera",JSON.stringify(this._camera))}catch{}}_toggleInspector(){this._showInspector=!this._showInspector;try{localStorage.setItem("pi_workflow_inspector_open",JSON.stringify(this._showInspector))}catch{}this.requestUpdate()}_closeInspector(){this._showInspector=!1;try{localStorage.setItem("pi_workflow_inspector_open",JSON.stringify(!1))}catch{}this.requestUpdate()}fitToViewport(){const t=this.getBoundingClientRect(),s=t.width||900,e=t.height||700,a=this._showInspector?Math.min(420,s*.45):0,n=s-a,d=zt({width:n,height:e},this._bounds);this._camera={scale:d.scale,panX:d.panX,panY:d.panY},this._saveCamera(),this.requestUpdate()}centerOnState(t){var g;if(!((g=this._graph)!=null&&g.states[t]))return;const s=this._graph.states[t],e=this.getBoundingClientRect(),a=e.width||900,n=e.height||700,d=this._showInspector?Math.min(420,a*.45):0,l=a-d;this._camera=Bt({width:l,height:n},s),this._activeStateId=t,this._selectedNodeId=t,this._selectedEdgeId=null,this._saveCamera(),this.requestUpdate()}showToast(t){this._toastMessage=t,this._toastTimeout&&clearTimeout(this._toastTimeout),this.requestUpdate(),this._toastTimeout=setTimeout(()=>{this._toastMessage=null,this.requestUpdate()},2500)}exportLayoutSnapshot(){var e;this._syncWaypointsToGraph();const t=this._snapshotGraphLayout(this._graph),s={...t.nodes,nodes:t.nodes,edges:t.edges,activeDiagramId:this._activeSubgraphId};if((e=this._rootGraph)!=null&&e.subgraphs&&Object.keys(this._rootGraph.subgraphs).length>0){const a={overview:this._snapshotGraphLayout(this._rootGraph)};for(const[n,d]of Object.entries(this._rootGraph.subgraphs))a[n]=this._snapshotGraphLayout(d);a[this._diagramIdForActive()]=t,s.diagrams=a}return s}async copyLayoutSnapshot(){const t=this.exportLayoutSnapshot(),s=t.diagrams?{diagrams:t.diagrams}:{nodes:t.nodes||{},edges:t.edges||{}},e=`window.WORKFLOW_LAYOUT = ${JSON.stringify(s,null,2)};
`;try{typeof navigator<"u"&&navigator.clipboard&&navigator.clipboard.writeText&&await navigator.clipboard.writeText(e)}catch{}try{t.diagrams?localStorage.setItem("pi_workflow_layout_override",JSON.stringify(t.diagrams)):localStorage.setItem("pi_workflow_layout_override",JSON.stringify(t.nodes||{})),this._saveEdgeWaypoints()}catch{}return console.log(`Exported layout JS:
`+e),this.showToast(t.diagrams?"✓ Multi-diagram layout JS copied to clipboard!":"✓ Layout JS copied to clipboard!"),this.emit("flow:snapshot-layout",{snapshot:t,code:e,json:s}),e}updateNode(t,s){var a,n;const e=(n=(a=this._graph)==null?void 0:a.states)==null?void 0:n[t];return e?(Object.assign(e,s,{id:t}),this.emit("flow:graph-change",{op:"update-node",nodeId:t,node:e,diagramId:this._diagramIdForActive(),graph:this._graph,rootGraph:this._rootGraph}),this.requestUpdate(),e):null}updateEdge(t,s){var a,n;const e=(n=(a=this._graph)==null?void 0:a.transitions)==null?void 0:n.find(d=>d.id===t);return e?(Object.assign(e,s,{id:t}),this.emit("flow:graph-change",{op:"update-edge",edgeId:t,edge:e,diagramId:this._diagramIdForActive(),graph:this._graph,rootGraph:this._rootGraph}),this.requestUpdate(),e):null}exportFsmPatch(){this._syncWaypointsToGraph();const t=this._rootGraph||this._graph,s={},e=[],a=["overview"],n=(l,g)=>{if(l){if(l.states)for(const[p,c]of Object.entries(l.states))g&&c.targetSubgraph||(s[p]={id:p,label:c.label,summary:c.summary,procedure:c.procedure?[...c.procedure]:void 0,substates:c.substates?[...c.substates]:void 0,kind:c.kind,permission:c.permission,targetSubgraph:c.targetSubgraph});if(l.transitions)for(const p of l.transitions)p.customData&&p.customData.aggregate||e.some(c=>c.id===p.id)||e.push({id:p.id,from:p.from,to:p.to,label:p.label,event:p.event,description:p.description,userMediated:p.userMediated,bidirectional:p.bidirectional})}};if(n(t,!!(t!=null&&t.subgraphs&&Object.keys(t.subgraphs).length>0)),t!=null&&t.subgraphs)for(const[l,g]of Object.entries(t.subgraphs))a.push(l),n(g,!1);const d={version:t==null?void 0:t.version,states:s,transitions:e,diagrams:a};return this.emit("flow:export-fsm-patch",{patch:d}),d}async copyFsmPatch(){var e;const t=this.exportFsmPatch(),s=JSON.stringify(t,null,2)+`
`;try{typeof navigator<"u"&&((e=navigator.clipboard)!=null&&e.writeText)&&await navigator.clipboard.writeText(s)}catch{}return console.log(`Exported FSM patch:
`+s),this.showToast("✓ FSM patch JSON copied to clipboard!"),s}resetLayout(){var s;if(!this._defaultLayout||!((s=this._graph)!=null&&s.states))return;for(const[e,a]of Object.entries(this._defaultLayout))this._graph.states[e]&&(this._graph.states[e].x=a.x,this._graph.states[e].y=a.y,this._graph.states[e].w=a.w,this._graph.states[e].h=a.h);this._edgeWaypoints.clear();try{localStorage.removeItem("pi_workflow_layout_override"),localStorage.removeItem("pi_workflow_edge_override")}catch{}const t=this._graph.framing!==!1;this._bounds=pt(this._graph.states,t?64:40,t?56:30,t?46:0,this._graph.groups),this.showToast("✓ Reset layout to default"),this.emit("flow:reset-layout"),this.requestUpdate()}zoomBy(t){const s=this.getBoundingClientRect(),e=s.width/2,a=s.height/2;this._camera=ht(this._camera,e,a,t,Z,et),this._saveCamera(),this.requestUpdate()}zoomTo(t=1){const s=this.getBoundingClientRect(),e=s.width/2,a=s.height/2,n=this._camera.scale||1,d=t/n;this._camera=ht(this._camera,e,a,d,Z,et),this._saveCamera(),this.requestUpdate()}resetZoom(){this.zoomTo(1)}_startNodeDrag(t,s){var a;const e=(a=this._graph)==null?void 0:a.states[t];e&&(this._draggedNodeId=t,this._nodeDragMoved=!1,this._activeGuides=[],this._dragNodeStart={startX:s.clientX,startY:s.clientY,nodeOrigX:e.x,nodeOrigY:e.y},window.addEventListener("pointermove",this.handleNodePointerMove),window.addEventListener("pointerup",this.handleNodePointerUp),this.requestUpdate())}_startWaypointDrag(t,s,e){const a=this._edgeWaypoints.get(t);if(!a||!a[s])return;const n=a[s];this._draggedWaypoint={edgeId:t,waypointIndex:s,startX:e.clientX,startY:e.clientY,origX:n[0],origY:n[1]},this._activeGuides=[],window.addEventListener("pointermove",this.handleWaypointPointerMove),window.addEventListener("pointerup",this.handleWaypointPointerUp),this.requestUpdate()}_syncWaypointsToGraph(){var t;if((t=this._graph)!=null&&t.transitions)for(const s of this._graph.transitions){const e=this._edgeWaypoints.get(s.id);e&&e.length>0?s.waypoints=e.map(([a,n])=>[a,n]):delete s.waypoints}}_diagramIdForActive(){return this._activeSubgraphId||"overview"}_snapshotGraphLayout(t){const s={};if(t!=null&&t.states)for(const[a,n]of Object.entries(t.states))s[a]={x:Math.round(n.x),y:Math.round(n.y),w:Math.round(n.w),h:Math.round(n.h)};const e={};if(t!=null&&t.transitions)for(const a of t.transitions)a.waypoints&&a.waypoints.length>0&&(e[a.id]=a.waypoints.map(([n,d])=>[Math.round(n),Math.round(d)]));return{nodes:s,edges:e}}_saveEdgeWaypoints(){this._syncWaypointsToGraph();try{const t={};for(const[d,l]of this._edgeWaypoints.entries())l&&l.length>0&&(t[d]=l);const s=this._diagramIdForActive();let e={};try{const d=localStorage.getItem("pi_workflow_edge_override");d&&(e=JSON.parse(d)||{})}catch{e={}}const a=e.diagrams&&typeof e.diagrams=="object"?{...e.diagrams}:{};!e.diagrams&&Object.keys(e).length>0&&Object.values(e).every(d=>Array.isArray(d))&&(a.overview=e),a[s]=t,localStorage.setItem("pi_workflow_edge_override",JSON.stringify({diagrams:a}))}catch{}}render(){var C,I,W,G,f,A,j;if(!this.shadowRootNode)return;if(!this._graph){this.shadowRootNode.innerHTML=`
        <div class="canvas-root" style="display:flex;align-items:center;justify-content:center;color:var(--tuto-muted);">
          No flow graph loaded
        </div>
      `;return}const t=this._graph.states,s=this._graph.transitions||[],e=Wt(Ut(s));for(const i of e){this._edgeWaypoints.has(i.id)?i.waypoints=this._edgeWaypoints.get(i.id):i.waypoints=void 0;const u=Ot(i,t);u&&(i.route=u)}const a=this._selectedNodeId||this._activeStateId||null,n=this._toolMode==="move",d=this._toolMode==="edit",l=n||d;let g="";if(d&&this._activePopover){const i=this._camera.panX+this._activePopover.worldX*this._camera.scale,u=this._camera.panY+this._activePopover.worldY*this._camera.scale;g=`
        <div class="flow-fab-popover" id="action-popover" style="left: ${i}px; top: ${u}px;">
          ${this._renderPopoverContent()}
        </div>
      `}let p="";if((C=this._rootGraph)!=null&&C.subgraphs&&Object.keys(this._rootGraph.subgraphs).length>0&&this._showSubgraphNav){const i=(u,v)=>{var w;const y=(v||u||"").trim(),$=((w=y.split(/[·•|]/)[0])==null?void 0:w.trim())||y;return/^align$/i.test(u)||/^align\b/i.test($)?"Align":/^spec$/i.test(u)||/^spec\b/i.test($)?"Spec":/^vibe$/i.test(u)||/^vibe\b/i.test($)?"Vibe":$.length<=12?$:u};p=`
        <div class="flow-subgraph-bar" id="subgraph-bar" role="tablist" aria-label="Diagram">
          <div class="flow-subgraph-tabs">
            <button type="button" role="tab" class="flow-subgraph-tab ${this._activeSubgraphId?"":"active"}" data-subgraph="__root__" aria-selected="${!this._activeSubgraphId}">Overview</button>
            ${Object.entries(this._rootGraph.subgraphs).map(([u,v])=>{const y=this._activeSubgraphId===u;return`
              <button type="button" role="tab" class="flow-subgraph-tab ${y?"active":""}" data-subgraph="${b(u)}" aria-selected="${y}">
                ${b(i(u,v.title))}
              </button>`}).join("")}
          </div>
        </div>
      `}this.shadowRootNode.innerHTML=`
      <div class="canvas-root ${n?"move-mode edit-mode":d?"edit-mode":""}">
        ${this._toastMessage?`<div class="flow-toast">${b(this._toastMessage)}</div>`:""}
        ${g}
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
              <text x="${this._bounds.x+20}" y="${this._bounds.y+28}" fill="var(--tuto-text, #ffffff)" font-size="12" font-weight="700" letter-spacing="0.05em" font-family="var(--tuto-font-sans, sans-serif)">${b(this._graph.title.toUpperCase())}</text>
              ${this._graph.subtitle?`<text x="${this._bounds.x+20+this._graph.title.length*7.5+16}" y="${this._bounds.y+28}" fill="var(--tuto-muted, #64748b)" font-size="11" font-family="var(--tuto-font-sans, sans-serif)">${b(this._graph.subtitle)}</text>`:""}
              <text x="${this._bounds.x+this._bounds.w-20}" y="${this._bounds.y+28}" fill="var(--tuto-muted, #64748b)" font-size="11" font-family="var(--tuto-font-mono, monospace)" text-anchor="end">${b(this._graph.version||"v1.0")}</text>
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
    `;const c=this.shadowRootNode.querySelector("svg.flow-svg");c&&(c.addEventListener("wheel",this.handleWheel,{passive:!1}),c.addEventListener("pointerdown",this.handlePointerDown));const k=this.shadowRootNode.getElementById("groups-group"),E=this.shadowRootNode.getElementById("guidelines-group"),L=this.shadowRootNode.getElementById("edges-paths-group"),S=this.shadowRootNode.getElementById("edges-pills-group"),N=this.shadowRootNode.getElementById("edges-handles-group"),T=this.shadowRootNode.getElementById("nodes-group");if(E&&this._activeGuides.length>0)for(const i of this._activeGuides)i.type==="vertical"?(z("line",{x1:i.pos,y1:i.start,x2:i.pos,y2:i.end,class:"flow-guideline"},E),z("circle",{cx:i.pos,cy:i.start+12,r:2.5,class:"flow-guideline-dot"},E),z("circle",{cx:i.pos,cy:i.end-12,r:2.5,class:"flow-guideline-dot"},E)):(z("line",{x1:i.start,y1:i.pos,x2:i.end,y2:i.pos,class:"flow-guideline"},E),z("circle",{cx:i.start+12,cy:i.pos,r:2.5,class:"flow-guideline-dot"},E),z("circle",{cx:i.end-12,cy:i.pos,r:2.5,class:"flow-guideline-dot"},E));if(this._graph.groups)for(const i of this._graph.groups){const u=z("g",{class:"flow-group-container"},k),v=i.accent||"#3b82f6";z("rect",{x:i.x,y:i.y,width:i.w,height:i.h,rx:14,fill:"var(--tuto-card-bg, #12161c)","fill-opacity":"0.38",stroke:v,"stroke-width":1.2,"stroke-opacity":"0.35"},u),z("path",{d:`M ${i.x} ${i.y+14} Q ${i.x} ${i.y} ${i.x+14} ${i.y} L ${i.x+i.w-14} ${i.y} Q ${i.x+i.w} ${i.y} ${i.x+i.w} ${i.y+14} L ${i.x+i.w} ${i.y+28} L ${i.x} ${i.y+28} Z`,fill:v,"fill-opacity":"0.12"},u);const y=z("text",{x:i.x+14,y:i.y+18,fill:v,"font-size":10.5,"font-weight":800,"letter-spacing":"0.08em","font-family":"var(--tuto-font-mono, monospace)"},u);y.textContent=i.label.toUpperCase()}if(this._graph.initial&&t[this._graph.initial]){const i=t[this._graph.initial],u=i.x-14,v=i.y+i.h/2,y=i.x,$=i.y+i.h/2,w=z("g",{class:"flow-initial-indicator"},L);z("circle",{cx:u-4,cy:v,r:4,fill:"#ffffff"},w),z("path",{d:`M ${u} ${v} L ${y} ${$}`,stroke:"#ffffff","stroke-width":2,fill:"none","marker-end":"url(#flow-arrow-init)"},w)}for(const i of e){if(!i.route||!i.route.points||i.route.points.length<2)continue;const u=!!(this._selectedNodeId&&i.from===this._selectedNodeId),v=!!(this._selectedNodeId&&i.to===this._selectedNodeId),y=!!i.bidirectional,$=u||v;if(this._selectedNodeId&&!$)continue;const w=i.id===this._selectedEdgeId;i.id,this._hoveredEdgeId;const D=w||u||y&&v,B=this._selectedNodeId?v&&!y&&!D:!1,X=!!((i.self||i.from===i.to)&&(!i.waypoints||i.waypoints.length===0)),$t=qt(i.route.points,X,12),Lt=D?"url(#flow-arrow-hot)":B?"url(#flow-arrow)":"url(#flow-arrow-init)",ut=y?D?"url(#flow-arrow-start-hot)":B?"url(#flow-arrow-start)":"url(#flow-arrow-start-init)":void 0,ft={d:$t,class:`flow-edge-path ${D?"hot available":""} ${B?"dimmed":""} ${w?"selected":""}`,stroke:D?"#38bdf8":B?"#334155":"#64748b","stroke-width":D?2.8:B?1.4:1.8,fill:"none","marker-end":Lt};ut&&(ft["marker-start"]=ut),z("path",ft,L).addEventListener("click",U=>{var O,F;if(U.stopPropagation(),!n){if(d){const H=U,rt=this.getBoundingClientRect(),nt=this._camera.scale||1,bt=(H.clientX-rt.left-this._camera.panX)/nt,vt=(H.clientY-rt.top-this._camera.panY)/nt;this._activePopover={type:"edge",id:i.id,worldX:((O=i.route)==null?void 0:O.seatX)||bt,worldY:((F=i.route)==null?void 0:F.seatY)||vt,label:st},this._selectedEdgeId=i.id,this.requestUpdate();return}i.to?(this._activeStateId=i.to,this._selectedNodeId=i.to,this._selectedEdgeId=i.id,this.emit("flow:transition",{from:i.from,to:i.to,event:i.event}),t[i.to]&&this.emit("flow:select-node",{node:t[i.to]}),this.requestUpdate()):(this._selectedEdgeId=i.id,this.emit("flow:select-edge",{edge:i}),this.requestUpdate())}});const st=i.event||i.label||"",R=Math.max(76,Math.min(240,st.length*8+28)),J=28,at=i.route.seatX-R/2,Nt=i.route.seatY-J/2,ee=((I=this._draggedWaypoint)==null?void 0:I.edgeId)===i.id,it=u||y&&v||!this._selectedNodeId,K=z("g",{class:`flow-edge-pill ${it?"available":"dimmed"} ${ee?"dragging":""}`,transform:`translate(${at}, ${Nt})`},S);z("rect",{width:R,height:J,rx:14,fill:it?"#3b82f6":"#202636",stroke:it?"#93c5fd":"rgba(255, 255, 255, 0.12)","stroke-width":it?2:1,filter:it?"drop-shadow(0 4px 14px rgba(59, 130, 246, 0.55))":"drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))"},K);const oe=z("text",{x:R/2,y:J/2,"text-anchor":"middle","dominant-baseline":"central",fill:it?"#ffffff":"#94a3b8","font-size":11,"font-weight":800,"letter-spacing":"0.04em","font-family":"var(--tuto-font-sans, sans-serif)"},K);if(oe.textContent=st,n?K.addEventListener("pointerdown",U=>{var nt,bt,vt;if(U.button!==0)return;U.stopPropagation();let O=this._edgeWaypoints.get(i.id)?[...this._edgeWaypoints.get(i.id)]:[],F=0;const H=((nt=i.route)==null?void 0:nt.seatX)||at+R/2,rt=((bt=i.route)==null?void 0:bt.seatY)||Nt+J/2;if(O.length===0){const dt=gt(H,rt,i.id,0,t,((vt=this._graph)==null?void 0:vt.transitions)||[],this._edgeWaypoints,Q,10);O=[[dt.x,dt.y]],this._edgeWaypoints.set(i.id,O),this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),F=0}else{let dt=0,jt=1/0;for(let lt=0;lt<O.length;lt++){const Yt=Math.hypot(O[lt][0]-H,O[lt][1]-rt);Yt<jt&&(jt=Yt,dt=lt)}F=dt}this._startWaypointDrag(i.id,F,U)}):d?(K.addEventListener("pointerdown",U=>U.stopPropagation()),K.addEventListener("click",U=>{var O,F;U.stopPropagation(),this._activePopover={type:"edge",id:i.id,worldX:((O=i.route)==null?void 0:O.seatX)||at+R/2,worldY:((F=i.route)==null?void 0:F.seatY)||Nt+J/2,label:st},this._selectedEdgeId=i.id,this.requestUpdate()})):(K.addEventListener("pointerdown",U=>U.stopPropagation()),K.addEventListener("click",U=>{U.stopPropagation(),i.to&&(this._activeStateId=i.to,this._selectedNodeId=i.to,this._selectedEdgeId=i.id,this.emit("flow:transition",{from:i.from,to:i.to,event:i.event}),t[i.to]&&this.emit("flow:select-node",{node:t[i.to]}),this.requestUpdate())})),K.addEventListener("dblclick",U=>{U.stopPropagation(),this._selectedEdgeId=i.id,this._showInspector=!0,this.requestUpdate()}),l&&i.waypoints&&i.waypoints.length>0)for(let U=0;U<i.waypoints.length;U++){const O=i.waypoints[U],F=z("circle",{cx:O[0],cy:O[1],r:6,class:"flow-waypoint-handle",fill:"#ffffff",stroke:"#0284c7","stroke-width":2.2},N);n?F.addEventListener("pointerdown",H=>{H.button===0&&(H.stopPropagation(),this._startWaypointDrag(i.id,U,H))}):d&&(F.addEventListener("pointerdown",H=>H.stopPropagation()),F.addEventListener("click",H=>{H.stopPropagation(),this._activePopover={type:"waypoint",id:i.id,index:U,worldX:O[0],worldY:O[1]},this.requestUpdate()}))}}for(const i of Object.values(t)){const u=z("foreignObject",{x:i.x,y:i.y,width:i.w,height:i.h,style:n?"cursor: grab;":""},T);u.addEventListener("pointerdown",y=>y.stopPropagation());const v=document.createElement("tuto-flow-node");if(v.node=i,v.selected=a===i.id,v.draggableNode=n,v.isDragging=this._draggedNodeId===i.id,n)v.addEventListener("pointerdown",y=>{y.button===0&&(y.stopPropagation(),this._startNodeDrag(i.id,y))});else if(d)v.addEventListener("pointerdown",y=>y.stopPropagation()),v.addEventListener("click",y=>{y.stopPropagation(),this._activePopover={type:"node",id:i.id,worldX:i.x+i.w/2,worldY:i.y,label:i.label||i.id},this.requestUpdate()});else{v.addEventListener("pointerdown",$=>{$.stopPropagation()});const y=$=>{$.stopPropagation();const w=i.id;this._selectedNodeId===w?(this._selectedNodeId=null,this._activeStateId=null,this._selectedEdgeId=null,this.emit("flow:select-node",{node:null})):(this._selectedNodeId=w,this._activeStateId=w,this._selectedEdgeId=null,this.emit("flow:select-node",{node:i})),this.requestUpdate()};v.addEventListener("flow:select-node",y),v.addEventListener("click",y)}v.addEventListener("dblclick",y=>{var w,D,B,X;y.stopPropagation();const $=i.targetSubgraph||i.subgraphId||((D=(w=this._rootGraph)==null?void 0:w.subgraphs)!=null&&D[i.id]?i.id:null);if($&&((X=(B=this._rootGraph)==null?void 0:B.subgraphs)!=null&&X[$])){this.selectSubgraph($);return}this._selectedNodeId=i.id,this._activeStateId=i.id,this._selectedEdgeId=null,this._showInspector=!0,this.requestUpdate()}),u.appendChild(v)}const M=this.shadowRootNode.getElementById("subgraph-bar");M&&(M.addEventListener("pointerdown",u=>u.stopPropagation()),M.addEventListener("mousedown",u=>u.stopPropagation()),M.querySelectorAll("[data-subgraph]").forEach(u=>{u.addEventListener("click",v=>{v.stopPropagation();const y=u.getAttribute("data-subgraph");this.selectSubgraph(y)})}));const _=this.shadowRootNode.getElementById("action-popover");if(_){_.addEventListener("pointerdown",w=>w.stopPropagation());const i=_.querySelector("[data-action='remove-waypoint']");i&&((W=this._activePopover)==null?void 0:W.type)==="waypoint"&&i.addEventListener("click",w=>{w.stopPropagation(),this._removeWaypoint(this._activePopover.id,this._activePopover.index)});const u=_.querySelector("[data-action='reset-edge']");u&&((G=this._activePopover)==null?void 0:G.type)==="edge"&&u.addEventListener("click",w=>{w.stopPropagation(),this._resetEdge(this._activePopover.id)});const v=_.querySelector("[data-action='add-waypoint']");v&&((f=this._activePopover)==null?void 0:f.type)==="edge"&&v.addEventListener("click",w=>{w.stopPropagation(),this._addWaypointToEdge(this._activePopover.id,this._activePopover.worldX,this._activePopover.worldY)});const y=_.querySelector("[data-action='reset-node']");y&&((A=this._activePopover)==null?void 0:A.type)==="node"&&y.addEventListener("click",w=>{w.stopPropagation(),this._resetNode(this._activePopover.id)});const $=_.querySelector("[data-action='close-popover']");$&&$.addEventListener("click",w=>{w.stopPropagation(),this._activePopover=null,this.requestUpdate()})}const P=this.shadowRootNode.getElementById("toolbar-el");P&&(P.zoom=Math.round(this._camera.scale*100),P.isInspectorActive=this._showInspector,P.toolMode=this._toolMode,P.addEventListener("flow:zoom-in",()=>this.zoomBy(1.2)),P.addEventListener("flow:zoom-out",()=>this.zoomBy(.8333333333333334)),P.addEventListener("flow:zoom-reset",()=>this.zoomTo(1)),P.addEventListener("flow:fit",()=>this.fitToViewport()),P.addEventListener("flow:reset",()=>{this._selectedNodeId=null,this._selectedEdgeId=null,this._showInspector=!1,this.fitToViewport()}),P.addEventListener("flow:toggle-move-mode",()=>{this.toolMode=this._toolMode==="move"?"view":"move"}),P.addEventListener("flow:toggle-edit-mode",()=>{this.toolMode=this._toolMode==="edit"?"view":"edit"}),P.addEventListener("flow:snapshot-layout",()=>{this.copyLayoutSnapshot()}),P.addEventListener("flow:reset-layout",()=>{this.resetLayout()}),P.addEventListener("flow:toggle-inspector",()=>{this._toggleInspector()}));const Y=this.shadowRootNode.getElementById("minimap-el");if(Y){const i=this.getBoundingClientRect();Y.bounds=this._bounds,Y.camera=this._camera,Y.viewportSize={width:i.width||900,height:i.height||700},Y.nodes=((j=this._graph)==null?void 0:j.states)||{},Y.selectedNodeId=this._selectedNodeId,Y.addEventListener("flow:pan-to",u=>{const v=u;if(v.detail){const{worldX:y,worldY:$}=v.detail,w=this.getBoundingClientRect(),D=w.width||900,B=w.height||700,X=this._camera.scale||1;this._camera={...this._camera,panX:D/2-y*X,panY:B/2-$*X},this._saveCamera(),this.requestUpdate()}})}const x=this.shadowRootNode.getElementById("inspector-el");if(x){if(x.isOpen=this._showInspector,x.graph=this._graph,x.tools=this._graph.tools||[],this._selectedNodeId&&t[this._selectedNodeId])x.node=t[this._selectedNodeId];else if(this._selectedEdgeId){const i=s.find(u=>u.id===this._selectedEdgeId)||e.find(u=>u.id===this._selectedEdgeId);x.edge=i||null}else x.node=null,x.edge=null;x.addEventListener("flow:close-inspector",()=>{this._closeInspector()}),x.addEventListener("flow:select-subgraph",i=>{var v;const u=i;(v=u.detail)!=null&&v.subgraphId&&this.selectSubgraph(u.detail.subgraphId)})}}}return h(It,"styles",`
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
  `),customElements.get("tuto-flow-canvas")||customElements.define("tuto-flow-canvas",It),Rt(),m.BaseElement=V,m.DEFAULT_CAMERA_PADDING=Ct,m.DEFAULT_GRID_SIZE=Q,m.DEFAULT_SNAP_THRESHOLD=xt,m.MAX_CAMERA_SCALE=et,m.MIN_CAMERA_SCALE=Z,m.PRIMARY_FORWARD_EVENTS=At,m.SVG_NS=Pt,m.TutoBadge=yt,m.TutoButton=wt,m.TutoFlowCanvas=It,m.TutoFlowInspector=St,m.TutoFlowMinimap=Mt,m.TutoFlowNode=kt,m.TutoFlowToolbar=Et,m.assignLanes=Wt,m.autoLayoutColumns=te,m.bundleEdges=Ut,m.centerOnNode=Bt,m.clamp=ct,m.colors=q,m.computeFitBounds=zt,m.computeGraphBounds=pt,m.computePolylineMidpoint=Tt,m.escapeHtml=b,m.getBestPortPair=Dt,m.getClosestPort=_t,m.getPort=Jt,m.htmlEl=Ft,m.injectThemeTokens=Rt,m.isEdgeHighlighted=Zt,m.pointsToSvgPath=qt,m.resolvePillSeats=Kt,m.routeEdgeItem=Ot,m.screenToWorld=Ht,m.shouldShowPill=Qt,m.snapNode=Gt,m.snapWaypoint=gt,m.spacing=Xt,m.svgEl=z,m.typography=tt,m.worldToScreen=Vt,m.zoomAtPoint=ht,Object.defineProperty(m,Symbol.toStringTag,{value:"Module"}),m})({});
