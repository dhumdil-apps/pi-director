var TutoUI=(function(g){"use strict";var Xt=Object.defineProperty;var qt=(g,N,j)=>N in g?Xt(g,N,{enumerable:!0,configurable:!0,writable:!0,value:j}):g[N]=j;var l=(g,N,j)=>qt(g,typeof N!="symbol"?N+"":N,j);const N={dark:{bg:"#090a0f",grid:"rgba(255, 255, 255, 0.04)",text:"#f1f5f9",textMuted:"#94a3b8",muted:"#64748b",panelBg:"#10131d",panelHead:"#161b28",cardBg:"#12151f",cardSelectedBg:"#181d2c",headBg:"#161b28",headSelectedBg:"#1e263c",border:"#283044",borderSubtle:"#1c2232",edge:"#7a869e",edgeDim:"#1e2536",hot:"#3b82f6",toolBg:"#141a24",badgeBg:"#181e2e",highlight:"rgba(59, 130, 246, 0.18)",shadow:"0 12px 36px rgba(0, 0, 0, 0.55)"},light:{bg:"#f8fafc",grid:"rgba(100, 116, 139, 0.10)",text:"#0f172a",textMuted:"#475569",muted:"#64748b",panelBg:"#ffffff",panelHead:"#f1f5f9",cardBg:"#ffffff",cardSelectedBg:"#f8fafc",headBg:"#f1f5f9",headSelectedBg:"#e2e8f0",border:"#cbd5e1",borderSubtle:"#e2e8f0",edge:"#64748b",edgeDim:"#e2e8f0",hot:"#2563eb",toolBg:"#ffffff",badgeBg:"#f1f5f9",highlight:"rgba(37, 99, 235, 0.12)",shadow:"0 12px 36px rgba(0, 0, 0, 0.12)"},accents:{align:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},spec:{accent:"#38bdf8",badge:"SPEC",perm:"READ",permClass:"perm-read"},vibe:{accent:"#10b981",badge:"VIBE",perm:"WRITE",permClass:"perm-write"},envision:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},establish:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},evaluate:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},explore:{accent:"#38bdf8",badge:"SPEC",perm:"READ",permClass:"perm-read"},elaborate:{accent:"#38bdf8",badge:"SPEC",perm:"READ",permClass:"perm-read"},execute:{accent:"#10b981",badge:"VIBE",perm:"WRITE",permClass:"perm-write"},examine:{accent:"#10b981",badge:"VIBE",perm:"WRITE",permClass:"perm-write"},closeOut:{accent:"#8b5cf6",badge:"PROCEDURE",perm:"READ",permClass:"perm-read"},blocked:{accent:"#ef4444",badge:"PROCEDURE",perm:"READ",permClass:"perm-read"},handoff:{accent:"#64748b",badge:"PROCEDURE",perm:"STANDBY",permClass:"perm-standby"}}},j={fonts:{sans:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',mono:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'},sizes:{xs:"0.68rem",sm:"0.75rem",base:"0.875rem",md:"0.95rem",lg:"1.125rem",xl:"1.25rem","2xl":"1.5rem"},weights:{normal:"400",medium:"500",semibold:"600",bold:"700",extrabold:"800"},lineHeights:{tight:"1.15",normal:"1.4",relaxed:"1.6"}},Ct={space:{1:"0.25rem",2:"0.5rem",3:"0.75rem",4:"1rem",5:"1.25rem",6:"1.5rem",8:"2rem",10:"2.5rem",12:"3rem"},radii:{none:"0",sm:"0.375rem",md:"0.5rem",lg:"0.75rem",xl:"1rem",full:"9999px"},shadows:{sm:"0 1px 2px 0 rgba(0, 0, 0, 0.05)",md:"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",lg:"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",xl:"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",elevated:"0 12px 36px rgba(0, 0, 0, 0.45)",glow:"0 0 15px rgba(59, 130, 246, 0.35)"},transitions:{fast:"150ms ease",default:"200ms ease",smooth:"300ms cubic-bezier(0.4, 0, 0.2, 1)"},zIndex:{canvas:0,edge:1,node:5,overlay:10,drawer:20,tooltip:30}};function yt(){if(typeof document>"u"||document.getElementById("tuto-theme-tokens"))return;const o=document.createElement("style");o.id="tuto-theme-tokens",o.textContent=`
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
  `,document.head.appendChild(o)}const F=class F extends HTMLElement{constructor(t={}){super();l(this,"_isRenderPending",!1);l(this,"_hasRendered",!1);l(this,"_useShadow");l(this,"shadowRootNode",null);this._useShadow=t.useShadow!==!1,this._useShadow&&(this.shadowRootNode=this.attachShadow({mode:t.shadowMode||"open"}))}connectedCallback(){this.adoptStyles(),this.requestUpdate()}disconnectedCallback(){}adoptStyles(){const t=this.constructor,a=t.styles;if(!(!a||!this.shadowRootNode)){if("adoptedStyleSheets"in Document.prototype&&"adoptedStyleSheets"in ShadowRoot.prototype)try{let s=F._styleSheetMap.get(t);s||(s=new CSSStyleSheet,s.replaceSync(a),F._styleSheetMap.set(t,s)),this.shadowRootNode.adoptedStyleSheets.includes(s)||(this.shadowRootNode.adoptedStyleSheets=[...this.shadowRootNode.adoptedStyleSheets,s]);return}catch{}if(!this.shadowRootNode.querySelector("style[data-tuto-style]")){const s=document.createElement("style");s.setAttribute("data-tuto-style","true"),s.textContent=a,this.shadowRootNode.prepend(s)}}}requestUpdate(){this._isRenderPending||(this._isRenderPending=!0,requestAnimationFrame(()=>{this._isRenderPending=!1,this.render(),this._hasRendered||(this._hasRendered=!0,this.firstUpdated()),this.updated()}))}emit(t,a,s={}){const i=new CustomEvent(t,{bubbles:!0,composed:!0,cancelable:!0,detail:a,...s});return this.dispatchEvent(i)}get renderRoot(){return this.shadowRootNode||this}firstUpdated(){}updated(){}};l(F,"styles",""),l(F,"_styleSheetMap",new WeakMap);let T=F;const _t="http://www.w3.org/2000/svg";function S(o,n={},t){const a=document.createElementNS(_t,o);for(const[s,i]of Object.entries(n))i!=null&&i!==!1&&a.setAttribute(s,String(i));return t&&t.appendChild(a),a}function zt(o,n={},t){const a=document.createElement(o);for(const[s,i]of Object.entries(n))i!=null&&i!==!1&&(s==="className"||s==="class"?a.className=String(i):a.setAttribute(s,String(i)));return t&&t.appendChild(a),a}function u(o){return o==null?"":String(o).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function rt(o,n,t){return Math.max(n,Math.min(t,o))}class ct extends T{static get observedAttributes(){return["variant","size","disabled"]}get variant(){return this.getAttribute("variant")||"secondary"}set variant(n){this.setAttribute("variant",n)}get size(){return this.getAttribute("size")||"md"}set size(n){this.setAttribute("size",n)}get disabled(){return this.hasAttribute("disabled")}set disabled(n){n?this.setAttribute("disabled",""):this.removeAttribute("disabled")}attributeChangedCallback(){this.requestUpdate()}render(){this.shadowRootNode&&(this.shadowRootNode.innerHTML=`
      <button class="variant-${this.variant} size-${this.size}" ${this.disabled?"disabled":""}>
        <slot></slot>
      </button>
    `)}}l(ct,"styles",`
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
  `),customElements.get("tuto-button")||customElements.define("tuto-button",ct);class ht extends T{static get observedAttributes(){return["variant"]}get variant(){return this.getAttribute("variant")||"default"}set variant(n){this.setAttribute("variant",n)}attributeChangedCallback(){this.requestUpdate()}render(){this.shadowRootNode&&(this.shadowRootNode.innerHTML=`
      <span class="badge variant-${this.variant}">
        <slot></slot>
      </span>
    `)}}l(ht,"styles",`
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
  `),customElements.get("tuto-badge")||customElements.define("tuto-badge",ht);const H=.2,K=3.5,xt=44;function kt(o,n,t=xt,a=1.25){const s=o.width||900,i=o.height||700,r=n.w||2e3,d=n.h||1e3,c=rt(Math.min((s-t*2)/r,(i-t*2)/d),H,a),p=(s-r*c)/2-n.x*c,f=(i-d*c)/2-n.y*c;return{panX:p,panY:f,scale:c}}function pt(o,n,t,a,s=H,i=K){const r=rt(o.scale*a,s,i);if(r===o.scale)return o;const d=n-(n-o.panX)*r/o.scale,c=t-(t-o.panY)*r/o.scale;return{panX:d,panY:c,scale:r}}function Et(o,n,t=1.05){const a=o.width||900,s=o.height||700,i=rt(t,H,K),r=n.x+n.w/2,d=n.y+n.h/2,c=a/2-r*i,p=s/2-d*i;return{panX:c,panY:p,scale:i}}function Ut(o,n){return{x:(o.x-n.panX)/n.scale,y:(o.y-n.panY)/n.scale}}function Bt(o,n){return{x:o.x*n.scale+n.panX,y:o.y*n.scale+n.panY}}const Mt=new Set(["GOAL_SET","ASK_ROUTED_SPEC","ASK_ROUTED_VIBE","RESEARCH_DONE","NEXT_VIBE","NEXT_SPEC","NEXT_ALIGN","RUN_CHECKS","CLOSE_OUT","NEXT_HANDOFF"]);function St(o){return o.map((n,t)=>({id:n.id||`${n.from}->${n.to}-${t}`,from:n.from,to:n.to,self:n.from===n.to,label:n.label||n.event||"",event:n.event||n.label||"",events:n.event?[n.event]:[],description:n.description||"",descriptions:n.description?[n.description]:[],userMediated:!1,waypoints:n.waypoints?[...n.waypoints]:void 0}))}function At(o,n,t=.5){const a=Math.min(.9,Math.max(.1,t));return n==="left"?{x:o.x,y:o.y+o.h*a}:n==="right"?{x:o.x+o.w,y:o.y+o.h*a}:n==="top"?{x:o.x+o.w*a,y:o.y}:{x:o.x+o.w*a,y:o.y+o.h}}function gt(o,n){const t=[{point:[o.x,o.y+o.h/2],side:"left"},{point:[o.x+o.w,o.y+o.h/2],side:"right"},{point:[o.x+o.w/2,o.y],side:"top"},{point:[o.x+o.w/2,o.y+o.h],side:"bottom"}];let a=t[0],s=1/0;for(const i of t){const r=Math.hypot(i.point[0]-n[0],i.point[1]-n[1]);r<s&&(s=r,a=i)}return a}function It(o,n=!0){if(!o||o.length===0)return[0,0];if(o.length===1)return o[0];if(o.length===2)return[(o[0][0]+o[1][0])/2,(o[0][1]+o[1][1])/2];if(n&&o.length===3)return o[1];let t=0;const a=[];for(let r=0;r<o.length-1;r++){const d=Math.hypot(o[r+1][0]-o[r][0],o[r+1][1]-o[r][1]);a.push(d),t+=d}if(t===0)return o[0];const s=t/2;let i=0;for(let r=0;r<a.length;r++){const d=a[r];if(i+d>=s){const c=s-i,p=d>0?c/d:.5,f=o[r],h=o[r+1];return[f[0]+(h[0]-f[0])*p,f[1]+(h[1]-f[1])*p]}i+=d}return o[Math.floor(o.length/2)]}function $t(o,n){const t=[[o.x,o.y+o.h/2],[o.x+o.w,o.y+o.h/2],[o.x+o.w/2,o.y],[o.x+o.w/2,o.y+o.h]],a=[[n.x,n.y+n.h/2],[n.x+n.w,n.y+n.h/2],[n.x+n.w/2,n.y],[n.x+n.w/2,n.y+n.h]];let s=t[0],i=a[0],r=1/0;for(const d of t)for(const c of a){const p=Math.hypot(c[0]-d[0],c[1]-d[1]);p<r&&(r=p,s=d,i=c)}return{p1:s,p2:i}}function Lt(o,n){return o}function Nt(o,n){const t=n[o.from],a=n[o.to];if(!t||!a)return null;if(o.waypoints&&o.waypoints.length>0){const r=o.self||o.from===o.to,d=o.waypoints[0],c=o.waypoints[o.waypoints.length-1];let p=gt(t,d),f=gt(a,c),h=p.point,y=f.point;r&&Math.hypot(h[0]-y[0],h[1]-y[1])<8&&(p.side==="right"||p.side==="left"?(h=[h[0],h[1]-12],y=[y[0],y[1]+12]):(h=[h[0]-16,h[1]],y=[y[0]+16,y[1]]));const $=[h,...o.waypoints,y],[P,C]=It($,!0);return{points:$,seatX:P,seatY:C,seatSide:"h"}}if(o.self||o.from===o.to){const r=t.x+t.w,d=t.y+t.h/2,c=38;return{points:[[r,d-10],[r+c,d-18],[r+c,d+18],[r,d+10]],seatX:r+c+24,seatY:d,seatSide:"h"}}const{p1:s,p2:i}=$t(t,a);return{points:[s,i],seatX:(s[0]+i[0])/2,seatY:(s[1]+i[1])/2,seatSide:"h"}}function Tt(o){}function Pt(o,n=!1,t=10){if(!o||o.length===0)return"";if(o.length===1)return`M ${o[0][0]} ${o[0][1]}`;if(n&&o.length===4)return`M ${o[0][0]} ${o[0][1]} C ${o[1][0]} ${o[1][1]}, ${o[2][0]} ${o[2][1]}, ${o[3][0]} ${o[3][1]}`;if(o.length===2)return`M ${o[0][0]} ${o[0][1]} L ${o[1][0]} ${o[1][1]}`;if(t<=0)return o.map((i,r)=>`${r===0?"M":"L"} ${i[0]} ${i[1]}`).join(" ");let a=`M ${o[0][0]} ${o[0][1]}`;for(let i=1;i<o.length-1;i++){const r=o[i-1],d=o[i],c=o[i+1],p=d[0]-r[0],f=d[1]-r[1],h=Math.hypot(p,f),y=c[0]-d[0],$=c[1]-d[1],P=Math.hypot(y,$);if(h<1||P<1){a+=` L ${d[0]} ${d[1]}`;continue}const C=Math.min(t,h/2,P/2),R=d[0]-p/h*C,M=d[1]-f/h*C,L=d[0]+y/P*C,z=d[1]+$/P*C;a+=` L ${R} ${M}`,a+=` Q ${d[0]} ${d[1]} ${L} ${z}`}const s=o[o.length-1];return a+=` L ${s[0]} ${s[1]}`,a}function Wt(o,n,t,a){return t===o.id||a===o.id?!0:n?o.from===n||o.to===n:!1}function Yt(o,n,t,a,s=Mt){return!0}function nt(o,n=64,t=56,a=46,s){let i=1/0,r=1/0,d=-1/0,c=-1/0;const p=Object.values(o);if(p.length===0&&(!s||s.length===0))return{x:0,y:0,w:1e3,h:600};for(const h of p)i=Math.min(i,h.x),r=Math.min(r,h.y),d=Math.max(d,h.x+h.w),c=Math.max(c,h.y+h.h);if(s)for(const h of s)i=Math.min(i,h.x),r=Math.min(r,h.y),d=Math.max(d,h.x+h.w),c=Math.max(c,h.y+h.h);const f=a>0;return{x:i-n,y:r-t-(f?a:0),w:d-i+n*2,h:c-r+t*2+(f?a+80:0)}}function Dt(o,n={}){const t=n.colWidth||420,a=n.colGap||180,s=n.rowGap||40,i=n.startX||120,r=n.startY||120,d={};let c=i,p=r;return o.forEach((f,h)=>{d[f.id]={...f,x:f.x??c,y:f.y??p,w:f.w||t,h:f.h||280},(h+1)%3===0?(c+=t+a,p=r):p+=(f.h||280)+s}),d}class ut extends T{constructor(){super(...arguments);l(this,"_node",null);l(this,"_selected",!1);l(this,"_draggableNode",!1);l(this,"_isDragging",!1)}get node(){return this._node}set node(t){this._node=t,this.requestUpdate()}get selected(){return this._selected}set selected(t){this._selected=!!t,this.requestUpdate()}get draggableNode(){return this._draggableNode}set draggableNode(t){this._draggableNode=!!t,this.requestUpdate()}get isDragging(){return this._isDragging}set isDragging(t){this._isDragging=!!t,this.requestUpdate()}render(){if(!this.shadowRootNode||!this._node)return;const t=this._node,a=N.accents[t.id]||(t.permission?N.accents[t.permission]:null)||N.accents.spec;this.style.setProperty("--node-accent",a.accent);const s=["node-card","compact",this._selected?"selected":"",this._draggableNode?"draggable":"",this._isDragging?"dragging":""].filter(Boolean).join(" ");this.shadowRootNode.innerHTML=`
      <div class="${s}" role="button" tabindex="0">
        <div class="node-head">
          <div class="node-head-left">
            <span class="state-dot"></span>
            <span class="head-title">${u(t.label||t.id)}</span>
          </div>
        </div>
      </div>
    `;const i=this.shadowRootNode.querySelector(".node-card");i&&i.addEventListener("click",r=>{r.stopPropagation(),this.emit("flow:select-node",{node:this._node})})}}l(ut,"styles",`
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
  `),customElements.get("tuto-flow-node")||customElements.define("tuto-flow-node",ut);class ft extends T{constructor(){super(...arguments);l(this,"_zoom",100);l(this,"_isMinimapActive",!1);l(this,"_isInspectorActive",!1);l(this,"_toolMode","view")}get zoom(){return this._zoom}set zoom(t){this._zoom=Math.round(t),this.requestUpdate()}get isMinimapActive(){return this._isMinimapActive}set isMinimapActive(t){this._isMinimapActive=!!t,this.requestUpdate()}get isInspectorActive(){return this._isInspectorActive}set isInspectorActive(t){this._isInspectorActive=!!t,this.requestUpdate()}get toolMode(){return this._toolMode}set toolMode(t){this._toolMode=t,this.requestUpdate()}get isEditModeActive(){return this._toolMode==="edit"}set isEditModeActive(t){this._toolMode=t?"edit":"view",this.requestUpdate()}render(){var i,r,d,c,p,f,h,y,$;if(!this.shadowRootNode)return;const t=this._toolMode==="move",a=this._toolMode==="edit",s=t||a;this.shadowRootNode.innerHTML=`
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
        <button class="tool-btn ${a?"active":""}" id="btn-edit-mode" title="Edit Actions Mode (E) — Click labels & nodes for actions/removal" aria-label="Edit Actions Mode">
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
    `,(i=this.shadowRootNode.getElementById("btn-zoom-in"))==null||i.addEventListener("click",()=>{this.emit("flow:zoom-in")}),(r=this.shadowRootNode.getElementById("btn-zoom-out"))==null||r.addEventListener("click",()=>{this.emit("flow:zoom-out")}),(d=this.shadowRootNode.getElementById("btn-fit"))==null||d.addEventListener("click",()=>{this.emit("flow:fit")}),(c=this.shadowRootNode.getElementById("btn-reset"))==null||c.addEventListener("click",()=>{this.emit("flow:reset")}),(p=this.shadowRootNode.getElementById("btn-move-mode"))==null||p.addEventListener("click",()=>{this.emit("flow:toggle-move-mode")}),(f=this.shadowRootNode.getElementById("btn-edit-mode"))==null||f.addEventListener("click",()=>{this.emit("flow:toggle-edit-mode")}),(h=this.shadowRootNode.getElementById("btn-snapshot"))==null||h.addEventListener("click",()=>{this.emit("flow:snapshot-layout")}),(y=this.shadowRootNode.getElementById("btn-reset-layout"))==null||y.addEventListener("click",()=>{this.emit("flow:reset-layout")}),($=this.shadowRootNode.getElementById("btn-inspector"))==null||$.addEventListener("click",()=>{this.emit("flow:toggle-inspector")})}}l(ft,"styles",`
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
  `),customElements.get("tuto-flow-toolbar")||customElements.define("tuto-flow-toolbar",ft);class mt extends T{constructor(){super(...arguments);l(this,"_bounds",{x:0,y:0,w:2e3,h:1e3});l(this,"_camera",{panX:0,panY:0,scale:1});l(this,"_viewportSize",{width:900,height:700});l(this,"_nodes",{});l(this,"_selectedNodeId",null);l(this,"_isDragging",!1);l(this,"handlePointerDown",t=>{t.button===0&&(t.preventDefault(),this._isDragging=!0,this.panToEvent(t))});l(this,"handlePointerMove",t=>{this._isDragging&&this.panToEvent(t)});l(this,"handlePointerUp",()=>{this._isDragging=!1})}get bounds(){return this._bounds}set bounds(t){this._bounds=t,this.requestUpdate()}get camera(){return this._camera}set camera(t){this._camera=t,this.requestUpdate()}get viewportSize(){return this._viewportSize}set viewportSize(t){this._viewportSize=t,this.requestUpdate()}get nodes(){return this._nodes}set nodes(t){this._nodes=t,this.requestUpdate()}get selectedNodeId(){return this._selectedNodeId}set selectedNodeId(t){this._selectedNodeId=t,this.requestUpdate()}connectedCallback(){super.connectedCallback(),this.addEventListener("pointerdown",this.handlePointerDown),window.addEventListener("pointermove",this.handlePointerMove),window.addEventListener("pointerup",this.handlePointerUp)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("pointerdown",this.handlePointerDown),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("pointerup",this.handlePointerUp)}panToEvent(t){const a=this.getBoundingClientRect(),s=t.clientX-a.left,i=t.clientY-a.top,r=a.width||170,d=a.height||120,c=this._bounds.w||2e3,p=this._bounds.h||1e3,f=Math.min(r/c,d/p),h=s/f+this._bounds.x,y=i/f+this._bounds.y;this.emit("flow:pan-to",{worldX:h,worldY:y})}render(){var R,M;if(!this.shadowRootNode)return;this.shadowRootNode.innerHTML="";const t=S("svg",{viewBox:"0 0 170 120",preserveAspectRatio:"xMidYMid meet"},this.shadowRootNode),a=170,s=120,i=this._bounds.w||2e3,r=this._bounds.h||1e3,d=Math.min(a/i,s/r),c=S("g",{transform:`scale(${d}) translate(${-this._bounds.x}, ${-this._bounds.y})`},t);S("rect",{x:this._bounds.x,y:this._bounds.y,width:this._bounds.w,height:this._bounds.h,rx:16,fill:"rgba(59, 130, 246, 0.04)",stroke:"var(--tuto-border, #30363d)","stroke-width":2},c);for(const[L,z]of Object.entries(this._nodes)){const X=((R=N.accents[L])==null?void 0:R.accent)||((M=N.accents[z.kind])==null?void 0:M.accent)||"#3b82f6";S("rect",{x:z.x,y:z.y,width:z.w,height:z.h,rx:10,fill:L===this._selectedNodeId?X:"var(--tuto-head-bg, #1a2030)",stroke:X,"stroke-width":2},c)}const p=this._viewportSize.width||900,f=this._viewportSize.height||700,h=this._camera.scale||1,y=(-this._camera.panX/h-this._bounds.x)*d,$=(-this._camera.panY/h-this._bounds.y)*d,P=p/h*d,C=f/h*d;S("rect",{x:Math.max(0,Math.min(a,y)),y:Math.max(0,Math.min(s,$)),width:Math.max(4,Math.min(a,P)),height:Math.max(4,Math.min(s,C)),fill:"rgba(59, 130, 246, 0.15)",stroke:"var(--tuto-hot, #3b82f6)","stroke-width":1.5,rx:3},t)}}l(mt,"styles",`
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
  `),customElements.get("tuto-flow-minimap")||customElements.define("tuto-flow-minimap",mt);class bt extends T{constructor(){super(...arguments);l(this,"_isOpen",!1);l(this,"_node",null);l(this,"_edge",null);l(this,"_graph",null);l(this,"_tools",[])}get graph(){return this._graph}set graph(t){this._graph=t,this.requestUpdate()}get isOpen(){return this._isOpen}set isOpen(t){this._isOpen=!!t,this.requestUpdate()}get node(){return this._node}set node(t){this._node=t,t&&(this._edge=null),this.requestUpdate()}get edge(){return this._edge}set edge(t){this._edge=t,t&&(this._node=null),this.requestUpdate()}get tools(){return this._tools}set tools(t){this._tools=t,this.requestUpdate()}render(){var i,r,d,c,p,f,h,y,$,P,C,R,M,L,z,X,Z,Q,tt;if(!this.shadowRootNode)return;let t="",a="";if(this._node){const e=this._node,m=N.accents[e.id]||N.accents[e.kind]||{accent:"#3b82f6",badge:(e.kind||"MODE").toUpperCase(),perm:(e.permission||"READ-ONLY").toUpperCase(),permClass:`perm-${e.permission||"readonly"}`},b=m.perm==="WRITE"?'<svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 3px; display: inline-block; vertical-align: -1px;"><path d="M11 2l3 3-8.5 8.5H2.5v-3z"/></svg>':'<svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 3px; display: inline-block; vertical-align: -1px;"><path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>';this.style.setProperty("--drawer-accent",m.accent),t=`
        <div class="header-titles">
          <h2>${u(e.label||e.id)}</h2>
          <div class="header-badges">
            <span class="badge badge-accent">${u(m.badge)}</span>
            <span class="badge badge-perm ${m.permClass}">${b}${u(m.perm)}</span>
          </div>
        </div>
      `;const x=(e.substates||[]).length?`<div>
            <h4 class="section-title">Substates</h4>
            <div class="chip-group">
              ${e.substates.map(E=>`<span class="chip">${u(E)}</span>`).join("")}
            </div>
          </div>`:"",w=(e.procedure||[]).length?`<div>
            <h4 class="section-title">Ordered Instructions (${e.procedure.length})</h4>
            <ol class="instruction-list">
              ${e.procedure.map((E,D)=>`
                <li class="instruction-item">
                  <span class="instruction-idx">${D+1}.</span>
                  <span>${u(E)}</span>
                </li>
              `).join("")}
            </ol>
          </div>`:"",A=this._tools.filter(E=>(E.modes||[]).includes(e.id)||(E.modes||[]).includes("any")),G=A.length?`<div>
            <h4 class="section-title">Permitted Tools & Gates (${A.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              ${A.map(E=>{var D;return`
                <div class="tool-card">
                  <div class="tool-title">
                    <span>${u(E.name)}</span>
                    <span class="chip">TOOL</span>
                  </div>
                  <p class="section-text" style="font-size: 0.78rem;">${u(E.summary)}</p>
                  ${(D=E.gate)!=null&&D.length?`<div style="font-size: 0.72rem; color: var(--tuto-muted, #64748b);"><strong>Gate:</strong> ${u(E.gate.join(" · "))}</div>`:""}
                </div>
              `}).join("")}
            </div>
          </div>`:"";a=`
        ${e.summary?`<div><h4 class="section-title">Summary</h4><p class="section-text">${u(e.summary)}</p></div>`:""}
        ${x}
        ${w}
        ${G}
      `}else if(this._edge){const e=this._edge;this.style.setProperty("--drawer-accent","#3b82f6");const m=e.event||e.label||"Transition";t=`
        <div class="header-titles">
          <h2>${u(m)}</h2>
          <div class="header-badges">
            <span class="badge badge-accent">TRANSITION</span>
            ${e.userMediated?'<span class="badge badge-perm perm-readonly">USER-MEDIATED</span>':'<span class="badge badge-perm perm-write">PROCEDURAL</span>'}
          </div>
        </div>
      `,a=`
        <div>
          <h4 class="section-title">Route Connection</h4>
          <p class="section-text" style="font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
            <span class="chip" style="font-size: 0.82rem; font-weight: 700; padding: 0.2rem 0.6rem;">${u(e.from.toUpperCase())}</span>
            <span style="color: var(--tuto-muted);">──►</span>
            <span class="chip" style="font-size: 0.82rem; font-weight: 700; padding: 0.2rem 0.6rem;">${u(e.to.toUpperCase())}</span>
          </p>
        </div>
        ${e.label&&e.label!==m?`<div><h4 class="section-title">Action / Intention</h4><p class="section-text" style="color: var(--tuto-text); font-weight: 600;">${u(e.label)}</p></div>`:""}
        ${e.description?`<div><h4 class="section-title">Description & Rules</h4><p class="section-text" style="line-height: 1.6;">${u(e.description)}</p></div>`:""}
        ${(i=e.events)!=null&&i.length?`<div>
                <h4 class="section-title">Trigger Events (${e.events.length})</h4>
                <div class="chip-group">
                  ${e.events.map(v=>`<span class="chip" style="color: var(--tuto-accent, #38bdf8);">${u(v)}</span>`).join("")}
                </div>
              </div>`:""}
        ${(r=e.descriptions)!=null&&r.length&&e.descriptions.length>1?`<div>
                <h4 class="section-title">Bundled Paths</h4>
                <ul class="instruction-list">
                  ${e.descriptions.map(v=>`
                    <li class="instruction-item">
                      <span>${u(v)}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>`:""}
      `}else{this.style.setProperty("--drawer-accent","#f97316");const e=((d=this._graph)==null?void 0:d.title)||"Workflow Overview",m=((c=this._graph)==null?void 0:c.version)||"",v=((p=this._graph)==null?void 0:p.description)||((f=this._graph)==null?void 0:f.summary)||"",b=(h=this._graph)==null?void 0:h.session,x=(y=this._graph)==null?void 0:y.exceptions,w=(($=this._graph)==null?void 0:$.invariants)||((P=this._graph)==null?void 0:P.rules)||(x==null?void 0:x.rules)||[],A=((C=this._graph)==null?void 0:C.ownership)||[],G=((R=this._graph)==null?void 0:R.always)||[],E=(M=this._graph)==null?void 0:M.artifact,D=((L=this._graph)==null?void 0:L.procedures)||{};t=`
        <div class="header-titles">
          <h2>${u(e)}</h2>
          <div class="header-badges">
            <span class="badge badge-accent" style="background: #f97316;">OVERVIEW</span>
            ${m?`<span class="badge badge-perm perm-standby">${u(m)}</span>`:""}
          </div>
        </div>
      `;const V=b?`<div>
            <h4 class="section-title" style="color: var(--tuto-accent, #38bdf8);">Session Model & Artifact Contract</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${b.mode?`<div class="info-card"><span class="info-card-label">Session Mode</span><span class="info-card-value">${u(b.mode)}</span></div>`:""}
              ${b.artifact?`<div class="info-card"><span class="info-card-label">Plan Artifact</span><span class="info-card-value">${u(b.artifact)}</span></div>`:""}
              ${b.scope?`<div class="info-card"><span class="info-card-label">Session Scope</span><span class="info-card-value">${u(b.scope)}</span></div>`:""}
              ${b.review?`<div class="info-card"><span class="info-card-label">Review State</span><span class="info-card-value">${u(b.review)}</span></div>`:""}
            </div>
          </div>`:"",q=x?`<div>
            <h4 class="section-title" style="color: #f97316;">${u(x.title||"Exceptions & Escape Hatches")}</h4>
            ${x.summary?`<p class="section-text" style="line-height: 1.55; margin-bottom: 0.75rem; font-size: 0.82rem;">${u(x.summary)}</p>`:""}
            ${(z=x.commands)!=null&&z.length?`<div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem;">
                    ${x.commands.map(k=>`
                      <div class="tool-card" style="border-left: 3px solid #f97316; padding: 0.65rem 0.8rem;">
                        <div class="tool-title" style="margin-bottom: 0.25rem;">
                          <span style="color: #f97316; font-size: 0.84rem; font-weight: 700;">${u(k.command)}</span>
                          ${k.label?`<span class="chip" style="color: #fdba74; border-color: rgba(249, 115, 22, 0.3); font-size: 0.68rem;">${u(k.label)}</span>`:""}
                        </div>
                        <p class="section-text" style="font-size: 0.78rem; line-height: 1.45;">${u(k.summary||k.description||"")}</p>
                      </div>
                    `).join("")}
                  </div>`:""}
            ${(X=x.rules)!=null&&X.length?`<ul class="instruction-list">
                    ${x.rules.map(k=>`
                      <li class="instruction-item">
                        <span class="instruction-idx" style="color: #f97316;">•</span>
                        <span style="font-size: 0.8rem; line-height: 1.45;">${u(k)}</span>
                      </li>
                    `).join("")}
                  </ul>`:""}
          </div>`:"",O=w.length?`<div>
            <h4 class="section-title">Workflow Invariants & Boundaries</h4>
            <ul class="instruction-list">
              ${w.map(k=>`
                <li class="instruction-item">
                  <span class="instruction-idx" style="color: #f97316;">•</span>
                  <span style="font-size: 0.8rem; line-height: 1.45;">${u(k)}</span>
                </li>
              `).join("")}
            </ul>
          </div>`:"",et=A.length?`<div>
            <h4 class="section-title">Ownership & Roles</h4>
            <ul class="instruction-list">
              ${A.map(k=>`
                <li class="instruction-item">
                  <span class="instruction-idx" style="color: #3b82f6;">•</span>
                  <span style="font-size: 0.8rem; line-height: 1.45;">${u(k)}</span>
                </li>
              `).join("")}
            </ul>
          </div>`:"",ot=E?`<div>
            <h4 class="section-title">Artifact Sections & Identifiers</h4>
            ${(Z=E.sections)!=null&&Z.length?`<div style="margin-bottom: 0.6rem;">
                    <div style="font-size: 0.72rem; color: var(--tuto-muted, #64748b); margin-bottom: 0.35rem; font-weight: 700;">REQUIRED SECTIONS (${E.sections.length})</div>
                    <div class="chip-group">
                      ${E.sections.map(k=>`<span class="chip" style="color: var(--tuto-accent, #38bdf8);">${u(k)}</span>`).join("")}
                    </div>
                  </div>`:""}
            ${E.identifiers&&Object.keys(E.identifiers).length?`<div style="margin-bottom: 0.6rem;">
                    <div style="font-size: 0.72rem; color: var(--tuto-muted, #64748b); margin-bottom: 0.35rem; font-weight: 700;">STABLE LIFECYCLE IDENTIFIERS</div>
                    <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                      ${Object.entries(E.identifiers).map(([k,_])=>`
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem;">
                          <span class="chip" style="font-weight: 700; color: #f97316;">${u(k)}</span>
                          <span style="color: var(--tuto-text-muted, #94a3b8);">${u(_)}</span>
                        </div>
                      `).join("")}
                    </div>
                  </div>`:""}
            ${(Q=E.rules)!=null&&Q.length?`<ul class="instruction-list">
                    ${E.rules.map(k=>`
                      <li class="instruction-item">
                        <span class="instruction-idx" style="color: #38bdf8;">•</span>
                        <span style="font-size: 0.8rem; line-height: 1.45;">${u(k)}</span>
                      </li>
                    `).join("")}
                  </ul>`:""}
          </div>`:"",wt=G.length?`<div>
            <h4 class="section-title">Execution Principles (ALWAYS)</h4>
            <ul class="instruction-list">
              ${G.map(k=>`
                <li class="instruction-item">
                  <span class="instruction-idx" style="color: #22c55e;">•</span>
                  <span style="font-size: 0.8rem; line-height: 1.45;">${u(k)}</span>
                </li>
              `).join("")}
            </ul>
          </div>`:"",W=Object.keys(D),Y=W.length?`<div>
            <h4 class="section-title">Global Procedures (${W.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              ${W.map(k=>`
                <details class="spec-details">
                  <summary>
                    <span>${u(k)}</span>
                    <span class="chip" style="font-size: 0.68rem;">${(D[k]||[]).length} steps</span>
                  </summary>
                  <div class="spec-details-content">
                    <ol class="instruction-list" style="gap: 0.4rem;">
                      ${(D[k]||[]).map((_,I)=>`
                        <li class="instruction-item" style="padding: 0.45rem 0.6rem; font-size: 0.78rem;">
                          <span class="instruction-idx">${I+1}.</span>
                          <span>${u(_)}</span>
                        </li>
                      `).join("")}
                    </ol>
                  </div>
                </details>
              `).join("")}
            </div>
          </div>`:"";a=`
        ${v?`<div>
                <h4 class="section-title">Big Picture & Architecture</h4>
                <p class="section-text" style="line-height: 1.6; color: var(--tuto-text, #e8eaed); font-size: 0.84rem;">${u(v)}</p>
              </div>`:""}
        ${V}
        ${q}
        ${O}
        ${et}
        ${ot}
        ${wt}
        ${Y}

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
          ${a}
        </div>
      </aside>
    `;const s=this.shadowRootNode.querySelector(".drawer");s&&(s.addEventListener("pointerdown",e=>e.stopPropagation()),s.addEventListener("mousedown",e=>e.stopPropagation())),(tt=this.shadowRootNode.getElementById("btn-close"))==null||tt.addEventListener("click",()=>{this.emit("flow:close-inspector")})}}l(bt,"styles",`
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
  `),customElements.get("tuto-flow-inspector")||customElements.define("tuto-flow-inspector",bt);class vt extends T{constructor(){super(...arguments);l(this,"_graph",null);l(this,"_camera",{panX:0,panY:0,scale:1});l(this,"_bounds",{x:0,y:0,w:2e3,h:1e3});l(this,"_activeStateId",null);l(this,"_selectedNodeId",null);l(this,"_selectedEdgeId",null);l(this,"_hoveredEdgeId",null);l(this,"_showMinimap",!1);l(this,"_showInspector",!0);l(this,"_hasRestoredCamera",!1);l(this,"_theme","dark");l(this,"_toolMode","view");l(this,"_isDragging",!1);l(this,"_dragStart",{x:0,y:0,panX:0,panY:0});l(this,"_draggedNodeId",null);l(this,"_dragNodeStart",null);l(this,"_nodeDragMoved",!1);l(this,"_edgeWaypoints",new Map);l(this,"_draggedWaypoint",null);l(this,"_defaultLayout",null);l(this,"_toastMessage",null);l(this,"_toastTimeout",null);l(this,"_activePopover",null);l(this,"handleKeyDown",t=>{var a;t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement||(t.key==="+"||t.key==="="?this.zoomBy(1.2):t.key==="-"?this.zoomBy(.8333333333333334):t.key==="0"||t.key==="f"||t.key==="F"?this.fitToViewport():t.key==="r"||t.key==="R"?(a=this._graph)!=null&&a.initial&&(this._activeStateId=this._graph.initial,this._selectedNodeId=this._graph.initial,this._selectedEdgeId=null,this.requestUpdate()):t.key==="i"||t.key==="I"?this._toggleInspector():t.key==="m"||t.key==="M"?this.toolMode=this._toolMode==="move"?"view":"move":t.key==="e"||t.key==="E"?this.toolMode=this._toolMode==="edit"?"view":"edit":(t.key==="s"||t.key==="S")&&this._toolMode!=="view"?this.copyLayoutSnapshot():t.key==="Escape"&&(this._activePopover?(this._activePopover=null,this.requestUpdate()):this._selectedNodeId||this._selectedEdgeId?(this._selectedNodeId=null,this._activeStateId=null,this._selectedEdgeId=null,this.requestUpdate()):this._toolMode!=="view"?this.toolMode="view":this._closeInspector()))});l(this,"handleResize",()=>{this.requestUpdate()});l(this,"handleWheel",t=>{t.preventDefault();const a=this.getBoundingClientRect(),s=t.clientX-a.left,i=t.clientY-a.top,r=t.deltaY<0?1.12:.89;this._camera=pt(this._camera,s,i,r,H,K),this._saveCamera(),this.requestUpdate()});l(this,"handlePointerDown",t=>{var i;if(t.button!==0||t.target.closest(".flow-edge-pill, tuto-flow-node, .floating-toolbar, .floating-minimap, tuto-flow-inspector, .flow-waypoint-handle, .flow-waypoint-split"))return;this._isDragging=!0,this._dragStart={x:t.clientX,y:t.clientY,panX:this._camera.panX,panY:this._camera.panY};const s=(i=this.shadowRootNode)==null?void 0:i.querySelector("svg.flow-svg");s==null||s.classList.add("grabbing"),window.addEventListener("pointermove",this.handlePointerMove),window.addEventListener("pointerup",this.handlePointerUp)});l(this,"handlePointerMove",t=>{this._isDragging&&(this._camera={...this._camera,panX:this._dragStart.panX+(t.clientX-this._dragStart.x),panY:this._dragStart.panY+(t.clientY-this._dragStart.y)},this.requestUpdate())});l(this,"handlePointerUp",()=>{var a;this._isDragging&&(Math.hypot(this._camera.panX-this._dragStart.panX,this._camera.panY-this._dragStart.panY)<4&&(this._selectedNodeId=null,this._activeStateId=null,this._selectedEdgeId=null),this._saveCamera()),this._isDragging=!1;const t=(a=this.shadowRootNode)==null?void 0:a.querySelector("svg.flow-svg");t==null||t.classList.remove("grabbing"),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("pointerup",this.handlePointerUp),this.requestUpdate()});l(this,"handleNodePointerMove",t=>{if(!this._draggedNodeId||!this._dragNodeStart||!this._graph)return;const a=this._graph.states[this._draggedNodeId];if(!a)return;const s=this._camera.scale||1,i=(t.clientX-this._dragNodeStart.startX)/s,r=(t.clientY-this._dragNodeStart.startY)/s;Math.hypot(i,r)>4&&(this._nodeDragMoved=!0);const d=this._dragNodeStart.nodeOrigX+i,c=this._dragNodeStart.nodeOrigY+r;a.x=Math.round(d/10)*10,a.y=Math.round(c/10)*10;const p=this._graph.framing!==!1;this._bounds=nt(this._graph.states,p?64:40,p?56:30,p?46:0,this._graph.groups),this.requestUpdate()});l(this,"handleNodePointerUp",()=>{var a;if(!this._draggedNodeId)return;const t=this._draggedNodeId;this._draggedNodeId=null,this._dragNodeStart=null,window.removeEventListener("pointermove",this.handleNodePointerMove),window.removeEventListener("pointerup",this.handleNodePointerUp),this._nodeDragMoved?this.emit("flow:layout-change",{nodeId:t,layout:this.exportLayoutSnapshot()}):this._selectedNodeId===t?(this._selectedNodeId=null,this._activeStateId=null,this.emit("flow:select-node",{node:null})):(this._selectedNodeId=t,this._activeStateId=t,(a=this._graph)!=null&&a.states[t]&&this.emit("flow:select-node",{node:this._graph.states[t]})),this.requestUpdate()});l(this,"handleWaypointPointerMove",t=>{if(!this._draggedWaypoint)return;const{edgeId:a,waypointIndex:s,startX:i,startY:r,origX:d,origY:c}=this._draggedWaypoint,p=this._edgeWaypoints.get(a);if(!p||!p[s])return;const f=this._camera.scale||1,h=(t.clientX-i)/f,y=(t.clientY-r)/f,$=Math.round((d+h)/10)*10,P=Math.round((c+y)/10)*10;p[s]=[$,P],this.requestUpdate()});l(this,"handleWaypointPointerUp",()=>{this._draggedWaypoint&&(this._draggedWaypoint=null,window.removeEventListener("pointermove",this.handleWaypointPointerMove),window.removeEventListener("pointerup",this.handleWaypointPointerUp),this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.requestUpdate())})}get graph(){return this._graph}set graph(t){if(this._graph=t,t){if(!this._defaultLayout&&t.states){this._defaultLayout={};for(const[s,i]of Object.entries(t.states))this._defaultLayout[s]={x:i.x,y:i.y,w:i.w,h:i.h}}if(this._edgeWaypoints.clear(),t.transitions)for(const s of t.transitions)s.waypoints&&s.waypoints.length>0&&this._edgeWaypoints.set(s.id,s.waypoints.map(i=>[...i]));try{const s=localStorage.getItem("pi_workflow_edge_override");if(s!==null){const i=JSON.parse(s);this._edgeWaypoints.clear();for(const[r,d]of Object.entries(i))Array.isArray(d)&&d.length>0&&this._edgeWaypoints.set(r,d)}}catch{}this._activeStateId||(this._activeStateId=t.initial||Object.keys(t.states||{})[0]||null);const a=t.framing!==!1;if(this._bounds=nt(t.states,a?64:40,a?56:30,a?46:0,t.groups),!this._hasRestoredCamera)try{const s=localStorage.getItem("pi_workflow_camera");if(s){const i=JSON.parse(s);i&&typeof i.scale=="number"&&typeof i.panX=="number"&&(this._camera=i,this._hasRestoredCamera=!0)}}catch{}this._hasRestoredCamera||requestAnimationFrame(()=>this.fitToViewport())}this.requestUpdate()}_removeWaypoint(t,a){const s=[...this._edgeWaypoints.get(t)||[]];a>=0&&a<s.length&&s.splice(a,1),s.length===0?(this._edgeWaypoints.delete(t),this.showToast("✓ Straightened edge (0 breakpoints)")):(this._edgeWaypoints.set(t,s),this.showToast(`✓ Removed breakpoint (${s.length}/2 remaining)`)),this._activePopover=null,this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.requestUpdate()}_resetEdge(t){this._edgeWaypoints.delete(t),this._activePopover=null,this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.showToast("✓ Reset edge to straight line (0 breakpoints)"),this.requestUpdate()}_addWaypointToEdge(t,a,s){const i=this._edgeWaypoints.get(t)?[...this._edgeWaypoints.get(t)]:[];if(i.length>=2){this.showToast("Maximum 2 breakpoints per line");return}const r=Math.round(a/10)*10,d=Math.round(s/10)*10;i.push([r,d]),this._edgeWaypoints.set(t,i),this._activePopover={type:"waypoint",id:t,index:i.length-1,worldX:r,worldY:d},this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.showToast(`✓ Added breakpoint (${i.length}/2)`),this.requestUpdate()}_resetNode(t){var a,s;if(this._defaultLayout&&this._defaultLayout[t]&&((s=(a=this._graph)==null?void 0:a.states)!=null&&s[t])){const i=this._defaultLayout[t];this._graph.states[t].x=i.x,this._graph.states[t].y=i.y,this._graph.states[t].w=i.w,this._graph.states[t].h=i.h;try{const r=localStorage.getItem("pi_workflow_layout_override");if(r){const d=JSON.parse(r);delete d[t],localStorage.setItem("pi_workflow_layout_override",JSON.stringify(d))}}catch{}this._activePopover=null,this.emit("flow:layout-change",{nodeId:t,layout:this.exportLayoutSnapshot()}),this.showToast(`✓ Reset ${t} position`),this.requestUpdate()}}_renderPopoverContent(){var t,a;if(!this._activePopover)return"";if(this._activePopover.type==="waypoint"){const s=this._activePopover.id,i=this._edgeWaypoints.get(s)||[];return`
        <span class="flow-fab-label">
          Breakpoint #${(this._activePopover.index??0)+1} of ${i.length}
          <span class="flow-fab-badge">${Math.round(this._activePopover.worldX)}, ${Math.round(this._activePopover.worldY)}</span>
        </span>
        <button type="button" class="flow-fab-btn danger" data-action="remove-waypoint" title="Remove this breakpoint">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          Remove
        </button>
        <button type="button" class="flow-fab-close" data-action="close-popover" title="Close">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `}if(this._activePopover.type==="edge"){const s=this._activePopover.id,i=this._edgeWaypoints.get(s)||[],r=i.length>0,d=i.length<2;return`
        <span class="flow-fab-label">
          ${u(this._activePopover.label||s)}
          <span class="flow-fab-badge">${r?`${i.length}/2 bp`:"Straight (0 bp)"}</span>
        </span>
        ${r?`<button type="button" class="flow-fab-btn warning" data-action="reset-edge" title="Straighten line (remove all breakpoints)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                Straighten
              </button>`:""}
        ${d?`<button type="button" class="flow-fab-btn primary" data-action="add-waypoint" title="Add a breakpoint (${i.length+1}/2)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Breakpoint
              </button>`:""}
        <button type="button" class="flow-fab-close" data-action="close-popover" title="Close">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `}if(this._activePopover.type==="node"){const s=this._activePopover.id,i=(a=(t=this._graph)==null?void 0:t.states)==null?void 0:a[s];return`
        <span class="flow-fab-label">
          ${u(this._activePopover.label||s)}
          <span class="flow-fab-badge">${Math.round((i==null?void 0:i.x)||0)}, ${Math.round((i==null?void 0:i.y)||0)}</span>
        </span>
        <button type="button" class="flow-fab-btn warning" data-action="reset-node" title="Reset node position to default">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
          Reset Position
        </button>
        <button type="button" class="flow-fab-close" data-action="close-popover" title="Close">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `}return""}get toolMode(){return this._toolMode}set toolMode(t){this._toolMode=t,this._activePopover=null,this.emit("flow:tool-mode-change",{toolMode:this._toolMode}),this._toolMode==="move"?this.showToast("Move Mode Active (Drag nodes, labels & lines to reposition · M to exit)"):this._toolMode==="edit"&&this.showToast("Edit Mode Active (Click labels, waypoints & nodes for actions · E to exit)"),this.requestUpdate()}get isEditMode(){return this._toolMode==="edit"}set isEditMode(t){this.toolMode=t?"edit":"view"}get isMoveMode(){return this._toolMode==="move"}set isMoveMode(t){this.toolMode=t?"move":"view"}get activeStateId(){return this._activeStateId}set activeStateId(t){this._activeStateId=t,this.requestUpdate()}get selectedNodeId(){return this._selectedNodeId}set selectedNodeId(t){this._selectedNodeId=t,this.requestUpdate()}get selectedEdgeId(){return this._selectedEdgeId}set selectedEdgeId(t){this._selectedEdgeId=t,this.requestUpdate()}get showMinimap(){return this._showMinimap}set showMinimap(t){this._showMinimap=!!t,this.requestUpdate()}get showInspector(){return this._showInspector}set showInspector(t){this._showInspector=!!t,this.requestUpdate()}get theme(){return this._theme}set theme(t){this._theme=t,this.setAttribute("data-theme",t),this.requestUpdate()}connectedCallback(){super.connectedCallback();try{const t=localStorage.getItem("pi_workflow_inspector_open");t!==null?this._showInspector=JSON.parse(t):this._showInspector=!0;const a=localStorage.getItem("pi_workflow_camera");if(a!==null){const s=JSON.parse(a);s&&typeof s.scale=="number"&&typeof s.panX=="number"&&(this._camera=s,this._hasRestoredCamera=!0)}}catch{}window.addEventListener("keydown",this.handleKeyDown),window.addEventListener("resize",this.handleResize)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.handleKeyDown),window.removeEventListener("resize",this.handleResize),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("pointerup",this.handlePointerUp),window.removeEventListener("pointermove",this.handleNodePointerMove),window.removeEventListener("pointerup",this.handleNodePointerUp),window.removeEventListener("pointermove",this.handleWaypointPointerMove),window.removeEventListener("pointerup",this.handleWaypointPointerUp)}_saveCamera(){try{localStorage.setItem("pi_workflow_camera",JSON.stringify(this._camera))}catch{}}_toggleInspector(){this._showInspector=!this._showInspector;try{localStorage.setItem("pi_workflow_inspector_open",JSON.stringify(this._showInspector))}catch{}this.requestUpdate()}_closeInspector(){this._showInspector=!1;try{localStorage.setItem("pi_workflow_inspector_open",JSON.stringify(!1))}catch{}this.requestUpdate()}fitToViewport(){const t=this.getBoundingClientRect(),a=t.width||900,s=t.height||700,i=this._showInspector?Math.min(420,a*.45):0,r=a-i,d=kt({width:r,height:s},this._bounds);this._camera={scale:d.scale,panX:d.panX,panY:d.panY},this._saveCamera(),this.requestUpdate()}centerOnState(t){var p;if(!((p=this._graph)!=null&&p.states[t]))return;const a=this._graph.states[t],s=this.getBoundingClientRect(),i=s.width||900,r=s.height||700,d=this._showInspector?Math.min(420,i*.45):0,c=i-d;this._camera=Et({width:c,height:r},a),this._activeStateId=t,this._selectedNodeId=t,this._selectedEdgeId=null,this._saveCamera(),this.requestUpdate()}showToast(t){this._toastMessage=t,this._toastTimeout&&clearTimeout(this._toastTimeout),this.requestUpdate(),this._toastTimeout=setTimeout(()=>{this._toastMessage=null,this.requestUpdate()},2500)}exportLayoutSnapshot(){var s;const t={};if((s=this._graph)!=null&&s.states)for(const[i,r]of Object.entries(this._graph.states))t[i]={x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.w),h:Math.round(r.h)};const a={};for(const[i,r]of this._edgeWaypoints.entries())r&&r.length>0&&(a[i]=r.map(([d,c])=>[Math.round(d),Math.round(c)]));return{...t,nodes:t,edges:a}}async copyLayoutSnapshot(){const t=this.exportLayoutSnapshot(),a=t.nodes||{},s=t.edges||{},i={nodes:a,edges:s},r=`window.WORKFLOW_LAYOUT = ${JSON.stringify(i,null,2)};
`;try{typeof navigator<"u"&&navigator.clipboard&&navigator.clipboard.writeText&&await navigator.clipboard.writeText(r)}catch{}try{localStorage.setItem("pi_workflow_layout_override",JSON.stringify(a)),this._saveEdgeWaypoints()}catch{}return console.log(`Exported layout JS:
`+r),this.showToast("✓ Layout JS copied to clipboard!"),this.emit("flow:snapshot-layout",{snapshot:t,code:r,json:i}),r}resetLayout(){var a;if(!this._defaultLayout||!((a=this._graph)!=null&&a.states))return;for(const[s,i]of Object.entries(this._defaultLayout))this._graph.states[s]&&(this._graph.states[s].x=i.x,this._graph.states[s].y=i.y,this._graph.states[s].w=i.w,this._graph.states[s].h=i.h);this._edgeWaypoints.clear();try{localStorage.removeItem("pi_workflow_layout_override"),localStorage.removeItem("pi_workflow_edge_override")}catch{}const t=this._graph.framing!==!1;this._bounds=nt(this._graph.states,t?64:40,t?56:30,t?46:0,this._graph.groups),this.showToast("✓ Reset layout to default"),this.emit("flow:reset-layout"),this.requestUpdate()}zoomBy(t){const a=this.getBoundingClientRect(),s=a.width/2,i=a.height/2;this._camera=pt(this._camera,s,i,t,H,K),this._saveCamera(),this.requestUpdate()}_startNodeDrag(t,a){var i;const s=(i=this._graph)==null?void 0:i.states[t];s&&(this._draggedNodeId=t,this._nodeDragMoved=!1,this._dragNodeStart={startX:a.clientX,startY:a.clientY,nodeOrigX:s.x,nodeOrigY:s.y},window.addEventListener("pointermove",this.handleNodePointerMove),window.addEventListener("pointerup",this.handleNodePointerUp),this.requestUpdate())}_startWaypointDrag(t,a,s){const i=this._edgeWaypoints.get(t);if(!i||!i[a])return;const r=i[a];this._draggedWaypoint={edgeId:t,waypointIndex:a,startX:s.clientX,startY:s.clientY,origX:r[0],origY:r[1]},window.addEventListener("pointermove",this.handleWaypointPointerMove),window.addEventListener("pointerup",this.handleWaypointPointerUp),this.requestUpdate()}_saveEdgeWaypoints(){try{const t={};for(const[a,s]of this._edgeWaypoints.entries())s&&s.length>0&&(t[a]=s);localStorage.setItem("pi_workflow_edge_override",JSON.stringify(t))}catch{}}render(){var z,X,Z,Q,tt;if(!this.shadowRootNode)return;if(!this._graph){this.shadowRootNode.innerHTML=`
        <div class="canvas-root" style="display:flex;align-items:center;justify-content:center;color:var(--tuto-muted);">
          No flow graph loaded
        </div>
      `;return}const t=this._graph.states,a=this._graph.transitions||[],s=Lt(St(a));for(const e of s){this._edgeWaypoints.has(e.id)?e.waypoints=this._edgeWaypoints.get(e.id):e.waypoints=void 0;const m=Nt(e,t);m&&(e.route=m)}const i=this._selectedNodeId||this._activeStateId||null,r=this._toolMode==="move",d=this._toolMode==="edit",c=r||d;let p="";if(d&&this._activePopover){const e=this._camera.panX+this._activePopover.worldX*this._camera.scale,m=this._camera.panY+this._activePopover.worldY*this._camera.scale;p=`
        <div class="flow-fab-popover" id="action-popover" style="left: ${e}px; top: ${m}px;">
          ${this._renderPopoverContent()}
        </div>
      `}this.shadowRootNode.innerHTML=`
      <div class="canvas-root ${r?"move-mode edit-mode":d?"edit-mode":""}">
        ${this._toastMessage?`<div class="flow-toast">${u(this._toastMessage)}</div>`:""}
        ${p}

        <svg class="flow-svg" id="flow-svg">
          <defs>
            <pattern id="flow-grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1" fill="var(--tuto-grid, rgba(255, 255, 255, 0.04))" />
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
              <text x="${this._bounds.x+20}" y="${this._bounds.y+28}" fill="var(--tuto-text, #ffffff)" font-size="12" font-weight="700" letter-spacing="0.05em" font-family="var(--tuto-font-sans, sans-serif)">${u(this._graph.title.toUpperCase())}</text>
              ${this._graph.subtitle?`<text x="${this._bounds.x+20+this._graph.title.length*7.5+16}" y="${this._bounds.y+28}" fill="var(--tuto-muted, #64748b)" font-size="11" font-family="var(--tuto-font-sans, sans-serif)">${u(this._graph.subtitle)}</text>`:""}
              <text x="${this._bounds.x+this._bounds.w-20}" y="${this._bounds.y+28}" fill="var(--tuto-muted, #64748b)" font-size="11" font-family="var(--tuto-font-mono, monospace)" text-anchor="end">${u(this._graph.version||"v1.0")}</text>
            </g>`:""}

            <!-- Groups Background Layer -->
            <g id="groups-group"></g>

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
    `;const f=this.shadowRootNode.querySelector("svg.flow-svg");f&&(f.addEventListener("wheel",this.handleWheel,{passive:!1}),f.addEventListener("pointerdown",this.handlePointerDown));const h=this.shadowRootNode.getElementById("groups-group"),y=this.shadowRootNode.getElementById("edges-paths-group"),$=this.shadowRootNode.getElementById("edges-pills-group"),P=this.shadowRootNode.getElementById("edges-handles-group"),C=this.shadowRootNode.getElementById("nodes-group");if(this._graph.groups)for(const e of this._graph.groups){const m=S("g",{class:"flow-group-container"},h),v=e.accent||"#3b82f6";S("rect",{x:e.x,y:e.y,width:e.w,height:e.h,rx:14,fill:"var(--tuto-card-bg, #12161c)","fill-opacity":"0.38",stroke:v,"stroke-width":1.2,"stroke-opacity":"0.35"},m),S("path",{d:`M ${e.x} ${e.y+14} Q ${e.x} ${e.y} ${e.x+14} ${e.y} L ${e.x+e.w-14} ${e.y} Q ${e.x+e.w} ${e.y} ${e.x+e.w} ${e.y+14} L ${e.x+e.w} ${e.y+28} L ${e.x} ${e.y+28} Z`,fill:v,"fill-opacity":"0.12"},m);const b=S("text",{x:e.x+14,y:e.y+18,fill:v,"font-size":10.5,"font-weight":800,"letter-spacing":"0.08em","font-family":"var(--tuto-font-mono, monospace)"},m);b.textContent=e.label.toUpperCase()}if(this._graph.initial&&t[this._graph.initial]){const e=t[this._graph.initial],m=e.x-14,v=e.y+e.h/2,b=e.x,x=e.y+e.h/2,w=S("g",{class:"flow-initial-indicator"},y);S("circle",{cx:m-4,cy:v,r:4,fill:"#ffffff"},w),S("path",{d:`M ${m} ${v} L ${b} ${x}`,stroke:"#ffffff","stroke-width":2,fill:"none","marker-end":"url(#flow-arrow-init)"},w)}for(const e of s){if(!e.route||!e.route.points||e.route.points.length<2)continue;const m=!!(this._selectedNodeId&&e.from===this._selectedNodeId),v=!!(this._selectedNodeId&&e.to===this._selectedNodeId),b=m||v;if(this._selectedNodeId&&!b)continue;const x=e.id===this._selectedEdgeId;e.id,this._hoveredEdgeId;const w=x||m,A=this._selectedNodeId?v:!1,G=!!((e.self||e.from===e.to)&&(!e.waypoints||e.waypoints.length===0)),E=Pt(e.route.points,G,12);S("path",{d:E,class:`flow-edge-path ${w?"hot available":""} ${A?"dimmed":""} ${x?"selected":""}`,stroke:w?"#38bdf8":A?"#334155":"#64748b","stroke-width":w?2.8:A?1.4:1.8,fill:"none","marker-end":w?"url(#flow-arrow-hot)":A?"url(#flow-arrow)":"url(#flow-arrow-init)"},y).addEventListener("click",_=>{var I,U;if(_.stopPropagation(),!r){if(d){const B=_,st=this.getBoundingClientRect(),it=this._camera.scale||1,dt=(B.clientX-st.left-this._camera.panX)/it,J=(B.clientY-st.top-this._camera.panY)/it;this._activePopover={type:"edge",id:e.id,worldX:((I=e.route)==null?void 0:I.seatX)||dt,worldY:((U=e.route)==null?void 0:U.seatY)||J,label:V},this._selectedEdgeId=e.id,this.requestUpdate();return}e.to?(this._activeStateId=e.to,this._selectedNodeId=e.to,this._selectedEdgeId=e.id,this.emit("flow:transition",{from:e.from,to:e.to,event:e.event}),t[e.to]&&this.emit("flow:select-node",{node:t[e.to]}),this.requestUpdate()):(this._selectedEdgeId=e.id,this.emit("flow:select-edge",{edge:e}),this.requestUpdate())}});const V=e.event||e.label||"",q=Math.max(76,Math.min(240,V.length*8+28)),O=28,et=e.route.seatX-q/2,ot=e.route.seatY-O/2,wt=((z=this._draggedWaypoint)==null?void 0:z.edgeId)===e.id,W=m||!this._selectedNodeId,Y=S("g",{class:`flow-edge-pill ${W?"available":"dimmed"} ${wt?"dragging":""}`,transform:`translate(${et}, ${ot})`},$);S("rect",{width:q,height:O,rx:14,fill:W?"#3b82f6":"#202636",stroke:W?"#93c5fd":"rgba(255, 255, 255, 0.12)","stroke-width":W?2:1,filter:W?"drop-shadow(0 4px 14px rgba(59, 130, 246, 0.55))":"drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))"},Y);const k=S("text",{x:q/2,y:O/2,"text-anchor":"middle","dominant-baseline":"central",fill:W?"#ffffff":"#94a3b8","font-size":11,"font-weight":800,"letter-spacing":"0.04em","font-family":"var(--tuto-font-sans, sans-serif)"},Y);if(k.textContent=V,r?Y.addEventListener("pointerdown",_=>{var it,dt;if(_.button!==0)return;_.stopPropagation();let I=this._edgeWaypoints.get(e.id)?[...this._edgeWaypoints.get(e.id)]:[],U=0;const B=((it=e.route)==null?void 0:it.seatX)||et+q/2,st=((dt=e.route)==null?void 0:dt.seatY)||ot+O/2;if(I.length===0){const J=Math.round(B/10)*10,lt=Math.round(st/10)*10;I=[[J,lt]],this._edgeWaypoints.set(e.id,I),this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),U=0}else{let J=0,lt=1/0;for(let at=0;at<I.length;at++){const Rt=Math.hypot(I[at][0]-B,I[at][1]-st);Rt<lt&&(lt=Rt,J=at)}U=J}this._startWaypointDrag(e.id,U,_)}):d?(Y.addEventListener("pointerdown",_=>_.stopPropagation()),Y.addEventListener("click",_=>{var I,U;_.stopPropagation(),this._activePopover={type:"edge",id:e.id,worldX:((I=e.route)==null?void 0:I.seatX)||et+q/2,worldY:((U=e.route)==null?void 0:U.seatY)||ot+O/2,label:V},this._selectedEdgeId=e.id,this.requestUpdate()})):(Y.addEventListener("pointerdown",_=>_.stopPropagation()),Y.addEventListener("click",_=>{_.stopPropagation(),e.to&&(this._activeStateId=e.to,this._selectedNodeId=e.to,this._selectedEdgeId=e.id,this.emit("flow:transition",{from:e.from,to:e.to,event:e.event}),t[e.to]&&this.emit("flow:select-node",{node:t[e.to]}),this.requestUpdate())})),Y.addEventListener("dblclick",_=>{_.stopPropagation(),this._selectedEdgeId=e.id,this._showInspector=!0,this.requestUpdate()}),c&&e.waypoints&&e.waypoints.length>0)for(let _=0;_<e.waypoints.length;_++){const I=e.waypoints[_],U=S("circle",{cx:I[0],cy:I[1],r:6,class:"flow-waypoint-handle",fill:"#ffffff",stroke:"#0284c7","stroke-width":2.2},P);r?U.addEventListener("pointerdown",B=>{B.button===0&&(B.stopPropagation(),this._startWaypointDrag(e.id,_,B))}):d&&(U.addEventListener("pointerdown",B=>B.stopPropagation()),U.addEventListener("click",B=>{B.stopPropagation(),this._activePopover={type:"waypoint",id:e.id,index:_,worldX:I[0],worldY:I[1]},this.requestUpdate()}))}}for(const e of Object.values(t)){const m=S("foreignObject",{x:e.x,y:e.y,width:e.w,height:e.h,style:r?"cursor: grab;":""},C);m.addEventListener("pointerdown",b=>b.stopPropagation());const v=document.createElement("tuto-flow-node");if(v.node=e,v.selected=i===e.id,v.draggableNode=r,v.isDragging=this._draggedNodeId===e.id,r)v.addEventListener("pointerdown",b=>{b.button===0&&(b.stopPropagation(),this._startNodeDrag(e.id,b))});else if(d)v.addEventListener("pointerdown",b=>b.stopPropagation()),v.addEventListener("click",b=>{b.stopPropagation(),this._activePopover={type:"node",id:e.id,worldX:e.x+e.w/2,worldY:e.y,label:e.label||e.id},this.requestUpdate()});else{v.addEventListener("pointerdown",x=>{x.stopPropagation()});const b=x=>{x.stopPropagation();const w=e.id;this._selectedNodeId===w?(this._selectedNodeId=null,this._activeStateId=null,this._selectedEdgeId=null,this.emit("flow:select-node",{node:null})):(this._selectedNodeId=w,this._activeStateId=w,this._selectedEdgeId=null,this.emit("flow:select-node",{node:e})),this.requestUpdate()};v.addEventListener("flow:select-node",b),v.addEventListener("click",b)}v.addEventListener("dblclick",b=>{b.stopPropagation(),this._selectedNodeId=e.id,this._activeStateId=e.id,this._selectedEdgeId=null,this._showInspector=!0,this.requestUpdate()}),m.appendChild(v)}const R=this.shadowRootNode.getElementById("action-popover");if(R){R.addEventListener("pointerdown",w=>w.stopPropagation());const e=R.querySelector("[data-action='remove-waypoint']");e&&((X=this._activePopover)==null?void 0:X.type)==="waypoint"&&e.addEventListener("click",w=>{w.stopPropagation(),this._removeWaypoint(this._activePopover.id,this._activePopover.index)});const m=R.querySelector("[data-action='reset-edge']");m&&((Z=this._activePopover)==null?void 0:Z.type)==="edge"&&m.addEventListener("click",w=>{w.stopPropagation(),this._resetEdge(this._activePopover.id)});const v=R.querySelector("[data-action='add-waypoint']");v&&((Q=this._activePopover)==null?void 0:Q.type)==="edge"&&v.addEventListener("click",w=>{w.stopPropagation(),this._addWaypointToEdge(this._activePopover.id,this._activePopover.worldX,this._activePopover.worldY)});const b=R.querySelector("[data-action='reset-node']");b&&((tt=this._activePopover)==null?void 0:tt.type)==="node"&&b.addEventListener("click",w=>{w.stopPropagation(),this._resetNode(this._activePopover.id)});const x=R.querySelector("[data-action='close-popover']");x&&x.addEventListener("click",w=>{w.stopPropagation(),this._activePopover=null,this.requestUpdate()})}const M=this.shadowRootNode.getElementById("toolbar-el");M&&(M.zoom=Math.round(this._camera.scale*100),M.isInspectorActive=this._showInspector,M.toolMode=this._toolMode,M.addEventListener("flow:zoom-in",()=>this.zoomBy(1.2)),M.addEventListener("flow:zoom-out",()=>this.zoomBy(.8333333333333334)),M.addEventListener("flow:fit",()=>this.fitToViewport()),M.addEventListener("flow:reset",()=>{this._selectedNodeId=null,this._selectedEdgeId=null,this._showInspector=!1,this.fitToViewport()}),M.addEventListener("flow:toggle-move-mode",()=>{this.toolMode=this._toolMode==="move"?"view":"move"}),M.addEventListener("flow:toggle-edit-mode",()=>{this.toolMode=this._toolMode==="edit"?"view":"edit"}),M.addEventListener("flow:snapshot-layout",()=>{this.copyLayoutSnapshot()}),M.addEventListener("flow:reset-layout",()=>{this.resetLayout()}),M.addEventListener("flow:toggle-inspector",()=>{this._toggleInspector()}));const L=this.shadowRootNode.getElementById("inspector-el");if(L){if(L.isOpen=this._showInspector,L.graph=this._graph,L.tools=this._graph.tools||[],this._selectedNodeId&&t[this._selectedNodeId])L.node=t[this._selectedNodeId];else if(this._selectedEdgeId){const e=a.find(m=>m.id===this._selectedEdgeId)||s.find(m=>m.id===this._selectedEdgeId);L.edge=e||null}else L.node=null,L.edge=null;L.addEventListener("flow:close-inspector",()=>{this._closeInspector()})}}}return l(vt,"styles",`
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
  `),customElements.get("tuto-flow-canvas")||customElements.define("tuto-flow-canvas",vt),yt(),g.BaseElement=T,g.DEFAULT_CAMERA_PADDING=xt,g.MAX_CAMERA_SCALE=K,g.MIN_CAMERA_SCALE=H,g.PRIMARY_FORWARD_EVENTS=Mt,g.SVG_NS=_t,g.TutoBadge=ht,g.TutoButton=ct,g.TutoFlowCanvas=vt,g.TutoFlowInspector=bt,g.TutoFlowMinimap=mt,g.TutoFlowNode=ut,g.TutoFlowToolbar=ft,g.assignLanes=Lt,g.autoLayoutColumns=Dt,g.bundleEdges=St,g.centerOnNode=Et,g.clamp=rt,g.colors=N,g.computeFitBounds=kt,g.computeGraphBounds=nt,g.computePolylineMidpoint=It,g.escapeHtml=u,g.getBestPortPair=$t,g.getClosestPort=gt,g.getPort=At,g.htmlEl=zt,g.injectThemeTokens=yt,g.isEdgeHighlighted=Wt,g.pointsToSvgPath=Pt,g.resolvePillSeats=Tt,g.routeEdgeItem=Nt,g.screenToWorld=Ut,g.shouldShowPill=Yt,g.spacing=Ct,g.svgEl=S,g.typography=j,g.worldToScreen=Bt,g.zoomAtPoint=pt,Object.defineProperty(g,Symbol.toStringTag,{value:"Module"}),g})({});
