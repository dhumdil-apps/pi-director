var TutoUI=(function(f){"use strict";var Gt=Object.defineProperty;var Vt=(f,B,J)=>B in f?Gt(f,B,{enumerable:!0,configurable:!0,writable:!0,value:J}):f[B]=J;var l=(f,B,J)=>Vt(f,typeof B!="symbol"?B+"":B,J);const B={dark:{bg:"#090a0f",grid:"rgba(255, 255, 255, 0.04)",text:"#f1f5f9",textMuted:"#94a3b8",muted:"#64748b",panelBg:"#10131d",panelHead:"#161b28",cardBg:"#12151f",cardSelectedBg:"#181d2c",headBg:"#161b28",headSelectedBg:"#1e263c",border:"#283044",borderSubtle:"#1c2232",edge:"#7a869e",edgeDim:"#1e2536",hot:"#3b82f6",toolBg:"#141a24",badgeBg:"#181e2e",highlight:"rgba(59, 130, 246, 0.18)",shadow:"0 12px 36px rgba(0, 0, 0, 0.55)"},light:{bg:"#f8fafc",grid:"rgba(100, 116, 139, 0.10)",text:"#0f172a",textMuted:"#475569",muted:"#64748b",panelBg:"#ffffff",panelHead:"#f1f5f9",cardBg:"#ffffff",cardSelectedBg:"#f8fafc",headBg:"#f1f5f9",headSelectedBg:"#e2e8f0",border:"#cbd5e1",borderSubtle:"#e2e8f0",edge:"#64748b",edgeDim:"#e2e8f0",hot:"#2563eb",toolBg:"#ffffff",badgeBg:"#f1f5f9",highlight:"rgba(37, 99, 235, 0.12)",shadow:"0 12px 36px rgba(0, 0, 0, 0.12)"},accents:{align:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},spec:{accent:"#38bdf8",badge:"SPEC",perm:"READ",permClass:"perm-read"},vibe:{accent:"#10b981",badge:"VIBE",perm:"WRITE",permClass:"perm-write"},envision:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},establish:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},evaluate:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},explore:{accent:"#38bdf8",badge:"SPEC",perm:"READ",permClass:"perm-read"},elaborate:{accent:"#38bdf8",badge:"SPEC",perm:"READ",permClass:"perm-read"},execute:{accent:"#10b981",badge:"VIBE",perm:"WRITE",permClass:"perm-write"},examine:{accent:"#10b981",badge:"VIBE",perm:"WRITE",permClass:"perm-write"},closeOut:{accent:"#8b5cf6",badge:"PROCEDURE",perm:"READ",permClass:"perm-read"},blocked:{accent:"#ef4444",badge:"PROCEDURE",perm:"READ",permClass:"perm-read"},handoff:{accent:"#64748b",badge:"PROCEDURE",perm:"STANDBY",permClass:"perm-standby"}}},J={fonts:{sans:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',mono:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'},sizes:{xs:"0.68rem",sm:"0.75rem",base:"0.875rem",md:"0.95rem",lg:"1.125rem",xl:"1.25rem","2xl":"1.5rem"},weights:{normal:"400",medium:"500",semibold:"600",bold:"700",extrabold:"800"},lineHeights:{tight:"1.15",normal:"1.4",relaxed:"1.6"}},Dt={space:{1:"0.25rem",2:"0.5rem",3:"0.75rem",4:"1rem",5:"1.25rem",6:"1.5rem",8:"2rem",10:"2.5rem",12:"3rem"},radii:{none:"0",sm:"0.375rem",md:"0.5rem",lg:"0.75rem",xl:"1rem",full:"9999px"},shadows:{sm:"0 1px 2px 0 rgba(0, 0, 0, 0.05)",md:"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",lg:"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",xl:"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",elevated:"0 12px 36px rgba(0, 0, 0, 0.45)",glow:"0 0 15px rgba(59, 130, 246, 0.35)"},transitions:{fast:"150ms ease",default:"200ms ease",smooth:"300ms cubic-bezier(0.4, 0, 0.2, 1)"},zIndex:{canvas:0,edge:1,node:5,overlay:10,drawer:20,tooltip:30}};function Et(){if(typeof document>"u"||document.getElementById("tuto-theme-tokens"))return;const e=document.createElement("style");e.id="tuto-theme-tokens",e.textContent=`
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
  `,document.head.appendChild(e)}const Z=class Z extends HTMLElement{constructor(t={}){super();l(this,"_isRenderPending",!1);l(this,"_hasRendered",!1);l(this,"_useShadow");l(this,"shadowRootNode",null);this._useShadow=t.useShadow!==!1,this._useShadow&&(this.shadowRootNode=this.attachShadow({mode:t.shadowMode||"open"}))}connectedCallback(){this.adoptStyles(),this.requestUpdate()}disconnectedCallback(){}adoptStyles(){const t=this.constructor,i=t.styles;if(!(!i||!this.shadowRootNode)){if("adoptedStyleSheets"in Document.prototype&&"adoptedStyleSheets"in ShadowRoot.prototype)try{let s=Z._styleSheetMap.get(t);s||(s=new CSSStyleSheet,s.replaceSync(i),Z._styleSheetMap.set(t,s)),this.shadowRootNode.adoptedStyleSheets.includes(s)||(this.shadowRootNode.adoptedStyleSheets=[...this.shadowRootNode.adoptedStyleSheets,s]);return}catch{}if(!this.shadowRootNode.querySelector("style[data-tuto-style]")){const s=document.createElement("style");s.setAttribute("data-tuto-style","true"),s.textContent=i,this.shadowRootNode.prepend(s)}}}requestUpdate(){this._isRenderPending||(this._isRenderPending=!0,requestAnimationFrame(()=>{this._isRenderPending=!1,this.render(),this._hasRendered||(this._hasRendered=!0,this.firstUpdated()),this.updated()}))}emit(t,i,s={}){const a=new CustomEvent(t,{bubbles:!0,composed:!0,cancelable:!0,detail:i,...s});return this.dispatchEvent(a)}get renderRoot(){return this.shadowRootNode||this}firstUpdated(){}updated(){}};l(Z,"styles",""),l(Z,"_styleSheetMap",new WeakMap);let Y=Z;const Mt="http://www.w3.org/2000/svg";function R(e,n={},t){const i=document.createElementNS(Mt,e);for(const[s,a]of Object.entries(n))a!=null&&a!==!1&&i.setAttribute(s,String(a));return t&&t.appendChild(i),i}function Wt(e,n={},t){const i=document.createElement(e);for(const[s,a]of Object.entries(n))a!=null&&a!==!1&&(s==="className"||s==="class"?i.className=String(a):i.setAttribute(s,String(a)));return t&&t.appendChild(i),i}function b(e){return e==null?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function lt(e,n,t){return Math.max(n,Math.min(t,e))}class ut extends Y{static get observedAttributes(){return["variant","size","disabled"]}get variant(){return this.getAttribute("variant")||"secondary"}set variant(n){this.setAttribute("variant",n)}get size(){return this.getAttribute("size")||"md"}set size(n){this.setAttribute("size",n)}get disabled(){return this.hasAttribute("disabled")}set disabled(n){n?this.setAttribute("disabled",""):this.removeAttribute("disabled")}attributeChangedCallback(){this.requestUpdate()}render(){this.shadowRootNode&&(this.shadowRootNode.innerHTML=`
      <button class="variant-${this.variant} size-${this.size}" ${this.disabled?"disabled":""}>
        <slot></slot>
      </button>
    `)}}l(ut,"styles",`
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
  `),customElements.get("tuto-button")||customElements.define("tuto-button",ut);class ft extends Y{static get observedAttributes(){return["variant"]}get variant(){return this.getAttribute("variant")||"default"}set variant(n){this.setAttribute("variant",n)}attributeChangedCallback(){this.requestUpdate()}render(){this.shadowRootNode&&(this.shadowRootNode.innerHTML=`
      <span class="badge variant-${this.variant}">
        <slot></slot>
      </span>
    `)}}l(ft,"styles",`
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
  `),customElements.get("tuto-badge")||customElements.define("tuto-badge",ft);const K=.2,tt=3.5,St=44;function It(e,n,t=St,i=1.25){const s=e.width||900,a=e.height||700,r=n.w||2e3,d=n.h||1e3,h=lt(Math.min((s-t*2)/r,(a-t*2)/d),K,i),g=(s-r*h)/2-n.x*h,u=(a-d*h)/2-n.y*h;return{panX:g,panY:u,scale:h}}function mt(e,n,t,i,s=K,a=tt){const r=lt(e.scale*i,s,a);if(r===e.scale)return e;const d=n-(n-e.panX)*r/e.scale,h=t-(t-e.panY)*r/e.scale;return{panX:d,panY:h,scale:r}}function $t(e,n,t=1.05){const i=e.width||900,s=e.height||700,a=lt(t,K,tt),r=n.x+n.w/2,d=n.y+n.h/2,h=i/2-r*a,g=s/2-d*a;return{panX:h,panY:g,scale:a}}function qt(e,n){return{x:(e.x-n.panX)/n.scale,y:(e.y-n.panY)/n.scale}}function Ot(e,n){return{x:e.x*n.scale+n.panX,y:e.y*n.scale+n.panY}}const Lt=new Set(["GOAL_SET","ASK_ROUTED_SPEC","ASK_ROUTED_VIBE","RESEARCH_DONE","NEXT_VIBE","NEXT_SPEC","NEXT_ALIGN","RUN_CHECKS","CLOSE_OUT","NEXT_HANDOFF"]);function Nt(e){return e.map((n,t)=>({id:n.id||`${n.from}->${n.to}-${t}`,from:n.from,to:n.to,self:n.from===n.to,label:n.label||n.event||"",event:n.event||n.label||"",events:n.event?[n.event]:[],description:n.description||"",descriptions:n.description?[n.description]:[],userMediated:!!n.userMediated,bidirectional:!!n.bidirectional,waypoints:n.waypoints?[...n.waypoints]:void 0}))}function Yt(e,n,t=.5){const i=Math.min(.9,Math.max(.1,t));return n==="left"?{x:e.x,y:e.y+e.h*i}:n==="right"?{x:e.x+e.w,y:e.y+e.h*i}:n==="top"?{x:e.x+e.w*i,y:e.y}:{x:e.x+e.w*i,y:e.y+e.h}}function bt(e,n){const t=[{point:[e.x,e.y+e.h/2],side:"left"},{point:[e.x+e.w,e.y+e.h/2],side:"right"},{point:[e.x+e.w/2,e.y],side:"top"},{point:[e.x+e.w/2,e.y+e.h],side:"bottom"}];let i=t[0],s=1/0;for(const a of t){const r=Math.hypot(a.point[0]-n[0],a.point[1]-n[1]);r<s&&(s=r,i=a)}return i}function Pt(e,n=!0){if(!e||e.length===0)return[0,0];if(e.length===1)return e[0];if(e.length===2)return[(e[0][0]+e[1][0])/2,(e[0][1]+e[1][1])/2];if(n&&e.length===3)return e[1];let t=0;const i=[];for(let r=0;r<e.length-1;r++){const d=Math.hypot(e[r+1][0]-e[r][0],e[r+1][1]-e[r][1]);i.push(d),t+=d}if(t===0)return e[0];const s=t/2;let a=0;for(let r=0;r<i.length;r++){const d=i[r];if(a+d>=s){const h=s-a,g=d>0?h/d:.5,u=e[r],p=e[r+1];return[u[0]+(p[0]-u[0])*g,u[1]+(p[1]-u[1])*g]}a+=d}return e[Math.floor(e.length/2)]}function Rt(e,n){const t=[[e.x,e.y+e.h/2],[e.x+e.w,e.y+e.h/2],[e.x+e.w/2,e.y],[e.x+e.w/2,e.y+e.h]],i=[[n.x,n.y+n.h/2],[n.x+n.w,n.y+n.h/2],[n.x+n.w/2,n.y],[n.x+n.w/2,n.y+n.h]];let s=t[0],a=i[0],r=1/0;for(const d of t)for(const h of i){const g=Math.hypot(h[0]-d[0],h[1]-d[1]);g<r&&(r=g,s=d,a=h)}return{p1:s,p2:a}}function Ct(e,n){return e}function zt(e,n){const t=n[e.from],i=n[e.to];if(!t||!i)return null;if(e.waypoints&&e.waypoints.length>0){const r=e.self||e.from===e.to,d=e.waypoints[0],h=e.waypoints[e.waypoints.length-1];let g=bt(t,d),u=bt(i,h),p=g.point,_=u.point;r&&Math.hypot(p[0]-_[0],p[1]-_[1])<8&&(g.side==="right"||g.side==="left"?(p=[p[0],p[1]-12],_=[_[0],_[1]+12]):(p=[p[0]-16,p[1]],_=[_[0]+16,_[1]]));const I=[p,...e.waypoints,_],[N,M]=Pt(I,!0);return{points:I,seatX:N,seatY:M,seatSide:"h"}}if(e.self||e.from===e.to){const r=t.x+t.w,d=t.y+t.h/2,h=38;return{points:[[r,d-10],[r+h,d-18],[r+h,d+18],[r,d+10]],seatX:r+h+24,seatY:d,seatSide:"h"}}const{p1:s,p2:a}=Rt(t,i);return{points:[s,a],seatX:(s[0]+a[0])/2,seatY:(s[1]+a[1])/2,seatSide:"h"}}function Xt(e){}function Ut(e,n=!1,t=10){if(!e||e.length===0)return"";if(e.length===1)return`M ${e[0][0]} ${e[0][1]}`;if(n&&e.length===4)return`M ${e[0][0]} ${e[0][1]} C ${e[1][0]} ${e[1][1]}, ${e[2][0]} ${e[2][1]}, ${e[3][0]} ${e[3][1]}`;if(e.length===2)return`M ${e[0][0]} ${e[0][1]} L ${e[1][0]} ${e[1][1]}`;if(t<=0)return e.map((a,r)=>`${r===0?"M":"L"} ${a[0]} ${a[1]}`).join(" ");let i=`M ${e[0][0]} ${e[0][1]}`;for(let a=1;a<e.length-1;a++){const r=e[a-1],d=e[a],h=e[a+1],g=d[0]-r[0],u=d[1]-r[1],p=Math.hypot(g,u),_=h[0]-d[0],I=h[1]-d[1],N=Math.hypot(_,I);if(p<1||N<1){i+=` L ${d[0]} ${d[1]}`;continue}const M=Math.min(t,p/2,N/2),S=d[0]-g/p*M,C=d[1]-u/p*M,w=d[0]+_/N*M,x=d[1]+I/N*M;i+=` L ${S} ${C}`,i+=` Q ${d[0]} ${d[1]} ${w} ${x}`}const s=e[e.length-1];return i+=` L ${s[0]} ${s[1]}`,i}function jt(e,n,t,i){return t===e.id||i===e.id?!0:n?e.from===n||e.to===n:!1}function Ht(e,n,t,i,s=Lt){return!0}function ct(e,n=64,t=56,i=46,s){let a=1/0,r=1/0,d=-1/0,h=-1/0;const g=Object.values(e);if(g.length===0&&(!s||s.length===0))return{x:0,y:0,w:1e3,h:600};for(const p of g)a=Math.min(a,p.x),r=Math.min(r,p.y),d=Math.max(d,p.x+p.w),h=Math.max(h,p.y+p.h);if(s)for(const p of s)a=Math.min(a,p.x),r=Math.min(r,p.y),d=Math.max(d,p.x+p.w),h=Math.max(h,p.y+p.h);const u=i>0;return{x:a-n,y:r-t-(u?i:0),w:d-a+n*2,h:h-r+t*2+(u?i+80:0)}}function Ft(e,n={}){const t=n.colWidth||420,i=n.colGap||180,s=n.rowGap||40,a=n.startX||120,r=n.startY||120,d={};let h=a,g=r;return e.forEach((u,p)=>{d[u.id]={...u,x:u.x??h,y:u.y??g,w:u.w||t,h:u.h||280},(p+1)%3===0?(h+=t+i,g=r):g+=(u.h||280)+s}),d}const G=20,vt=8;function At(e,n,t,i,s,a,r=G,d=vt){const h=[],g=n,u=n+i/2,p=n+i,_=t,I=t+s/2,N=t+s;let M=null,S=d+1,C=[],w=null,x=d+1,T=[];for(const[L,c]of Object.entries(a)){if(L===e)continue;const o=c.x,y=c.x+c.w/2,m=c.x+c.w,v=c.y,U=c.y+c.h/2,k=c.y+c.h,D=Math.abs(u-y);D<S?(S=D,M=y-i/2,C=[{type:"vertical",pos:y,start:Math.min(t,v)-30,end:Math.max(t+s,k)+30,kind:"center",sourceNodeId:e,targetNodeId:L}]):M!==null&&Math.abs(D-S)<.5&&C.push({type:"vertical",pos:y,start:Math.min(t,v)-30,end:Math.max(t+s,k)+30,kind:"center",sourceNodeId:e,targetNodeId:L});const P=Math.abs(g-o);P<S&&(S=P,M=o,C=[{type:"vertical",pos:o,start:Math.min(t,v)-30,end:Math.max(t+s,k)+30,kind:"edge",sourceNodeId:e,targetNodeId:L}]);const W=Math.abs(p-m);W<S&&(S=W,M=m-i,C=[{type:"vertical",pos:m,start:Math.min(t,v)-30,end:Math.max(t+s,k)+30,kind:"edge",sourceNodeId:e,targetNodeId:L}]);const Q=Math.abs(I-U);Q<x?(x=Q,w=U-s/2,T=[{type:"horizontal",pos:U,start:Math.min(n,o)-30,end:Math.max(n+i,m)+30,kind:"center",sourceNodeId:e,targetNodeId:L}]):w!==null&&Math.abs(Q-x)<.5&&T.push({type:"horizontal",pos:U,start:Math.min(n,o)-30,end:Math.max(n+i,m)+30,kind:"center",sourceNodeId:e,targetNodeId:L});const H=Math.abs(_-v);H<x&&(x=H,w=v,T=[{type:"horizontal",pos:v,start:Math.min(n,o)-30,end:Math.max(n+i,m)+30,kind:"edge",sourceNodeId:e,targetNodeId:L}]);const X=Math.abs(N-k);X<x&&(x=X,w=k-s,T=[{type:"horizontal",pos:k,start:Math.min(n,o)-30,end:Math.max(n+i,m)+30,kind:"edge",sourceNodeId:e,targetNodeId:L}])}const j=M!==null?Math.round(M):Math.round(n/r)*r,$=w!==null?Math.round(w):Math.round(t/r)*r;return M!==null&&h.push(...C),w!==null&&h.push(...T),{x:j,y:$,guides:h}}function ht(e,n,t,i,s,a,r,d=G,h=vt){const g=[];let u=null,p=h+1,_=[],I=null,N=h+1,M=[];const S=a.find($=>$.id===t),C=r.get(t)||[],w=i>0?C[i-1]:S&&s[S.from]?[s[S.from].x+s[S.from].w/2,s[S.from].y+s[S.from].h/2]:null,x=i<C.length-1?C[i+1]:S&&s[S.to]?[s[S.to].x+s[S.to].w/2,s[S.to].y+s[S.to].h/2]:null;if(w){const $=Math.abs(e-w[0]);$<p&&(p=$,u=w[0],_=[{type:"vertical",pos:w[0],start:Math.min(n,w[1])-20,end:Math.max(n,w[1])+20,kind:"axis"}]);const L=Math.abs(n-w[1]);L<N&&(N=L,I=w[1],M=[{type:"horizontal",pos:w[1],start:Math.min(e,w[0])-20,end:Math.max(e,w[0])+20,kind:"axis"}])}if(x){const $=Math.abs(e-x[0]);$<p&&(p=$,u=x[0],_=[{type:"vertical",pos:x[0],start:Math.min(n,x[1])-20,end:Math.max(n,x[1])+20,kind:"axis"}]);const L=Math.abs(n-x[1]);L<N&&(N=L,I=x[1],M=[{type:"horizontal",pos:x[1],start:Math.min(e,x[0])-20,end:Math.max(e,x[0])+20,kind:"axis"}])}for(const[$,L]of r.entries())L&&L.forEach((c,o)=>{if($===t&&o===i)return;const y=Math.abs(e-c[0]);y<p&&(p=y,u=c[0],_=[{type:"vertical",pos:c[0],start:Math.min(n,c[1])-20,end:Math.max(n,c[1])+20,kind:"edge"}]);const m=Math.abs(n-c[1]);m<N&&(N=m,I=c[1],M=[{type:"horizontal",pos:c[1],start:Math.min(e,c[0])-20,end:Math.max(e,c[0])+20,kind:"edge"}])});for(const $ of Object.values(s)){const L=$.x+$.w/2,c=$.y+$.h/2,o=Math.abs(e-L);o<p&&(p=o,u=L,_=[{type:"vertical",pos:L,start:Math.min(n,$.y)-20,end:Math.max(n,$.y+$.h)+20,kind:"center"}]);const y=Math.abs(n-c);y<N&&(N=y,I=c,M=[{type:"horizontal",pos:c,start:Math.min(e,$.x)-20,end:Math.max(e,$.x+$.w)+20,kind:"center"}])}const T=u!==null?Math.round(u):Math.round(e/d)*d,j=I!==null?Math.round(I):Math.round(n/d)*d;return u!==null&&g.push(..._),I!==null&&g.push(...M),{x:T,y:j,guides:g}}class yt extends Y{constructor(){super(...arguments);l(this,"_node",null);l(this,"_selected",!1);l(this,"_draggableNode",!1);l(this,"_isDragging",!1)}get node(){return this._node}set node(t){this._node=t,this.requestUpdate()}get selected(){return this._selected}set selected(t){this._selected=!!t,this.requestUpdate()}get draggableNode(){return this._draggableNode}set draggableNode(t){this._draggableNode=!!t,this.requestUpdate()}get isDragging(){return this._isDragging}set isDragging(t){this._isDragging=!!t,this.requestUpdate()}render(){if(!this.shadowRootNode||!this._node)return;const t=this._node,i=B.accents[t.id]||(t.permission?B.accents[t.permission]:null)||B.accents.spec;this.style.setProperty("--node-accent",i.accent);const s=["node-card","compact",this._selected?"selected":"",this._draggableNode?"draggable":"",this._isDragging?"dragging":""].filter(Boolean).join(" ");this.shadowRootNode.innerHTML=`
      <div class="${s}" role="button" tabindex="0">
        <div class="node-head">
          <div class="node-head-left">
            <span class="state-dot"></span>
            <span class="head-title">${b(t.label||t.id)}</span>
          </div>
        </div>
      </div>
    `;const a=this.shadowRootNode.querySelector(".node-card");a&&a.addEventListener("click",r=>{r.stopPropagation(),this.emit("flow:select-node",{node:this._node})})}}l(yt,"styles",`
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
  `),customElements.get("tuto-flow-node")||customElements.define("tuto-flow-node",yt);class wt extends Y{constructor(){super(...arguments);l(this,"_zoom",100);l(this,"_isMinimapActive",!1);l(this,"_isInspectorActive",!1);l(this,"_toolMode","view")}get zoom(){return this._zoom}set zoom(t){this._zoom=Math.round(t),this.requestUpdate()}get isMinimapActive(){return this._isMinimapActive}set isMinimapActive(t){this._isMinimapActive=!!t,this.requestUpdate()}get isInspectorActive(){return this._isInspectorActive}set isInspectorActive(t){this._isInspectorActive=!!t,this.requestUpdate()}get toolMode(){return this._toolMode}set toolMode(t){this._toolMode=t,this.requestUpdate()}get isEditModeActive(){return this._toolMode==="edit"}set isEditModeActive(t){this._toolMode=t?"edit":"view",this.requestUpdate()}render(){var a,r,d,h,g,u,p,_,I;if(!this.shadowRootNode)return;const t=this._toolMode==="move",i=this._toolMode==="edit",s=t||i;this.shadowRootNode.innerHTML=`
      <div class="toolbar-container">
        <!-- Camera Controls -->
        <button class="tool-btn" id="btn-zoom-out" title="Zoom Out" aria-label="Zoom Out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <span class="zoom-text">${this._zoom}%</span>
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

        <div class="divider"></div>

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
        ${s?`
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
    `,(a=this.shadowRootNode.getElementById("btn-zoom-in"))==null||a.addEventListener("click",()=>{this.emit("flow:zoom-in")}),(r=this.shadowRootNode.getElementById("btn-zoom-out"))==null||r.addEventListener("click",()=>{this.emit("flow:zoom-out")}),(d=this.shadowRootNode.getElementById("btn-fit"))==null||d.addEventListener("click",()=>{this.emit("flow:fit")}),(h=this.shadowRootNode.getElementById("btn-reset"))==null||h.addEventListener("click",()=>{this.emit("flow:reset")}),(g=this.shadowRootNode.getElementById("btn-move-mode"))==null||g.addEventListener("click",()=>{this.emit("flow:toggle-move-mode")}),(u=this.shadowRootNode.getElementById("btn-edit-mode"))==null||u.addEventListener("click",()=>{this.emit("flow:toggle-edit-mode")}),(p=this.shadowRootNode.getElementById("btn-snapshot"))==null||p.addEventListener("click",()=>{this.emit("flow:snapshot-layout")}),(_=this.shadowRootNode.getElementById("btn-reset-layout"))==null||_.addEventListener("click",()=>{this.emit("flow:reset-layout")}),(I=this.shadowRootNode.getElementById("btn-inspector"))==null||I.addEventListener("click",()=>{this.emit("flow:toggle-inspector")})}}l(wt,"styles",`
    :host {
      display: block;
      font-family: var(--tuto-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      color: var(--tuto-text, #e8eaed);
      user-select: none;
    }
    .toolbar-container {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem;
      background: color-mix(in srgb, var(--tuto-panel-bg, #161b22) 92%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--tuto-border, #30363d);
      border-radius: 0.75rem;
      box-shadow: var(--tuto-shadow, 0 12px 36px rgba(0, 0, 0, 0.45));
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
    .zoom-text {
      font-family: var(--tuto-font-mono, monospace);
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0 0.4rem;
      color: var(--tuto-muted, #64748b);
      min-width: 2.6rem;
      text-align: center;
    }
  `),customElements.get("tuto-flow-toolbar")||customElements.define("tuto-flow-toolbar",wt);class _t extends Y{constructor(){super(...arguments);l(this,"_bounds",{x:0,y:0,w:2e3,h:1e3});l(this,"_camera",{panX:0,panY:0,scale:1});l(this,"_viewportSize",{width:900,height:700});l(this,"_nodes",{});l(this,"_selectedNodeId",null);l(this,"_isDragging",!1);l(this,"handlePointerDown",t=>{t.button===0&&(t.preventDefault(),this._isDragging=!0,this.panToEvent(t))});l(this,"handlePointerMove",t=>{this._isDragging&&this.panToEvent(t)});l(this,"handlePointerUp",()=>{this._isDragging=!1})}get bounds(){return this._bounds}set bounds(t){this._bounds=t,this.requestUpdate()}get camera(){return this._camera}set camera(t){this._camera=t,this.requestUpdate()}get viewportSize(){return this._viewportSize}set viewportSize(t){this._viewportSize=t,this.requestUpdate()}get nodes(){return this._nodes}set nodes(t){this._nodes=t,this.requestUpdate()}get selectedNodeId(){return this._selectedNodeId}set selectedNodeId(t){this._selectedNodeId=t,this.requestUpdate()}connectedCallback(){super.connectedCallback(),this.addEventListener("pointerdown",this.handlePointerDown),window.addEventListener("pointermove",this.handlePointerMove),window.addEventListener("pointerup",this.handlePointerUp)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("pointerdown",this.handlePointerDown),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("pointerup",this.handlePointerUp)}panToEvent(t){const i=this.getBoundingClientRect(),s=t.clientX-i.left,a=t.clientY-i.top,r=i.width||170,d=i.height||120,h=this._bounds.w||2e3,g=this._bounds.h||1e3,u=Math.min(r/h,d/g),p=s/u+this._bounds.x,_=a/u+this._bounds.y;this.emit("flow:pan-to",{worldX:p,worldY:_})}render(){var S,C;if(!this.shadowRootNode)return;this.shadowRootNode.innerHTML="";const t=R("svg",{viewBox:"0 0 170 120",preserveAspectRatio:"xMidYMid meet"},this.shadowRootNode),i=170,s=120,a=this._bounds.w||2e3,r=this._bounds.h||1e3,d=Math.min(i/a,s/r),h=R("g",{transform:`scale(${d}) translate(${-this._bounds.x}, ${-this._bounds.y})`},t);R("rect",{x:this._bounds.x,y:this._bounds.y,width:this._bounds.w,height:this._bounds.h,rx:16,fill:"rgba(59, 130, 246, 0.04)",stroke:"var(--tuto-border, #30363d)","stroke-width":2},h);for(const[w,x]of Object.entries(this._nodes)){const T=((S=B.accents[w])==null?void 0:S.accent)||((C=B.accents[x.kind])==null?void 0:C.accent)||"#3b82f6";R("rect",{x:x.x,y:x.y,width:x.w,height:x.h,rx:10,fill:w===this._selectedNodeId?T:"var(--tuto-head-bg, #1a2030)",stroke:T,"stroke-width":2},h)}const g=this._viewportSize.width||900,u=this._viewportSize.height||700,p=this._camera.scale||1,_=(-this._camera.panX/p-this._bounds.x)*d,I=(-this._camera.panY/p-this._bounds.y)*d,N=g/p*d,M=u/p*d;R("rect",{x:Math.max(0,Math.min(i,_)),y:Math.max(0,Math.min(s,I)),width:Math.max(4,Math.min(i,N)),height:Math.max(4,Math.min(s,M)),fill:"rgba(59, 130, 246, 0.15)",stroke:"var(--tuto-hot, #3b82f6)","stroke-width":1.5,rx:3},t)}}l(_t,"styles",`
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
  `),customElements.get("tuto-flow-minimap")||customElements.define("tuto-flow-minimap",_t);class xt extends Y{constructor(){super(...arguments);l(this,"_isOpen",!1);l(this,"_node",null);l(this,"_edge",null);l(this,"_graph",null);l(this,"_tools",[])}get graph(){return this._graph}set graph(t){this._graph=t,this.requestUpdate()}get isOpen(){return this._isOpen}set isOpen(t){this._isOpen=!!t,this.requestUpdate()}get node(){return this._node}set node(t){this._node=t,t&&(this._edge=null),this.requestUpdate()}get edge(){return this._edge}set edge(t){this._edge=t,t&&(this._node=null),this.requestUpdate()}get tools(){return this._tools}set tools(t){this._tools=t,this.requestUpdate()}render(){var a,r,d,h,g,u,p,_,I,N,M,S,C,w,x,T,j,$,L;if(!this.shadowRootNode)return;let t="",i="";if(this._node){const c=this._node,o=B.accents[c.id]||B.accents[c.kind]||{accent:"#3b82f6",badge:(c.kind||"MODE").toUpperCase(),perm:(c.permission||"READ-ONLY").toUpperCase(),permClass:`perm-${c.permission||"readonly"}`},m=o.perm==="WRITE"?'<svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 3px; display: inline-block; vertical-align: -1px;"><path d="M11 2l3 3-8.5 8.5H2.5v-3z"/></svg>':'<svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 3px; display: inline-block; vertical-align: -1px;"><path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>';this.style.setProperty("--drawer-accent",o.accent),t=`
        <div class="header-titles">
          <h2>${b(c.label||c.id)}</h2>
          <div class="header-badges">
            <span class="badge badge-accent">${b(o.badge)}</span>
            <span class="badge badge-perm ${o.permClass}">${m}${b(o.perm)}</span>
          </div>
        </div>
      `;const v=(c.substates||[]).length?`<div>
            <h4 class="section-title">Substates</h4>
            <div class="chip-group">
              ${c.substates.map(P=>`<span class="chip">${b(P)}</span>`).join("")}
            </div>
          </div>`:"",U=(c.procedure||[]).length?`<div>
            <h4 class="section-title">Ordered Instructions (${c.procedure.length})</h4>
            <ol class="instruction-list">
              ${c.procedure.map((P,W)=>`
                <li class="instruction-item">
                  <span class="instruction-idx">${W+1}.</span>
                  <span>${b(P)}</span>
                </li>
              `).join("")}
            </ol>
          </div>`:"",k=this._tools.filter(P=>(P.modes||[]).includes(c.id)||(P.modes||[]).includes("any")),D=k.length?`<div>
            <h4 class="section-title">Permitted Tools & Gates (${k.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              ${k.map(P=>{var W;return`
                <div class="tool-card">
                  <div class="tool-title">
                    <span>${b(P.name)}</span>
                    <span class="chip">TOOL</span>
                  </div>
                  <p class="section-text" style="font-size: 0.78rem;">${b(P.summary)}</p>
                  ${(W=P.gate)!=null&&W.length?`<div style="font-size: 0.72rem; color: var(--tuto-muted, #64748b);"><strong>Gate:</strong> ${b(P.gate.join(" · "))}</div>`:""}
                </div>
              `}).join("")}
            </div>
          </div>`:"";i=`
        ${c.summary?`<div><h4 class="section-title">Summary</h4><p class="section-text">${b(c.summary)}</p></div>`:""}
        ${v}
        ${U}
        ${D}
      `}else if(this._edge){const c=this._edge;this.style.setProperty("--drawer-accent","#3b82f6");const o=c.event||c.label||"Transition";t=`
        <div class="header-titles">
          <h2>${b(o)}</h2>
          <div class="header-badges">
            <span class="badge badge-accent">TRANSITION</span>
            ${c.userMediated?'<span class="badge badge-perm perm-readonly">USER-MEDIATED</span>':'<span class="badge badge-perm perm-write">PROCEDURAL</span>'}
          </div>
        </div>
      `,i=`
        <div>
          <h4 class="section-title">Route Connection</h4>
          <p class="section-text" style="font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
            <span class="chip" style="font-size: 0.82rem; font-weight: 700; padding: 0.2rem 0.6rem;">${b(c.from.toUpperCase())}</span>
            <span style="color: var(--tuto-muted);">──►</span>
            <span class="chip" style="font-size: 0.82rem; font-weight: 700; padding: 0.2rem 0.6rem;">${b(c.to.toUpperCase())}</span>
          </p>
        </div>
        ${c.label&&c.label!==o?`<div><h4 class="section-title">Action / Intention</h4><p class="section-text" style="color: var(--tuto-text); font-weight: 600;">${b(c.label)}</p></div>`:""}
        ${c.description?`<div><h4 class="section-title">Description & Rules</h4><p class="section-text" style="line-height: 1.6;">${b(c.description)}</p></div>`:""}
        ${(a=c.events)!=null&&a.length?`<div>
                <h4 class="section-title">Trigger Events (${c.events.length})</h4>
                <div class="chip-group">
                  ${c.events.map(y=>`<span class="chip" style="color: var(--tuto-accent, #38bdf8);">${b(y)}</span>`).join("")}
                </div>
              </div>`:""}
        ${(r=c.descriptions)!=null&&r.length&&c.descriptions.length>1?`<div>
                <h4 class="section-title">Bundled Paths</h4>
                <ul class="instruction-list">
                  ${c.descriptions.map(y=>`
                    <li class="instruction-item">
                      <span>${b(y)}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>`:""}
      `}else{this.style.setProperty("--drawer-accent","#f97316");const c=((d=this._graph)==null?void 0:d.title)||"Workflow Overview",o=((h=this._graph)==null?void 0:h.version)||"",y=((g=this._graph)==null?void 0:g.description)||((u=this._graph)==null?void 0:u.summary)||"",m=(p=this._graph)==null?void 0:p.session,v=(_=this._graph)==null?void 0:_.exceptions,U=((I=this._graph)==null?void 0:I.invariants)||((N=this._graph)==null?void 0:N.rules)||(v==null?void 0:v.rules)||[],k=((M=this._graph)==null?void 0:M.ownership)||[],D=((S=this._graph)==null?void 0:S.always)||[],P=(C=this._graph)==null?void 0:C.artifact,W=((w=this._graph)==null?void 0:w.procedures)||{};t=`
        <div class="header-titles">
          <h2>${b(c)}</h2>
          <div class="header-badges">
            <span class="badge badge-accent" style="background: #f97316;">OVERVIEW</span>
            ${o?`<span class="badge badge-perm perm-standby">${b(o)}</span>`:""}
          </div>
        </div>
      `;const Q=m?`<div>
            <h4 class="section-title" style="color: var(--tuto-accent, #38bdf8);">Session Model & Artifact Contract</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${m.mode?`<div class="info-card"><span class="info-card-label">Session Mode</span><span class="info-card-value">${b(m.mode)}</span></div>`:""}
              ${m.artifact?`<div class="info-card"><span class="info-card-label">Plan Artifact</span><span class="info-card-value">${b(m.artifact)}</span></div>`:""}
              ${m.scope?`<div class="info-card"><span class="info-card-label">Session Scope</span><span class="info-card-value">${b(m.scope)}</span></div>`:""}
              ${m.review?`<div class="info-card"><span class="info-card-label">Review State</span><span class="info-card-value">${b(m.review)}</span></div>`:""}
            </div>
          </div>`:"",H=v?`<div>
            <h4 class="section-title" style="color: #f97316;">${b(v.title||"Exceptions & Escape Hatches")}</h4>
            ${v.summary?`<p class="section-text" style="line-height: 1.55; margin-bottom: 0.75rem; font-size: 0.82rem;">${b(v.summary)}</p>`:""}
            ${(x=v.commands)!=null&&x.length?`<div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem;">
                    ${v.commands.map(E=>`
                      <div class="tool-card" style="border-left: 3px solid #f97316; padding: 0.65rem 0.8rem;">
                        <div class="tool-title" style="margin-bottom: 0.25rem;">
                          <span style="color: #f97316; font-size: 0.84rem; font-weight: 700;">${b(E.command)}</span>
                          ${E.label?`<span class="chip" style="color: #fdba74; border-color: rgba(249, 115, 22, 0.3); font-size: 0.68rem;">${b(E.label)}</span>`:""}
                        </div>
                        <p class="section-text" style="font-size: 0.78rem; line-height: 1.45;">${b(E.summary||E.description||"")}</p>
                      </div>
                    `).join("")}
                  </div>`:""}
            ${(T=v.rules)!=null&&T.length?`<ul class="instruction-list">
                    ${v.rules.map(E=>`
                      <li class="instruction-item">
                        <span class="instruction-idx" style="color: #f97316;">•</span>
                        <span style="font-size: 0.8rem; line-height: 1.45;">${b(E)}</span>
                      </li>
                    `).join("")}
                  </ul>`:""}
          </div>`:"",X=U.length?`<div>
            <h4 class="section-title">Workflow Invariants & Boundaries</h4>
            <ul class="instruction-list">
              ${U.map(E=>`
                <li class="instruction-item">
                  <span class="instruction-idx" style="color: #f97316;">•</span>
                  <span style="font-size: 0.8rem; line-height: 1.45;">${b(E)}</span>
                </li>
              `).join("")}
            </ul>
          </div>`:"",V=k.length?`<div>
            <h4 class="section-title">Ownership & Roles</h4>
            <ul class="instruction-list">
              ${k.map(E=>`
                <li class="instruction-item">
                  <span class="instruction-idx" style="color: #3b82f6;">•</span>
                  <span style="font-size: 0.8rem; line-height: 1.45;">${b(E)}</span>
                </li>
              `).join("")}
            </ul>
          </div>`:"",et=P?`<div>
            <h4 class="section-title">Artifact Sections & Identifiers</h4>
            ${(j=P.sections)!=null&&j.length?`<div style="margin-bottom: 0.6rem;">
                    <div style="font-size: 0.72rem; color: var(--tuto-muted, #64748b); margin-bottom: 0.35rem; font-weight: 700;">REQUIRED SECTIONS (${P.sections.length})</div>
                    <div class="chip-group">
                      ${P.sections.map(E=>`<span class="chip" style="color: var(--tuto-accent, #38bdf8);">${b(E)}</span>`).join("")}
                    </div>
                  </div>`:""}
            ${P.identifiers&&Object.keys(P.identifiers).length?`<div style="margin-bottom: 0.6rem;">
                    <div style="font-size: 0.72rem; color: var(--tuto-muted, #64748b); margin-bottom: 0.35rem; font-weight: 700;">STABLE LIFECYCLE IDENTIFIERS</div>
                    <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                      ${Object.entries(P.identifiers).map(([E,it])=>`
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem;">
                          <span class="chip" style="font-weight: 700; color: #f97316;">${b(E)}</span>
                          <span style="color: var(--tuto-text-muted, #94a3b8);">${b(it)}</span>
                        </div>
                      `).join("")}
                    </div>
                  </div>`:""}
            ${($=P.rules)!=null&&$.length?`<ul class="instruction-list">
                    ${P.rules.map(E=>`
                      <li class="instruction-item">
                        <span class="instruction-idx" style="color: #38bdf8;">•</span>
                        <span style="font-size: 0.8rem; line-height: 1.45;">${b(E)}</span>
                      </li>
                    `).join("")}
                  </ul>`:""}
          </div>`:"",ot=D.length?`<div>
            <h4 class="section-title">Execution Principles (ALWAYS)</h4>
            <ul class="instruction-list">
              ${D.map(E=>`
                <li class="instruction-item">
                  <span class="instruction-idx" style="color: #22c55e;">•</span>
                  <span style="font-size: 0.8rem; line-height: 1.45;">${b(E)}</span>
                </li>
              `).join("")}
            </ul>
          </div>`:"",st=Object.keys(W),F=st.length?`<div>
            <h4 class="section-title">Global Procedures (${st.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              ${st.map(E=>`
                <details class="spec-details">
                  <summary>
                    <span>${b(E)}</span>
                    <span class="chip" style="font-size: 0.68rem;">${(W[E]||[]).length} steps</span>
                  </summary>
                  <div class="spec-details-content">
                    <ol class="instruction-list" style="gap: 0.4rem;">
                      ${(W[E]||[]).map((it,z)=>`
                        <li class="instruction-item" style="padding: 0.45rem 0.6rem; font-size: 0.78rem;">
                          <span class="instruction-idx">${z+1}.</span>
                          <span>${b(it)}</span>
                        </li>
                      `).join("")}
                    </ol>
                  </div>
                </details>
              `).join("")}
            </div>
          </div>`:"";i=`
        ${y?`<div>
                <h4 class="section-title">Big Picture & Architecture</h4>
                <p class="section-text" style="line-height: 1.6; color: var(--tuto-text, #e8eaed); font-size: 0.84rem;">${b(y)}</p>
              </div>`:""}
        ${Q}
        ${H}
        ${X}
        ${V}
        ${et}
        ${ot}
        ${F}

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
    `;const s=this.shadowRootNode.querySelector(".drawer");s&&(s.addEventListener("pointerdown",c=>c.stopPropagation()),s.addEventListener("mousedown",c=>c.stopPropagation())),(L=this.shadowRootNode.getElementById("btn-close"))==null||L.addEventListener("click",()=>{this.emit("flow:close-inspector")})}}l(xt,"styles",`
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
  `),customElements.get("tuto-flow-inspector")||customElements.define("tuto-flow-inspector",xt);class kt extends Y{constructor(){super(...arguments);l(this,"_graph",null);l(this,"_camera",{panX:0,panY:0,scale:1});l(this,"_bounds",{x:0,y:0,w:2e3,h:1e3});l(this,"_activeStateId",null);l(this,"_selectedNodeId",null);l(this,"_selectedEdgeId",null);l(this,"_hoveredEdgeId",null);l(this,"_showMinimap",!1);l(this,"_showInspector",!0);l(this,"_hasRestoredCamera",!1);l(this,"_theme","dark");l(this,"_toolMode","view");l(this,"_isDragging",!1);l(this,"_dragStart",{x:0,y:0,panX:0,panY:0});l(this,"_draggedNodeId",null);l(this,"_dragNodeStart",null);l(this,"_nodeDragMoved",!1);l(this,"_edgeWaypoints",new Map);l(this,"_draggedWaypoint",null);l(this,"_activeGuides",[]);l(this,"_defaultLayout",null);l(this,"_toastMessage",null);l(this,"_toastTimeout",null);l(this,"_activePopover",null);l(this,"handleKeyDown",t=>{var i;t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement||(t.key==="+"||t.key==="="?this.zoomBy(1.2):t.key==="-"?this.zoomBy(.8333333333333334):t.key==="0"||t.key==="f"||t.key==="F"?this.fitToViewport():t.key==="r"||t.key==="R"?(i=this._graph)!=null&&i.initial&&(this._activeStateId=this._graph.initial,this._selectedNodeId=this._graph.initial,this._selectedEdgeId=null,this.requestUpdate()):t.key==="i"||t.key==="I"?this._toggleInspector():t.key==="m"||t.key==="M"?this.toolMode=this._toolMode==="move"?"view":"move":t.key==="e"||t.key==="E"?this.toolMode=this._toolMode==="edit"?"view":"edit":(t.key==="s"||t.key==="S")&&this._toolMode!=="view"?this.copyLayoutSnapshot():t.key==="Escape"&&(this._activePopover?(this._activePopover=null,this.requestUpdate()):this._selectedNodeId||this._selectedEdgeId?(this._selectedNodeId=null,this._activeStateId=null,this._selectedEdgeId=null,this.requestUpdate()):this._toolMode!=="view"?this.toolMode="view":this._closeInspector()))});l(this,"handleResize",()=>{this.requestUpdate()});l(this,"handleWheel",t=>{t.preventDefault();const i=this.getBoundingClientRect(),s=t.clientX-i.left,a=t.clientY-i.top,r=t.deltaY<0?1.12:.89;this._camera=mt(this._camera,s,a,r,K,tt),this._saveCamera(),this.requestUpdate()});l(this,"handlePointerDown",t=>{var a;if(t.button!==0||t.target.closest(".flow-edge-pill, tuto-flow-node, .floating-toolbar, .floating-minimap, tuto-flow-inspector, .flow-waypoint-handle, .flow-waypoint-split"))return;this._isDragging=!0,this._dragStart={x:t.clientX,y:t.clientY,panX:this._camera.panX,panY:this._camera.panY};const s=(a=this.shadowRootNode)==null?void 0:a.querySelector("svg.flow-svg");s==null||s.classList.add("grabbing"),window.addEventListener("pointermove",this.handlePointerMove),window.addEventListener("pointerup",this.handlePointerUp)});l(this,"handlePointerMove",t=>{this._isDragging&&(this._camera={...this._camera,panX:this._dragStart.panX+(t.clientX-this._dragStart.x),panY:this._dragStart.panY+(t.clientY-this._dragStart.y)},this.requestUpdate())});l(this,"handlePointerUp",()=>{var i;this._isDragging&&(Math.hypot(this._camera.panX-this._dragStart.panX,this._camera.panY-this._dragStart.panY)<4&&(this._selectedNodeId=null,this._activeStateId=null,this._selectedEdgeId=null),this._saveCamera()),this._isDragging=!1;const t=(i=this.shadowRootNode)==null?void 0:i.querySelector("svg.flow-svg");t==null||t.classList.remove("grabbing"),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("pointerup",this.handlePointerUp),this.requestUpdate()});l(this,"handleNodePointerMove",t=>{if(!this._draggedNodeId||!this._dragNodeStart||!this._graph)return;const i=this._graph.states[this._draggedNodeId];if(!i)return;const s=this._camera.scale||1,a=(t.clientX-this._dragNodeStart.startX)/s,r=(t.clientY-this._dragNodeStart.startY)/s;Math.hypot(a,r)>4&&(this._nodeDragMoved=!0);const d=this._dragNodeStart.nodeOrigX+a,h=this._dragNodeStart.nodeOrigY+r,g=At(this._draggedNodeId,d,h,i.w,i.h,this._graph.states,G,10);i.x=g.x,i.y=g.y,this._activeGuides=g.guides;const u=this._graph.framing!==!1;this._bounds=ct(this._graph.states,u?64:40,u?56:30,u?46:0,this._graph.groups),this.requestUpdate()});l(this,"handleNodePointerUp",()=>{var i;if(!this._draggedNodeId)return;const t=this._draggedNodeId;this._draggedNodeId=null,this._dragNodeStart=null,this._activeGuides=[],window.removeEventListener("pointermove",this.handleNodePointerMove),window.removeEventListener("pointerup",this.handleNodePointerUp),this._nodeDragMoved?this.emit("flow:layout-change",{nodeId:t,layout:this.exportLayoutSnapshot()}):this._selectedNodeId===t?(this._selectedNodeId=null,this._activeStateId=null,this.emit("flow:select-node",{node:null})):(this._selectedNodeId=t,this._activeStateId=t,(i=this._graph)!=null&&i.states[t]&&this.emit("flow:select-node",{node:this._graph.states[t]})),this.requestUpdate()});l(this,"handleWaypointPointerMove",t=>{if(!this._draggedWaypoint||!this._graph)return;const{edgeId:i,waypointIndex:s,startX:a,startY:r,origX:d,origY:h}=this._draggedWaypoint,g=this._edgeWaypoints.get(i);if(!g||!g[s])return;const u=this._camera.scale||1,p=(t.clientX-a)/u,_=(t.clientY-r)/u,I=d+p,N=h+_,M=ht(I,N,i,s,this._graph.states,this._graph.transitions||[],this._edgeWaypoints,G,10);g[s]=[M.x,M.y],this._activeGuides=M.guides,this.requestUpdate()});l(this,"handleWaypointPointerUp",()=>{this._draggedWaypoint&&(this._draggedWaypoint=null,this._activeGuides=[],window.removeEventListener("pointermove",this.handleWaypointPointerMove),window.removeEventListener("pointerup",this.handleWaypointPointerUp),this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.requestUpdate())})}get graph(){return this._graph}set graph(t){if(this._graph=t,t){if(!this._defaultLayout&&t.states){this._defaultLayout={};for(const[s,a]of Object.entries(t.states))this._defaultLayout[s]={x:a.x,y:a.y,w:a.w,h:a.h}}if(this._edgeWaypoints.clear(),t.transitions)for(const s of t.transitions)s.waypoints&&s.waypoints.length>0&&this._edgeWaypoints.set(s.id,s.waypoints.map(a=>[...a]));try{const s=localStorage.getItem("pi_workflow_edge_override");if(s!==null){const a=JSON.parse(s);this._edgeWaypoints.clear();for(const[r,d]of Object.entries(a))Array.isArray(d)&&d.length>0&&this._edgeWaypoints.set(r,d)}}catch{}this._activeStateId||(this._activeStateId=t.initial||Object.keys(t.states||{})[0]||null);const i=t.framing!==!1;if(this._bounds=ct(t.states,i?64:40,i?56:30,i?46:0,t.groups),!this._hasRestoredCamera)try{const s=localStorage.getItem("pi_workflow_camera");if(s){const a=JSON.parse(s);a&&typeof a.scale=="number"&&typeof a.panX=="number"&&(this._camera=a,this._hasRestoredCamera=!0)}}catch{}this._hasRestoredCamera||requestAnimationFrame(()=>this.fitToViewport())}this.requestUpdate()}_removeWaypoint(t,i){const s=[...this._edgeWaypoints.get(t)||[]];i>=0&&i<s.length&&s.splice(i,1),s.length===0?(this._edgeWaypoints.delete(t),this.showToast("✓ Straightened edge (0 breakpoints)")):(this._edgeWaypoints.set(t,s),this.showToast(`✓ Removed breakpoint (${s.length}/2 remaining)`)),this._activePopover=null,this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.requestUpdate()}_resetEdge(t){this._edgeWaypoints.delete(t),this._activePopover=null,this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.showToast("✓ Reset edge to straight line (0 breakpoints)"),this.requestUpdate()}_addWaypointToEdge(t,i,s){var g,u;const a=this._edgeWaypoints.get(t)?[...this._edgeWaypoints.get(t)]:[];if(a.length>=2){this.showToast("Maximum 2 breakpoints per line");return}const r=ht(i,s,t,a.length,((g=this._graph)==null?void 0:g.states)||{},((u=this._graph)==null?void 0:u.transitions)||[],this._edgeWaypoints,G,10),d=r.x,h=r.y;a.push([d,h]),this._edgeWaypoints.set(t,a),this._activePopover={type:"waypoint",id:t,index:a.length-1,worldX:d,worldY:h},this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.showToast(`✓ Added breakpoint (${a.length}/2)`),this.requestUpdate()}_resetNode(t){var i,s;if(this._defaultLayout&&this._defaultLayout[t]&&((s=(i=this._graph)==null?void 0:i.states)!=null&&s[t])){const a=this._defaultLayout[t];this._graph.states[t].x=a.x,this._graph.states[t].y=a.y,this._graph.states[t].w=a.w,this._graph.states[t].h=a.h;try{const r=localStorage.getItem("pi_workflow_layout_override");if(r){const d=JSON.parse(r);delete d[t],localStorage.setItem("pi_workflow_layout_override",JSON.stringify(d))}}catch{}this._activePopover=null,this.emit("flow:layout-change",{nodeId:t,layout:this.exportLayoutSnapshot()}),this.showToast(`✓ Reset ${t} position`),this.requestUpdate()}}_renderPopoverContent(){var t,i;if(!this._activePopover)return"";if(this._activePopover.type==="waypoint"){const s=this._activePopover.id,a=this._edgeWaypoints.get(s)||[];return`
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
      `}if(this._activePopover.type==="edge"){const s=this._activePopover.id,a=this._edgeWaypoints.get(s)||[],r=a.length>0,d=a.length<2;return`
        <span class="flow-fab-label">
          ${b(this._activePopover.label||s)}
          <span class="flow-fab-badge">${r?`${a.length}/2 bp`:"Straight (0 bp)"}</span>
        </span>
        ${r?`<button type="button" class="flow-fab-btn warning" data-action="reset-edge" title="Straighten line (remove all breakpoints)">
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
      `}if(this._activePopover.type==="node"){const s=this._activePopover.id,a=(i=(t=this._graph)==null?void 0:t.states)==null?void 0:i[s];return`
        <span class="flow-fab-label">
          ${b(this._activePopover.label||s)}
          <span class="flow-fab-badge">${Math.round((a==null?void 0:a.x)||0)}, ${Math.round((a==null?void 0:a.y)||0)}</span>
        </span>
        <button type="button" class="flow-fab-btn warning" data-action="reset-node" title="Reset node position to default">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
          Reset Position
        </button>
        <button type="button" class="flow-fab-close" data-action="close-popover" title="Close">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `}return""}get toolMode(){return this._toolMode}set toolMode(t){this._toolMode=t,this._activePopover=null,this.emit("flow:tool-mode-change",{toolMode:this._toolMode}),this._toolMode==="move"?this.showToast("Move Mode Active (Drag nodes, labels & lines to reposition · M to exit)"):this._toolMode==="edit"&&this.showToast("Edit Mode Active (Click labels, waypoints & nodes for actions · E to exit)"),this.requestUpdate()}get isEditMode(){return this._toolMode==="edit"}set isEditMode(t){this.toolMode=t?"edit":"view"}get isMoveMode(){return this._toolMode==="move"}set isMoveMode(t){this.toolMode=t?"move":"view"}get activeStateId(){return this._activeStateId}set activeStateId(t){this._activeStateId=t,this.requestUpdate()}get selectedNodeId(){return this._selectedNodeId}set selectedNodeId(t){this._selectedNodeId=t,this.requestUpdate()}get selectedEdgeId(){return this._selectedEdgeId}set selectedEdgeId(t){this._selectedEdgeId=t,this.requestUpdate()}get showMinimap(){return this._showMinimap}set showMinimap(t){this._showMinimap=!!t,this.requestUpdate()}get showInspector(){return this._showInspector}set showInspector(t){this._showInspector=!!t,this.requestUpdate()}get theme(){return this._theme}set theme(t){this._theme=t,this.setAttribute("data-theme",t),this.requestUpdate()}connectedCallback(){super.connectedCallback();try{const t=localStorage.getItem("pi_workflow_inspector_open");t!==null?this._showInspector=JSON.parse(t):this._showInspector=!0;const i=localStorage.getItem("pi_workflow_camera");if(i!==null){const s=JSON.parse(i);s&&typeof s.scale=="number"&&typeof s.panX=="number"&&(this._camera=s,this._hasRestoredCamera=!0)}}catch{}window.addEventListener("keydown",this.handleKeyDown),window.addEventListener("resize",this.handleResize)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.handleKeyDown),window.removeEventListener("resize",this.handleResize),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("pointerup",this.handlePointerUp),window.removeEventListener("pointermove",this.handleNodePointerMove),window.removeEventListener("pointerup",this.handleNodePointerUp),window.removeEventListener("pointermove",this.handleWaypointPointerMove),window.removeEventListener("pointerup",this.handleWaypointPointerUp)}_saveCamera(){try{localStorage.setItem("pi_workflow_camera",JSON.stringify(this._camera))}catch{}}_toggleInspector(){this._showInspector=!this._showInspector;try{localStorage.setItem("pi_workflow_inspector_open",JSON.stringify(this._showInspector))}catch{}this.requestUpdate()}_closeInspector(){this._showInspector=!1;try{localStorage.setItem("pi_workflow_inspector_open",JSON.stringify(!1))}catch{}this.requestUpdate()}fitToViewport(){const t=this.getBoundingClientRect(),i=t.width||900,s=t.height||700,a=this._showInspector?Math.min(420,i*.45):0,r=i-a,d=It({width:r,height:s},this._bounds);this._camera={scale:d.scale,panX:d.panX,panY:d.panY},this._saveCamera(),this.requestUpdate()}centerOnState(t){var g;if(!((g=this._graph)!=null&&g.states[t]))return;const i=this._graph.states[t],s=this.getBoundingClientRect(),a=s.width||900,r=s.height||700,d=this._showInspector?Math.min(420,a*.45):0,h=a-d;this._camera=$t({width:h,height:r},i),this._activeStateId=t,this._selectedNodeId=t,this._selectedEdgeId=null,this._saveCamera(),this.requestUpdate()}showToast(t){this._toastMessage=t,this._toastTimeout&&clearTimeout(this._toastTimeout),this.requestUpdate(),this._toastTimeout=setTimeout(()=>{this._toastMessage=null,this.requestUpdate()},2500)}exportLayoutSnapshot(){var s;const t={};if((s=this._graph)!=null&&s.states)for(const[a,r]of Object.entries(this._graph.states))t[a]={x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.w),h:Math.round(r.h)};const i={};for(const[a,r]of this._edgeWaypoints.entries())r&&r.length>0&&(i[a]=r.map(([d,h])=>[Math.round(d),Math.round(h)]));return{...t,nodes:t,edges:i}}async copyLayoutSnapshot(){const t=this.exportLayoutSnapshot(),i=t.nodes||{},s=t.edges||{},a={nodes:i,edges:s},r=`window.WORKFLOW_LAYOUT = ${JSON.stringify(a,null,2)};
`;try{typeof navigator<"u"&&navigator.clipboard&&navigator.clipboard.writeText&&await navigator.clipboard.writeText(r)}catch{}try{localStorage.setItem("pi_workflow_layout_override",JSON.stringify(i)),this._saveEdgeWaypoints()}catch{}return console.log(`Exported layout JS:
`+r),this.showToast("✓ Layout JS copied to clipboard!"),this.emit("flow:snapshot-layout",{snapshot:t,code:r,json:a}),r}resetLayout(){var i;if(!this._defaultLayout||!((i=this._graph)!=null&&i.states))return;for(const[s,a]of Object.entries(this._defaultLayout))this._graph.states[s]&&(this._graph.states[s].x=a.x,this._graph.states[s].y=a.y,this._graph.states[s].w=a.w,this._graph.states[s].h=a.h);this._edgeWaypoints.clear();try{localStorage.removeItem("pi_workflow_layout_override"),localStorage.removeItem("pi_workflow_edge_override")}catch{}const t=this._graph.framing!==!1;this._bounds=ct(this._graph.states,t?64:40,t?56:30,t?46:0,this._graph.groups),this.showToast("✓ Reset layout to default"),this.emit("flow:reset-layout"),this.requestUpdate()}zoomBy(t){const i=this.getBoundingClientRect(),s=i.width/2,a=i.height/2;this._camera=mt(this._camera,s,a,t,K,tt),this._saveCamera(),this.requestUpdate()}_startNodeDrag(t,i){var a;const s=(a=this._graph)==null?void 0:a.states[t];s&&(this._draggedNodeId=t,this._nodeDragMoved=!1,this._activeGuides=[],this._dragNodeStart={startX:i.clientX,startY:i.clientY,nodeOrigX:s.x,nodeOrigY:s.y},window.addEventListener("pointermove",this.handleNodePointerMove),window.addEventListener("pointerup",this.handleNodePointerUp),this.requestUpdate())}_startWaypointDrag(t,i,s){const a=this._edgeWaypoints.get(t);if(!a||!a[i])return;const r=a[i];this._draggedWaypoint={edgeId:t,waypointIndex:i,startX:s.clientX,startY:s.clientY,origX:r[0],origY:r[1]},this._activeGuides=[],window.addEventListener("pointermove",this.handleWaypointPointerMove),window.addEventListener("pointerup",this.handleWaypointPointerUp),this.requestUpdate()}_saveEdgeWaypoints(){try{const t={};for(const[i,s]of this._edgeWaypoints.entries())s&&s.length>0&&(t[i]=s);localStorage.setItem("pi_workflow_edge_override",JSON.stringify(t))}catch{}}render(){var T,j,$,L,c;if(!this.shadowRootNode)return;if(!this._graph){this.shadowRootNode.innerHTML=`
        <div class="canvas-root" style="display:flex;align-items:center;justify-content:center;color:var(--tuto-muted);">
          No flow graph loaded
        </div>
      `;return}const t=this._graph.states,i=this._graph.transitions||[],s=Ct(Nt(i));for(const o of s){this._edgeWaypoints.has(o.id)?o.waypoints=this._edgeWaypoints.get(o.id):o.waypoints=void 0;const y=zt(o,t);y&&(o.route=y)}const a=this._selectedNodeId||this._activeStateId||null,r=this._toolMode==="move",d=this._toolMode==="edit",h=r||d;let g="";if(d&&this._activePopover){const o=this._camera.panX+this._activePopover.worldX*this._camera.scale,y=this._camera.panY+this._activePopover.worldY*this._camera.scale;g=`
        <div class="flow-fab-popover" id="action-popover" style="left: ${o}px; top: ${y}px;">
          ${this._renderPopoverContent()}
        </div>
      `}this.shadowRootNode.innerHTML=`
      <div class="canvas-root ${r?"move-mode edit-mode":d?"edit-mode":""}">
        ${this._toastMessage?`<div class="flow-toast">${b(this._toastMessage)}</div>`:""}
        ${g}

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
            <marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--tuto-edge, #5b6477)" />
            </marker>
            <marker id="flow-arrow-hot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
            <marker id="flow-arrow-init" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
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

        <!-- Inspector Drawer Sidebar -->
        <tuto-flow-inspector id="inspector-el"></tuto-flow-inspector>
      </div>
    `;const u=this.shadowRootNode.querySelector("svg.flow-svg");u&&(u.addEventListener("wheel",this.handleWheel,{passive:!1}),u.addEventListener("pointerdown",this.handlePointerDown));const p=this.shadowRootNode.getElementById("groups-group"),_=this.shadowRootNode.getElementById("guidelines-group"),I=this.shadowRootNode.getElementById("edges-paths-group"),N=this.shadowRootNode.getElementById("edges-pills-group"),M=this.shadowRootNode.getElementById("edges-handles-group"),S=this.shadowRootNode.getElementById("nodes-group");if(_&&this._activeGuides.length>0)for(const o of this._activeGuides)o.type==="vertical"?(R("line",{x1:o.pos,y1:o.start,x2:o.pos,y2:o.end,class:"flow-guideline"},_),R("circle",{cx:o.pos,cy:o.start+12,r:2.5,class:"flow-guideline-dot"},_),R("circle",{cx:o.pos,cy:o.end-12,r:2.5,class:"flow-guideline-dot"},_)):(R("line",{x1:o.start,y1:o.pos,x2:o.end,y2:o.pos,class:"flow-guideline"},_),R("circle",{cx:o.start+12,cy:o.pos,r:2.5,class:"flow-guideline-dot"},_),R("circle",{cx:o.end-12,cy:o.pos,r:2.5,class:"flow-guideline-dot"},_));if(this._graph.groups)for(const o of this._graph.groups){const y=R("g",{class:"flow-group-container"},p),m=o.accent||"#3b82f6";R("rect",{x:o.x,y:o.y,width:o.w,height:o.h,rx:14,fill:"var(--tuto-card-bg, #12161c)","fill-opacity":"0.38",stroke:m,"stroke-width":1.2,"stroke-opacity":"0.35"},y),R("path",{d:`M ${o.x} ${o.y+14} Q ${o.x} ${o.y} ${o.x+14} ${o.y} L ${o.x+o.w-14} ${o.y} Q ${o.x+o.w} ${o.y} ${o.x+o.w} ${o.y+14} L ${o.x+o.w} ${o.y+28} L ${o.x} ${o.y+28} Z`,fill:m,"fill-opacity":"0.12"},y);const v=R("text",{x:o.x+14,y:o.y+18,fill:m,"font-size":10.5,"font-weight":800,"letter-spacing":"0.08em","font-family":"var(--tuto-font-mono, monospace)"},y);v.textContent=o.label.toUpperCase()}if(this._graph.initial&&t[this._graph.initial]){const o=t[this._graph.initial],y=o.x-14,m=o.y+o.h/2,v=o.x,U=o.y+o.h/2,k=R("g",{class:"flow-initial-indicator"},I);R("circle",{cx:y-4,cy:m,r:4,fill:"#ffffff"},k),R("path",{d:`M ${y} ${m} L ${v} ${U}`,stroke:"#ffffff","stroke-width":2,fill:"none","marker-end":"url(#flow-arrow-init)"},k)}for(const o of s){if(!o.route||!o.route.points||o.route.points.length<2)continue;const y=!!(this._selectedNodeId&&o.from===this._selectedNodeId),m=!!(this._selectedNodeId&&o.to===this._selectedNodeId),v=y||m;if(this._selectedNodeId&&!v)continue;const U=o.id===this._selectedEdgeId;o.id,this._hoveredEdgeId;const k=U||y||!!(o.bidirectional&&m),D=this._selectedNodeId?m&&!k:!1,P=!!((o.self||o.from===o.to)&&(!o.waypoints||o.waypoints.length===0)),W=Ut(o.route.points,P,12);R("path",{d:W,class:`flow-edge-path ${k?"hot available":""} ${D?"dimmed":""} ${U?"selected":""}`,stroke:k?"#38bdf8":D?"#334155":"#64748b","stroke-width":k?2.8:D?1.4:1.8,fill:"none","marker-end":k?"url(#flow-arrow-hot)":D?"url(#flow-arrow)":"url(#flow-arrow-init)","marker-start":o.bidirectional?(k?"url(#flow-arrow-hot)":D?"url(#flow-arrow)":"url(#flow-arrow-init)"):null},I).addEventListener("click",z=>{var A,q;if(z.stopPropagation(),!r){if(d){const O=z,at=this.getBoundingClientRect(),nt=this._camera.scale||1,pt=(O.clientX-at.left-this._camera.panX)/nt,gt=(O.clientY-at.top-this._camera.panY)/nt;this._activePopover={type:"edge",id:o.id,worldX:((A=o.route)==null?void 0:A.seatX)||pt,worldY:((q=o.route)==null?void 0:q.seatY)||gt,label:H},this._selectedEdgeId=o.id,this.requestUpdate();return}o.to?(this._activeStateId=o.to,this._selectedNodeId=o.to,this._selectedEdgeId=o.id,this.emit("flow:transition",{from:o.from,to:o.to,event:o.event}),t[o.to]&&this.emit("flow:select-node",{node:t[o.to]}),this.requestUpdate()):(this._selectedEdgeId=o.id,this.emit("flow:select-edge",{edge:o}),this.requestUpdate())}});const H=o.event||o.label||"",X=Math.max(76,Math.min(240,H.length*8+28)),V=28,et=o.route.seatX-X/2,ot=o.route.seatY-V/2,st=((T=this._draggedWaypoint)==null?void 0:T.edgeId)===o.id,F=!this._selectedNodeId||k,E=R("g",{class:`flow-edge-pill ${F?"available":"dimmed"} ${st?"dragging":""}`,transform:`translate(${et}, ${ot})`},N);R("rect",{width:X,height:V,rx:14,fill:F?"#3b82f6":"#202636",stroke:F?"#93c5fd":"rgba(255, 255, 255, 0.12)","stroke-width":F?2:1,filter:F?"drop-shadow(0 4px 14px rgba(59, 130, 246, 0.55))":"drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))"},E);const it=R("text",{x:X/2,y:V/2,"text-anchor":"middle","dominant-baseline":"central",fill:F?"#ffffff":"#94a3b8","font-size":11,"font-weight":800,"letter-spacing":"0.04em","font-family":"var(--tuto-font-sans, sans-serif)"},E);if(it.textContent=H,r?E.addEventListener("pointerdown",z=>{var nt,pt,gt;if(z.button!==0)return;z.stopPropagation();let A=this._edgeWaypoints.get(o.id)?[...this._edgeWaypoints.get(o.id)]:[],q=0;const O=((nt=o.route)==null?void 0:nt.seatX)||et+X/2,at=((pt=o.route)==null?void 0:pt.seatY)||ot+V/2;if(A.length===0){const rt=ht(O,at,o.id,0,t,((gt=this._graph)==null?void 0:gt.transitions)||[],this._edgeWaypoints,G,10);A=[[rt.x,rt.y]],this._edgeWaypoints.set(o.id,A),this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),q=0}else{let rt=0,Bt=1/0;for(let dt=0;dt<A.length;dt++){const Tt=Math.hypot(A[dt][0]-O,A[dt][1]-at);Tt<Bt&&(Bt=Tt,rt=dt)}q=rt}this._startWaypointDrag(o.id,q,z)}):d?(E.addEventListener("pointerdown",z=>z.stopPropagation()),E.addEventListener("click",z=>{var A,q;z.stopPropagation(),this._activePopover={type:"edge",id:o.id,worldX:((A=o.route)==null?void 0:A.seatX)||et+X/2,worldY:((q=o.route)==null?void 0:q.seatY)||ot+V/2,label:H},this._selectedEdgeId=o.id,this.requestUpdate()})):(E.addEventListener("pointerdown",z=>z.stopPropagation()),E.addEventListener("click",z=>{z.stopPropagation(),o.to&&(this._activeStateId=o.to,this._selectedNodeId=o.to,this._selectedEdgeId=o.id,this.emit("flow:transition",{from:o.from,to:o.to,event:o.event}),t[o.to]&&this.emit("flow:select-node",{node:t[o.to]}),this.requestUpdate())})),E.addEventListener("dblclick",z=>{z.stopPropagation(),this._selectedEdgeId=o.id,this._showInspector=!0,this.requestUpdate()}),h&&o.waypoints&&o.waypoints.length>0)for(let z=0;z<o.waypoints.length;z++){const A=o.waypoints[z],q=R("circle",{cx:A[0],cy:A[1],r:6,class:"flow-waypoint-handle",fill:"#ffffff",stroke:"#0284c7","stroke-width":2.2},M);r?q.addEventListener("pointerdown",O=>{O.button===0&&(O.stopPropagation(),this._startWaypointDrag(o.id,z,O))}):d&&(q.addEventListener("pointerdown",O=>O.stopPropagation()),q.addEventListener("click",O=>{O.stopPropagation(),this._activePopover={type:"waypoint",id:o.id,index:z,worldX:A[0],worldY:A[1]},this.requestUpdate()}))}}for(const o of Object.values(t)){const y=R("foreignObject",{x:o.x,y:o.y,width:o.w,height:o.h,style:r?"cursor: grab;":""},S);y.addEventListener("pointerdown",v=>v.stopPropagation());const m=document.createElement("tuto-flow-node");if(m.node=o,m.selected=a===o.id,m.draggableNode=r,m.isDragging=this._draggedNodeId===o.id,r)m.addEventListener("pointerdown",v=>{v.button===0&&(v.stopPropagation(),this._startNodeDrag(o.id,v))});else if(d)m.addEventListener("pointerdown",v=>v.stopPropagation()),m.addEventListener("click",v=>{v.stopPropagation(),this._activePopover={type:"node",id:o.id,worldX:o.x+o.w/2,worldY:o.y,label:o.label||o.id},this.requestUpdate()});else{m.addEventListener("pointerdown",U=>{U.stopPropagation()});const v=U=>{U.stopPropagation();const k=o.id;this._selectedNodeId===k?(this._selectedNodeId=null,this._activeStateId=null,this._selectedEdgeId=null,this.emit("flow:select-node",{node:null})):(this._selectedNodeId=k,this._activeStateId=k,this._selectedEdgeId=null,this.emit("flow:select-node",{node:o})),this.requestUpdate()};m.addEventListener("flow:select-node",v),m.addEventListener("click",v)}m.addEventListener("dblclick",v=>{v.stopPropagation(),this._selectedNodeId=o.id,this._activeStateId=o.id,this._selectedEdgeId=null,this._showInspector=!0,this.requestUpdate()}),y.appendChild(m)}const C=this.shadowRootNode.getElementById("action-popover");if(C){C.addEventListener("pointerdown",k=>k.stopPropagation());const o=C.querySelector("[data-action='remove-waypoint']");o&&((j=this._activePopover)==null?void 0:j.type)==="waypoint"&&o.addEventListener("click",k=>{k.stopPropagation(),this._removeWaypoint(this._activePopover.id,this._activePopover.index)});const y=C.querySelector("[data-action='reset-edge']");y&&(($=this._activePopover)==null?void 0:$.type)==="edge"&&y.addEventListener("click",k=>{k.stopPropagation(),this._resetEdge(this._activePopover.id)});const m=C.querySelector("[data-action='add-waypoint']");m&&((L=this._activePopover)==null?void 0:L.type)==="edge"&&m.addEventListener("click",k=>{k.stopPropagation(),this._addWaypointToEdge(this._activePopover.id,this._activePopover.worldX,this._activePopover.worldY)});const v=C.querySelector("[data-action='reset-node']");v&&((c=this._activePopover)==null?void 0:c.type)==="node"&&v.addEventListener("click",k=>{k.stopPropagation(),this._resetNode(this._activePopover.id)});const U=C.querySelector("[data-action='close-popover']");U&&U.addEventListener("click",k=>{k.stopPropagation(),this._activePopover=null,this.requestUpdate()})}const w=this.shadowRootNode.getElementById("toolbar-el");w&&(w.zoom=Math.round(this._camera.scale*100),w.isInspectorActive=this._showInspector,w.toolMode=this._toolMode,w.addEventListener("flow:zoom-in",()=>this.zoomBy(1.2)),w.addEventListener("flow:zoom-out",()=>this.zoomBy(.8333333333333334)),w.addEventListener("flow:fit",()=>this.fitToViewport()),w.addEventListener("flow:reset",()=>{this._selectedNodeId=null,this._selectedEdgeId=null,this._showInspector=!1,this.fitToViewport()}),w.addEventListener("flow:toggle-move-mode",()=>{this.toolMode=this._toolMode==="move"?"view":"move"}),w.addEventListener("flow:toggle-edit-mode",()=>{this.toolMode=this._toolMode==="edit"?"view":"edit"}),w.addEventListener("flow:snapshot-layout",()=>{this.copyLayoutSnapshot()}),w.addEventListener("flow:reset-layout",()=>{this.resetLayout()}),w.addEventListener("flow:toggle-inspector",()=>{this._toggleInspector()}));const x=this.shadowRootNode.getElementById("inspector-el");if(x){if(x.isOpen=this._showInspector,x.graph=this._graph,x.tools=this._graph.tools||[],this._selectedNodeId&&t[this._selectedNodeId])x.node=t[this._selectedNodeId];else if(this._selectedEdgeId){const o=i.find(y=>y.id===this._selectedEdgeId)||s.find(y=>y.id===this._selectedEdgeId);x.edge=o||null}else x.node=null,x.edge=null;x.addEventListener("flow:close-inspector",()=>{this._closeInspector()})}}}return l(kt,"styles",`
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
      bottom: 1rem;
      z-index: 20;
    }
    .floating-minimap {
      position: absolute;
      right: 1rem;
      bottom: 1rem;
      z-index: 20;
      transition: opacity 200ms ease, transform 200ms ease;
    }
    .floating-minimap.hidden {
      opacity: 0;
      pointer-events: none;
      transform: translateY(10px);
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
  `),customElements.get("tuto-flow-canvas")||customElements.define("tuto-flow-canvas",kt),Et(),f.BaseElement=Y,f.DEFAULT_CAMERA_PADDING=St,f.DEFAULT_GRID_SIZE=G,f.DEFAULT_SNAP_THRESHOLD=vt,f.MAX_CAMERA_SCALE=tt,f.MIN_CAMERA_SCALE=K,f.PRIMARY_FORWARD_EVENTS=Lt,f.SVG_NS=Mt,f.TutoBadge=ft,f.TutoButton=ut,f.TutoFlowCanvas=kt,f.TutoFlowInspector=xt,f.TutoFlowMinimap=_t,f.TutoFlowNode=yt,f.TutoFlowToolbar=wt,f.assignLanes=Ct,f.autoLayoutColumns=Ft,f.bundleEdges=Nt,f.centerOnNode=$t,f.clamp=lt,f.colors=B,f.computeFitBounds=It,f.computeGraphBounds=ct,f.computePolylineMidpoint=Pt,f.escapeHtml=b,f.getBestPortPair=Rt,f.getClosestPort=bt,f.getPort=Yt,f.htmlEl=Wt,f.injectThemeTokens=Et,f.isEdgeHighlighted=jt,f.pointsToSvgPath=Ut,f.resolvePillSeats=Xt,f.routeEdgeItem=zt,f.screenToWorld=qt,f.shouldShowPill=Ht,f.snapNode=At,f.snapWaypoint=ht,f.spacing=Dt,f.svgEl=R,f.typography=J,f.worldToScreen=Ot,f.zoomAtPoint=mt,Object.defineProperty(f,Symbol.toStringTag,{value:"Module"}),f})({});
