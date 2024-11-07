import{a4 as q,al as z,at as F,au as b,Z as T,P as $,ak as V,D as I,C as H,b as G,av as U,h as w,aw as M,k as L,a8 as g,m as k,e as y,o as W,ax as D,H as A,j as Z,aj as x,l as J,ay as K,ah as Q,a5 as X,az as ee,c as te,p as ae,a as re,v as ne}from"./runtime.BK6o-1wa.js";import{b as oe}from"./template.Do8CTX05.js";const j=new Set,N=new Set;function ie(e,t,r,o){function i(a){if(o.capture||E.call(t,a),!a.cancelBubble){var u=V,f=I;b(null),T(null);try{return r.call(this,a)}finally{b(u),T(f)}}}return e.startsWith("pointer")||e.startsWith("touch")||e==="wheel"?z(()=>{t.addEventListener(e,i,o)}):t.addEventListener(e,i,o),i}function pe(e,t,r,o,i){var a={capture:o,passive:i},u=ie(e,t,r,a);(t===document.body||t===window||t===document)&&q(()=>{t.removeEventListener(e,u,a)})}function ye(e){for(var t=0;t<e.length;t++)j.add(e[t]);for(var r of N)r(e)}function E(e){var O;var t=this,r=t.ownerDocument,o=e.type,i=((O=e.composedPath)==null?void 0:O.call(e))||[],a=i[0]||e.target,u=0,f=e.__root;if(f){var _=i.indexOf(f);if(_!==-1&&(t===document||t===window)){e.__root=t;return}var h=i.indexOf(t);if(h===-1)return;_<=h&&(u=_)}if(a=i[u]||e.target,a!==t){F(e,"currentTarget",{configurable:!0,get(){return a||r}});var S=V,d=I;b(null),T(null);try{for(var n,s=[];a!==null;){var c=a.assignedSlot||a.parentNode||a.host||null;try{var p=a["__"+o];if(p!==void 0&&!a.disabled)if($(p)){var[P,...Y]=p;P.apply(a,[e,...Y])}else p.call(a,e)}catch(m){n?s.push(m):n=m}if(e.cancelBubble||c===t||c===null)break;a=c}if(n){for(let m of s)queueMicrotask(()=>{throw m});throw n}}finally{e.__root=t,delete e.currentTarget,b(S),T(d)}}}let l;function se(){l=void 0}function ve(e){let t=null,r=w;var o;if(w){for(t=y,l===void 0&&(l=W(document.head));l!==null&&(l.nodeType!==8||l.data!==M);)l=L(l);l===null?g(!1):l=k(L(l))}w||(o=document.head.appendChild(H()));try{G(()=>e(o),U)}finally{r&&(g(!0),l=y,k(t))}}function ge(e){return e.endsWith("capture")&&e!=="gotpointercapture"&&e!=="lostpointercapture"}const ue=["beforeinput","click","change","dblclick","contextmenu","focusin","focusout","input","keydown","keyup","mousedown","mousemove","mouseout","mouseover","mouseup","pointerdown","pointermove","pointerout","pointerover","pointerup","touchend","touchmove","touchstart"];function we(e){return ue.includes(e)}const le={formnovalidate:"formNoValidate",ismap:"isMap",nomodule:"noModule",playsinline:"playsInline",readonly:"readOnly"};function Ee(e){return e=e.toLowerCase(),le[e]??e}const de=["touchstart","touchmove"];function ce(e){return de.includes(e)}let C=!0;function me(e,t){var r=t==null?"":typeof t=="object"?t+"":t;r!==(e.__t??(e.__t=e.nodeValue))&&(e.__t=r,e.nodeValue=r==null?"":r+"")}function fe(e,t){return B(e,t)}function be(e,t){D(),t.intro=t.intro??!1;const r=t.target,o=w,i=y;try{for(var a=W(r);a&&(a.nodeType!==8||a.data!==M);)a=L(a);if(!a)throw A;g(!0),k(a),Z();const u=B(e,{...t,anchor:a});if(y===null||y.nodeType!==8||y.data!==x)throw J(),A;return g(!1),u}catch(u){if(u===A)return t.recover===!1&&K(),D(),Q(r),g(!1),fe(e,t);throw u}finally{g(o),k(i),se()}}const v=new Map;function B(e,{target:t,anchor:r,props:o={},events:i,context:a,intro:u=!0}){D();var f=new Set,_=d=>{for(var n=0;n<d.length;n++){var s=d[n];if(!f.has(s)){f.add(s);var c=ce(s);t.addEventListener(s,E,{passive:c});var p=v.get(s);p===void 0?(document.addEventListener(s,E,{passive:c}),v.set(s,1)):v.set(s,p+1)}}};_(X(j)),N.add(_);var h=void 0,S=ee(()=>{var d=r??t.appendChild(H());return te(()=>{if(a){ae({});var n=ne;n.c=a}i&&(o.$$events=i),w&&oe(d,null),C=u,h=e(d,o)||{},C=!0,w&&(I.nodes_end=y),a&&re()}),()=>{var c;for(var n of f){t.removeEventListener(n,E);var s=v.get(n);--s===0?(document.removeEventListener(n,E),v.delete(n)):v.set(n,s)}N.delete(_),R.delete(h),d!==r&&((c=d.parentNode)==null||c.removeChild(d))}});return R.set(h,S),h}let R=new WeakMap;function Te(e){const t=R.get(e);t&&t()}export{we as a,C as b,ie as c,ye as d,ve as e,pe as f,be as h,ge as i,fe as m,Ee as n,me as s,Te as u};
