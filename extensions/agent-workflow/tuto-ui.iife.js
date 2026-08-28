var TutoUI=(function(x){"use strict";var ne=Object.defineProperty;var de=(x,q,st)=>q in x?ne(x,q,{enumerable:!0,configurable:!0,writable:!0,value:st}):x[q]=st;var f=(x,q,st)=>de(x,typeof q!="symbol"?q+"":q,st);const q={dark:{bg:"#090a0f",grid:"rgba(255, 255, 255, 0.04)",text:"#f1f5f9",textMuted:"#94a3b8",muted:"#64748b",panelBg:"#10131d",panelHead:"#161b28",cardBg:"#12151f",cardSelectedBg:"#181d2c",headBg:"#161b28",headSelectedBg:"#1e263c",border:"#283044",borderSubtle:"#1c2232",edge:"#7a869e",edgeDim:"#1e2536",hot:"#3b82f6",toolBg:"#141a24",badgeBg:"#181e2e",highlight:"rgba(59, 130, 246, 0.18)",shadow:"0 12px 36px rgba(0, 0, 0, 0.55)"},light:{bg:"#f8fafc",grid:"rgba(100, 116, 139, 0.10)",text:"#0f172a",textMuted:"#475569",muted:"#64748b",panelBg:"#ffffff",panelHead:"#f1f5f9",cardBg:"#ffffff",cardSelectedBg:"#f8fafc",headBg:"#f1f5f9",headSelectedBg:"#e2e8f0",border:"#cbd5e1",borderSubtle:"#e2e8f0",edge:"#64748b",edgeDim:"#e2e8f0",hot:"#2563eb",toolBg:"#ffffff",badgeBg:"#f1f5f9",highlight:"rgba(37, 99, 235, 0.12)",shadow:"0 12px 36px rgba(0, 0, 0, 0.12)"},accents:{align:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},spec:{accent:"#38bdf8",badge:"SPEC",perm:"READ",permClass:"perm-read"},vibe:{accent:"#10b981",badge:"VIBE",perm:"WRITE",permClass:"perm-write"},envision:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},establish:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},evaluate:{accent:"#f59e0b",badge:"ALIGN",perm:"READ",permClass:"perm-read"},explore:{accent:"#38bdf8",badge:"SPEC",perm:"READ",permClass:"perm-read"},elaborate:{accent:"#38bdf8",badge:"SPEC",perm:"READ",permClass:"perm-read"},execute:{accent:"#10b981",badge:"VIBE",perm:"WRITE",permClass:"perm-write"},examine:{accent:"#10b981",badge:"VIBE",perm:"WRITE",permClass:"perm-write"},closeOut:{accent:"#8b5cf6",badge:"PROCEDURE",perm:"READ",permClass:"perm-read"},blocked:{accent:"#ef4444",badge:"PROCEDURE",perm:"READ",permClass:"perm-read"},handoff:{accent:"#64748b",badge:"PROCEDURE",perm:"STANDBY",permClass:"perm-standby"}}},st={fonts:{sans:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',mono:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'},sizes:{xs:"0.68rem",sm:"0.75rem",base:"0.875rem",md:"0.95rem",lg:"1.125rem",xl:"1.25rem","2xl":"1.5rem"},weights:{normal:"400",medium:"500",semibold:"600",bold:"700",extrabold:"800"},lineHeights:{tight:"1.15",normal:"1.4",relaxed:"1.6"}},Kt={space:{1:"0.25rem",2:"0.5rem",3:"0.75rem",4:"1rem",5:"1.25rem",6:"1.5rem",8:"2rem",10:"2.5rem",12:"3rem"},radii:{none:"0",sm:"0.375rem",md:"0.5rem",lg:"0.75rem",xl:"1rem",full:"9999px"},shadows:{sm:"0 1px 2px 0 rgba(0, 0, 0, 0.05)",md:"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",lg:"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",xl:"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",elevated:"0 12px 36px rgba(0, 0, 0, 0.45)",glow:"0 0 15px rgba(59, 130, 246, 0.35)"},transitions:{fast:"150ms ease",default:"200ms ease",smooth:"300ms cubic-bezier(0.4, 0, 0.2, 1)"},zIndex:{canvas:0,edge:1,node:5,overlay:10,drawer:20,tooltip:30}};function At(){if(typeof document>"u"||document.getElementById("tuto-theme-tokens"))return;const i=document.createElement("style");i.id="tuto-theme-tokens",i.textContent=`
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
  `,document.head.appendChild(i)}const at=class at extends HTMLElement{constructor(t={}){super();f(this,"_isRenderPending",!1);f(this,"_hasRendered",!1);f(this,"_useShadow");f(this,"shadowRootNode",null);this._useShadow=t.useShadow!==!1,this._useShadow&&(this.shadowRootNode=this.attachShadow({mode:t.shadowMode||"open"}))}connectedCallback(){this.adoptStyles(),this.requestUpdate()}disconnectedCallback(){}adoptStyles(){const t=this.constructor,s=t.styles;if(!(!s||!this.shadowRootNode)){if("adoptedStyleSheets"in Document.prototype&&"adoptedStyleSheets"in ShadowRoot.prototype)try{let e=at._styleSheetMap.get(t);e||(e=new CSSStyleSheet,e.replaceSync(s),at._styleSheetMap.set(t,e)),this.shadowRootNode.adoptedStyleSheets.includes(e)||(this.shadowRootNode.adoptedStyleSheets=[...this.shadowRootNode.adoptedStyleSheets,e]);return}catch{}if(!this.shadowRootNode.querySelector("style[data-tuto-style]")){const e=document.createElement("style");e.setAttribute("data-tuto-style","true"),e.textContent=s,this.shadowRootNode.prepend(e)}}}requestUpdate(){this._isRenderPending||(this._isRenderPending=!0,requestAnimationFrame(()=>{this._isRenderPending=!1,this.render(),this._hasRendered||(this._hasRendered=!0,this.firstUpdated()),this.updated()}))}emit(t,s,e={}){const o=new CustomEvent(t,{bubbles:!0,composed:!0,cancelable:!0,detail:s,...e});return this.dispatchEvent(o)}get renderRoot(){return this.shadowRootNode||this}firstUpdated(){}updated(){}};f(at,"styles",""),f(at,"_styleSheetMap",new WeakMap);let J=at;const Tt="http://www.w3.org/2000/svg";function W(i,a={},t){const s=document.createElementNS(Tt,i);for(const[e,o]of Object.entries(a))o!=null&&o!==!1&&s.setAttribute(e,String(o));return t&&t.appendChild(s),s}function Zt(i,a={},t){const s=document.createElement(i);for(const[e,o]of Object.entries(a))o!=null&&o!==!1&&(e==="className"||e==="class"?s.className=String(o):s.setAttribute(e,String(o)));return t&&t.appendChild(s),s}function E(i){return i==null?"":String(i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function gt(i,a,t){return Math.max(a,Math.min(t,i))}class _t extends J{static get observedAttributes(){return["variant","size","disabled"]}get variant(){return this.getAttribute("variant")||"secondary"}set variant(a){this.setAttribute("variant",a)}get size(){return this.getAttribute("size")||"md"}set size(a){this.setAttribute("size",a)}get disabled(){return this.hasAttribute("disabled")}set disabled(a){a?this.setAttribute("disabled",""):this.removeAttribute("disabled")}attributeChangedCallback(){this.requestUpdate()}render(){this.shadowRootNode&&(this.shadowRootNode.innerHTML=`
      <button class="variant-${this.variant} size-${this.size}" ${this.disabled?"disabled":""}>
        <slot></slot>
      </button>
    `)}}f(_t,"styles",`
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
  `),customElements.get("tuto-button")||customElements.define("tuto-button",_t);class xt extends J{static get observedAttributes(){return["variant"]}get variant(){return this.getAttribute("variant")||"default"}set variant(a){this.setAttribute("variant",a)}attributeChangedCallback(){this.requestUpdate()}render(){this.shadowRootNode&&(this.shadowRootNode.innerHTML=`
      <span class="badge variant-${this.variant}">
        <slot></slot>
      </span>
    `)}}f(xt,"styles",`
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
  `),customElements.get("tuto-badge")||customElements.define("tuto-badge",xt);const tt=.2,it=3.5,Ut=44;function Wt(i,a,t=Ut,s=1.25){const e=i.width||900,o=i.height||700,n=a.w||2e3,d=a.h||1e3,l=gt(Math.min((e-t*2)/n,(o-t*2)/d),tt,s),c=(e-n*l)/2-a.x*l,u=(o-d*l)/2-a.y*l;return{panX:c,panY:u,scale:l}}function ut(i,a,t,s,e=tt,o=it){const n=gt(i.scale*s,e,o);if(n===i.scale)return i;const d=a-(a-i.panX)*n/i.scale,l=t-(t-i.panY)*n/i.scale;return{panX:d,panY:l,scale:n}}function Ot(i,a,t=1.05){const s=i.width||900,e=i.height||700,o=gt(t,tt,it),n=a.x+a.w/2,d=a.y+a.h/2,l=s/2-n*o,c=e/2-d*o;return{panX:l,panY:c,scale:o}}function Qt(i,a){return{x:(i.x-a.panX)/a.scale,y:(i.y-a.panY)/a.scale}}function te(i,a){return{x:i.x*a.scale+a.panX,y:i.y*a.scale+a.panY}}const Yt=new Set(["GOAL_SET","ASK_ROUTED_SPEC","ASK_ROUTED_VIBE","RESEARCH_DONE","NEXT_VIBE","NEXT_SPEC","NEXT_ALIGN","RUN_CHECKS","CLOSE_OUT","NEXT_HANDOFF"]);function kt(i){return i.map((a,t)=>({id:a.id||`${a.from}->${a.to}-${t}`,from:a.from,to:a.to,self:a.from===a.to,label:a.label||a.event||"",event:a.event||a.label||"",events:a.event?[a.event]:a.events?[...a.events]:[],description:a.description||"",descriptions:a.descriptions?[...a.descriptions]:a.description?[a.description]:[],userMediated:!!a.userMediated,bidirectional:!!a.bidirectional,waypoints:a.waypoints?[...a.waypoints]:void 0,customData:a.customData?{...a.customData}:void 0}))}function ee(i,a,t=.5){const s=Math.min(.9,Math.max(.1,t));return a==="left"?{x:i.x,y:i.y+i.h*s}:a==="right"?{x:i.x+i.w,y:i.y+i.h*s}:a==="top"?{x:i.x+i.w*s,y:i.y}:{x:i.x+i.w*s,y:i.y+i.h}}function Et(i,a){const t=[{point:[i.x,i.y+i.h/2],side:"left"},{point:[i.x+i.w,i.y+i.h/2],side:"right"},{point:[i.x+i.w/2,i.y],side:"top"},{point:[i.x+i.w/2,i.y+i.h],side:"bottom"}];let s=t[0],e=1/0;for(const o of t){const n=Math.hypot(o.point[0]-a[0],o.point[1]-a[1]);n<e&&(e=n,s=o)}return s}function Dt(i,a=!0){if(!i||i.length===0)return[0,0];if(i.length===1)return i[0];if(i.length===2)return[(i[0][0]+i[1][0])/2,(i[0][1]+i[1][1])/2];if(a&&i.length===3)return i[1];let t=0;const s=[];for(let n=0;n<i.length-1;n++){const d=Math.hypot(i[n+1][0]-i[n][0],i[n+1][1]-i[n][1]);s.push(d),t+=d}if(t===0)return i[0];const e=t/2;let o=0;for(let n=0;n<s.length;n++){const d=s[n];if(o+d>=e){const l=e-o,c=d>0?l/d:.5,u=i[n],h=i[n+1];return[u[0]+(h[0]-u[0])*c,u[1]+(h[1]-u[1])*c]}o+=d}return i[Math.floor(i.length/2)]}function Xt(i,a){const t=[[i.x,i.y+i.h/2],[i.x+i.w,i.y+i.h/2],[i.x+i.w/2,i.y],[i.x+i.w/2,i.y+i.h]],s=[[a.x,a.y+a.h/2],[a.x+a.w,a.y+a.h/2],[a.x+a.w/2,a.y],[a.x+a.w/2,a.y+a.h]];let e=t[0],o=s[0],n=1/0;for(const d of t)for(const l of s){const c=Math.hypot(l[0]-d[0],l[1]-d[1]);c<n&&(n=c,e=d,o=l)}return{p1:e,p2:o}}function ft(i,a,t,s=.22,e=.78){if(t<=1)return i.y+i.h/2;const o=s+a/(t-1)*(e-s);return i.y+i.h*o}function Mt(i,a){if(!i||i.length===0||!a)return i;const t=[],s=[],e=Object.values(a);for(const p of i){if(p.waypoints&&p.waypoints.length>0||p.self||p.from===p.to)continue;const b=a[p.from],y=a[p.to];if(!b||!y)continue;const w={x:b.x+b.w/2,y:b.y+b.h/2},S={x:y.x+y.w/2,y:y.y+y.h/2},R=Math.abs(w.x-S.x)<=Math.max(b.w,y.w)*.75,z=y.y-b.y;z>b.h*.5&&R&&!e.some(m=>{if(m.id===b.id||m.id===y.id)return!1;const L=m.x+m.w/2,C=m.y>=b.y+b.h&&m.y+m.h<=y.y,g=Math.abs(L-w.x)<=Math.max(b.w,m.w)*.6;return C&&g})||Math.abs(w.y-S.y)<=Math.max(b.h,y.h)*.75&&y.x>b.x+b.w*.5&&!e.some(m=>{if(m.id===b.id||m.id===y.id)return!1;const L=m.y+m.h/2,C=m.x>=b.x+b.w&&m.x+m.w<=y.x,g=Math.abs(L-w.y)<=Math.max(b.h,m.h)*.6;return C&&g})||(z>20?t.push(p):z<-20&&s.push(p))}const o=60,n=32,d={},l={};for(const p of t)d[p.from]=(d[p.from]||0)+1,l[p.to]=(l[p.to]||0)+1;t.sort((p,b)=>{const y=a[p.from],w=a[p.to],S=a[b.from],R=a[b.to],z=w.y-y.y,k=R.y-S.y;return z!==k?z-k:y.y-S.y});const c={},u={};t.forEach((p,b)=>{const y=a[p.from],w=a[p.to],S=Math.min(y.y,w.y),R=Math.max(y.y+y.h,w.y+w.h);let z=Math.max(y.x+y.w,w.x+w.w);for(const A of e)A.y+A.h>=S&&A.y<=R&&(z=Math.max(z,A.x+A.w));const k=c[p.from]||0;c[p.from]=k+1;const P=u[p.to]||0;u[p.to]=P+1;const m=ft(y,k,d[p.from]),L=ft(w,P,l[p.to]),C=z+o+b*n,g=[y.x+y.w,m],T=[w.x+w.w,L],X=[g,[C,g[1]],[C,T[1]],T];p.route={points:X,seatX:C,seatY:(g[1]+T[1])/2,seatSide:"h"}});const h={},$={};for(const p of s)h[p.from]=(h[p.from]||0)+1,$[p.to]=($[p.to]||0)+1;s.sort((p,b)=>{const y=a[p.from],w=a[p.to],S=a[b.from],R=a[b.to],z=y.y-w.y,k=S.y-R.y;return z!==k?z-k:y.y-S.y});const N={},B={};return s.forEach((p,b)=>{const y=a[p.from],w=a[p.to],S=Math.min(y.y,w.y),R=Math.max(y.y+y.h,w.y+w.h);let z=Math.min(y.x,w.x);for(const A of e)A.y+A.h>=S&&A.y<=R&&(z=Math.min(z,A.x));const k=N[p.from]||0;N[p.from]=k+1;const P=B[p.to]||0;B[p.to]=P+1;const m=ft(y,k,h[p.from]),L=ft(w,P,$[p.to]),C=z-(o+b*n),g=[y.x,m],T=[w.x,L],X=[g,[C,g[1]],[C,T[1]],T];p.route={points:X,seatX:C,seatY:(g[1]+T[1])/2,seatSide:"h"}}),i}function jt(i,a){const t=i.map(e=>({...e,waypoints:void 0}));Mt(t,a);const s=new Map;for(const e of t)e.route&&e.route.points.length===4&&s.set(e.id,[e.route.points[1],e.route.points[2]]);return s}function Gt(i,a){const t=a[i.from],s=a[i.to];if(!t||!s)return null;if(i.waypoints&&i.waypoints.length>0){const n=i.self||i.from===i.to,d=i.waypoints[0],l=i.waypoints[i.waypoints.length-1];let c=Et(t,d),u=Et(s,l),h=c.point,$=u.point;n&&Math.hypot(h[0]-$[0],h[1]-$[1])<8&&(c.side==="right"||c.side==="left"?(h=[h[0],h[1]-12],$=[$[0],$[1]+12]):(h=[h[0]-16,h[1]],$=[$[0]+16,$[1]]));const N=[h,...i.waypoints,$],[B,p]=Dt(N,!0);return{points:N,seatX:B,seatY:p,seatSide:"h"}}if(i.route&&i.route.points&&i.route.points.length>0)return i.route;if(i.self||i.from===i.to){const n=t.x+t.w,d=t.y+t.h/2,l=38;return{points:[[n,d-10],[n+l,d-18],[n+l,d+18],[n,d+10]],seatX:n+l+24,seatY:d,seatSide:"h"}}const{p1:e,p2:o}=Xt(t,s);return{points:[e,o],seatX:(e[0]+o[0])/2,seatY:(e[1]+o[1])/2,seatSide:"h"}}function qt(i){if(!(!i||i.length<2)){for(let a=0;a<i.length;a++){const t=i[a].route;if(t)for(let s=a+1;s<i.length;s++){const e=i[s].route;if(!e)continue;const o=Math.abs(t.seatX-e.seatX),n=Math.abs(t.seatY-e.seatY);o<24&&n<36&&(t.seatY-=16,e.seatY+=16)}}for(let a=0;a<i.length;a++){const t=i[a].route;if(t)for(let s=a+1;s<i.length;s++){const e=i[s].route;if(!e)continue;const o=Math.abs(t.seatX-e.seatX),n=Math.abs(t.seatY-e.seatY);o>=24&&o<64&&n<22&&(t.seatY-=12,e.seatY+=12)}}}}function Ft(i,a=!1,t=22){if(!i||i.length===0)return"";if(i.length===1)return`M ${i[0][0]} ${i[0][1]}`;if(a&&i.length===4)return`M ${i[0][0]} ${i[0][1]} C ${i[1][0]} ${i[1][1]}, ${i[2][0]} ${i[2][1]}, ${i[3][0]} ${i[3][1]}`;if(i.length===2)return`M ${i[0][0]} ${i[0][1]} L ${i[1][0]} ${i[1][1]}`;if(t<=0)return i.map((o,n)=>`${n===0?"M":"L"} ${o[0]} ${o[1]}`).join(" ");let s=`M ${i[0][0]} ${i[0][1]}`;for(let o=1;o<i.length-1;o++){const n=i[o-1],d=i[o],l=i[o+1],c=d[0]-n[0],u=d[1]-n[1],h=Math.hypot(c,u),$=l[0]-d[0],N=l[1]-d[1],B=Math.hypot($,N);if(h<1||B<1){s+=` L ${d[0]} ${d[1]}`;continue}const p=Math.min(t,h/2,B/2),b=d[0]-c/h*p,y=d[1]-u/h*p,w=d[0]+$/B*p,S=d[1]+N/B*p;s+=` L ${b} ${y}`,s+=` Q ${d[0]} ${d[1]} ${w} ${S}`}const e=i[i.length-1];return s+=` L ${e[0]} ${e[1]}`,s}function oe(i,a,t,s){return t===i.id||s===i.id?!0:a?i.from===a||i.to===a:!1}function se(i,a,t,s,e=Yt){return!0}function mt(i,a=64,t=56,s=46,e){let o=1/0,n=1/0,d=-1/0,l=-1/0;const c=Object.values(i);if(c.length===0&&(!e||e.length===0))return{x:0,y:0,w:1e3,h:600};for(const h of c)o=Math.min(o,h.x),n=Math.min(n,h.y),d=Math.max(d,h.x+h.w),l=Math.max(l,h.y+h.h);if(e)for(const h of e)o=Math.min(o,h.x),n=Math.min(n,h.y),d=Math.max(d,h.x+h.w),l=Math.max(l,h.y+h.h);const u=s>0;return{x:o-a,y:n-t-(u?s:0),w:d-o+a*2,h:l-n+t*2+(u?s+80:0)}}function ie(i,a={}){const t=a.colWidth||420,s=a.colGap||180,e=a.rowGap||40,o=a.startX||120,n=a.startY||120,d={};let l=o,c=n;return i.forEach((u,h)=>{d[u.id]={...u,x:u.x??l,y:u.y??c,w:u.w||t,h:u.h||280},(h+1)%3===0?(l+=t+s,c=n):c+=(u.h||280)+e}),d}const et=20,St=8;function Ht(i,a,t,s,e,o,n=et,d=St){const l=[],c=a,u=a+s/2,h=a+s,$=t,N=t+e/2,B=t+e;let p=null,b=d+1,y=[],w=null,S=d+1,R=[];for(const[P,m]of Object.entries(o)){if(P===i)continue;const L=m.x,C=m.x+m.w/2,g=m.x+m.w,T=m.y,X=m.y+m.h/2,A=m.y+m.h,Y=Math.abs(u-C);Y<b?(b=Y,p=C-s/2,y=[{type:"vertical",pos:C,start:Math.min(t,T)-30,end:Math.max(t+e,A)+30,kind:"center",sourceNodeId:i,targetNodeId:P}]):p!==null&&Math.abs(Y-b)<.5&&y.push({type:"vertical",pos:C,start:Math.min(t,T)-30,end:Math.max(t+e,A)+30,kind:"center",sourceNodeId:i,targetNodeId:P});const r=Math.abs(c-L);r<b&&(b=r,p=L,y=[{type:"vertical",pos:L,start:Math.min(t,T)-30,end:Math.max(t+e,A)+30,kind:"edge",sourceNodeId:i,targetNodeId:P}]);const v=Math.abs(h-g);v<b&&(b=v,p=g-s,y=[{type:"vertical",pos:g,start:Math.min(t,T)-30,end:Math.max(t+e,A)+30,kind:"edge",sourceNodeId:i,targetNodeId:P}]);const M=Math.abs(N-X);M<S?(S=M,w=X-e/2,R=[{type:"horizontal",pos:X,start:Math.min(a,L)-30,end:Math.max(a+s,g)+30,kind:"center",sourceNodeId:i,targetNodeId:P}]):w!==null&&Math.abs(M-S)<.5&&R.push({type:"horizontal",pos:X,start:Math.min(a,L)-30,end:Math.max(a+s,g)+30,kind:"center",sourceNodeId:i,targetNodeId:P});const _=Math.abs($-T);_<S&&(S=_,w=T,R=[{type:"horizontal",pos:T,start:Math.min(a,L)-30,end:Math.max(a+s,g)+30,kind:"edge",sourceNodeId:i,targetNodeId:P}]);const U=Math.abs(B-A);U<S&&(S=U,w=A-e,R=[{type:"horizontal",pos:A,start:Math.min(a,L)-30,end:Math.max(a+s,g)+30,kind:"edge",sourceNodeId:i,targetNodeId:P}])}const z=p!==null?Math.round(p):Math.round(a/n)*n,k=w!==null?Math.round(w):Math.round(t/n)*n;return p!==null&&l.push(...y),w!==null&&l.push(...R),{x:z,y:k,guides:l}}function bt(i,a,t,s,e,o,n,d=et,l=St){const c=[];let u=null,h=l+1,$=[],N=null,B=l+1,p=[];const b=o.find(k=>k.id===t),y=n.get(t)||[],w=s>0?y[s-1]:b&&e[b.from]?[e[b.from].x+e[b.from].w/2,e[b.from].y+e[b.from].h/2]:null,S=s<y.length-1?y[s+1]:b&&e[b.to]?[e[b.to].x+e[b.to].w/2,e[b.to].y+e[b.to].h/2]:null;if(w){const k=Math.abs(i-w[0]);k<h&&(h=k,u=w[0],$=[{type:"vertical",pos:w[0],start:Math.min(a,w[1])-20,end:Math.max(a,w[1])+20,kind:"axis"}]);const P=Math.abs(a-w[1]);P<B&&(B=P,N=w[1],p=[{type:"horizontal",pos:w[1],start:Math.min(i,w[0])-20,end:Math.max(i,w[0])+20,kind:"axis"}])}if(S){const k=Math.abs(i-S[0]);k<h&&(h=k,u=S[0],$=[{type:"vertical",pos:S[0],start:Math.min(a,S[1])-20,end:Math.max(a,S[1])+20,kind:"axis"}]);const P=Math.abs(a-S[1]);P<B&&(B=P,N=S[1],p=[{type:"horizontal",pos:S[1],start:Math.min(i,S[0])-20,end:Math.max(i,S[0])+20,kind:"axis"}])}for(const[k,P]of n.entries())P&&P.forEach((m,L)=>{if(k===t&&L===s)return;const C=Math.abs(i-m[0]);C<h&&(h=C,u=m[0],$=[{type:"vertical",pos:m[0],start:Math.min(a,m[1])-20,end:Math.max(a,m[1])+20,kind:"edge"}]);const g=Math.abs(a-m[1]);g<B&&(B=g,N=m[1],p=[{type:"horizontal",pos:m[1],start:Math.min(i,m[0])-20,end:Math.max(i,m[0])+20,kind:"edge"}])});for(const k of Object.values(e)){const P=k.x+k.w/2,m=k.y+k.h/2,L=Math.abs(i-P);L<h&&(h=L,u=P,$=[{type:"vertical",pos:P,start:Math.min(a,k.y)-20,end:Math.max(a,k.y+k.h)+20,kind:"center"}]);const C=Math.abs(a-m);C<B&&(B=C,N=m,p=[{type:"horizontal",pos:m,start:Math.min(i,k.x)-20,end:Math.max(i,k.x+k.w)+20,kind:"center"}])}const R=u!==null?Math.round(u):Math.round(i/d)*d,z=N!==null?Math.round(N):Math.round(a/d)*d;return u!==null&&c.push(...$),N!==null&&c.push(...p),{x:R,y:z,guides:c}}class It extends J{constructor(){super(...arguments);f(this,"_node",null);f(this,"_selected",!1);f(this,"_draggableNode",!1);f(this,"_isDragging",!1)}get node(){return this._node}set node(t){this._node=t,this.requestUpdate()}get selected(){return this._selected}set selected(t){this._selected=!!t,this.requestUpdate()}get draggableNode(){return this._draggableNode}set draggableNode(t){this._draggableNode=!!t,this.requestUpdate()}get isDragging(){return this._isDragging}set isDragging(t){this._isDragging=!!t,this.requestUpdate()}render(){if(!this.shadowRootNode||!this._node)return;const t=this._node,s=q.accents[t.id]||(t.permission?q.accents[t.permission]:null)||q.accents.spec;this.style.setProperty("--node-accent",s.accent);const e=["node-card","compact",this._selected?"selected":"",this._draggableNode?"draggable":"",this._isDragging?"dragging":""].filter(Boolean).join(" ");this.shadowRootNode.innerHTML=`
      <div class="${e}" role="button" tabindex="0">
        <div class="node-head">
          <div class="node-head-left">
            <span class="state-dot"></span>
            <span class="head-title">${E(t.label||t.id)}</span>
          </div>
        </div>
      </div>
    `;const o=this.shadowRootNode.querySelector(".node-card");o&&o.addEventListener("click",n=>{n.stopPropagation(),this.emit("flow:select-node",{node:this._node})})}}f(It,"styles",`
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
  `),customElements.get("tuto-flow-node")||customElements.define("tuto-flow-node",It);class $t extends J{constructor(){super(...arguments);f(this,"_zoom",100);f(this,"_isMinimapActive",!1);f(this,"_isInspectorActive",!1);f(this,"_toolMode","view")}get zoom(){return this._zoom}set zoom(t){this._zoom=Math.round(t),this.requestUpdate()}get isMinimapActive(){return this._isMinimapActive}set isMinimapActive(t){this._isMinimapActive=!!t,this.requestUpdate()}get isInspectorActive(){return this._isInspectorActive}set isInspectorActive(t){this._isInspectorActive=!!t,this.requestUpdate()}get toolMode(){return this._toolMode}set toolMode(t){this._toolMode=t,this.requestUpdate()}get isEditModeActive(){return this._toolMode==="edit"}set isEditModeActive(t){this._toolMode=t?"edit":"view",this.requestUpdate()}render(){var o,n,d,l,c,u,h,$,N,B,p,b;if(!this.shadowRootNode)return;const t=this._toolMode==="move",s=this._toolMode==="edit",e=t||s;this.shadowRootNode.innerHTML=`
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
        <button class="tool-btn" id="btn-autoroute-edges" title="Auto-Route Channels (Tidy Rails)" aria-label="Auto-Route Channels">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
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
    `,(o=this.shadowRootNode.getElementById("btn-zoom-in"))==null||o.addEventListener("click",()=>{this.emit("flow:zoom-in")}),(n=this.shadowRootNode.getElementById("btn-zoom-out"))==null||n.addEventListener("click",()=>{this.emit("flow:zoom-out")}),(d=this.shadowRootNode.getElementById("btn-zoom-reset"))==null||d.addEventListener("click",()=>{this.emit("flow:zoom-reset")}),(l=this.shadowRootNode.getElementById("btn-fit"))==null||l.addEventListener("click",()=>{this.emit("flow:fit")}),(c=this.shadowRootNode.getElementById("btn-reset"))==null||c.addEventListener("click",()=>{this.emit("flow:reset")}),(u=this.shadowRootNode.getElementById("btn-minimap"))==null||u.addEventListener("click",()=>{this.emit("flow:toggle-minimap")}),(h=this.shadowRootNode.getElementById("btn-move-mode"))==null||h.addEventListener("click",()=>{this.emit("flow:toggle-move-mode")}),($=this.shadowRootNode.getElementById("btn-edit-mode"))==null||$.addEventListener("click",()=>{this.emit("flow:toggle-edit-mode")}),(N=this.shadowRootNode.getElementById("btn-snapshot"))==null||N.addEventListener("click",()=>{this.emit("flow:snapshot-layout")}),(B=this.shadowRootNode.getElementById("btn-autoroute-edges"))==null||B.addEventListener("click",()=>{this.emit("flow:autoroute-edges")}),(p=this.shadowRootNode.getElementById("btn-reset-layout"))==null||p.addEventListener("click",()=>{this.emit("flow:reset-layout")}),(b=this.shadowRootNode.getElementById("btn-inspector"))==null||b.addEventListener("click",()=>{this.emit("flow:toggle-inspector")})}}f($t,"styles",`
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
  `),customElements.get("tuto-flow-toolbar")||customElements.define("tuto-flow-toolbar",$t);class Lt extends J{constructor(){super(...arguments);f(this,"_bounds",{x:0,y:0,w:2e3,h:1e3});f(this,"_camera",{panX:0,panY:0,scale:1});f(this,"_viewportSize",{width:900,height:700});f(this,"_nodes",{});f(this,"_transitions",[]);f(this,"_groups",[]);f(this,"_selectedNodeId",null);f(this,"_isDragging",!1);f(this,"_dragOffsetWorld",{x:0,y:0});f(this,"_lastProjection",null);f(this,"handlePointerDown",t=>{var h;if(t.button!==0||!((h=this.shadowRootNode)==null?void 0:h.querySelector("svg.minimap-canvas")))return;t.preventDefault(),t.stopPropagation();const e=this.screenToWorld(t.clientX,t.clientY);if(!e)return;const o=this._camera.scale||1,n=-this._camera.panX/o,d=-this._camera.panY/o,l=(this._viewportSize.width||900)/o,c=(this._viewportSize.height||700)/o,u=e.x>=n&&e.x<=n+l&&e.y>=d&&e.y<=d+c;if(this._isDragging=!0,window.addEventListener("pointermove",this.handlePointerMove),window.addEventListener("pointerup",this.handlePointerUp),window.addEventListener("pointercancel",this.handlePointerUp),u){const $=n+l/2,N=d+c/2;this._dragOffsetWorld={x:e.x-$,y:e.y-N}}else this._dragOffsetWorld={x:0,y:0},this.emit("flow:pan-to",{worldX:e.x,worldY:e.y});this._updateViewport()});f(this,"handlePointerMove",t=>{if(!this._isDragging)return;t.preventDefault(),t.stopPropagation();const s=this.screenToWorld(t.clientX,t.clientY);if(!s)return;const e=s.x-this._dragOffsetWorld.x,o=s.y-this._dragOffsetWorld.y;this.emit("flow:pan-to",{worldX:e,worldY:o})});f(this,"handlePointerUp",t=>{this._isDragging&&(this._isDragging=!1,window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("pointerup",this.handlePointerUp),window.removeEventListener("pointercancel",this.handlePointerUp),this._updateViewport())})}get bounds(){return this._bounds}set bounds(t){this._bounds=t,this.requestUpdate()}get camera(){return this._camera}set camera(t){this._camera=t,this._updateViewport()}get viewportSize(){return this._viewportSize}set viewportSize(t){this._viewportSize=t,this.requestUpdate()}get nodes(){return this._nodes}set nodes(t){this._nodes=t,this.requestUpdate()}get transitions(){return this._transitions}set transitions(t){this._transitions=t||[],this.requestUpdate()}get groups(){return this._groups}set groups(t){this._groups=t||[],this.requestUpdate()}get selectedNodeId(){return this._selectedNodeId}set selectedNodeId(t){this._selectedNodeId=t,this.requestUpdate()}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("pointerup",this.handlePointerUp),window.removeEventListener("pointercancel",this.handlePointerUp)}_updateViewport(){if(!this.shadowRootNode)return;const t=this.shadowRootNode.querySelector(".minimap-viewport");if(!t){this.requestUpdate();return}const s=this._camera.scale||1,e=-this._camera.panX/s,o=-this._camera.panY/s,n=(this._viewportSize.width||900)/s,d=(this._viewportSize.height||700)/s;t.setAttribute("x",String(e)),t.setAttribute("y",String(o)),t.setAttribute("width",String(n)),t.setAttribute("height",String(d)),this._isDragging?t.classList.add("is-dragging"):t.classList.remove("is-dragging")}screenToWorld(t,s){var p;if(!this._lastProjection)return null;const e=(p=this.shadowRootNode)==null?void 0:p.querySelector("svg.minimap-canvas");if(!e)return null;const o=e.getBoundingClientRect();if(o.width<=0||o.height<=0)return null;const n=190,d=120,l=(t-o.left)*(n/o.width),c=(s-o.top)*(d/o.height),{offsetX:u,offsetY:h,scaleMap:$,bx:N,by:B}=this._lastProjection;return{x:(l-u)/$+N,y:(c-h)/$+B}}render(){var z,k,P;if(!this.shadowRootNode)return;const t=190,s=120,e=8,o=t-e*2,n=s-e*2,d=Math.max(10,this._bounds.w||2e3),l=Math.max(10,this._bounds.h||1e3),c=this._bounds.x||0,u=this._bounds.y||0,h=Math.min(o/d,n/l),$=e+(o-d*h)/2,N=e+(n-l*h)/2;this._lastProjection={offsetX:$,offsetY:N,scaleMap:h,bx:c,by:u},this.shadowRootNode.innerHTML=`
      <div class="minimap-container">
        <svg class="minimap-canvas" viewBox="0 0 ${t} ${s}" preserveAspectRatio="none"></svg>
      </div>
    `;const B=this.shadowRootNode.querySelector("svg.minimap-canvas");if(!B)return;B.addEventListener("pointerdown",this.handlePointerDown);const p=W("g",{transform:`translate(${$}, ${N}) scale(${h}) translate(${-c}, ${-u})`},B);if(W("rect",{x:c,y:u,width:d,height:l,rx:16,fill:"rgba(59, 130, 246, 0.03)",stroke:"var(--tuto-border, #30363d)","stroke-width":1.5/h},p),this._groups&&this._groups.length>0)for(const m of this._groups){const L=m.accent||"#3b82f6";W("rect",{x:m.x,y:m.y,width:m.w,height:m.h,rx:12,fill:"rgba(255, 255, 255, 0.02)",stroke:L,"stroke-width":1/h,"stroke-opacity":"0.4"},p)}if(this._transitions&&this._transitions.length>0)for(const m of this._transitions){const L=(z=m.route)==null?void 0:z.points;if(L&&L.length>=2){let C=`M ${L[0][0]} ${L[0][1]}`;for(let g=1;g<L.length;g++)C+=` L ${L[g][0]} ${L[g][1]}`;W("path",{d:C,fill:"none",stroke:"var(--tuto-muted, #64748b)","stroke-width":1.2/h,"stroke-opacity":"0.35"},p)}else if(this._nodes[m.from]&&this._nodes[m.to]){const C=this._nodes[m.from],g=this._nodes[m.to],T=C.x+C.w/2,X=C.y+C.h/2,A=g.x+g.w/2,Y=g.y+g.h/2;W("line",{x1:T,y1:X,x2:A,y2:Y,stroke:"var(--tuto-muted, #64748b)","stroke-width":1.2/h,"stroke-opacity":"0.35"},p)}}for(const[m,L]of Object.entries(this._nodes)){const C=((k=q.accents[m])==null?void 0:k.accent)||((P=q.accents[L.kind])==null?void 0:P.accent)||"#3b82f6",g=m===this._selectedNodeId;W("rect",{x:L.x,y:L.y,width:L.w,height:L.h,rx:8,fill:g?C:"var(--tuto-head-bg, #1a2030)",stroke:C,"stroke-width":(g?2.5:1.2)/h},p)}const b=this._camera.scale||1,y=-this._camera.panX/b,w=-this._camera.panY/b,S=(this._viewportSize.width||900)/b,R=(this._viewportSize.height||700)/b;W("rect",{x:y,y:w,width:S,height:R,rx:6,class:`minimap-viewport ${this._isDragging?"is-dragging":""}`,"stroke-width":1.5/h},p)}}f(Lt,"styles",`
    :host {
      display: block;
      width: 190px;
      height: 120px;
      background: color-mix(in srgb, var(--tuto-panel-bg, #10131d) 92%, transparent);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--tuto-border, #30363d);
      border-radius: 10px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
      overflow: hidden;
      user-select: none;
      box-sizing: border-box;
    }
    .minimap-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    .minimap-canvas {
      width: 100%;
      height: 100%;
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
  `),customElements.get("tuto-flow-minimap")||customElements.define("tuto-flow-minimap",Lt);class Nt extends J{constructor(){super(...arguments);f(this,"_isOpen",!1);f(this,"_node",null);f(this,"_edge",null);f(this,"_graph",null);f(this,"_tools",[])}get graph(){return this._graph}set graph(t){this._graph=t,this.requestUpdate()}get isOpen(){return this._isOpen}set isOpen(t){this._isOpen=!!t,this.requestUpdate()}get node(){return this._node}set node(t){this._node=t,t&&(this._edge=null),this.requestUpdate()}get edge(){return this._edge}set edge(t){this._edge=t,t&&(this._node=null),this.requestUpdate()}get tools(){return this._tools}set tools(t){this._tools=t,this.requestUpdate()}render(){var n,d,l,c,u,h,$,N,B,p,b,y,w,S,R,z,k,P,m,L,C;if(!this.shadowRootNode)return;let t="",s="";if(this._node){const g=this._node,T=q.accents[g.id]||q.accents[g.kind]||{accent:"#3b82f6",badge:(g.kind||"MODE").toUpperCase(),perm:(g.permission||"READ-ONLY").toUpperCase(),permClass:`perm-${g.permission||"readonly"}`},A=T.perm==="WRITE"?'<svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 3px; display: inline-block; vertical-align: -1px;"><path d="M11 2l3 3-8.5 8.5H2.5v-3z"/></svg>':'<svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 3px; display: inline-block; vertical-align: -1px;"><path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>';this.style.setProperty("--drawer-accent",T.accent),t=`
        <div class="header-titles">
          <h2>${E(g.label||g.id)}</h2>
          <div class="header-badges">
            <span class="badge badge-accent">${E(T.badge)}</span>
            <span class="badge badge-perm ${T.permClass}">${A}${E(T.perm)}</span>
          </div>
        </div>
      `;const Y=(g.substates||[]).length?`<div>
            <h4 class="section-title">Substates</h4>
            <div class="chip-group">
              ${g.substates.map(I=>`<span class="chip">${E(I)}</span>`).join("")}
            </div>
          </div>`:"",r=(g.procedure||[]).length?`<div>
            <h4 class="section-title">Ordered Instructions (${g.procedure.length})</h4>
            <ol class="instruction-list">
              ${g.procedure.map((I,j)=>`
                <li class="instruction-item">
                  <span class="instruction-idx">${j+1}.</span>
                  <span>${E(I)}</span>
                </li>
              `).join("")}
            </ol>
          </div>`:"",v=this._tools.filter(I=>{const j=[g.id,(g.customData||{}).userMode,(g.customData||{}).procedureTool].filter(V=>typeof V=="string"&&V.length>0),V=I.modes||[];return V.includes("any")||j.some(K=>V.includes(K))}),M=v.length?`<div>
            <h4 class="section-title">Permitted Tools & Gates (${v.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              ${v.map(I=>{var j;return`
                <div class="tool-card">
                  <div class="tool-title">
                    <span>${E(I.name)}</span>
                    <span class="chip">TOOL</span>
                  </div>
                  <p class="section-text" style="font-size: 0.78rem;">${E(I.summary)}</p>
                  ${(j=I.gate)!=null&&j.length?`<div style="font-size: 0.72rem; color: var(--tuto-muted, #64748b);"><strong>Gate:</strong> ${E(I.gate.join(" · "))}</div>`:""}
                </div>
              `}).join("")}
            </div>
          </div>`:"",_=g.targetSubgraph||g.subgraphId||((d=(n=this._graph)==null?void 0:n.subgraphs)!=null&&d[g.id]?g.id:null);s=`
        ${_?`<div style="margin-bottom: 0.5rem;">
            <button class="btn-subgraph-drill" id="btn-subgraph-drill" data-subgraph="${E(_)}">
              <span>Drill into <strong>${E(_)}</strong> Subgraph</span>
              <span>➔</span>
            </button>
          </div>`:""}
        ${g.summary?`<div><h4 class="section-title">Summary</h4><p class="section-text">${E(g.summary)}</p></div>`:""}
        ${Y}
        ${r}
        ${M}
      `}else if(this._edge){const g=this._edge;this.style.setProperty("--drawer-accent","#3b82f6");const T=g.event||g.label||"Transition";t=`
        <div class="header-titles">
          <h2>${E(T)}</h2>
          <div class="header-badges">
            <span class="badge badge-accent">TRANSITION</span>
            ${g.userMediated?'<span class="badge badge-perm perm-readonly">USER-MEDIATED</span>':'<span class="badge badge-perm perm-write">PROCEDURAL</span>'}
            ${g.bidirectional?'<span class="badge badge-perm perm-write">BIDIRECTIONAL</span>':""}
          </div>
        </div>
      `,s=`
        <div>
          <h4 class="section-title">Route Connection</h4>
          <p class="section-text" style="font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
            <span class="chip" style="font-size: 0.82rem; font-weight: 700; padding: 0.2rem 0.6rem;">${E(g.from.toUpperCase())}</span>
            <span style="color: var(--tuto-muted);">${g.bidirectional?"◄──►":"──►"}</span>
            <span class="chip" style="font-size: 0.82rem; font-weight: 700; padding: 0.2rem 0.6rem;">${E(g.to.toUpperCase())}</span>
          </p>
        </div>
        ${g.label&&g.label!==T?`<div><h4 class="section-title">Action / Intention</h4><p class="section-text" style="color: var(--tuto-text); font-weight: 600;">${E(g.label)}</p></div>`:""}
        ${g.description?`<div><h4 class="section-title">Description & Rules</h4><p class="section-text" style="line-height: 1.6;">${E(g.description)}</p></div>`:""}
        ${(l=g.events)!=null&&l.length?`<div>
                <h4 class="section-title">Trigger Events (${g.events.length})</h4>
                <div class="chip-group">
                  ${g.events.map(X=>`<span class="chip" style="color: var(--tuto-accent, #38bdf8);">${E(X)}</span>`).join("")}
                </div>
              </div>`:""}
        ${(c=g.descriptions)!=null&&c.length&&g.descriptions.length>1?`<div>
                <h4 class="section-title">Bundled Paths</h4>
                <ul class="instruction-list">
                  ${g.descriptions.map(X=>`
                    <li class="instruction-item">
                      <span>${E(X)}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>`:""}
      `}else{this.style.setProperty("--drawer-accent","#f97316");const g=((u=this._graph)==null?void 0:u.title)||"Workflow Overview",T=((h=this._graph)==null?void 0:h.version)||"",X=(($=this._graph)==null?void 0:$.description)||((N=this._graph)==null?void 0:N.summary)||"",A=(B=this._graph)==null?void 0:B.session,Y=(p=this._graph)==null?void 0:p.exceptions,r=((b=this._graph)==null?void 0:b.invariants)||((y=this._graph)==null?void 0:y.rules)||(Y==null?void 0:Y.rules)||[],v=((w=this._graph)==null?void 0:w.ownership)||[],M=((S=this._graph)==null?void 0:S.always)||[],_=(R=this._graph)==null?void 0:R.artifact,U=((z=this._graph)==null?void 0:z.procedures)||{};t=`
        <div class="header-titles">
          <h2>${E(g)}</h2>
          <div class="header-badges">
            <span class="badge badge-accent" style="background: #f97316;">OVERVIEW</span>
            ${T?`<span class="badge badge-perm perm-standby">${E(T)}</span>`:""}
          </div>
        </div>
      `;const I=A?`<div>
            <h4 class="section-title" style="color: var(--tuto-accent, #38bdf8);">Session Model & Artifact Contract</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${A.mode?`<div class="info-card"><span class="info-card-label">Session Mode</span><span class="info-card-value">${E(A.mode)}</span></div>`:""}
              ${A.artifact?`<div class="info-card"><span class="info-card-label">Plan Artifact</span><span class="info-card-value">${E(A.artifact)}</span></div>`:""}
              ${A.scope?`<div class="info-card"><span class="info-card-label">Session Scope</span><span class="info-card-value">${E(A.scope)}</span></div>`:""}
              ${A.review?`<div class="info-card"><span class="info-card-label">Review State</span><span class="info-card-value">${E(A.review)}</span></div>`:""}
            </div>
          </div>`:"",j=Y?`<div>
            <h4 class="section-title" style="color: #f97316;">${E(Y.title||"Exceptions & Escape Hatches")}</h4>
            ${Y.summary?`<p class="section-text" style="line-height: 1.55; margin-bottom: 0.75rem; font-size: 0.82rem;">${E(Y.summary)}</p>`:""}
            ${(k=Y.commands)!=null&&k.length?`<div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem;">
                    ${Y.commands.map(O=>`
                      <div class="tool-card" style="border-left: 3px solid #f97316; padding: 0.65rem 0.8rem;">
                        <div class="tool-title" style="margin-bottom: 0.25rem;">
                          <span style="color: #f97316; font-size: 0.84rem; font-weight: 700;">${E(O.command)}</span>
                          ${O.label?`<span class="chip" style="color: #fdba74; border-color: rgba(249, 115, 22, 0.3); font-size: 0.68rem;">${E(O.label)}</span>`:""}
                        </div>
                        <p class="section-text" style="font-size: 0.78rem; line-height: 1.45;">${E(O.summary||O.description||"")}</p>
                      </div>
                    `).join("")}
                  </div>`:""}
            ${(P=Y.rules)!=null&&P.length?`<ul class="instruction-list">
                    ${Y.rules.map(O=>`
                      <li class="instruction-item">
                        <span class="instruction-idx" style="color: #f97316;">•</span>
                        <span style="font-size: 0.8rem; line-height: 1.45;">${E(O)}</span>
                      </li>
                    `).join("")}
                  </ul>`:""}
          </div>`:"",V=r.length?`<div>
            <h4 class="section-title">Workflow Invariants & Boundaries</h4>
            <ul class="instruction-list">
              ${r.map(O=>`
                <li class="instruction-item">
                  <span class="instruction-idx" style="color: #f97316;">•</span>
                  <span style="font-size: 0.8rem; line-height: 1.45;">${E(O)}</span>
                </li>
              `).join("")}
            </ul>
          </div>`:"",K=v.length?`<div>
            <h4 class="section-title">Ownership & Roles</h4>
            <ul class="instruction-list">
              ${v.map(O=>`
                <li class="instruction-item">
                  <span class="instruction-idx" style="color: #3b82f6;">•</span>
                  <span style="font-size: 0.8rem; line-height: 1.45;">${E(O)}</span>
                </li>
              `).join("")}
            </ul>
          </div>`:"",Pt=_?`<div>
            <h4 class="section-title">Artifact Sections & Identifiers</h4>
            ${(m=_.sections)!=null&&m.length?`<div style="margin-bottom: 0.6rem;">
                    <div style="font-size: 0.72rem; color: var(--tuto-muted, #64748b); margin-bottom: 0.35rem; font-weight: 700;">REQUIRED SECTIONS (${_.sections.length})</div>
                    <div class="chip-group">
                      ${_.sections.map(O=>`<span class="chip" style="color: var(--tuto-accent, #38bdf8);">${E(O)}</span>`).join("")}
                    </div>
                  </div>`:""}
            ${_.identifiers&&Object.keys(_.identifiers).length?`<div style="margin-bottom: 0.6rem;">
                    <div style="font-size: 0.72rem; color: var(--tuto-muted, #64748b); margin-bottom: 0.35rem; font-weight: 700;">STABLE LIFECYCLE IDENTIFIERS</div>
                    <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                      ${Object.entries(_.identifiers).map(([O,Z])=>`
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem;">
                          <span class="chip" style="font-weight: 700; color: #f97316;">${E(O)}</span>
                          <span style="color: var(--tuto-text-muted, #94a3b8);">${E(Z)}</span>
                        </div>
                      `).join("")}
                    </div>
                  </div>`:""}
            ${(L=_.rules)!=null&&L.length?`<ul class="instruction-list">
                    ${_.rules.map(O=>`
                      <li class="instruction-item">
                        <span class="instruction-idx" style="color: #38bdf8;">•</span>
                        <span style="font-size: 0.8rem; line-height: 1.45;">${E(O)}</span>
                      </li>
                    `).join("")}
                  </ul>`:""}
          </div>`:"",Ct=M.length?`<div>
            <h4 class="section-title">Execution Principles (ALWAYS)</h4>
            <ul class="instruction-list">
              ${M.map(O=>`
                <li class="instruction-item">
                  <span class="instruction-idx" style="color: #22c55e;">•</span>
                  <span style="font-size: 0.8rem; line-height: 1.45;">${E(O)}</span>
                </li>
              `).join("")}
            </ul>
          </div>`:"",rt=Object.keys(U),vt=rt.length?`<div>
            <h4 class="section-title">Global Procedures (${rt.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              ${rt.map(O=>`
                <details class="spec-details">
                  <summary>
                    <span>${E(O)}</span>
                    <span class="chip" style="font-size: 0.68rem;">${(U[O]||[]).length} steps</span>
                  </summary>
                  <div class="spec-details-content">
                    <ol class="instruction-list" style="gap: 0.4rem;">
                      ${(U[O]||[]).map((Z,ot)=>`
                        <li class="instruction-item" style="padding: 0.45rem 0.6rem; font-size: 0.78rem;">
                          <span class="instruction-idx">${ot+1}.</span>
                          <span>${E(Z)}</span>
                        </li>
                      `).join("")}
                    </ol>
                  </div>
                </details>
              `).join("")}
            </div>
          </div>`:"";s=`
        ${X?`<div>
                <h4 class="section-title">Big Picture & Architecture</h4>
                <p class="section-text" style="line-height: 1.6; color: var(--tuto-text, #e8eaed); font-size: 0.84rem;">${E(X)}</p>
              </div>`:""}
        ${I}
        ${j}
        ${V}
        ${K}
        ${Pt}
        ${Ct}
        ${vt}

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
    `;const e=this.shadowRootNode.querySelector(".drawer");e&&(e.addEventListener("pointerdown",g=>g.stopPropagation()),e.addEventListener("mousedown",g=>g.stopPropagation())),(C=this.shadowRootNode.getElementById("btn-close"))==null||C.addEventListener("click",()=>{this.emit("flow:close-inspector")});const o=this.shadowRootNode.getElementById("btn-subgraph-drill");o&&o.addEventListener("click",()=>{const g=o.getAttribute("data-subgraph");g&&this.emit("flow:select-subgraph",{subgraphId:g})})}}f(Nt,"styles",`
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
  `),customElements.get("tuto-flow-inspector")||customElements.define("tuto-flow-inspector",Nt);class Rt extends J{constructor(){super(...arguments);f(this,"_rootGraph",null);f(this,"_graph",null);f(this,"_activeSubgraphId",null);f(this,"_showSubgraphNav",!0);f(this,"_camera",{panX:0,panY:0,scale:1});f(this,"_bounds",{x:0,y:0,w:2e3,h:1e3});f(this,"_activeStateId",null);f(this,"_selectedNodeId",null);f(this,"_selectedEdgeId",null);f(this,"_hoveredEdgeId",null);f(this,"_showMinimap",!0);f(this,"_showInspector",!0);f(this,"_hasRestoredCamera",!1);f(this,"_theme","dark");f(this,"_toolMode","view");f(this,"_isDragging",!1);f(this,"_dragStart",{x:0,y:0,panX:0,panY:0});f(this,"_draggedNodeId",null);f(this,"_dragNodeStart",null);f(this,"_nodeDragMoved",!1);f(this,"_edgeWaypoints",new Map);f(this,"_draggedWaypoint",null);f(this,"_activeGuides",[]);f(this,"_defaultLayout",null);f(this,"_toastMessage",null);f(this,"_toastTimeout",null);f(this,"_activePopover",null);f(this,"handleKeyDown",t=>{var s;t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement||(t.key==="+"||t.key==="="?this.zoomBy(1.2):t.key==="-"?this.zoomBy(.8333333333333334):t.key==="0"||t.key==="f"||t.key==="F"?this.fitToViewport():t.key==="r"||t.key==="R"?(s=this._graph)!=null&&s.initial&&(this._activeStateId=this._graph.initial,this._selectedNodeId=this._graph.initial,this._selectedEdgeId=null,this.requestUpdate()):t.key==="i"||t.key==="I"?this._toggleInspector():t.key==="m"||t.key==="M"?this.toolMode=this._toolMode==="move"?"view":"move":t.key==="e"||t.key==="E"?this.toolMode=this._toolMode==="edit"?"view":"edit":(t.key==="s"||t.key==="S")&&this._toolMode!=="view"?t.shiftKey?this.copyFsmPatch():this.copyLayoutSnapshot():t.key==="Escape"&&(this._activePopover?(this._activePopover=null,this.requestUpdate()):this._selectedNodeId||this._selectedEdgeId?(this._selectedNodeId=null,this._activeStateId=null,this._selectedEdgeId=null,this.requestUpdate()):this._toolMode!=="view"?this.toolMode="view":this._closeInspector()))});f(this,"handleResize",()=>{this.requestUpdate()});f(this,"handleWheel",t=>{t.preventDefault();const s=this.getBoundingClientRect(),e=t.clientX-s.left,o=t.clientY-s.top,n=t.deltaY<0?1.12:.89;this._camera=ut(this._camera,e,o,n,tt,it),this._applyCameraTransform()});f(this,"handlePointerDown",t=>{var o;if(t.button!==0||t.target.closest(".flow-edge-pill, tuto-flow-node, .floating-toolbar, .floating-minimap, tuto-flow-inspector, .flow-waypoint-handle, .flow-waypoint-split"))return;this._isDragging=!0,this._dragStart={x:t.clientX,y:t.clientY,panX:this._camera.panX,panY:this._camera.panY};const e=(o=this.shadowRootNode)==null?void 0:o.querySelector("svg.flow-svg");e==null||e.classList.add("grabbing"),window.addEventListener("pointermove",this.handlePointerMove),window.addEventListener("pointerup",this.handlePointerUp)});f(this,"handlePointerMove",t=>{this._isDragging&&(this._camera={...this._camera,panX:this._dragStart.panX+(t.clientX-this._dragStart.x),panY:this._dragStart.panY+(t.clientY-this._dragStart.y)},this._applyCameraTransform())});f(this,"handlePointerUp",()=>{var s;this._isDragging&&(Math.hypot(this._camera.panX-this._dragStart.panX,this._camera.panY-this._dragStart.panY)<4&&(this._selectedNodeId=null,this._activeStateId=null,this._selectedEdgeId=null,this.requestUpdate()),this._saveCamera()),this._isDragging=!1;const t=(s=this.shadowRootNode)==null?void 0:s.querySelector("svg.flow-svg");t==null||t.classList.remove("grabbing"),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("pointerup",this.handlePointerUp)});f(this,"handleNodePointerMove",t=>{if(!this._draggedNodeId||!this._dragNodeStart||!this._graph)return;const s=this._graph.states[this._draggedNodeId];if(!s)return;const e=this._camera.scale||1,o=(t.clientX-this._dragNodeStart.startX)/e,n=(t.clientY-this._dragNodeStart.startY)/e;Math.hypot(o,n)>4&&(this._nodeDragMoved=!0);const d=this._dragNodeStart.nodeOrigX+o,l=this._dragNodeStart.nodeOrigY+n,c=Ht(this._draggedNodeId,d,l,s.w,s.h,this._graph.states,et,10);s.x=c.x,s.y=c.y,this._activeGuides=c.guides;const u=this._graph.framing!==!1;this._bounds=mt(this._graph.states,u?64:40,u?56:30,u?46:0,this._graph.groups),this.requestUpdate()});f(this,"handleNodePointerUp",()=>{var s;if(!this._draggedNodeId)return;const t=this._draggedNodeId;this._draggedNodeId=null,this._dragNodeStart=null,this._activeGuides=[],window.removeEventListener("pointermove",this.handleNodePointerMove),window.removeEventListener("pointerup",this.handleNodePointerUp),this._nodeDragMoved?this.emit("flow:layout-change",{nodeId:t,layout:this.exportLayoutSnapshot()}):this._selectedNodeId===t?(this._selectedNodeId=null,this._activeStateId=null,this.emit("flow:select-node",{node:null})):(this._selectedNodeId=t,this._activeStateId=t,(s=this._graph)!=null&&s.states[t]&&this.emit("flow:select-node",{node:this._graph.states[t]})),this.requestUpdate()});f(this,"handleWaypointPointerMove",t=>{if(!this._draggedWaypoint||!this._graph)return;const{edgeId:s,waypointIndex:e,startX:o,startY:n,origX:d,origY:l}=this._draggedWaypoint,c=this._edgeWaypoints.get(s);if(!c||!c[e])return;const u=this._camera.scale||1,h=(t.clientX-o)/u,$=(t.clientY-n)/u,N=d+h,B=l+$,p=bt(N,B,s,e,this._graph.states,this._graph.transitions||[],this._edgeWaypoints,et,10);c[e]=[p.x,p.y],this._activeGuides=p.guides,this.requestUpdate()});f(this,"handleWaypointPointerUp",()=>{this._draggedWaypoint&&(this._draggedWaypoint=null,this._activeGuides=[],window.removeEventListener("pointermove",this.handleWaypointPointerMove),window.removeEventListener("pointerup",this.handleWaypointPointerUp),this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.requestUpdate())})}get graph(){return this._graph}set graph(t){var e;this._rootGraph=t,this._activeSubgraphId=(t==null?void 0:t.activeSubgraphId)||null;const s=this._activeSubgraphId&&((e=t==null?void 0:t.subgraphs)!=null&&e[this._activeSubgraphId])?t.subgraphs[this._activeSubgraphId]:t;this._applyGraph(s),this.requestUpdate()}get rootGraph(){return this._rootGraph}get activeSubgraphId(){return this._activeSubgraphId}set activeSubgraphId(t){this.selectSubgraph(t)}get subgraphs(){var t;return(t=this._rootGraph)==null?void 0:t.subgraphs}get showSubgraphNav(){return this._showSubgraphNav}set showSubgraphNav(t){this._showSubgraphNav=t,this.requestUpdate()}selectSubgraph(t){var s;if(this._rootGraph){if(this._syncWaypointsToGraph(),!t||t==="__root__"||t==="overview")this._activeSubgraphId=null,this._applyGraph(this._rootGraph);else if((s=this._rootGraph.subgraphs)!=null&&s[t])this._activeSubgraphId=t,this._applyGraph(this._rootGraph.subgraphs[t]);else return;this._selectedNodeId=null,this._selectedEdgeId=null,requestAnimationFrame(()=>this.fitToViewport()),this.emit("flow:subgraph-change",{subgraphId:this._activeSubgraphId,graph:this._graph}),this.requestUpdate()}}_applyGraph(t){if(this._graph=t,t){if(this._defaultLayout=null,t.states){this._defaultLayout={};for(const[e,o]of Object.entries(t.states))this._defaultLayout[e]={x:o.x,y:o.y,w:o.w,h:o.h}}if(this._edgeWaypoints.clear(),t.transitions)for(const e of t.transitions)e.waypoints&&e.waypoints.length>0&&this._edgeWaypoints.set(e.id,e.waypoints.map(o=>[...o]));try{const e=localStorage.getItem("pi_workflow_edge_override");if(e!==null){const o=JSON.parse(e),n=this._activeSubgraphId||"overview";let d=null;if(o!=null&&o.diagrams&&typeof o.diagrams=="object"?d=o.diagrams[n]||null:o&&typeof o=="object"&&(d=o),d)for(const[l,c]of Object.entries(d))Array.isArray(c)&&c.length>0&&this._edgeWaypoints.set(l,c)}}catch{}this._activeStateId=t.initial||Object.keys(t.states||{})[0]||null;const s=t.framing!==!1;if(this._bounds=mt(t.states,s?64:40,s?56:30,s?46:0,t.groups),!this._hasRestoredCamera)try{const e=localStorage.getItem("pi_workflow_camera");if(e){const o=JSON.parse(e);o&&typeof o.scale=="number"&&typeof o.panX=="number"&&(this._camera=o,this._hasRestoredCamera=!0)}}catch{}this._hasRestoredCamera||requestAnimationFrame(()=>this.fitToViewport())}}_removeWaypoint(t,s){const e=[...this._edgeWaypoints.get(t)||[]];s>=0&&s<e.length&&e.splice(s,1),e.length===0?(this._edgeWaypoints.delete(t),this.showToast("✓ Straightened edge (0 breakpoints)")):(this._edgeWaypoints.set(t,e),this.showToast(`✓ Removed breakpoint (${e.length}/2 remaining)`)),this._activePopover=null,this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.requestUpdate()}_resetEdge(t){this._edgeWaypoints.delete(t),this._activePopover=null,this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.showToast("✓ Reset edge to straight line (0 breakpoints)"),this.requestUpdate()}_addWaypointToEdge(t,s,e){var c,u;const o=this._edgeWaypoints.get(t)?[...this._edgeWaypoints.get(t)]:[];if(o.length>=2){this.showToast("Maximum 2 breakpoints per line");return}const n=bt(s,e,t,o.length,((c=this._graph)==null?void 0:c.states)||{},((u=this._graph)==null?void 0:u.transitions)||[],this._edgeWaypoints,et,10),d=n.x,l=n.y;o.push([d,l]),this._edgeWaypoints.set(t,o),this._activePopover={type:"waypoint",id:t,index:o.length-1,worldX:d,worldY:l},this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),this.showToast(`✓ Added breakpoint (${o.length}/2)`),this.requestUpdate()}_resetNode(t){var s,e;if(this._defaultLayout&&this._defaultLayout[t]&&((e=(s=this._graph)==null?void 0:s.states)!=null&&e[t])){const o=this._defaultLayout[t];this._graph.states[t].x=o.x,this._graph.states[t].y=o.y,this._graph.states[t].w=o.w,this._graph.states[t].h=o.h;try{const n=localStorage.getItem("pi_workflow_layout_override");if(n){const d=JSON.parse(n);delete d[t],localStorage.setItem("pi_workflow_layout_override",JSON.stringify(d))}}catch{}this._activePopover=null,this.emit("flow:layout-change",{nodeId:t,layout:this.exportLayoutSnapshot()}),this.showToast(`✓ Reset ${t} position`),this.requestUpdate()}}_renderPopoverContent(){var t,s;if(!this._activePopover)return"";if(this._activePopover.type==="waypoint"){const e=this._activePopover.id,o=this._edgeWaypoints.get(e)||[];return`
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
          ${E(this._activePopover.label||e)}
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
      `}if(this._activePopover.type==="node"){const e=this._activePopover.id,o=(s=(t=this._graph)==null?void 0:t.states)==null?void 0:s[e];return`
        <span class="flow-fab-label">
          ${E(this._activePopover.label||e)}
          <span class="flow-fab-badge">${Math.round((o==null?void 0:o.x)||0)}, ${Math.round((o==null?void 0:o.y)||0)}</span>
        </span>
        <button type="button" class="flow-fab-btn warning" data-action="reset-node" title="Reset node position to default">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
          Reset Position
        </button>
        <button type="button" class="flow-fab-close" data-action="close-popover" title="Close">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `}return""}get toolMode(){return this._toolMode}set toolMode(t){this._toolMode=t,this._activePopover=null,this.emit("flow:tool-mode-change",{toolMode:this._toolMode}),this._toolMode==="move"?this.showToast("Move Mode Active (Drag nodes, labels & lines to reposition · M to exit)"):this._toolMode==="edit"&&this.showToast("Edit Mode Active (Click labels, waypoints & nodes for actions · E to exit)"),this.requestUpdate()}get isEditMode(){return this._toolMode==="edit"}set isEditMode(t){this.toolMode=t?"edit":"view"}get isMoveMode(){return this._toolMode==="move"}set isMoveMode(t){this.toolMode=t?"move":"view"}get activeStateId(){return this._activeStateId}set activeStateId(t){this._activeStateId=t,this.requestUpdate()}get selectedNodeId(){return this._selectedNodeId}set selectedNodeId(t){this._selectedNodeId=t,this.requestUpdate()}get selectedEdgeId(){return this._selectedEdgeId}set selectedEdgeId(t){this._selectedEdgeId=t,this.requestUpdate()}get showMinimap(){return this._showMinimap}set showMinimap(t){this._showMinimap=!!t;try{localStorage.setItem("pi_workflow_minimap_open",JSON.stringify(this._showMinimap))}catch{}this.requestUpdate()}get showInspector(){return this._showInspector}set showInspector(t){this._showInspector=!!t,this.requestUpdate()}get theme(){return this._theme}set theme(t){this._theme=t,this.setAttribute("data-theme",t),this.requestUpdate()}get camera(){return this._camera}set camera(t){this._camera=t,this._applyCameraTransform()}connectedCallback(){super.connectedCallback();try{const t=localStorage.getItem("pi_workflow_minimap_open");t!==null?this._showMinimap=JSON.parse(t):this._showMinimap=!0;const s=localStorage.getItem("pi_workflow_inspector_open");s!==null?this._showInspector=JSON.parse(s):this._showInspector=!0;const e=localStorage.getItem("pi_workflow_camera");if(e!==null){const o=JSON.parse(e);o&&typeof o.scale=="number"&&typeof o.panX=="number"&&(this._camera=o,this._hasRestoredCamera=!0)}}catch{}window.addEventListener("keydown",this.handleKeyDown),window.addEventListener("resize",this.handleResize)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.handleKeyDown),window.removeEventListener("resize",this.handleResize),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("pointerup",this.handlePointerUp),window.removeEventListener("pointermove",this.handleNodePointerMove),window.removeEventListener("pointerup",this.handleNodePointerUp),window.removeEventListener("pointermove",this.handleWaypointPointerMove),window.removeEventListener("pointerup",this.handleWaypointPointerUp)}_saveCamera(){try{localStorage.setItem("pi_workflow_camera",JSON.stringify(this._camera))}catch{}}_toggleMinimap(){this.showMinimap=!this._showMinimap}_toggleInspector(){this._showInspector=!this._showInspector;try{localStorage.setItem("pi_workflow_inspector_open",JSON.stringify(this._showInspector))}catch{}this.requestUpdate()}_closeInspector(){this._showInspector=!1;try{localStorage.setItem("pi_workflow_inspector_open",JSON.stringify(!1))}catch{}this.requestUpdate()}fitToViewport(){const t=this.getBoundingClientRect(),s=t.width||900,e=t.height||700,o=this._showInspector?Math.min(420,s*.45):0,n=s-o,d=Wt({width:n,height:e},this._bounds);this._camera={scale:d.scale,panX:d.panX,panY:d.panY},this._applyCameraTransform()}centerOnState(t){var c;if(!((c=this._graph)!=null&&c.states[t]))return;const s=this._graph.states[t],e=this.getBoundingClientRect(),o=e.width||900,n=e.height||700,d=this._showInspector?Math.min(420,o*.45):0,l=o-d;this._camera=Ot({width:l,height:n},s),this._activeStateId=t,this._selectedNodeId=t,this._selectedEdgeId=null,this._saveCamera(),this.requestUpdate()}showToast(t){this._toastMessage=t,this._toastTimeout&&clearTimeout(this._toastTimeout),this.requestUpdate(),this._toastTimeout=setTimeout(()=>{this._toastMessage=null,this.requestUpdate()},2500)}exportLayoutSnapshot(){var o,n;this._syncWaypointsToGraph();const t=this._snapshotGraphLayout(this._graph),s={...t.nodes,nodes:t.nodes,edges:t.edges,activeDiagramId:this._activeSubgraphId};let e={};if(typeof window<"u"){const d=window.WORKFLOW_LAYOUT;d!=null&&d.diagrams&&typeof d.diagrams=="object"&&(e={...d.diagrams});try{const l=localStorage.getItem("pi_workflow_layout_override");if(l){const c=JSON.parse(l);c!=null&&c.diagrams&&typeof c.diagrams=="object"?e={...e,...c.diagrams}:c&&typeof c=="object"&&(c.overview||c.full||c.align)&&(e={...e,...c})}}catch{}}if((o=this._rootGraph)!=null&&o.subgraphs&&Object.keys(this._rootGraph.subgraphs).length>0){const d={...e,overview:this._snapshotGraphLayout(this._rootGraph)};for(const[l,c]of Object.entries(this._rootGraph.subgraphs))d[l]=this._snapshotGraphLayout(c);d[this._diagramIdForActive()]=t,s.diagrams=d}else{const d=((n=this._graph)==null?void 0:n.id)==="full-fsm"?"full":this._diagramIdForActive(),l={...e,[d]:t};Object.keys(l).length>0&&(s.diagrams=l)}return s}async copyLayoutSnapshot(){var n,d;const t=!!((n=this._rootGraph)!=null&&n.subgraphs&&Object.keys(this._rootGraph.subgraphs).length>0);this._syncWaypointsToGraph();const s=this._snapshotGraphLayout(this._graph);let e="",o;if(t){const l={overview:this._snapshotGraphLayout(this._rootGraph)};if((d=this._rootGraph)!=null&&d.subgraphs)for(const[c,u]of Object.entries(this._rootGraph.subgraphs))l[c]=this._snapshotGraphLayout(u);l[this._diagramIdForActive()]=s,o={diagrams:l},e=`window.WORKFLOW_LAYOUT_MULTI = ${JSON.stringify(o,null,2)};
`}else o={nodes:s.nodes||{},edges:s.edges||{}},e=`window.WORKFLOW_LAYOUT_FULL = ${JSON.stringify(o,null,2)};
`;try{typeof navigator<"u"&&navigator.clipboard&&navigator.clipboard.writeText&&await navigator.clipboard.writeText(e)}catch{}try{t?localStorage.setItem("pi_workflow_layout_override",JSON.stringify(o.diagrams)):localStorage.setItem("pi_workflow_layout_override",JSON.stringify(o)),this._saveEdgeWaypoints()}catch{}return console.log(`Exported layout JS:
`+e),this.showToast(t?"✓ Multi layout JS (workflow-layout-multi.js) copied to clipboard!":"✓ Full FSM layout JS (workflow-layout-full.js) copied to clipboard!"),this.emit("flow:snapshot-layout",{snapshot:t?{diagrams:o.diagrams}:o,code:e,json:o}),e}autoRouteEdges(){if(!this._graph)return;this._edgeWaypoints.clear();const t=this._graph.transitions||[],s=kt(t),e=jt(s,this._graph.states);for(const[o,n]of e.entries())this._edgeWaypoints.set(o,n);this._saveEdgeWaypoints(),this.showToast("✓ Edges auto-routed to clean channels"),this.requestUpdate()}updateNode(t,s){var o,n;const e=(n=(o=this._graph)==null?void 0:o.states)==null?void 0:n[t];return e?(Object.assign(e,s,{id:t}),this.emit("flow:graph-change",{op:"update-node",nodeId:t,node:e,diagramId:this._diagramIdForActive(),graph:this._graph,rootGraph:this._rootGraph}),this.requestUpdate(),e):null}updateEdge(t,s){var o,n;const e=(n=(o=this._graph)==null?void 0:o.transitions)==null?void 0:n.find(d=>d.id===t);return e?(Object.assign(e,s,{id:t}),this.emit("flow:graph-change",{op:"update-edge",edgeId:t,edge:e,diagramId:this._diagramIdForActive(),graph:this._graph,rootGraph:this._rootGraph}),this.requestUpdate(),e):null}exportFsmPatch(){this._syncWaypointsToGraph();const t=this._rootGraph||this._graph,s={},e=[],o=["overview"],n=(l,c)=>{if(l){if(l.states)for(const[u,h]of Object.entries(l.states))c&&h.targetSubgraph||(s[u]={id:u,label:h.label,summary:h.summary,procedure:h.procedure?[...h.procedure]:void 0,substates:h.substates?[...h.substates]:void 0,kind:h.kind,permission:h.permission,targetSubgraph:h.targetSubgraph});if(l.transitions)for(const u of l.transitions)u.customData&&u.customData.aggregate||e.some(h=>h.id===u.id)||e.push({id:u.id,from:u.from,to:u.to,label:u.label,event:u.event,description:u.description,userMediated:u.userMediated,bidirectional:u.bidirectional})}};if(n(t,!!(t!=null&&t.subgraphs&&Object.keys(t.subgraphs).length>0)),t!=null&&t.subgraphs)for(const[l,c]of Object.entries(t.subgraphs))o.push(l),n(c,!1);const d={version:t==null?void 0:t.version,states:s,transitions:e,diagrams:o};return this.emit("flow:export-fsm-patch",{patch:d}),d}async copyFsmPatch(){var e;const t=this.exportFsmPatch(),s=JSON.stringify(t,null,2)+`
`;try{typeof navigator<"u"&&((e=navigator.clipboard)!=null&&e.writeText)&&await navigator.clipboard.writeText(s)}catch{}return console.log(`Exported FSM patch:
`+s),this.showToast("✓ FSM patch JSON copied to clipboard!"),s}resetLayout(){var s;if(!this._defaultLayout||!((s=this._graph)!=null&&s.states))return;for(const[e,o]of Object.entries(this._defaultLayout))this._graph.states[e]&&(this._graph.states[e].x=o.x,this._graph.states[e].y=o.y,this._graph.states[e].w=o.w,this._graph.states[e].h=o.h);this._edgeWaypoints.clear();try{localStorage.removeItem("pi_workflow_layout_override"),localStorage.removeItem("pi_workflow_edge_override")}catch{}const t=this._graph.framing!==!1;this._bounds=mt(this._graph.states,t?64:40,t?56:30,t?46:0,this._graph.groups),this.showToast("✓ Reset layout to default"),this.emit("flow:reset-layout"),this.requestUpdate()}zoomBy(t){const s=this.getBoundingClientRect(),e=s.width/2,o=s.height/2;this._camera=ut(this._camera,e,o,t,tt,it),this._applyCameraTransform()}zoomTo(t=1){const s=this.getBoundingClientRect(),e=s.width/2,o=s.height/2,n=this._camera.scale||1,d=t/n;this._camera=ut(this._camera,e,o,d,tt,it),this._applyCameraTransform()}resetZoom(){this.zoomTo(1)}_applyCameraTransform(){if(!this.shadowRootNode)return;const t=this.shadowRootNode.getElementById("viewport-root");t&&t.setAttribute("transform",`translate(${this._camera.panX}, ${this._camera.panY}) scale(${this._camera.scale})`);const s=this.shadowRootNode.getElementById("flow-grid-pattern");s&&s.setAttribute("patternTransform",`translate(${this._camera.panX}, ${this._camera.panY}) scale(${this._camera.scale})`);const e=this.shadowRootNode.getElementById("action-popover");if(e&&this._activePopover){const d=this._camera.panX+this._activePopover.worldX*this._camera.scale,l=this._camera.panY+this._activePopover.worldY*this._camera.scale;e.style.left=`${d}px`,e.style.top=`${l}px`}const o=this.shadowRootNode.getElementById("minimap-el");o&&(o.camera=this._camera);const n=this.shadowRootNode.getElementById("toolbar-el");n&&(n.zoom=Math.round(this._camera.scale*100)),this._saveCamera()}_startNodeDrag(t,s){var o;const e=(o=this._graph)==null?void 0:o.states[t];e&&(this._draggedNodeId=t,this._nodeDragMoved=!1,this._activeGuides=[],this._dragNodeStart={startX:s.clientX,startY:s.clientY,nodeOrigX:e.x,nodeOrigY:e.y},window.addEventListener("pointermove",this.handleNodePointerMove),window.addEventListener("pointerup",this.handleNodePointerUp),this.requestUpdate())}_startWaypointDrag(t,s,e){const o=this._edgeWaypoints.get(t);if(!o||!o[s])return;const n=o[s];this._draggedWaypoint={edgeId:t,waypointIndex:s,startX:e.clientX,startY:e.clientY,origX:n[0],origY:n[1]},this._activeGuides=[],window.addEventListener("pointermove",this.handleWaypointPointerMove),window.addEventListener("pointerup",this.handleWaypointPointerUp),this.requestUpdate()}_syncWaypointsToGraph(){var t;if((t=this._graph)!=null&&t.transitions)for(const s of this._graph.transitions){const e=this._edgeWaypoints.get(s.id);e&&e.length>0?s.waypoints=e.map(([o,n])=>[o,n]):delete s.waypoints}}_diagramIdForActive(){return this._activeSubgraphId||"overview"}_snapshotGraphLayout(t){const s={};if(t!=null&&t.states)for(const[o,n]of Object.entries(t.states))s[o]={x:Math.round(n.x),y:Math.round(n.y),w:Math.round(n.w),h:Math.round(n.h)};const e={};if(t!=null&&t.transitions)for(const o of t.transitions)o.waypoints&&o.waypoints.length>0&&(e[o.id]=o.waypoints.map(([n,d])=>[Math.round(n),Math.round(d)]));return{nodes:s,edges:e}}_saveEdgeWaypoints(){this._syncWaypointsToGraph();try{const t={};for(const[d,l]of this._edgeWaypoints.entries())l&&l.length>0&&(t[d]=l);const s=this._diagramIdForActive();let e={};try{const d=localStorage.getItem("pi_workflow_edge_override");d&&(e=JSON.parse(d)||{})}catch{e={}}const o=e.diagrams&&typeof e.diagrams=="object"?{...e.diagrams}:{};!e.diagrams&&Object.keys(e).length>0&&Object.values(e).every(d=>Array.isArray(d))&&(o.overview=e),o[s]=t,localStorage.setItem("pi_workflow_edge_override",JSON.stringify({diagrams:o}))}catch{}}render(){var P,m,L,C,g,T,X,A,Y;if(!this.shadowRootNode)return;if(!this._graph){this.shadowRootNode.innerHTML=`
        <div class="canvas-root" style="display:flex;align-items:center;justify-content:center;color:var(--tuto-muted);">
          No flow graph loaded
        </div>
      `;return}const t=this._graph.states,s=this._graph.transitions||[],e=Mt(kt(s),t);for(const r of e){this._edgeWaypoints.has(r.id)?r.waypoints=this._edgeWaypoints.get(r.id):r.waypoints=void 0;const v=Gt(r,t);v&&(r.route=v)}qt(e);const o=this._selectedNodeId||this._activeStateId||null,n=this._toolMode==="move",d=this._toolMode==="edit",l=n||d;let c="";if(d&&this._activePopover){const r=this._camera.panX+this._activePopover.worldX*this._camera.scale,v=this._camera.panY+this._activePopover.worldY*this._camera.scale;c=`
        <div class="flow-fab-popover" id="action-popover" style="left: ${r}px; top: ${v}px;">
          ${this._renderPopoverContent()}
        </div>
      `}let u="";if((P=this._rootGraph)!=null&&P.subgraphs&&Object.keys(this._rootGraph.subgraphs).length>0&&this._showSubgraphNav){const r=(v,M)=>{var I;const _=(M||v||"").trim(),U=((I=_.split(/[·•|]/)[0])==null?void 0:I.trim())||_;return/^align$/i.test(v)||/^align\b/i.test(U)?"Align":/^spec$/i.test(v)||/^spec\b/i.test(U)?"Spec":/^vibe$/i.test(v)||/^vibe\b/i.test(U)?"Vibe":U.length<=12?U:v};u=`
        <div class="flow-subgraph-bar" id="subgraph-bar" role="tablist" aria-label="Diagram">
          <div class="flow-subgraph-tabs">
            <button type="button" role="tab" class="flow-subgraph-tab ${this._activeSubgraphId?"":"active"}" data-subgraph="__root__" aria-selected="${!this._activeSubgraphId}">Overview</button>
            ${Object.entries(this._rootGraph.subgraphs).map(([v,M])=>{const _=this._activeSubgraphId===v;return`
              <button type="button" role="tab" class="flow-subgraph-tab ${_?"active":""}" data-subgraph="${E(v)}" aria-selected="${_}">
                ${E(r(v,M.title))}
              </button>`}).join("")}
          </div>
        </div>
      `}this.shadowRootNode.innerHTML=`
      <div class="canvas-root ${n?"move-mode edit-mode":d?"edit-mode":""}">
        ${this._toastMessage?`<div class="flow-toast">${E(this._toastMessage)}</div>`:""}
        ${c}
        ${u}

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
              <text x="${this._bounds.x+20}" y="${this._bounds.y+28}" fill="var(--tuto-text, #ffffff)" font-size="12" font-weight="700" letter-spacing="0.05em" font-family="var(--tuto-font-sans, sans-serif)">${E(this._graph.title.toUpperCase())}</text>
              ${this._graph.subtitle?`<text x="${this._bounds.x+20+this._graph.title.length*7.5+16}" y="${this._bounds.y+28}" fill="var(--tuto-muted, #64748b)" font-size="11" font-family="var(--tuto-font-sans, sans-serif)">${E(this._graph.subtitle)}</text>`:""}
              <text x="${this._bounds.x+this._bounds.w-20}" y="${this._bounds.y+28}" fill="var(--tuto-muted, #64748b)" font-size="11" font-family="var(--tuto-font-mono, monospace)" text-anchor="end">${E(this._graph.version||"v1.0")}</text>
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
    `;const h=this.shadowRootNode.querySelector("svg.flow-svg");h&&(h.addEventListener("wheel",this.handleWheel,{passive:!1}),h.addEventListener("pointerdown",this.handlePointerDown));const $=this.shadowRootNode.getElementById("groups-group"),N=this.shadowRootNode.getElementById("guidelines-group"),B=this.shadowRootNode.getElementById("edges-paths-group"),p=this.shadowRootNode.getElementById("edges-pills-group"),b=this.shadowRootNode.getElementById("edges-handles-group"),y=this.shadowRootNode.getElementById("nodes-group");if(N&&this._activeGuides.length>0)for(const r of this._activeGuides)r.type==="vertical"?(W("line",{x1:r.pos,y1:r.start,x2:r.pos,y2:r.end,class:"flow-guideline"},N),W("circle",{cx:r.pos,cy:r.start+12,r:2.5,class:"flow-guideline-dot"},N),W("circle",{cx:r.pos,cy:r.end-12,r:2.5,class:"flow-guideline-dot"},N)):(W("line",{x1:r.start,y1:r.pos,x2:r.end,y2:r.pos,class:"flow-guideline"},N),W("circle",{cx:r.start+12,cy:r.pos,r:2.5,class:"flow-guideline-dot"},N),W("circle",{cx:r.end-12,cy:r.pos,r:2.5,class:"flow-guideline-dot"},N));if(this._graph.groups)for(const r of this._graph.groups){const v=W("g",{class:"flow-group-container"},$),M=r.accent||"#3b82f6";W("rect",{x:r.x,y:r.y,width:r.w,height:r.h,rx:14,fill:"var(--tuto-card-bg, #12161c)","fill-opacity":"0.38",stroke:M,"stroke-width":1.2,"stroke-opacity":"0.35"},v),W("path",{d:`M ${r.x} ${r.y+14} Q ${r.x} ${r.y} ${r.x+14} ${r.y} L ${r.x+r.w-14} ${r.y} Q ${r.x+r.w} ${r.y} ${r.x+r.w} ${r.y+14} L ${r.x+r.w} ${r.y+28} L ${r.x} ${r.y+28} Z`,fill:M,"fill-opacity":"0.12"},v);const _=W("text",{x:r.x+14,y:r.y+18,fill:M,"font-size":10.5,"font-weight":800,"letter-spacing":"0.08em","font-family":"var(--tuto-font-mono, monospace)"},v);_.textContent=r.label.toUpperCase()}if(this._graph.initial&&t[this._graph.initial]){const r=t[this._graph.initial],v=r.x-14,M=r.y+r.h/2,_=r.x,U=r.y+r.h/2,I=W("g",{class:"flow-initial-indicator"},B);W("circle",{cx:v-4,cy:M,r:4,fill:"#ffffff"},I),W("path",{d:`M ${v} ${M} L ${_} ${U}`,stroke:"#ffffff","stroke-width":2,fill:"none","marker-end":"url(#flow-arrow-init)"},I)}for(const r of e){if(!r.route||!r.route.points||r.route.points.length<2)continue;const v=!!(this._selectedNodeId&&r.from===this._selectedNodeId),M=!!(this._selectedNodeId&&r.to===this._selectedNodeId),_=!!r.bidirectional,U=v||M;if(this._selectedNodeId&&!U)continue;const I=r.id===this._selectedEdgeId;r.id,this._hoveredEdgeId;const j=I||v||_&&M,V=this._selectedNodeId?M&&!_&&!j:!1,K=!!((r.self||r.from===r.to)&&(!r.waypoints||r.waypoints.length===0)),Pt=Ft(r.route.points,K,22),Ct=j?"url(#flow-arrow-hot)":V?"url(#flow-arrow)":"url(#flow-arrow-init)",rt=_?j?"url(#flow-arrow-start-hot)":V?"url(#flow-arrow-start)":"url(#flow-arrow-start-init)":void 0,vt={d:Pt,class:`flow-edge-path ${j?"hot available":""} ${V?"dimmed":""} ${I?"selected":""}`,stroke:j?"#38bdf8":V?"#334155":"#64748b","stroke-width":j?2.8:V?1.4:1.8,fill:"none","marker-end":Ct};rt&&(vt["marker-start"]=rt),W("path",vt,B).addEventListener("click",D=>{var G,F;if(D.stopPropagation(),!n){if(d){const H=D,lt=this.getBoundingClientRect(),ct=this._camera.scale||1,wt=(H.clientX-lt.left-this._camera.panX)/ct,yt=(H.clientY-lt.top-this._camera.panY)/ct;this._activePopover={type:"edge",id:r.id,worldX:((G=r.route)==null?void 0:G.seatX)||wt,worldY:((F=r.route)==null?void 0:F.seatY)||yt,label:Z},this._selectedEdgeId=r.id,this.requestUpdate();return}r.to?(this._activeStateId=r.to,this._selectedNodeId=r.to,this._selectedEdgeId=r.id,this.emit("flow:transition",{from:r.from,to:r.to,event:r.event}),t[r.to]&&this.emit("flow:select-node",{node:t[r.to]}),this.requestUpdate()):(this._selectedEdgeId=r.id,this.emit("flow:select-edge",{edge:r}),this.requestUpdate())}});const Z=r.event||r.label||"",ot=Math.max(76,Math.min(240,Z.length*8+28)),dt=28,zt=r.route.seatX-ot/2,Bt=r.route.seatY-dt/2,ae=((m=this._draggedWaypoint)==null?void 0:m.edgeId)===r.id,nt=v||_&&M||!this._selectedNodeId,Q=W("g",{class:`flow-edge-pill ${nt?"available":"dimmed"} ${ae?"dragging":""}`,transform:`translate(${zt}, ${Bt})`},p);W("rect",{width:ot,height:dt,rx:14,fill:nt?"#3b82f6":"#202636",stroke:nt?"#93c5fd":"rgba(255, 255, 255, 0.12)","stroke-width":nt?2:1,filter:nt?"drop-shadow(0 4px 14px rgba(59, 130, 246, 0.55))":"drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))"},Q);const re=W("text",{x:ot/2,y:dt/2,"text-anchor":"middle","dominant-baseline":"central",fill:nt?"#ffffff":"#94a3b8","font-size":11,"font-weight":800,"letter-spacing":"0.04em","font-family":"var(--tuto-font-sans, sans-serif)"},Q);if(re.textContent=Z,n?Q.addEventListener("pointerdown",D=>{var ct,wt,yt;if(D.button!==0)return;D.stopPropagation();let G=this._edgeWaypoints.get(r.id)?[...this._edgeWaypoints.get(r.id)]:[],F=0;const H=((ct=r.route)==null?void 0:ct.seatX)||zt+ot/2,lt=((wt=r.route)==null?void 0:wt.seatY)||Bt+dt/2;if(G.length===0){const ht=bt(H,lt,r.id,0,t,((yt=this._graph)==null?void 0:yt.transitions)||[],this._edgeWaypoints,et,10);G=[[ht.x,ht.y]],this._edgeWaypoints.set(r.id,G),this._saveEdgeWaypoints(),this.emit("flow:layout-change",{layout:this.exportLayoutSnapshot()}),F=0}else{let ht=0,Vt=1/0;for(let pt=0;pt<G.length;pt++){const Jt=Math.hypot(G[pt][0]-H,G[pt][1]-lt);Jt<Vt&&(Vt=Jt,ht=pt)}F=ht}this._startWaypointDrag(r.id,F,D)}):d?(Q.addEventListener("pointerdown",D=>D.stopPropagation()),Q.addEventListener("click",D=>{var G,F;D.stopPropagation(),this._activePopover={type:"edge",id:r.id,worldX:((G=r.route)==null?void 0:G.seatX)||zt+ot/2,worldY:((F=r.route)==null?void 0:F.seatY)||Bt+dt/2,label:Z},this._selectedEdgeId=r.id,this.requestUpdate()})):(Q.addEventListener("pointerdown",D=>D.stopPropagation()),Q.addEventListener("click",D=>{D.stopPropagation(),r.to&&(this._activeStateId=r.to,this._selectedNodeId=r.to,this._selectedEdgeId=r.id,this.emit("flow:transition",{from:r.from,to:r.to,event:r.event}),t[r.to]&&this.emit("flow:select-node",{node:t[r.to]}),this.requestUpdate())})),Q.addEventListener("dblclick",D=>{D.stopPropagation(),this._selectedEdgeId=r.id,this._showInspector=!0,this.requestUpdate()}),l&&r.waypoints&&r.waypoints.length>0)for(let D=0;D<r.waypoints.length;D++){const G=r.waypoints[D],F=W("circle",{cx:G[0],cy:G[1],r:6,class:"flow-waypoint-handle",fill:"#ffffff",stroke:"#0284c7","stroke-width":2.2},b);n?F.addEventListener("pointerdown",H=>{H.button===0&&(H.stopPropagation(),this._startWaypointDrag(r.id,D,H))}):d&&(F.addEventListener("pointerdown",H=>H.stopPropagation()),F.addEventListener("click",H=>{H.stopPropagation(),this._activePopover={type:"waypoint",id:r.id,index:D,worldX:G[0],worldY:G[1]},this.requestUpdate()}))}}for(const r of Object.values(t)){const v=W("foreignObject",{x:r.x,y:r.y,width:r.w,height:r.h,style:n?"cursor: grab;":""},y);v.addEventListener("pointerdown",_=>_.stopPropagation());const M=document.createElement("tuto-flow-node");if(M.node=r,M.selected=o===r.id,M.draggableNode=n,M.isDragging=this._draggedNodeId===r.id,n)M.addEventListener("pointerdown",_=>{_.button===0&&(_.stopPropagation(),this._startNodeDrag(r.id,_))});else if(d)M.addEventListener("pointerdown",_=>_.stopPropagation()),M.addEventListener("click",_=>{_.stopPropagation(),this._activePopover={type:"node",id:r.id,worldX:r.x+r.w/2,worldY:r.y,label:r.label||r.id},this.requestUpdate()});else{M.addEventListener("pointerdown",U=>{U.stopPropagation()});const _=U=>{U.stopPropagation();const I=r.id;this._selectedNodeId===I?(this._selectedNodeId=null,this._activeStateId=null,this._selectedEdgeId=null,this.emit("flow:select-node",{node:null})):(this._selectedNodeId=I,this._activeStateId=I,this._selectedEdgeId=null,this.emit("flow:select-node",{node:r})),this.requestUpdate()};M.addEventListener("flow:select-node",_),M.addEventListener("click",_)}M.addEventListener("dblclick",_=>{var I,j,V,K;_.stopPropagation();const U=r.targetSubgraph||r.subgraphId||((j=(I=this._rootGraph)==null?void 0:I.subgraphs)!=null&&j[r.id]?r.id:null);if(U&&((K=(V=this._rootGraph)==null?void 0:V.subgraphs)!=null&&K[U])){this.selectSubgraph(U);return}this._selectedNodeId=r.id,this._activeStateId=r.id,this._selectedEdgeId=null,this._showInspector=!0,this.requestUpdate()}),v.appendChild(M)}const w=this.shadowRootNode.getElementById("subgraph-bar");w&&(w.addEventListener("pointerdown",v=>v.stopPropagation()),w.addEventListener("mousedown",v=>v.stopPropagation()),w.querySelectorAll("[data-subgraph]").forEach(v=>{v.addEventListener("click",M=>{M.stopPropagation();const _=v.getAttribute("data-subgraph");this.selectSubgraph(_)})}));const S=this.shadowRootNode.getElementById("action-popover");if(S){S.addEventListener("pointerdown",I=>I.stopPropagation());const r=S.querySelector("[data-action='remove-waypoint']");r&&((L=this._activePopover)==null?void 0:L.type)==="waypoint"&&r.addEventListener("click",I=>{I.stopPropagation(),this._removeWaypoint(this._activePopover.id,this._activePopover.index)});const v=S.querySelector("[data-action='reset-edge']");v&&((C=this._activePopover)==null?void 0:C.type)==="edge"&&v.addEventListener("click",I=>{I.stopPropagation(),this._resetEdge(this._activePopover.id)});const M=S.querySelector("[data-action='add-waypoint']");M&&((g=this._activePopover)==null?void 0:g.type)==="edge"&&M.addEventListener("click",I=>{I.stopPropagation(),this._addWaypointToEdge(this._activePopover.id,this._activePopover.worldX,this._activePopover.worldY)});const _=S.querySelector("[data-action='reset-node']");_&&((T=this._activePopover)==null?void 0:T.type)==="node"&&_.addEventListener("click",I=>{I.stopPropagation(),this._resetNode(this._activePopover.id)});const U=S.querySelector("[data-action='close-popover']");U&&U.addEventListener("click",I=>{I.stopPropagation(),this._activePopover=null,this.requestUpdate()})}const R=this.shadowRootNode.getElementById("toolbar-el");R&&(R.zoom=Math.round(this._camera.scale*100),R.isMinimapActive=this._showMinimap,R.isInspectorActive=this._showInspector,R.toolMode=this._toolMode,R.addEventListener("flow:zoom-in",()=>this.zoomBy(1.2)),R.addEventListener("flow:zoom-out",()=>this.zoomBy(.8333333333333334)),R.addEventListener("flow:zoom-reset",()=>this.zoomTo(1)),R.addEventListener("flow:fit",()=>this.fitToViewport()),R.addEventListener("flow:reset",()=>{this._selectedNodeId=null,this._selectedEdgeId=null,this._showInspector=!1,this.fitToViewport()}),R.addEventListener("flow:toggle-minimap",()=>{this._toggleMinimap()}),R.addEventListener("flow:toggle-move-mode",()=>{this.toolMode=this._toolMode==="move"?"view":"move"}),R.addEventListener("flow:toggle-edit-mode",()=>{this.toolMode=this._toolMode==="edit"?"view":"edit"}),R.addEventListener("flow:snapshot-layout",()=>{this.copyLayoutSnapshot()}),R.addEventListener("flow:autoroute-edges",()=>{this.autoRouteEdges()}),R.addEventListener("flow:reset-layout",()=>{this.resetLayout()}),R.addEventListener("flow:toggle-inspector",()=>{this._toggleInspector()}));const z=this.shadowRootNode.getElementById("minimap-el");if(z){const r=this.getBoundingClientRect();z.bounds=this._bounds,z.camera=this._camera,z.viewportSize={width:r.width||900,height:r.height||700},z.nodes=((X=this._graph)==null?void 0:X.states)||{},z.transitions=((A=this._graph)==null?void 0:A.transitions)||[],z.groups=((Y=this._graph)==null?void 0:Y.groups)||[],z.selectedNodeId=this._selectedNodeId,z.addEventListener("flow:pan-to",v=>{const M=v;if(M.detail){const{worldX:_,worldY:U}=M.detail,I=this.getBoundingClientRect(),j=I.width||900,V=I.height||700,K=this._camera.scale||1;this._camera={...this._camera,panX:j/2-_*K,panY:V/2-U*K},this._applyCameraTransform()}}),z.addEventListener("flow:close-minimap",()=>{this.showMinimap=!1})}const k=this.shadowRootNode.getElementById("inspector-el");if(k){if(k.isOpen=this._showInspector,k.graph=this._graph,k.tools=this._graph.tools||[],this._selectedNodeId&&t[this._selectedNodeId])k.node=t[this._selectedNodeId];else if(this._selectedEdgeId){const r=s.find(v=>v.id===this._selectedEdgeId)||e.find(v=>v.id===this._selectedEdgeId);k.edge=r||null}else k.node=null,k.edge=null;k.addEventListener("flow:close-inspector",()=>{this._closeInspector()}),k.addEventListener("flow:select-subgraph",r=>{var M;const v=r;(M=v.detail)!=null&&M.subgraphId&&this.selectSubgraph(v.detail.subgraphId)})}}}return f(Rt,"styles",`
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
  `),customElements.get("tuto-flow-canvas")||customElements.define("tuto-flow-canvas",Rt),At(),x.BaseElement=J,x.DEFAULT_CAMERA_PADDING=Ut,x.DEFAULT_GRID_SIZE=et,x.DEFAULT_SNAP_THRESHOLD=St,x.MAX_CAMERA_SCALE=it,x.MIN_CAMERA_SCALE=tt,x.PRIMARY_FORWARD_EVENTS=Yt,x.SVG_NS=Tt,x.TutoBadge=xt,x.TutoButton=_t,x.TutoFlowCanvas=Rt,x.TutoFlowInspector=Nt,x.TutoFlowMinimap=Lt,x.TutoFlowNode=It,x.TutoFlowToolbar=$t,x.assignLanes=Mt,x.autoLayoutColumns=ie,x.bundleEdges=kt,x.centerOnNode=Ot,x.clamp=gt,x.colors=q,x.computeAutoRailWaypoints=jt,x.computeFitBounds=Wt,x.computeGraphBounds=mt,x.computePolylineMidpoint=Dt,x.escapeHtml=E,x.getBestPortPair=Xt,x.getClosestPort=Et,x.getPort=ee,x.htmlEl=Zt,x.injectThemeTokens=At,x.isEdgeHighlighted=oe,x.pointsToSvgPath=Ft,x.resolvePillSeats=qt,x.routeEdgeItem=Gt,x.screenToWorld=Qt,x.shouldShowPill=se,x.snapNode=Ht,x.snapWaypoint=bt,x.spacing=Kt,x.svgEl=W,x.typography=st,x.worldToScreen=te,x.zoomAtPoint=ut,Object.defineProperty(x,Symbol.toStringTag,{value:"Module"}),x})({});
