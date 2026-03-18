import{j as D}from"./jsx-runtime-D_zvdyIk.js";import{R as T}from"./iframe-DPM_GlN0.js";import"./preload-helper-Dp1pzeXC.js";const e=T.forwardRef(({variant:B="primary",size:$="md",className:N="",children:R,...j},L)=>{const P="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",k={primary:"bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] shadow-sm",secondary:"bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border-primary)]",danger:"bg-[var(--color-text-danger)] text-white hover:bg-red-600 shadow-sm"},A={sm:"h-8 px-3 text-xs",md:"h-10 px-4 py-2 text-sm",lg:"h-11 px-8 text-base"};return D.jsx("button",{ref:L,className:`${P} ${k[B]} ${A[$]} ${N}`,...j,children:R})});e.displayName="Button";const E={title:"Components/Common/Button",component:e,tags:["autodocs"],argTypes:{variant:{control:"select",options:["primary","secondary","danger"]},size:{control:"select",options:["sm","md","lg"]},onClick:{action:"clicked"}}},r={args:{variant:"primary",children:"Primary Action"}},a={args:{variant:"secondary",children:"Secondary Action"}},n={args:{variant:"danger",children:"Delete Item"}},s={args:{size:"sm",children:"Small Button"}},o={args:{size:"lg",children:"Large Button"}};e.__docgenInfo={description:"",methods:[],displayName:"Button",props:{variant:{required:!1,tsType:{name:"union",raw:"'primary' | 'secondary' | 'danger'",elements:[{name:"literal",value:"'primary'"},{name:"literal",value:"'secondary'"},{name:"literal",value:"'danger'"}]},description:"",defaultValue:{value:"'primary'",computed:!1}},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:"",defaultValue:{value:"'md'",computed:!1}},className:{defaultValue:{value:"''",computed:!1},required:!1}}};var t,i,c;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  const variants = {
    primary: 'bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] shadow-sm',
    secondary: 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border-primary)]',
    danger: 'bg-[var(--color-text-danger)] text-white hover:bg-red-600 shadow-sm'
  };
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-11 px-8 text-base'
  };
  return <button ref={ref} className={\`\${baseStyles} \${variants[variant]} \${sizes[size]} \${className}\`} {...props}>\r
      {children}\r
    </button>;
})`,...(c=(i=e.parameters)==null?void 0:i.docs)==null?void 0:c.source}}};var l,d,m;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    children: 'Primary Action'
  }
}`,...(m=(d=r.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var u,p,g;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    variant: 'secondary',
    children: 'Secondary Action'
  }
}`,...(g=(p=a.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var v,y,f;n.parameters={...n.parameters,docs:{...(v=n.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    variant: 'danger',
    children: 'Delete Item'
  }
}`,...(f=(y=n.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};var b,h,x;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    children: 'Small Button'
  }
}`,...(x=(h=s.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};var S,w,z;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    children: 'Large Button'
  }
}`,...(z=(w=o.parameters)==null?void 0:w.docs)==null?void 0:z.source}}};const I=["Button","Primary","Secondary","Danger","Small","Large"];export{e as Button,n as Danger,o as Large,r as Primary,a as Secondary,s as Small,I as __namedExportsOrder,E as default};
